<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAsyncInterviewStore } from '@/stores/candidate'
import { asyncInterviewFlows } from '@/mock/candidateData'

const router = useRouter()
const store = useAsyncInterviewStore()

const flows = asyncInterviewFlows
const flowIndex = ref(0)
const messages = ref([]) // { role: 'ai'|'candidate', content, time, dimension? }
const inputText = ref('')
const typing = ref(false)
const displayedText = ref('')
const started = ref(false)

// 计时
const totalSeconds = ref((store.invitation?.duration || 45) * 60)
const remaining = ref(totalSeconds.value)
const usedSeconds = ref(0)
const paused = ref(false)
const timer = ref(null)
const leaveCount = ref(0)
const leaveSeconds = ref(0)
let lastBlurAt = null

const remainText = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const usedText = computed(() => {
  const m = Math.floor(usedSeconds.value / 60)
  const s = usedSeconds.value % 60
  return `${m}m ${s}s`
})
const progressPct = computed(() => {
  const answered = messages.value.filter(m => m.role === 'candidate').length
  return Math.min(100, Math.round((answered / store.invitation.questionCount) * 100))
})
const currentDimension = computed(() => {
  const cur = flows[flowIndex.value]
  return cur?.dimension || (flowIndex.value === 0 ? '开场' : '收尾')
})

function startTimer() {
  if (timer.value) return
  timer.value = setInterval(() => {
    if (!paused.value) {
      if (remaining.value > 0) {
        remaining.value--
        usedSeconds.value++
      } else {
        finishByTimeout()
      }
    }
  }, 1000)
}
function stopTimer() { clearInterval(timer.value); timer.value = null }

async function streamAI(text) {
  typing.value = true
  displayedText.value = ''
  // 逐字流式输出
  for (let i = 0; i < text.length; i++) {
    if (!typing.value) { // 被中断
      displayedText.value = text
      break
    }
    displayedText.value += text[i]
    await new Promise(r => setTimeout(r, 18))
  }
  typing.value = false
  // 写入消息
  const cur = flows[flowIndex.value]
  messages.value.push({
    role: 'ai',
    content: text,
    time: nowTime(),
    dimension: cur?.dimension
  })
  displayedText.value = ''
}

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function startInterview() {
  started.value = true
  startTimer()
  await streamAI(flows[0].aiSay)
}

async function sendAnswer() {
  if (!inputText.value.trim() || typing.value) return
  const text = inputText.value.trim()
  messages.value.push({ role: 'candidate', content: text, time: nowTime() })
  inputText.value = ''
  // 推进到下一题
  flowIndex.value++
  if (flowIndex.value >= flows.length) {
    return finish()
  }
  await new Promise(r => setTimeout(r, 400))
  await streamAI(flows[flowIndex.value].aiSay)
}

function skipQuestion() {
  if (typing.value || !started.value) return
  flowIndex.value++
  if (flowIndex.value >= flows.length) return finish()
  streamAI(flows[flowIndex.value].aiSay)
}

function togglePause() {
  paused.value = !paused.value
}

function finish() {
  stopTimer()
  store.finish()
  router.push('/c/async/thanks')
}
function finishByTimeout() {
  stopTimer()
  store.finish()
  router.push('/c/async/thanks')
}
function manualFinish() {
  if (confirm('确认提前结束面试？已作答内容将被提交评估。')) finish()
}

// 失焦检测（防作弊日志）
function onBlur() {
  if (!started.value || paused.value) return
  lastBlurAt = Date.now()
  leaveCount.value++
}
function onFocus() {
  if (lastBlurAt) {
    leaveSeconds.value += Math.round((Date.now() - lastBlurAt) / 1000)
    lastBlurAt = null
  }
}

onMounted(() => {
  if (!store.isVerified) {
    router.replace('/c/login')
    return
  }
  window.addEventListener('blur', onBlur)
  window.addEventListener('focus', onFocus)
})
onUnmounted(() => {
  stopTimer()
  window.removeEventListener('blur', onBlur)
  window.removeEventListener('focus', onFocus)
})

function scrollToBottom() {
  nextTick(() => {
    const el = document.querySelector('.msg-list')
    if (el) el.scrollTop = el.scrollHeight
  })
}
</script>

<template>
  <div class="ar-page">
    <!-- 顶部栏 -->
    <header class="ar-top">
      <div class="ar-top-left">
        <span class="ar-org">{{ store.invitation?.orgLogo }} {{ store.invitation?.orgName }}</span>
        <span class="ar-sep">|</span>
        <span class="ar-pos">{{ store.invitation?.positionTitle }}</span>
      </div>
      <div class="ar-top-center">
        <div class="ar-timer" :class="{ warn: remaining < 300, paused }">
          <span class="ar-timer-icon">{{ paused ? '⏸' : '⏱' }}</span>
          {{ remainText }}
        </div>
      </div>
      <div class="ar-top-right">
        <button class="ar-btn ghost" @click="togglePause">{{ paused ? '继续' : '暂停' }}</button>
        <button class="ar-btn danger" @click="manualFinish">结束</button>
      </div>
    </header>

    <!-- 开始遮罩 -->
    <div v-if="!started" class="ar-start">
      <div class="ar-start-card">
        <h2>准备就绪？</h2>
        <p>岗位：{{ store.invitation?.positionTitle }} · 时长 {{ store.invitation?.duration }} 分钟</p>
        <p class="ar-start-tip">点击开始后，AI 面试官将发起开场白，进入正式问答。</p>
        <button class="ar-go" @click="startInterview">开始面试</button>
      </div>
    </div>

    <!-- 主体 -->
    <div class="ar-body">
      <!-- 对话区 -->
      <section class="ar-chat">
        <div class="msg-list">
          <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
            <div class="msg-avatar">{{ m.role === 'ai' ? '🤖' : '🙂' }}</div>
            <div class="msg-bubble">
              <div class="msg-meta">
                <span class="msg-name">{{ m.role === 'ai' ? 'AI 面试官' : store.invitation?.candidateName }}</span>
                <span v-if="m.dimension" class="msg-dim">{{ m.dimension }}</span>
                <span class="msg-time">{{ m.time }}</span>
              </div>
              <div class="msg-content" v-html="m.content.replace(/\n/g, '<br>')"></div>
            </div>
          </div>
          <!-- 流式输出气泡 -->
          <div v-if="typing" class="msg ai">
            <div class="msg-avatar">🤖</div>
            <div class="msg-bubble">
              <div class="msg-meta"><span class="msg-name">AI 面试官</span><span class="typing-dot">正在输入</span></div>
              <div class="msg-content" v-html="displayedText.replace(/\n/g, '<br>')"></div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="ar-input">
          <textarea
            v-model="inputText"
            class="ar-textarea"
            placeholder="在此输入你的回答...（回答完毕后点击发送，AI 将推进后续问题）"
            :disabled="typing || !started"
            @keydown.ctrl.enter="sendAnswer"
          ></textarea>
          <div class="ar-input-actions">
            <button class="ar-btn ghost" @click="skipQuestion" :disabled="typing || !started">跳过本题</button>
            <button class="ar-send" @click="sendAnswer" :disabled="!inputText.trim() || typing || !started">发送 ⏎</button>
          </div>
          <div class="ar-input-hint">Ctrl + Enter 快速发送 · 禁止复制粘贴题目</div>
        </div>
      </section>

      <!-- 右侧进度面板 -->
      <aside class="ar-side">
        <div class="side-card">
          <div class="side-title">作答进度</div>
          <div class="side-progress-ring">
            <div class="ring" :style="{ background: `conic-gradient(#7c3aed ${progressPct * 3.6}deg, #ede9fe 0)` }">
              <div class="ring-inner">{{ progressPct }}%</div>
            </div>
          </div>
          <div class="side-stat">
            <span>已答题数</span><b>{{ messages.filter(m => m.role === 'candidate').length }} / {{ store.invitation?.questionCount }}</b>
          </div>
          <div class="side-stat">
            <span>当前维度</span><b class="dim">{{ currentDimension }}</b>
          </div>
          <div class="side-stat">
            <span>已用时长</span><b>{{ usedText }}</b>
          </div>
        </div>

        <div class="side-card">
          <div class="side-title">行为日志</div>
          <div class="side-stat">
            <span>离页次数</span><b>{{ leaveCount }}</b>
          </div>
          <div class="side-stat">
            <span>离页累计</span><b>{{ leaveSeconds }}s</b>
          </div>
          <div class="side-stat">
            <span>暂停状态</span><b :class="{ on: paused }">{{ paused ? '已暂停' : '进行中' }}</b>
          </div>
          <p class="side-tip">离页行为将记录在面试报告中，供 HR 参考。</p>
        </div>

        <div class="side-card warn-card">
          <div class="side-title">离线保护</div>
          <p class="side-tip">网络中断时作答内容自动本地缓存，恢复后自动同步，无需担心数据丢失。</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.ar-page { height: 100vh; display: flex; flex-direction: column; background: #f6f8fb; }
.ar-top {
  height: 60px; background: #fff; border-bottom: 1px solid #ebedf0;
  display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,.03);
}
.ar-top-left { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.ar-org { font-weight: 600; color: #1f2937; }
.ar-sep { color: #d1d5db; }
.ar-pos { color: #6b7280; }
.ar-top-center { display: flex; align-items: center; }
.ar-timer {
  display: flex; align-items: center; gap: 6px; padding: 8px 18px;
  background: #f3f4f6; border-radius: 999px; font-weight: 700; font-size: 16px; color: #1f2937;
  font-variant-numeric: tabular-nums;
}
.ar-timer.warn { background: #fef2f2; color: #ef4444; animation: pulse 1.5s ease infinite; }
.ar-timer.paused { background: #fffbeb; color: #d97706; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .7; } }
.ar-top-right { display: flex; gap: 8px; }
.ar-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; border: 1px solid #e5e7eb; background: #fff; color: #374151; transition: all .2s; }
.ar-btn:hover { background: #f9fafb; }
.ar-btn.danger { color: #ef4444; border-color: #fecaca; }
.ar-btn.danger:hover { background: #fef2f2; }
.ar-btn:disabled { opacity: .5; cursor: not-allowed; }

.ar-start {
  position: fixed; inset: 60px 0 0 0; background: rgba(15,23,42,.7); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
.ar-start-card { background: #fff; border-radius: 20px; padding: 40px 48px; text-align: center; max-width: 420px; }
.ar-start-card h2 { font-size: 22px; color: #1f2937; margin-bottom: 12px; }
.ar-start-card p { color: #6b7280; font-size: 14px; margin-bottom: 4px; }
.ar-start-tip { color: #9ca3af; font-size: 13px; margin: 12px 0 24px; }
.ar-go {
  height: 48px; padding: 0 40px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
  font-size: 16px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.ar-go:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,.4); }

.ar-body { flex: 1; display: flex; overflow: hidden; }
.ar-chat { flex: 1; display: flex; flex-direction: column; padding: 20px; box-sizing: border-box; }
.msg-list { flex: 1; overflow-y: auto; padding: 8px 4px; display: flex; flex-direction: column; gap: 16px; }
.msg { display: flex; gap: 10px; max-width: 80%; }
.msg.candidate { align-self: flex-end; flex-direction: row-reverse; }
.msg-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
  background: #f3f4f6;
}
.msg.candidate .msg-avatar { background: #ede9fe; }
.msg-bubble { padding: 12px 16px; border-radius: 14px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.msg.candidate .msg-bubble { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
.msg-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.msg-name { font-size: 12px; font-weight: 600; color: #6b7280; }
.msg.candidate .msg-name { color: rgba(255,255,255,.9); }
.msg-dim { font-size: 10px; padding: 2px 6px; background: #ede9fe; color: #6d28d9; border-radius: 4px; font-weight: 500; }
.msg.candidate .msg-dim { background: rgba(255,255,255,.2); color: #fff; }
.msg-time { font-size: 11px; color: #9ca3af; margin-left: auto; }
.msg.candidate .msg-time { color: rgba(255,255,255,.7); }
.msg-content { font-size: 14px; line-height: 1.7; color: #1f2937; }
.msg.candidate .msg-content { color: #fff; }
.typing-dot { font-size: 11px; color: #7c3aed; }
.typing-dot::after { content: '...'; animation: dots 1.4s infinite; }
@keyframes dots { 0%,20% { content: '.'; } 40% { content: '..'; } 60%,100% { content: '...'; } }

.ar-input { border-top: 1px solid #ebedf0; padding-top: 16px; }
.ar-textarea {
  width: 100%; min-height: 100px; max-height: 160px; padding: 14px;
  border: 1px solid #e5e7eb; border-radius: 12px; font-size: 14px; line-height: 1.6;
  resize: none; outline: none; box-sizing: border-box; background: #fff; transition: border-color .2s;
  font-family: inherit;
}
.ar-textarea:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.ar-input-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.ar-send {
  padding: 10px 24px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.ar-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,58,237,.3); }
.ar-send:disabled { opacity: .5; cursor: not-allowed; background: #c4b5fd; }
.ar-input-hint { font-size: 11px; color: #9ca3af; margin-top: 6px; text-align: right; }

.ar-side { width: 280px; padding: 20px 20px 20px 0; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.side-card { background: #fff; border-radius: 14px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.side-title { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 14px; }
.side-progress-ring { display: flex; justify-content: center; margin-bottom: 16px; }
.ring {
  width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: background 1s;
}
.ring-inner {
  width: 70px; height: 70px; border-radius: 50%; background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: #7c3aed;
}
.side-stat { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid #f3f4f6; font-size: 13px; }
.side-stat span { color: #9ca3af; }
.side-stat b { color: #1f2937; font-weight: 600; }
.side-stat b.dim { color: #7c3aed; }
.side-stat b.on { color: #d97706; }
.side-tip { font-size: 12px; color: #9ca3af; line-height: 1.6; margin-top: 8px; }
.warn-card { background: #f0fdf4; border: 1px solid #bbf7d0; }
.warn-card .side-tip { color: #15803d; }
</style>
