<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore, useCandidateStore, useQuestionStore, useReportStore } from '@/stores/data'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NSpace, NProgress } from 'naive-ui'
import { interviewFlows, streamText, getAiScoreHint, getFollowUpSuggestions, getDimensionCoverage } from '@/mock/aiSimulator'
import { interviewModeMap } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const candidateStore = useCandidateStore()
const questionStore = useQuestionStore()
const reportStore = useReportStore()
const message = useMessage()

const interview = computed(() => interviewStore.getById(route.params.id))
const candidate = computed(() => interview.value ? candidateStore.getById(interview.value.candidateId) : null)

const messages = ref([])
const inputText = ref('')
const isStreaming = ref(false)
const isPaused = ref(false)
const isEnded = ref(false)
const chatBodyRef = ref(null)
const timer = ref(0)
const flowIndex = ref(0)
const askedDimensions = ref([])

let timerInterval = null

const currentFlow = computed(() => interviewFlows[flowIndex.value])

onMounted(() => {
  if (interview.value) {
    // 标记面试进行中
    if (interview.value.status === 'not_started') {
      interviewStore.updateStatus(route.params.id, 'in_progress', '进行中')
    }
    startTimer()
    // 启动 AI 开场白
    setTimeout(() => streamAiMessage(currentFlow.value), 600)
  }
})

onUnmounted(() => clearInterval(timerInterval))

function startTimer() {
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (!isPaused.value && !isEnded.value) timer.value++
  }, 1000)
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

// AI 流式输出
function streamAiMessage(flow) {
  if (!flow) return
  isStreaming.value = true
  const aiMsg = ref({ role: 'ai', content: '', ts: Date.now(), stage: flow.stage })
  messages.value.push(aiMsg.value)
  
  // 记录已考察维度
  if (flow.questionId) {
    const q = questionStore.byId(flow.questionId)
    if (q && !askedDimensions.value.includes(q.dimension)) askedDimensions.value.push(q.dimension)
  }

  streamText(flow.aiSay, 
    (token) => {
      aiMsg.value.content += token
      scrollToBottom()
    },
    () => {
      isStreaming.value = false
      // 如果是结束阶段
      if (flow.isClosing) {
        isEnded.value = true
        finishInterview()
      }
    },
    35
  )
}

function scrollToBottom() {
  nextTick(() => {
    const el = chatBodyRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

// 候选人/面试官发送消息
function sendMessage(asInterviewer = false) {
  const text = inputText.value.trim()
  if (!text || isStreaming.value || isEnded.value) return
  
  messages.value.push({ role: asInterviewer ? 'interviewer' : 'candidate', content: text, ts: Date.now() })
  inputText.value = ''
  scrollToBottom()

  // 推进面试流程
  setTimeout(() => {
    flowIndex.value++
    if (flowIndex.value < interviewFlows.length) {
      streamAiMessage(interviewFlows[flowIndex.value])
    } else {
      // 流程结束
      isEnded.value = true
      finishInterview()
    }
  }, 500)
}

function finishInterview() {
  clearInterval(timerInterval)
  interviewStore.updateStatus(route.params.id, 'completed', '已结束')
  // 更新候选人状态为待评估
  candidateStore.updateStatus(interview.value.candidateId, 'pending_eval', '待评估')
  message.success('面试已结束，正在生成评估报告...')
}

// 辅助模式：AI 建议
const aiSuggestions = computed(() => {
  if (interview.value?.mode !== 'assist') return null
  const flow = currentFlow.value
  if (!flow?.questionId) return null
  return {
    followUps: getFollowUpSuggestions(flow.questionId),
    scoreHint: messages.value.filter(m => m.role === 'candidate').slice(-1)[0]
      ? getAiScoreHint(messages.value.filter(m => m.role === 'candidate').slice(-1)[0].content)
      : null,
    coverage: getDimensionCoverage(interview.value.focusDimensions, askedDimensions.value)
  }
})

const aiScoreData = computed(() => aiSuggestions.value?.scoreHint)

function sendFollowUp(text) {
  inputText.value = text
  sendMessage(true)
}

function pauseInterview() {
  isPaused.value = true
  message.info('面试已暂停')
}
function resumeInterview() {
  isPaused.value = false
  message.success('面试已恢复')
}
function endEarly() {
  isEnded.value = true
  finishInterview()
}

function gotoRecord() {
  router.push(`/interview/${route.params.id}/record`)
}

// 快速预设回答
const quickReplies = [
  '（自我介绍）我有4年前端经验，精通Vue3全家桶，主导过飞书表格性能优化，FPS从30提升到55。',
  'ref用于基本类型，reactive基于Proxy实现深度响应，解构会丢失响应性可用toRefs解决。',
  '先用Performance火焰图定位瓶颈，引入虚拟滚动+时间切片，FPS从30提到55，并建立Lighthouse监控。',
  '分阶段迁移，统一依赖版本，引入Turbo构建缓存，调整CI流水线，准备回滚预案。',
  '（结束）好的，我没有问题了。'
]

function useQuickReply(idx) {
  inputText.value = quickReplies[idx]
}
</script>

<template>
  <div class="page-container" v-if="interview" style="padding: 16px; height: calc(100vh - 56px); display: flex; flex-direction: column">
    <!-- 头部 -->
    <div class="room-header">
      <div class="flex-center gap-12">
        <n-avatar round :size="36" :src="candidate?.avatar" color="#5B8FF9">{{ candidate?.name?.[0] }}</n-avatar>
        <div>
          <div style="font-weight: 600; font-size: 15px">{{ candidate?.name }} · {{ interview.positionTitle }}</div>
          <div class="text-muted text-sm">
            <n-tag size="tiny" :bordered="false" :type="interview.mode === 'ai_auto' ? 'info' : 'success'">{{ interviewModeMap[interview.mode].label }}</n-tag>
            <span style="margin-left: 8px">考察维度：{{ interview.focusDimensions.join('、') }}</span>
          </div>
        </div>
      </div>
      <n-space align="center" :size="12">
        <div class="timer" :class="{ paused: isPaused, ended: isEnded }">⏱ {{ formatTime(timer) }}</div>
        <n-button v-if="!isPaused && !isEnded" size="small" @click="pauseInterview">暂停</n-button>
        <n-button v-if="isPaused && !isEnded" size="small" type="primary" @click="resumeInterview">恢复</n-button>
        <n-button v-if="!isEnded" size="small" type="error" quirk @click="endEarly">提前结束</n-button>
        <n-button v-if="isEnded" size="small" type="primary" @click="gotoRecord">查看记录</n-button>
      </n-space>
    </div>

    <div style="flex: 1; display: flex; gap: 16px; min-height: 0">
      <!-- 对话区 -->
      <div style="flex: 1; display: flex; flex-direction: column; background: #fff; border-radius: 8px; overflow: hidden; min-width: 0">
        <div ref="chatBodyRef" class="chat-body">
          <div v-for="(msg, i) in messages" :key="i" class="chat-row" :class="msg.role">
            <div class="chat-meta">
              <span v-if="msg.role === 'ai'">🤖 AI 面试官</span>
              <span v-else-if="msg.role === 'candidate'">👤 {{ candidate?.name }}</span>
              <span v-else>👔 面试官</span>
            </div>
            <div class="chat-bubble" :class="msg.role === 'ai' ? 'chat-ai' : msg.role === 'interviewer' ? 'chat-interviewer' : 'chat-candidate'">
              {{ msg.content }}<span v-if="isStreaming && i === messages.length - 1 && msg.role === 'ai'" class="cursor">▋</span>
            </div>
          </div>
          <div v-if="isEnded" class="chat-end">
            <n-tag type="success" :bordered="false">✓ 面试已结束</n-tag>
            <p class="text-muted text-sm mt-12">AI 正在生成评估报告，请稍候查看</p>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="chat-input" v-if="!isEnded">
          <div v-if="interview.mode === 'ai_auto'" class="quick-replies">
            <n-button v-for="(q, idx) in quickReplies.slice(0, 3)" :key="idx" size="tiny" quirk @click="useQuickReply(idx)">{{ q.slice(0, 12) }}...</n-button>
          </div>
          <div class="flex gap-12">
            <n-input v-model:value="inputText" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" :disabled="isStreaming || isPaused"
              :placeholder="isStreaming ? 'AI 正在回复...' : isPaused ? '面试已暂停' : (interview.mode === 'assist' ? '以面试官身份发送...' : '请输入候选人回答...')"
              @keydown.enter.exact.prevent="sendMessage(interview.mode === 'assist')" />
            <n-button type="primary" :disabled="isStreaming || isPaused || !inputText.trim()" @click="sendMessage(interview.mode === 'assist')">
              {{ interview.mode === 'assist' ? '发送' : '候选人作答' }}
            </n-button>
          </div>
        </div>
      </div>

      <!-- 右侧辅助面板 -->
      <div style="width: 300px; display: flex; flex-direction: column; gap: 16px" v-if="interview.mode === 'assist'">
        <!-- AI 题目推荐 -->
        <n-card title="🎯 当前题目" size="small" :bordered="false">
          <div v-if="currentFlow" class="text-sm" style="line-height: 1.7">{{ currentFlow.aiSay }}</div>
          <n-empty v-else description="面试已完成" size="small" />
        </n-card>

        <!-- AI 追问建议 -->
        <n-card title="💡 AI 追问建议" size="small" :bordered="false" v-if="aiSuggestions?.followUps?.length">
          <n-space vertical :size="8">
            <n-button v-for="(fu, i) in aiSuggestions.followUps" :key="i" block size="small" @click="sendFollowUp(fu)" align="left">
              {{ fu }}
            </n-button>
          </n-space>
        </n-card>

        <!-- AI 实时评分参考 -->
        <n-card title="📊 AI 评分参考" size="small" :bordered="false" v-if="aiScoreData">
          <div class="flex-between mb-12">
            <span class="text-sm">预评分</span>
            <n-tag :type="aiScoreData.score >= 80 ? 'success' : aiScoreData.score >= 60 ? 'warning' : 'error'" :bordered="false">
              {{ aiScoreData.score }} 分
            </n-tag>
          </div>
          <n-space :size="4" wrap>
            <n-tag v-for="t in aiScoreData.tags" :key="t" size="tiny" :bordered="false" type="info">{{ t }}</n-tag>
          </n-space>
        </n-card>

        <!-- 维度覆盖 -->
        <n-card title="✓ 维度覆盖" size="small" :bordered="false" v-if="aiSuggestions">
          <n-space vertical :size="6">
            <n-tag v-for="d in interview.focusDimensions" :key="d" size="small" :bordered="false" :type="askedDimensions.includes(d) ? 'success' : 'default'">
              {{ askedDimensions.includes(d) ? '✓' : '○' }} {{ d }}
            </n-tag>
          </n-space>
          <div class="text-muted text-sm mt-12" v-if="!aiSuggestions.coverage.complete">{{ aiSuggestions.coverage.message }}</div>
        </n-card>
      </div>

      <!-- AI 自主模式：右侧流程信息 -->
      <div style="width: 260px; display: flex; flex-direction: column; gap: 16px" v-else>
        <n-card title="📋 面试流程" size="small" :bordered="false">
          <n-steps :current="flowIndex + 1" size="small" vertical>
            <n-step v-for="(f, i) in interviewFlows" :key="f.stage" :title="f.isClosing ? '收尾反馈' : f.questionId ? `Q${i}` : '开场'" :description="f.questionId ? '' : f.stage === 'opening' ? '自我介绍' : ''" />
          </n-steps>
        </n-card>

        <n-card title="✓ 维度覆盖" size="small" :bordered="false">
          <n-space vertical :size="6">
            <n-tag v-for="d in interview.focusDimensions" :key="d" size="small" :bordered="false" :type="askedDimensions.includes(d) ? 'success' : 'default'">
              {{ askedDimensions.includes(d) ? '✓' : '○' }} {{ d }}
            </n-tag>
          </n-space>
        </n-card>

        <n-card title="📝 面试官旁听" size="small" :bordered="false">
          <p class="text-muted text-sm" style="margin: 0 0 8px">HR 可旁听 AI 与候选人对话全过程</p>
          <n-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="记录批注..." />
        </n-card>
      </div>
    </div>
  </div>
  <n-empty v-else description="面试不存在" style="padding: 100px" />
</template>

<style scoped>
.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
}
.timer {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #5B8FF9;
  padding: 4px 12px;
  background: #f0f5ff;
  border-radius: 6px;
}
.timer.paused { color: #faad14; background: #fff7e6; }
.timer.ended { color: #86909c; background: #f2f3f5; }
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chat-row { display: flex; flex-direction: column; }
.chat-row.candidate, .chat-row.interviewer { align-items: flex-end; }
.chat-row.ai { align-items: flex-start; }
.chat-input {
  border-top: 1px solid #f0f0f0;
  padding: 12px;
}
.quick-replies { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.chat-end { text-align: center; padding: 20px; }
.cursor { animation: blink 1s infinite; color: #5B8FF9; }
@keyframes blink { 50% { opacity: 0; } }
</style>
