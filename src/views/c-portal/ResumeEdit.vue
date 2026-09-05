<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateAuthStore } from '@/stores/candidate'
import { resumeOptimizeFlow } from '@/mock/candidateData'
import { streamText } from '@/mock/aiSimulator'
import { api } from '@/api/client'

const router = useRouter()
const auth = useCandidateAuthStore()

// 简历选择
const resumes = computed(() => auth.user?.resumes || [])
const selectedId = ref(resumes.value[0]?.id || null)
const currentResume = computed(() => resumes.value.find(r => r.id === selectedId.value) || null)

// AI 优化状态
// 优先使用后端实时生成的分段建议；后端不可用时回退内置 mock
const onlineFlow = ref(null)
const flow = computed(() => onlineFlow.value || resumeOptimizeFlow[selectedId.value] || [])
const optimizing = ref(false)
const fetching = ref(false) // 调用后端生成中
const appliedSet = ref(new Set()) // 已应用优化的段落 index
// 流式输出：每段渲染进度 0~1
const sectionProgress = ref([]) // [{ idx, optimizedText: '' }]
const activeStreamTimer = ref(null)

async function startOptimize() {
  if (optimizing.value) return
  optimizing.value = true
  fetching.value = true
  appliedSet.value = new Set()
  sectionProgress.value = []
  onlineFlow.value = null
  try {
    // 调后端 AI 改简历接口
    const data = await api.post(`/c/resumes/${selectedId.value}/optimize`, {})
    onlineFlow.value = data.sections || []
  } catch {
    // 后端不可用 → mock 兜底
    onlineFlow.value = resumeOptimizeFlow[selectedId.value] || []
  }
  fetching.value = false
  const sections = onlineFlow.value
  if (!sections.length) { optimizing.value = false; return }
  sectionProgress.value = sections.map(() => ({ idx: 0, optimizedText: '' }))
  streamNext(0)
}

// 切换简历：清空上次结果
function switchResume() {
  stopOptimize()
  onlineFlow.value = null
  sectionProgress.value = []
  appliedSet.value = new Set()
}

function streamNext(idx) {
  if (idx >= flow.value.length) {
    optimizing.value = false
    return
  }
  const text = flow.value[idx].optimized
  sectionProgress.value[idx] = { idx, optimizedText: '' }
  activeStreamTimer.value = streamText(
    text,
    (token) => {
      sectionProgress.value[idx].optimizedText += token
    },
    () => {
      // 流式输出完毕，进入下一段
      setTimeout(() => streamNext(idx + 1), 300)
    },
    18
  )
}

function stopOptimize() {
  if (activeStreamTimer.value) clearInterval(activeStreamTimer.value)
  optimizing.value = false
}

function applySection(idx) {
  appliedSet.value = new Set([...appliedSet.value, idx])
}
function applyAll() {
  appliedSet.value = new Set(flow.value.map((_, i) => i))
}
function resetAll() {
  appliedSet.value = new Set()
  sectionProgress.value = []
}

// 是否已流式输出该段
function isStreamed(idx) {
  return sectionProgress.value[idx]?.optimizedText && sectionProgress.value[idx].optimizedText.length >= flow.value[idx].optimized.length
}

onUnmounted(() => {
  if (activeStreamTimer.value) clearInterval(activeStreamTimer.value)
})

function goAssess() {
  router.push('/c/resume/assess')
}

// ============ 本地上传简历 → AI 优化 ============
const fileInput = ref(null)
const uploading = ref(false)
const uploadMsg = ref('') // 上传结果提示（含解析摘要）
const uploadError = ref('')
const ALLOWED = ['.pdf', '.docx', '.txt', '.md']

function triggerUpload() {
  uploadError.value = ''
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  e.target.value = '' // 允许重复选同一文件
  if (!file) return
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
  if (!ALLOWED.includes(ext)) {
    uploadError.value = '仅支持 PDF / Word(.docx) / TXT / Markdown 格式'
    return
  }
  uploading.value = true
  uploadError.value = ''
  uploadMsg.value = ''
  try {
    const fd = new FormData()
    fd.append('resume', file) // 字段名必须与后端 multer single('resume') 一致
    const data = await api.upload('/c/resumes/upload', fd)
    // 把新简历加入本地列表并选中
    const list = auth.user?.resumes || []
    auth.updateUser({ resumes: [data.resume, ...list] })
    selectedId.value = data.resume.id
    const ex = data.extracted || {}
    uploadMsg.value =
      `已上传《${file.name}》并解析：识别到 ${ex.skills?.length || 0} 个技能` +
      (ex.workYears ? `、${ex.workYears} 年经验` : '') +
      (ex.warning ? `。${ex.warning}` : '')
    // 自动开始 AI 优化
    await startOptimize()
  } catch (err) {
    uploadError.value = err.message || '上传失败'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="re-page">
    <!-- 头部：选择简历 + 操作 -->
    <div class="re-head">
      <div class="re-head-left">
        <h1 class="re-title">✍️ AI 帮你改简历</h1>
        <p class="re-desc">选择一份简历，AI 将按"摘要 / 项目经验 / 技能栈"分段逐条优化，并给出修改理由。</p>
      </div>
      <div class="re-head-right">
        <label class="re-select-label">选择简历</label>
        <select v-model="selectedId" class="re-select" :disabled="optimizing || uploading" @change="switchResume">
          <option v-for="r in resumes" :key="r.id" :value="r.id">{{ r.name }}{{ r.isDefault ? '（默认）' : '' }}</option>
          <option v-if="!resumes.length" :value="null">暂无简历</option>
        </select>
        <button class="re-btn upload" :disabled="uploading || optimizing" @click="triggerUpload">
          {{ uploading ? '⏳ 上传解析中...' : '📄 上传简历文件' }}
        </button>
        <input
          ref="fileInput" type="file" accept=".pdf,.docx,.txt,.md"
          style="display:none" @change="onFileChange"
        />
      </div>
    </div>

    <!-- 上传结果/错误提示 -->
    <div v-if="uploadMsg" class="re-notice ok">✅ {{ uploadMsg }}，AI 已开始优化 ↓</div>
    <div v-if="uploadError" class="re-notice err">⚠️ {{ uploadError }}</div>

    <!-- 空状态 -->
    <div v-if="!resumes.length" class="empty-state">
      <div class="empty-icon">📥</div>
      <h3>还没有简历</h3>
      <p>上传一份本地简历（PDF / Word / TXT），AI 自动解析并帮你优化。</p>
      <button class="re-btn primary" :disabled="uploading" @click="triggerUpload">
        {{ uploading ? '⏳ 上传解析中...' : '📄 上传简历文件' }}
      </button>
    </div>

    <template v-else>
      <!-- 简历概要 -->
      <div class="resume-meta">
        <div class="rm-item"><span>简历名称</span><b>{{ currentResume.name }}</b></div>
        <div class="rm-item"><span>最近公司</span><b>{{ currentResume.parsed?.lastCompany }}</b></div>
        <div class="rm-item"><span>工作年限</span><b>{{ currentResume.parsed?.workYears }} 年</b></div>
        <div class="rm-item"><span>上传时间</span><b>{{ currentResume.uploadedAt }}</b></div>
      </div>

      <!-- 操作栏 -->
      <div class="re-actions">
        <button class="re-btn primary" :disabled="optimizing" @click="startOptimize">
          {{ fetching ? '⏳ AI 正在分析简历...' : optimizing ? '⏳ AI 正在输出优化...' : '🚀 开始 AI 优化' }}
        </button>
        <button v-if="optimizing" class="re-btn ghost" @click="stopOptimize">停止</button>
        <button v-if="!optimizing && sectionProgress.length" class="re-btn ghost" @click="resetAll">重置</button>
        <button v-if="sectionProgress.length" class="re-btn ghost" @click="applyAll">一键应用全部</button>
        <button class="re-btn ghost" @click="goAssess">去简历测评 →</button>
        <span v-if="appliedSet.size" class="applied-count">已应用 {{ appliedSet.size }}/{{ flow.length }} 项</span>
      </div>

      <!-- 进度条 -->
      <div v-if="sectionProgress.length" class="progress-bar">
        <div class="pb-inner" :style="{ width: (appliedSet.size / flow.length * 100) + '%' }"></div>
      </div>

      <!-- AI 分析中 -->
      <div v-if="fetching" class="optimizing-loading">
        <div class="ol-spinner"></div>
        <p>AI 正在解析简历内容，生成分段优化建议...</p>
      </div>

      <!-- 分段优化卡片 -->
      <div v-else-if="sectionProgress.length" class="sections">
        <div v-for="(s, i) in flow" :key="i" class="sec-card" :class="{ applied: appliedSet.has(i), active: optimizing && isStreamed(i) === false && sectionProgress[i]?.optimizedText }">
          <div class="sec-card-head">
            <div class="sec-num">{{ i + 1 }}</div>
            <div class="sec-section">{{ s.section }}</div>
            <span v-if="appliedSet.has(i)" class="sec-badge applied">已应用</span>
            <span v-else-if="isStreamed(i)" class="sec-badge ready">可应用</span>
            <span v-else-if="sectionProgress[i]?.optimizedText" class="sec-badge streaming">生成中</span>
            <span v-else class="sec-badge pending">待生成</span>
          </div>

          <div class="sec-compare">
            <!-- 原文 -->
            <div class="sec-col original">
              <div class="col-label">原文</div>
              <pre class="col-pre">{{ s.original }}</pre>
            </div>
            <!-- 优化后 -->
            <div class="sec-col optimized">
              <div class="col-label">AI 优化后</div>
              <pre class="col-pre">{{ sectionProgress[i]?.optimizedText || '' }}<span v-if="optimizing && sectionProgress[i]?.optimizedText && !isStreamed(i)" class="cursor">▋</span></pre>
            </div>
          </div>

          <!-- 修改理由 -->
          <div v-if="isStreamed(i)" class="sec-rationale">
            <span class="rr-label">💡 修改理由</span>
            <p>{{ s.rationale }}</p>
          </div>

          <!-- 应用按钮 -->
          <div v-if="isStreamed(i) && !appliedSet.has(i)" class="sec-foot">
            <button class="re-btn small primary" @click="applySection(i)">应用此段优化</button>
          </div>
        </div>

        <!-- 完成提示 -->
        <div v-if="!optimizing && sectionProgress.length && appliedSet.size === flow.length" class="done-tip">
          <span class="dt-icon">✅</span>
          <div>
            <div class="dt-title">全部优化已应用！</div>
            <div class="dt-sub">建议立即去简历测评，看看新简历的得分提升了多少。</div>
          </div>
          <button class="re-btn primary" @click="goAssess">立即测评 →</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.re-page { display: flex; flex-direction: column; gap: 20px; }

.re-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
.re-head-left { flex: 1; min-width: 280px; }
.re-title { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; }
.re-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }
.re-head-right { display: flex; flex-direction: column; gap: 6px; }
.re-select-label { font-size: 12px; color: #6b7280; }
.re-select {
  height: 40px; padding: 0 14px; border: 1px solid #e5e7eb; border-radius: 10px;
  font-size: 14px; background: #fff; outline: none; min-width: 220px; cursor: pointer;
}
.re-select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.re-select:disabled { background: #f9fafb; cursor: not-allowed; }

.empty-state {
  background: #fff; border-radius: 16px; padding: 48px 24px; text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state h3 { font-size: 17px; color: #1f2937; margin: 0 0 6px; }
.empty-state p { font-size: 13px; color: #9ca3af; margin: 0 0 20px; }

.resume-meta {
  background: #fff; border-radius: 12px; padding: 16px 20px; display: flex;
  gap: 32px; flex-wrap: wrap; box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.rm-item { display: flex; flex-direction: column; gap: 2px; }
.rm-item span { font-size: 11px; color: #9ca3af; }
.rm-item b { font-size: 14px; color: #1f2937; font-weight: 600; }

.re-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.re-btn {
  height: 40px; padding: 0 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all .2s; border: 1px solid transparent;
}
.re-btn.primary { border: none; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
.re-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(124,58,237,.3); }
.re-btn.primary:disabled { opacity: .6; cursor: not-allowed; }
.re-btn.upload {
  border: 1px solid #7c3aed; background: #fff; color: #7c3aed;
  padding: 8px 14px; font-size: 13px; white-space: nowrap;
}
.re-btn.upload:hover:not(:disabled) { background: #f5f3ff; }
.re-btn.upload:disabled { opacity: .6; cursor: not-allowed; }
.re-notice {
  margin: 0 0 16px; padding: 10px 16px; border-radius: 10px; font-size: 13px; line-height: 1.6;
}
.re-notice.ok { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
.re-notice.err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.re-btn.ghost { background: #fff; color: #6b7280; border-color: #e5e7eb; }
.re-btn.ghost:hover { background: #f9fafb; border-color: #d1d5db; }
.re-btn.small { height: 34px; padding: 0 16px; font-size: 13px; }
.applied-count { font-size: 13px; color: #7c3aed; font-weight: 600; margin-left: auto; }

.progress-bar { height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
.pb-inner { height: 100%; background: linear-gradient(90deg, #7c3aed, #4f46e5); border-radius: 3px; transition: width .4s; }

.optimizing-loading {
  background: #fff; border-radius: 16px; padding: 48px 24px; text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.ol-spinner {
  width: 44px; height: 44px; margin: 0 auto 16px; border: 4px solid #eef2ff;
  border-top-color: #7c3aed; border-radius: 50%; animation: ol-spin 1s linear infinite;
}
@keyframes ol-spin { to { transform: rotate(360deg); } }
.optimizing-loading p { margin: 0; font-size: 14px; color: #6b7280; }
.sections { display: flex; flex-direction: column; gap: 16px; }
.sec-card {
  background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.04);
  border: 1px solid #f3f4f6; transition: all .2s;
}
.sec-card.applied { border-color: #6ee7b7; background: linear-gradient(180deg, #f0fdf4, #fff); }
.sec-card.active { border-color: #c4b5fd; }

.sec-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.sec-num { width: 26px; height: 26px; border-radius: 50%; background: #7c3aed; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.sec-section { flex: 1; font-size: 15px; font-weight: 700; color: #1f2937; }
.sec-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.sec-badge.pending { background: #f3f4f6; color: #9ca3af; }
.sec-badge.streaming { background: #dbeafe; color: #2563eb; }
.sec-badge.ready { background: #fef3c7; color: #b45309; }
.sec-badge.applied { background: #d1fae5; color: #059669; }

.sec-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.sec-col { display: flex; flex-direction: column; gap: 6px; }
.col-label { font-size: 11px; font-weight: 600; color: #9ca3af; }
.col-pre {
  margin: 0; padding: 14px; background: #f9fafb; border-radius: 10px;
  font-size: 13px; line-height: 1.7; color: #4b5563; white-space: pre-wrap;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; min-height: 80px;
}
.sec-col.optimized .col-pre { background: #eef2ff; color: #1e293b; }
.cursor { color: #7c3aed; animation: blink 1s steps(2) infinite; }
@keyframes blink { 50% { opacity: 0; } }

.sec-rationale {
  margin-top: 14px; padding: 12px 14px; background: #fefce8; border-radius: 10px;
  border-left: 3px solid #f59e0b;
}
.rr-label { font-size: 12px; font-weight: 700; color: #92400e; }
.sec-rationale p { margin: 4px 0 0; font-size: 13px; color: #78350f; line-height: 1.6; }

.sec-foot { margin-top: 12px; display: flex; justify-content: flex-end; }

.done-tip {
  display: flex; align-items: center; gap: 16px; padding: 20px 24px;
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4); border-radius: 16px;
  border: 1px solid #6ee7b7;
}
.dt-icon { font-size: 32px; }
.dt-title { font-size: 15px; font-weight: 700; color: #065f46; }
.dt-sub { font-size: 12px; color: #047857; margin-top: 2px; }
.done-tip .re-btn { margin-left: auto; }
</style>
