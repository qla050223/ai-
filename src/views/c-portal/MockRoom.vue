<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCandidateDataStore, useCandidateAuthStore } from '@/stores/candidate'

const router = useRouter()
const route = useRoute()
const dataStore = useCandidateDataStore()
const auth = useCandidateAuthStore()

const interviewId = route.params.interviewId
const interview = computed(() => dataStore.interviewById(interviewId))

// 基于岗位的模拟对话流（AI 开场 → 多题 → 收尾反馈）
const baseFlows = [
  { stage: 'opening', aiSay: '你好，{{name}}。我是你的 AI 模拟面试官，今天针对「{{position}}」岗位进行一场 {{duration}} 分钟的练习面试。\n\n覆盖维度：{{dims}}。每题作答后我会根据你的回答触发动态追问，结束后会即时生成能力雷达图与改进建议。\n\n准备好了我们就开始：请用 1 分钟做个简短的自我介绍，重点放在你的技术栈与近期项目。', dimension: '开场' },
  { stage: 'q1', aiSay: '感谢介绍。直接进入技术部分。\n\n请说明 Vue3 的响应式原理：ref 与 reactive 的区别是什么？什么场景应该用哪个？', dimension: '专业技能' },
  { stage: 'q1_f', aiSay: '你提到 reactive 解构会丢失响应性，能否进一步说明原因？toRefs 是如何解决的？', dimension: '专业技能', isFollowUp: true },
  { stage: 'q2', aiSay: '理解到位。接下来看项目：请还原一次性能优化的完整路径——如何定位瓶颈、采取了哪些手段、如何度量结果？', dimension: '项目经验' },
  { stage: 'q2_f', aiSay: '如果数据量再翻 10 倍，你的方案还能支撑吗？你会从哪些维度重新设计？', dimension: '项目经验', isFollowUp: true },
  { stage: 'q3', aiSay: '换个工程化角度：团队要从单仓库迁移到 Monorepo（pnpm workspace），你会如何规划？需要考虑哪些风险与回滚方案？', dimension: '逻辑思维' },
  { stage: 'q4', aiSay: '最后聊聊协作：举一个你和后端出现分歧的例子，你是如何沟通并达成一致的？', dimension: '沟通表达' },
  { stage: 'closing', aiSay: '回答很有体系，我来做个简要反馈：\n\n- Vue3 响应式：理解到位，能讲到 Proxy 依赖收集\n- 性能优化：方法论完整，有量化结果\n- 工程化：考虑到了风险与回滚\n- 协作：复盘深度可加强\n\n模拟结束，正在为你生成能力报告...', dimension: '收尾', isClosing: true }
]

const messages = ref([])
const inputText = ref('')
const typing = ref(false)
const displayedText = ref('')
const started = ref(false)
const flowIndex = ref(0)
const generating = ref(false)

// 计时
const totalSeconds = computed(() => (interview.value?.duration || 30) * 60)
const usedSeconds = ref(0)
const timer = ref(null)
const usedText = computed(() => {
  const m = Math.floor(usedSeconds.value / 60)
  const s = usedSeconds.value % 60
  return `${m}m ${s}s`
})

const currentDimension = computed(() => {
  return getFlow(flowIndex.value)?.dimension || ''
})

function getFlow(i) {
  const f = baseFlows[i]
  if (!f) return null
  const name = auth.user?.name || '求职者'
  const position = interview.value?.positionTitle || '前端工程师'
  const dims = (interview.value?.dimensionsCovered || []).join('、')
  return { ...f, aiSay: f.aiSay.replace(/{{name}}/g, name).replace(/{{position}}/g, position).replace(/{{duration}}/g, interview.value?.duration || 30).replace(/{{dims}}/g, dims) }
}

function startTimer() {
  if (timer.value) return
  timer.value = setInterval(() => { usedSeconds.value++ }, 1000)
}
function stopTimer() { clearInterval(timer.value); timer.value = null }

async function streamAI(text) {
  typing.value = true
  displayedText.value = ''
  for (let i = 0; i < text.length; i++) {
    if (!typing.value) { displayedText.value = text; break }
    displayedText.value += text[i]
    await new Promise(r => setTimeout(r, 16))
  }
  typing.value = false
  const flow = getFlow(flowIndex.value)
  messages.value.push({
    role: 'ai',
    content: text,
    time: nowTime(),
    dimension: flow?.dimension
  })
  displayedText.value = ''
  scrollToBottom()
  // 收尾则触发报告生成
  if (flow?.isClosing) {
    await new Promise(r => setTimeout(r, 800))
    generating.value = true
    await new Promise(r => setTimeout(r, 1800))
    // 写入模拟报告数据
    finalizeReport()
    router.push(`/c/mock/result/${interviewId}`)
  }
}

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function start() {
  started.value = true
  startTimer()
  await streamAI(getFlow(0).aiSay)
}

async function sendAnswer() {
  if (!inputText.value.trim() || typing.value) return
  const text = inputText.value.trim()
  messages.value.push({ role: 'candidate', content: text, time: nowTime() })
  inputText.value = ''
  scrollToBottom()
  flowIndex.value++
  if (flowIndex.value >= baseFlows.length) return
  await new Promise(r => setTimeout(r, 400))
  await streamAI(getFlow(flowIndex.value).aiSay)
}

function skipQuestion() {
  if (typing.value || !started.value || generating.value) return
  flowIndex.value++
  if (flowIndex.value >= baseFlows.length) return finalizeAndGo()
  streamAI(getFlow(flowIndex.value).aiSay)
}

function finishEarly() {
  if (generating.value) return
  if (confirm('确认提前结束？已作答内容将生成能力报告。')) finalizeAndGo()
}
function finalizeAndGo() {
  stopTimer()
  finalizeReport()
  router.push(`/c/mock/result/${interviewId}`)
}

function finalizeReport() {
  const radar = {
    专业技能: 82, 项目经验: 80, 逻辑思维: 75, 沟通表达: 72, 学习能力: 85, 文化匹配: 74
  }
  const answered = messages.value.filter(m => m.role === 'candidate').length
  const overall = Math.round(Object.values(radar).reduce((a,b)=>a+b,0) / Object.keys(radar).length)
  dataStore.addMockInterview({
    id: interviewId, // 覆盖原记录
    typeId: interview.value?.typeId,
    positionTitle: interview.value?.positionTitle,
    duration: interview.value?.duration,
    overallScore: overall,
    radar,
    dimensionsCovered: interview.value?.dimensionsCovered || [],
    questionCount: answered,
    summary: '前端基础扎实，Vue3 响应式理解到位；性能优化有量化结果，工程化体系性可加强。',
    shortboards: ['工程化', '跨团队协作']
  })
  stopTimer()
}

function scrollToBottom() {
  nextTick(() => {
    const el = document.querySelector('.mr-msg-list')
    if (el) el.scrollTop = el.scrollHeight
  })
}

onMounted(() => {
  if (!interview.value) {
    router.replace('/c/mock')
    return
  }
})
onUnmounted(() => stopTimer())
</script>

<template>
  <div class="mr-page">
    <!-- 顶部 -->
    <header class="mr-top">
      <div class="mr-top-left">
        <span class="mr-badge">🤖 AI 模拟面试</span>
        <span class="mr-pos">{{ interview?.positionTitle }}</span>
      </div>
      <div class="mr-top-right">
        <span class="mr-timer">⏱ {{ usedText }}</span>
        <button class="mr-btn ghost" @click="skipQuestion" :disabled="typing || !started || generating">跳过本题</button>
        <button class="mr-btn danger" @click="finishEarly" :disabled="generating">提前结束</button>
      </div>
    </header>

    <!-- 开始遮罩 -->
    <div v-if="!started" class="mr-start">
      <div class="mr-start-card">
        <div class="ms-icon">🎯</div>
        <h2>模拟面试即将开始</h2>
        <p>岗位：{{ interview?.positionTitle }} · 时长 {{ interview?.duration }} 分钟</p>
        <p class="ms-tip">这是一场纯 AI 对话练习，无面试官旁听，可随时跳题或结束。</p>
        <button class="mr-go" @click="start">开始</button>
      </div>
    </div>

    <!-- 生成报告遮罩 -->
    <div v-if="generating" class="mr-gen">
      <div class="mr-gen-card">
        <div class="gen-spin"></div>
        <h3>正在生成能力报告</h3>
        <p>AI 正在分析你的作答，生成雷达图与改进建议...</p>
      </div>
    </div>

    <!-- 主体 -->
    <div class="mr-body">
      <section class="mr-chat">
        <div class="mr-msg-list">
          <div v-for="(m, i) in messages" :key="i" class="mr-msg" :class="m.role">
            <div class="mr-avatar">{{ m.role === 'ai' ? '🤖' : '🙂' }}</div>
            <div class="mr-bubble">
              <div class="mr-meta">
                <span class="mr-name">{{ m.role === 'ai' ? 'AI 面试官' : auth.displayName }}</span>
                <span v-if="m.dimension" class="mr-dim">{{ m.dimension }}</span>
                <span class="mr-time">{{ m.time }}</span>
              </div>
              <div class="mr-content" v-html="m.content.replace(/\n/g, '<br>')"></div>
            </div>
          </div>
          <div v-if="typing" class="mr-msg ai">
            <div class="mr-avatar">🤖</div>
            <div class="mr-bubble">
              <div class="mr-meta"><span class="mr-name">AI 面试官</span><span class="typing">正在输入</span></div>
              <div class="mr-content" v-html="displayedText.replace(/\n/g, '<br>')"></div>
            </div>
          </div>
        </div>

        <div class="mr-input">
          <textarea
            v-model="inputText"
            class="mr-textarea"
            placeholder="输入你的回答...（Ctrl+Enter 发送）"
            :disabled="typing || !started || generating"
            @keydown.ctrl.enter="sendAnswer"
          ></textarea>
          <div class="mr-input-actions">
            <button class="mr-send" @click="sendAnswer" :disabled="!inputText.trim() || typing || !started || generating">发送</button>
          </div>
        </div>
      </section>

      <!-- 右侧：练习信息 -->
      <aside class="mr-side">
        <div class="ms-card">
          <div class="ms-title">练习信息</div>
          <div class="ms-stat"><span>岗位</span><b>{{ interview?.positionTitle }}</b></div>
          <div class="ms-stat"><span>考察维度</span><b>{{ interview?.dimensionsCovered?.length }} 个</b></div>
          <div class="ms-stat"><span>题目数</span><b>{{ interview?.questionCount }}</b></div>
          <div class="ms-stat"><span>已用时长</span><b>{{ usedText }}</b></div>
        </div>
        <div class="ms-card">
          <div class="ms-title">当前维度</div>
          <div class="ms-current-dim">{{ currentDimension || '—' }}</div>
          <div class="ms-dims">
            <span v-for="d in interview?.dimensionsCovered" :key="d" class="ms-dim-tag" :class="{ active: d === currentDimension }">{{ d }}</span>
          </div>
        </div>
        <div class="ms-card tip-card">
          <div class="ms-title">💡 小贴士</div>
          <p class="ms-tip-text">这是模拟练习，不计入任何企业面试。可大胆尝试不同回答，AI 会给出结构化反馈。</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.mr-page { height: 100vh; display: flex; flex-direction: column; background: #f6f8fb; }
.mr-top {
  height: 60px; background: #fff; border-bottom: 1px solid #ebedf0;
  display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
}
.mr-top-left { display: flex; align-items: center; gap: 12px; }
.mr-badge {
  padding: 4px 12px; background: #ede9fe; color: #6d28d9; border-radius: 6px;
  font-size: 12px; font-weight: 600;
}
.mr-pos { font-size: 14px; color: #1f2937; font-weight: 500; }
.mr-top-right { display: flex; align-items: center; gap: 10px; }
.mr-timer {
  padding: 6px 14px; background: #f3f4f6; border-radius: 999px;
  font-size: 13px; font-weight: 600; color: #1f2937; font-variant-numeric: tabular-nums;
}
.mr-btn { padding: 8px 16px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; font-size: 13px; cursor: pointer; color: #374151; }
.mr-btn:hover:not(:disabled) { background: #f9fafb; }
.mr-btn.danger { color: #ef4444; border-color: #fecaca; }
.mr-btn.danger:hover:not(:disabled) { background: #fef2f2; }
.mr-btn:disabled { opacity: .5; cursor: not-allowed; }

.mr-start, .mr-gen {
  position: fixed; inset: 60px 0 0 0; background: rgba(15,23,42,.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
.mr-start-card, .mr-gen-card { background: #fff; border-radius: 20px; padding: 40px 48px; text-align: center; max-width: 420px; }
.ms-icon { font-size: 48px; margin-bottom: 12px; }
.mr-start-card h2, .mr-gen-card h3 { font-size: 20px; color: #1f2937; margin-bottom: 8px; }
.mr-start-card p { color: #6b7280; font-size: 14px; margin-bottom: 4px; }
.ms-tip { color: #9ca3af; font-size: 13px; margin: 12px 0 24px; }
.mr-go {
  height: 48px; padding: 0 40px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
  font-size: 16px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.mr-go:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,.4); }
.gen-spin {
  width: 48px; height: 48px; border: 4px solid #ede9fe; border-top-color: #7c3aed;
  border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.mr-gen-card p { color: #6b7280; font-size: 13px; }

.mr-body { flex: 1; display: flex; overflow: hidden; }
.mr-chat { flex: 1; display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
.mr-msg-list { flex: 1; overflow-y: auto; padding: 8px 4px; display: flex; flex-direction: column; gap: 16px; }
.mr-msg { display: flex; gap: 10px; max-width: 78%; }
.mr-msg.candidate { align-self: flex-end; flex-direction: row-reverse; }
.mr-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px; background: #f3f4f6;
}
.mr-msg.candidate .mr-avatar { background: #ede9fe; }
.mr-bubble { padding: 12px 16px; border-radius: 14px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.mr-msg.candidate .mr-bubble { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
.mr-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.mr-name { font-size: 12px; font-weight: 600; color: #6b7280; }
.mr-msg.candidate .mr-name { color: rgba(255,255,255,.9); }
.mr-dim { font-size: 10px; padding: 2px 6px; background: #ede9fe; color: #6d28d9; border-radius: 4px; font-weight: 500; }
.mr-msg.candidate .mr-dim { background: rgba(255,255,255,.2); color: #fff; }
.mr-time { font-size: 11px; color: #9ca3af; margin-left: auto; }
.mr-msg.candidate .mr-time { color: rgba(255,255,255,.7); }
.mr-content { font-size: 14px; line-height: 1.7; color: #1f2937; }
.mr-msg.candidate .mr-content { color: #fff; }
.typing { font-size: 11px; color: #7c3aed; }
.typing::after { content: '...'; animation: dots 1.4s infinite; }
@keyframes dots { 0%,20%{content:'.'} 40%{content:'..'} 60%,100%{content:'...'} }

.mr-input { border-top: 1px solid #ebedf0; padding-top: 16px; }
.mr-textarea {
  width: 100%; min-height: 90px; max-height: 140px; padding: 12px; border: 1px solid #e5e7eb;
  border-radius: 12px; font-size: 14px; line-height: 1.6; resize: none; outline: none;
  box-sizing: border-box; background: #fff; font-family: inherit; transition: border-color .2s;
}
.mr-textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.mr-input-actions { display: flex; justify-content: flex-end; margin-top: 10px; }
.mr-send {
  padding: 10px 28px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.mr-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,58,237,.3); }
.mr-send:disabled { opacity: .5; cursor: not-allowed; background: #c4b5fd; }

.mr-side { width: 280px; padding: 20px 20px 20px 0; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.ms-card { background: #fff; border-radius: 14px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.ms-title { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 14px; }
.ms-stat { display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #f3f4f6; font-size: 13px; }
.ms-stat span { color: #9ca3af; }
.ms-stat b { color: #1f2937; font-weight: 600; }
.ms-current-dim { font-size: 20px; font-weight: 700; color: #7c3aed; margin-bottom: 12px; }
.ms-dims { display: flex; flex-wrap: wrap; gap: 6px; }
.ms-dim-tag { padding: 3px 10px; background: #f3f4f6; color: #6b7280; border-radius: 6px; font-size: 11px; }
.ms-dim-tag.active { background: #ede9fe; color: #6d28d9; font-weight: 600; }
.tip-card { background: #f0fdf4; border: 1px solid #bbf7d0; }
.ms-tip-text { font-size: 12px; color: #15803d; line-height: 1.6; }
</style>
