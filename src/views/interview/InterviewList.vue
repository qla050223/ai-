<script setup>
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useInterviewStore, useCandidateStore } from '@/stores/data'
import { NTag, NButton, NSpace, NAvatar } from 'naive-ui'
import { interviewStatusMap, interviewModeMap } from '@/mock/data'

const router = useRouter()
const interviewStore = useInterviewStore()
const candidateStore = useCandidateStore()

const statusFilter = ref(null)
const modeFilter = ref(null)

const statusOptions = [
  { label: '全部状态', value: null },
  { label: '未开始', value: 'not_started' },
  { label: '进行中', value: 'in_progress' },
  { label: '已结束', value: 'completed' }
]

const filtered = computed(() => {
  return interviewStore.list.filter(i => {
    if (statusFilter.value && i.status !== statusFilter.value) return false
    if (modeFilter.value && i.mode !== modeFilter.value) return false
    return true
  })
})

const columns = [
  {
    title: '候选人', key: 'candidateName', width: 180, render(row) {
      const c = candidateStore.getById(row.candidateId)
      return h(NSpace, { size: 10, align: 'center' }, () => [
        h(NAvatar, { round: true, size: 'small', src: c?.avatar, color: '#5B8FF9' }, () => row.candidateName[0]),
        h('span', { style: 'font-weight: 500' }, row.candidateName)
      ])
    }
  },
  { title: '应聘岗位', key: 'positionTitle', width: 160 },
  {
    title: '面试模式', key: 'mode', width: 140, render(row) {
      return h(NTag, { type: row.mode === 'ai_auto' ? 'info' : 'success', bordered: false, size: 'small' }, () => interviewModeMap[row.mode].label)
    }
  },
  {
    title: '状态', key: 'status', width: 100, render(row) {
      return h(NTag, { type: interviewStatusMap[row.status].type, bordered: false, size: 'small' }, () => interviewStatusMap[row.status].label)
    }
  },
  { title: '创建时间', key: 'createdAt', width: 160 },
  { title: '时长(分)', key: 'duration', width: 90 },
  { title: '创建人', key: 'createdBy', width: 100 },
  {
    title: '操作', key: 'actions', width: 200, fixed: 'right', render(row) {
      const btns = [
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/interview/${row.id}/record`) }, () => '记录')
      ]
      if (row.status === 'not_started' || row.status === 'in_progress') {
        btns.push(h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/interview/${row.id}/room`) }, () => row.status === 'in_progress' ? '继续' : '进入面试'))
      }
      if (row.status === 'completed') {
        btns.push(h(NButton, { size: 'small', text: true, type: 'info', onClick: () => {
          // 找到对应报告
          router.push(`/report`)
        } }, () => '报告'))
      }
      return h(NSpace, { size: 8 }, () => btns)
    }
  }
]
</script>

<template>
  <div class="page-container">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">面试管理</h2>
        <p class="page-desc">所有面试会话集中管理，支持 AI 自主与面试官辅助两种模式</p>
      </div>
      <n-button type="primary" @click="router.push('/interview/create')">+ 创建面试</n-button>
    </div>

    <n-card :bordered="false">
      <div class="mb-16 flex gap-12">
        <n-select v-model:value="statusFilter" :options="statusOptions" style="width: 160px" />
        <n-select v-model:value="modeFilter" :options="[
          { label: '全部模式', value: null },
          { label: 'AI 自主面试', value: 'ai_auto' },
          { label: '面试官辅助', value: 'assist' }
        ]" style="width: 160px" />
      </div>
      <n-data-table :columns="columns" :data="filtered" :bordered="false" :single-line="false" size="medium" />
    </n-card>
  </div>
</template>
