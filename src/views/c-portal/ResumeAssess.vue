<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateAuthStore, useCandidateDataStore } from '@/stores/candidate'
import { resumeAssessResults } from '@/mock/candidateData'
import { api } from '@/api/client'
import RadarChart from '@/components/RadarChart.vue'

const router = useRouter()
const auth = useCandidateAuthStore()
const dataStore = useCandidateDataStore()

const resumes = computed(() => auth.user?.resumes || [])
const selectedId = ref(resumes.value[0]?.id || null)

// 目标职业选择
const positions = computed(() => dataStore.positions)
const selectedPositionId = ref(positions.value[0]?.id || null)
const selectedPosition = computed(() => positions.value.find(p => p.id === selectedPositionId.value))
const selectedPositionTitle = computed(() => selectedPosition.value?.title || '')

// 测评结果：优先用后端返回，离线时回退 mock
const onlineResult = ref(null)
const result = computed(() => onlineResult.value || resumeAssessResults[selectedId.value] || null)

// 测评状态：idle / loading / done
const status = ref('idle')

async function startAssess() {
  if (status.value === 'loading' || !selectedId.value) return
  status.value = 'loading'
  try {
    const data = await api.post(`/c/resumes/${selectedId.value}/assess`, { position: selectedPositionTitle.value })
    onlineResult.value = data.result
  } catch {
    // 后端不可用 → mock 兜底
    await new Promise(r => setTimeout(r, 1600))
    onlineResult.value = resumeAssessResults[selectedId.value] || null
  }
  status.value = 'done'
}

function switchResume() {
  status.value = 'idle'
  onlineResult.value = null
}
function switchPosition() {
  status.value = 'idle'
  onlineResult.value = null
}

function goEdit() {
  router.push('/c/resume/edit')
}
// 进入 AI 面试：携带所选职业跳转到练习配置页
function goInterview() {
  if (selectedPositionId.value) {
    router.push(`/c/mock/config/${selectedPositionId.value}`)
  } else {
    router.push('/c/mock')
  }
}
// 进入题库练习
function goPractice() {
  router.push('/c/mock')
}
</script>

<template>
  <div class="ra-page">
    <!-- 头部 -->
    <div class="ra-head">
      <div class="ra-head-left">
        <h1 class="ra-title">📊 简历测评</h1>
        <p class="ra-desc">选择目标职业与简历，AI 从 6 个维度打分并计算职业匹配度，测评完成可直接进入 AI 面试或题库练习。</p>
      </div>
      <div class="ra-head-right">
        <div class="ra-select-group">
          <label class="ra-select-label">目标职业</label>
          <select v-model="selectedPositionId" class="ra-select" :disabled="status === 'loading'" @change="switchPosition">
            <option v-for="p in positions" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
        </div>
        <div class="ra-select-group">
          <label class="ra-select-label">选择简历</label>
          <select v-model="selectedId" class="ra-select" :disabled="status === 'loading'" @change="switchResume">
            <option v-for="r in resumes" :key="r.id" :value="r.id">{{ r.name }}{{ r.isDefault ? '（默认）' : '' }}</option>
            <option v-if="!resumes.length" :value="null">暂无简历</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!resumes.length" class="empty-state">
      <div class="empty-icon">📥</div>
      <h3>还没有简历</h3>
      <p>请先上传一份简历，AI 才能进行测评。</p>
      <button class="ra-btn primary" @click="goEdit">去上传</button>
    </div>

    <template v-else>
      <!-- 未测评：开始按钮 -->
      <div v-if="status === 'idle'" class="start-card">
        <div class="sc-icon">🤖</div>
        <h2>开始 AI 简历测评</h2>
        <p>目标职业：<b>{{ selectedPositionTitle }}</b></p>
        <p>当前简历：<b>{{ resumes.find(r => r.id === selectedId)?.name }}</b></p>
        <p class="sc-tip">AI 将解析简历内容，从 6 个维度生成评分、职业匹配度、关键词命中报告与改进清单。</p>
        <button class="ra-btn primary lg" @click="startAssess">🚀 开始测评</button>
      </div>

      <!-- 测评中 -->
      <div v-else-if="status === 'loading'" class="loading-card">
        <div class="lc-spinner"></div>
        <h3>AI 正在解析简历...</h3>
        <div class="lc-steps">
          <div class="lc-step">✓ 提取文本与结构</div>
          <div class="lc-step">✓ 匹配「{{ selectedPositionTitle }}」关键词库</div>
          <div class="lc-step">⏳ 计算 6 维评分与职业匹配度</div>
          <div class="lc-step dim">⏸ 生成改进清单</div>
        </div>
      </div>

      <!-- 测评结果 -->
      <template v-else-if="status === 'done' && result">
        <!-- 顶部评分卡 -->
        <div class="score-hero">
          <div class="sh-left">
            <div class="sh-label">综合得分</div>
            <div class="sh-score">{{ result.overallScore }}</div>
            <div class="sh-tag-wrap">
              <span class="sh-tag" :class="result.overallScore >= 80 ? 'good' : result.overallScore >= 70 ? 'mid' : 'low'">
                {{ result.overallScore >= 80 ? '优秀' : result.overallScore >= 70 ? '良好' : '待提升' }}
              </span>
              <span class="sh-resume">{{ resumes.find(r => r.id === selectedId)?.name }}</span>
              <span v-if="selectedPositionTitle" class="sh-pos">🎯 {{ selectedPositionTitle }}</span>
            </div>
          </div>
          <div class="sh-right">
            <div class="sh-stat"><span>维度数</span><b>6 个</b></div>
            <div class="sh-stat"><span>命中关键词</span><b>{{ result.keywords.hit.length }} 个</b></div>
            <div class="sh-stat"><span>缺失关键词</span><b>{{ result.keywords.miss.length }} 个</b></div>
          </div>
        </div>

        <!-- 职业匹配度（突出展示） -->
        <div v-if="result.positionMatch" class="pm-card">
          <div class="pm-left">
            <div class="pm-label">职业匹配度</div>
            <div class="pm-position">{{ result.positionMatch.position }}</div>
          </div>
          <div class="pm-score-wrap">
            <div class="pm-score" :class="result.positionMatch.score >= 80 ? 'good' : result.positionMatch.score >= 60 ? 'mid' : 'low'">
              {{ result.positionMatch.score }}
            </div>
            <div class="pm-bar">
              <div class="pm-bar-inner" :style="{ width: result.positionMatch.score + '%' }"></div>
            </div>
          </div>
          <div class="pm-comment">{{ result.positionMatch.comment }}</div>
        </div>

        <!-- AI 综合评语 -->
        <div class="card">
          <div class="card-title">🎯 AI 综合评语</div>
          <p class="ai-summary">{{ result.summary }}</p>
        </div>

        <div class="two-col">
          <!-- 雷达图 -->
          <div class="card">
            <div class="card-title">📈 能力雷达图</div>
            <RadarChart :data="result.radar" height="320px" />
            <div class="dim-list">
              <div v-for="d in result.dimensions" :key="d.name" class="dim-row">
                <span class="dim-name">{{ d.name }}</span>
                <div class="dim-bar">
                  <div class="dim-bar-inner" :style="{ width: d.score + '%', background: d.score >= 80 ? '#10b981' : d.score >= 60 ? '#7c3aed' : '#ef4444' }"></div>
                </div>
                <span class="dim-score">{{ d.score }}</span>
              </div>
            </div>
          </div>

          <!-- 维度详情 -->
          <div class="card">
            <div class="card-title">📝 维度详情</div>
            <div class="dim-detail-list">
              <div v-for="(d, i) in result.dimensions" :key="d.name" class="dim-detail">
                <div class="dd-head">
                  <span class="dd-num">{{ i + 1 }}</span>
                  <span class="dd-name">{{ d.name }}</span>
                  <span class="dd-score" :class="d.score >= 80 ? 'good' : d.score >= 60 ? 'mid' : 'low'">{{ d.score }} 分</span>
                </div>
                <p class="dd-comment">{{ d.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 关键词命中 -->
        <div class="card">
          <div class="card-title">🔑 关键词命中（ATS 过筛参考）</div>
          <div class="kw-row">
            <div class="kw-col hit">
              <div class="kw-label">✓ 已命中（{{ result.keywords.hit.length }}）</div>
              <div class="kw-tags">
                <span v-for="k in result.keywords.hit" :key="k" class="kw-tag hit">{{ k }}</span>
              </div>
            </div>
            <div class="kw-col miss">
              <div class="kw-label">✗ 缺失（{{ result.keywords.miss.length }}）</div>
              <div class="kw-tags">
                <span v-for="k in result.keywords.miss" :key="k" class="kw-tag miss">{{ k }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 改进建议 -->
        <div class="card">
          <div class="card-title">💡 改进建议</div>
          <div class="sug-list">
            <div v-for="(s, i) in result.suggestions" :key="i" class="sug-item">
              <div class="sug-num">{{ i + 1 }}</div>
              <div class="sug-body">
                <span class="sug-type">{{ s.type }}</span>
                <p class="sug-text">{{ s.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作：重新测评 / 改简历 / AI 面试 / 题库练习 -->
        <div class="actions">
          <button class="act-btn ghost" @click="status = 'idle'">🔄 重新测评</button>
          <button class="act-btn ghost" @click="goEdit">✍️ AI 改简历</button>
          <button class="act-btn interview" @click="goInterview">🎤 进入 AI 面试</button>
          <button class="act-btn primary" @click="goPractice">📚 进入题库练习</button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.ra-page { display: flex; flex-direction: column; gap: 20px; }

.ra-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
.ra-head-left { flex: 1; min-width: 280px; }
.ra-title { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; }
.ra-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }
.ra-head-right { display: flex; flex-direction: column; gap: 10px; }
.ra-select-group { display: flex; flex-direction: column; gap: 6px; }
.ra-select-label { font-size: 12px; color: #6b7280; }
.ra-select {
  height: 40px; padding: 0 14px; border: 1px solid #e5e7eb; border-radius: 10px;
  font-size: 14px; background: #fff; outline: none; min-width: 220px; cursor: pointer;
}
.ra-select:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.ra-select:disabled { background: #f9fafb; cursor: not-allowed; }

.empty-state {
  background: #fff; border-radius: 16px; padding: 48px 24px; text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state h3 { font-size: 17px; color: #1f2937; margin: 0 0 6px; }
.empty-state p { font-size: 13px; color: #9ca3af; margin: 0 0 20px; }

/* 开始卡片 */
.start-card {
  background: #fff; border-radius: 20px; padding: 56px 32px; text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,.04); border: 1px solid #f3f4f6;
}
.sc-icon { font-size: 56px; margin-bottom: 16px; }
.start-card h2 { font-size: 22px; color: #1f2937; margin: 0 0 8px; }
.start-card p { font-size: 14px; color: #6b7280; margin: 0 0 4px; }
.start-card p b { color: #7c3aed; }
.sc-tip { max-width: 480px; margin: 12px auto 28px !important; line-height: 1.6; color: #9ca3af !important; font-size: 13px !important; }

/* 加载卡片 */
.loading-card {
  background: #fff; border-radius: 20px; padding: 48px 32px; text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.lc-spinner {
  width: 48px; height: 48px; margin: 0 auto 20px; border: 4px solid #eef2ff;
  border-top-color: #7c3aed; border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-card h3 { font-size: 18px; color: #1f2937; margin: 0 0 20px; }
.lc-steps { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.lc-step { font-size: 13px; color: #7c3aed; }
.lc-step.dim { color: #d1d5db; }

/* 评分卡 */
.score-hero {
  background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 20px; padding: 32px;
  color: #fff; display: flex; justify-content: space-between; align-items: center;
}
.sh-label { font-size: 13px; opacity: .9; margin-bottom: 4px; }
.sh-score { font-size: 56px; font-weight: 700; line-height: 1; margin-bottom: 12px; }
.sh-tag-wrap { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.sh-tag { padding: 4px 12px; background: rgba(255,255,255,.2); border-radius: 999px; font-size: 12px; font-weight: 600; }
.sh-tag.good { background: #d1fae5; color: #059669; }
.sh-tag.mid { background: #dbeafe; color: #2563eb; }
.sh-tag.low { background: #fee2e2; color: #dc2626; }
.sh-resume { font-size: 13px; opacity: .9; }
.sh-pos { font-size: 13px; opacity: .9; background: rgba(255,255,255,.15); padding: 4px 10px; border-radius: 999px; }
.sh-right { display: flex; flex-direction: column; gap: 8px; }
.sh-stat { display: flex; gap: 12px; align-items: center; font-size: 14px; }
.sh-stat span { opacity: .85; }
.sh-stat b { font-weight: 700; }

/* 职业匹配度卡片 */
.pm-card {
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border: 1px solid #a7f3d0; border-radius: 16px; padding: 24px;
  display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
}
.pm-left { flex-shrink: 0; }
.pm-label { font-size: 12px; color: #059669; font-weight: 600; margin-bottom: 4px; }
.pm-position { font-size: 20px; font-weight: 700; color: #065f46; }
.pm-score-wrap { display: flex; flex-direction: column; gap: 8px; min-width: 200px; flex: 1; }
.pm-score { font-size: 36px; font-weight: 700; line-height: 1; }
.pm-score.good { color: #059669; }
.pm-score.mid { color: #d97706; }
.pm-score.low { color: #dc2626; }
.pm-bar { height: 10px; background: #d1fae5; border-radius: 5px; overflow: hidden; }
.pm-bar-inner { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #10b981, #059669); transition: width .8s; }
.pm-comment { font-size: 13px; color: #047857; line-height: 1.6; flex: 1; min-width: 240px; }

.card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.card-title { font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 16px; }
.ai-summary { font-size: 14px; color: #4b5563; line-height: 1.8; background: #f9fafb; padding: 14px; border-radius: 10px; border-left: 3px solid #7c3aed; margin: 0; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.dim-list { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
.dim-row { display: flex; align-items: center; gap: 10px; }
.dim-name { width: 96px; font-size: 13px; color: #4b5563; }
.dim-bar { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.dim-bar-inner { height: 100%; border-radius: 4px; transition: width .6s; }
.dim-score { width: 36px; text-align: right; font-size: 13px; font-weight: 700; color: #1f2937; }

.dim-detail-list { display: flex; flex-direction: column; gap: 14px; max-height: 500px; overflow-y: auto; padding-right: 4px; }
.dim-detail { padding: 14px; background: #f9fafb; border-radius: 12px; }
.dd-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.dd-num { width: 22px; height: 22px; border-radius: 50%; background: #7c3aed; color: #fff; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.dd-name { flex: 1; font-size: 13px; font-weight: 600; color: #1f2937; }
.dd-score { font-size: 13px; font-weight: 700; }
.dd-score.good { color: #059669; }
.dd-score.mid { color: #7c3aed; }
.dd-score.low { color: #ef4444; }
.dd-comment { margin: 0; font-size: 12px; color: #4b5563; line-height: 1.7; }

/* 关键词 */
.kw-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.kw-col { display: flex; flex-direction: column; gap: 10px; }
.kw-label { font-size: 13px; font-weight: 600; }
.kw-col.hit .kw-label { color: #059669; }
.kw-col.miss .kw-label { color: #dc2626; }
.kw-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.kw-tag { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; }
.kw-tag.hit { background: #d1fae5; color: #059669; }
.kw-tag.miss { background: #fee2e2; color: #dc2626; }

/* 改进建议 */
.sug-list { display: flex; flex-direction: column; gap: 12px; }
.sug-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px; background: #fefce8; border-radius: 12px; border: 1px solid #fde68a; }
.sug-num { width: 28px; height: 28px; border-radius: 50%; background: #f59e0b; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sug-body { flex: 1; }
.sug-type { display: inline-block; padding: 2px 8px; background: #fde68a; color: #92400e; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 6px; }
.sug-text { margin: 0; font-size: 13px; color: #78350f; line-height: 1.6; }

/* 操作按钮 */
.actions { display: flex; gap: 12px; justify-content: center; padding: 12px 0; flex-wrap: wrap; }
.act-btn { height: 44px; padding: 0 28px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; }
.act-btn.ghost { border: 1px solid #e5e7eb; background: #fff; color: #6b7280; }
.act-btn.ghost:hover { background: #f9fafb; }
.act-btn.interview { border: none; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
.act-btn.interview:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,.3); }
.act-btn.primary { border: none; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
.act-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,.3); }

/* 按钮 */
.ra-btn { height: 40px; padding: 0 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; border: 1px solid transparent; }
.ra-btn.primary { border: none; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
.ra-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(124,58,237,.3); }
.ra-btn.lg { height: 48px; padding: 0 32px; font-size: 15px; }
</style>
