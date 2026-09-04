<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore, useCandidateStore, useReportStore } from '@/stores/data'
import { interviewModeMap, interviewStatusMap } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const candidateStore = useCandidateStore()
const reportStore = useReportStore()
const message = useMessage()

const interview = computed(() => interviewStore.getById(route.params.id))
const candidate = computed(() => interview.value ? candidateStore.getById(interview.value.candidateId) : null)

// 模拟完整对话记录（实际从 interview.messages 取，原型用模拟数据）
const recordMessages = computed(() => {
  if (!interview.value) return []
  if (interview.value.messages && interview.value.messages.length) return interview.value.messages
  // 模拟记录
  return [
    { role: 'ai', content: '你好，张明远。我是 AI 面试官，今天由我与你进行本次面试...', ts: '10:05:12' },
    { role: 'candidate', content: '我有4年前端经验，精通Vue3全家桶，主导过飞书表格性能优化，FPS从30提升到55。', ts: '10:06:30' },
    { role: 'ai', content: 'Vue3 的响应式是核心，请详细说明 ref 与 reactive 的区别...', ts: '10:07:15' },
    { role: 'candidate', content: 'ref用于基本类型，reactive基于Proxy实现深度响应，解构会丢失响应性可用toRefs解决。', ts: '10:12:40' },
    { role: 'ai', content: '你提到 reactive 解构会丢失响应性，能否进一步说明原因？', ts: '10:13:20' },
    { role: 'candidate', content: '因为解构出来的是原始值，不再走 Proxy 的 get 拦截，所以依赖收集失效...', ts: '10:15:50' },
    { role: 'ai', content: '理解得很清晰。接下来看你的项目：飞书表格 FPS 从30到55的优化路径...', ts: '10:16:30' },
    { role: 'candidate', content: '先用Performance火焰图定位瓶颈，引入虚拟滚动+时间切片，FPS从30提到55，并建立Lighthouse监控。', ts: '10:22:10' },
    { role: 'ai', content: '如果数据量再翻10倍，你的方案还能支撑吗？', ts: '10:23:00' },
    { role: 'candidate', content: '需要引入Web Worker卸载计算，配合更细粒度的虚拟滚动与时间切片...', ts: '10:28:45' },
    { role: 'ai', content: '回答很有体系。今天的面试就到这里，我来做一个简要反馈...', ts: '10:35:20' }
  ]
})

const questions = computed(() => {
  const qIds = ['q_001', 'q_001', 'q_003', 'q_003']
  return qIds.map((id, i) => {
    const q = interview.value ? useQuestionStoreById(id) : null
    return { index: i + 1, id, title: ['ref 与 reactive 区别及响应式原理', 'reactive 解构响应性追问', '飞书表格性能优化路径', '数据量翻10倍方案'][i] }
  })
})

function useQuestionStoreById(id) { return null }

function exportRecord() { message.success('面试记录已导出为 PDF') }
function gotoReport() {
  if (interview.value) {
    const report = reportStore.byCandidate(interview.value.candidateId)[0]
    if (report) router.push(`/report/${report.id}`)
    else { message.info('报告生成中，请稍后查看'); router.push('/report') }
  }
}
</script>

<template>
  <div class="page-container" v-if="interview">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">面试记录</h2>
        <p class="page-desc">{{ candidate?.name }} · {{ interview.positionTitle }} · {{ interviewModeMap[interview.mode].label }}</p>
      </div>
      <n-space>
        <n-button @click="exportRecord">📥 导出记录</n-button>
        <n-button type="primary" @click="gotoReport">查看评估报告</n-button>
      </n-space>
    </div>

    <n-grid :cols="3" :x-gap="16" :y-gap="16">
      <n-grid-item span="2">
        <n-card :bordered="false">
          <template #header>
            <n-space align="center" :size="12">
              <span>对话记录</span>
              <n-tag :type="interviewStatusMap[interview.status].type" size="small" :bordered="false">{{ interview.statusText }}</n-tag>
              <span class="text-muted text-sm">· {{ interview.duration }} 分钟</span>
            </n-space>
          </template>
          <div class="record-list">
            <div v-for="(msg, i) in recordMessages" :key="i" class="record-row" :class="msg.role">
              <div class="rec-time">{{ msg.ts }}</div>
              <div class="rec-role">
                <span v-if="msg.role === 'ai'">🤖 AI</span>
                <span v-else-if="msg.role === 'candidate'">👤 候选人</span>
                <span v-else>👔 面试官</span>
              </div>
              <div class="rec-content">{{ msg.content }}</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item span="1">
        <n-card title="面试信息" :bordered="false" class="mb-16">
          <n-descriptions label-placement="top" :column="1" size="small">
            <n-descriptions-item label="候选人">{{ candidate?.name }}</n-descriptions-item>
            <n-descriptions-item label="岗位">{{ interview.positionTitle }}</n-descriptions-item>
            <n-descriptions-item label="模式">{{ interviewModeMap[interview.mode].label }}</n-descriptions-item>
            <n-descriptions-item label="创建人">{{ interview.createdBy }}</n-descriptions-item>
            <n-descriptions-item label="创建时间">{{ interview.createdAt }}</n-descriptions-item>
            <n-descriptions-item label="考察维度">{{ interview.focusDimensions.join('、') }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="逐题作答摘要" :bordered="false">
          <n-list size="small">
            <n-list-item v-for="q in questions" :key="q.index">
              <n-thing>
                <template #header>Q{{ q.index }}. {{ q.title }}</template>
                <template #description>
                  <n-space :size="8" style="font-size: 12px">
                    <span class="text-muted">AI 摘要：候选人回答完整</span>
                  </n-space>
                </template>
                <template #action>
                  <n-tag size="tiny" :bordered="false" type="success">已作答</n-tag>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
  <n-empty v-else description="面试记录不存在" style="padding: 100px">
    <template #footer><n-button type="primary" @click="router.push('/interview')">返回列表</n-button></template>
  </n-empty>
</template>

<style scoped>
.record-list { display: flex; flex-direction: column; gap: 12px; max-height: 600px; overflow-y: auto; }
.record-row { display: flex; gap: 12px; padding: 12px; border-radius: 6px; background: #fafbfc; }
.rec-time { font-size: 11px; color: #86909c; width: 60px; flex-shrink: 0; }
.rec-role { font-size: 12px; font-weight: 500; width: 70px; flex-shrink: 0; color: #5B8FF9; }
.rec-content { flex: 1; font-size: 13px; line-height: 1.6; color: #4e5969; }
</style>
