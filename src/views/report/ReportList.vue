<script setup>
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore, useCandidateStore } from '@/stores/data'
import { NTag, NButton, NSpace, NAvatar } from 'naive-ui'
import { recommendLevelMap } from '@/mock/data'

const router = useRouter()
const reportStore = useReportStore()
const candidateStore = useCandidateStore()

const levelFilter = ref(null)

const filtered = computed(() => {
  return reportStore.list.filter(r => {
    if (levelFilter.value && r.recommendLevel !== levelFilter.value) return false
    return true
  })
})

const columns = [
  {
    title: '候选人', key: 'candidateName', width: 160, render(row) {
      const c = candidateStore.getById(row.candidateId)
      return h(NSpace, { size: 10, align: 'center' }, () => [
        h(NAvatar, { round: true, size: 'small', src: c?.avatar, color: '#5B8FF9' }, () => row.candidateName[0]),
        h('a', { style: 'font-weight: 500', onClick: () => router.push(`/report/${row.id}`) }, row.candidateName)
      ])
    }
  },
  { title: '应聘岗位', key: 'positionTitle', width: 160 },
  {
    title: '综合分', key: 'overallScore', width: 100, render: (r) => h('span', { style: `font-weight: 700; color: ${r.overallScore >= 85 ? '#5AD8A6' : r.overallScore >= 70 ? '#5B8FF9' : '#E86452'}` }, r.overallScore)
  },
  {
    title: '推荐等级', key: 'recommendLevel', width: 110, render(row) {
      return h(NTag, { type: recommendLevelMap[row.recommendLevel].type, bordered: false, size: 'small' }, () => recommendLevelMap[row.recommendLevel].label)
    }
  },
  { title: '生成时间', key: 'generatedAt', width: 160 },
  {
    title: '状态', key: 'revised', width: 90, render: (r) => h(NTag, { size: 'small', bordered: false, type: r.revised ? 'warning' : 'default' }, () => r.revised ? '已修正' : '原始')
  },
  {
    title: '操作', key: 'actions', width: 160, fixed: 'right', render(row) {
      return h(NSpace, { size: 8 }, () => [
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/report/${row.id}`) }, () => '查看'),
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/report/${row.id}`) }, () => '修正')
      ])
    }
  }
]
</script>

<template>
  <div class="page-container">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">评估报告</h2>
        <p class="page-desc">面试结束后自动生成，支持人工修正与导出分享</p>
      </div>
      <n-button type="primary" @click="router.push('/interview')">发起面试</n-button>
    </div>

    <n-card :bordered="false">
      <div class="mb-16 flex gap-12">
        <n-select v-model:value="levelFilter" :options="[
          { label: '全部推荐等级', value: null },
          { label: '强烈推荐', value: 'strongly_recommended' },
          { label: '推荐', value: 'recommended' },
          { label: '待定', value: 'pending' },
          { label: '不推荐', value: 'not_recommended' }
        ]" style="width: 180px" />
      </div>
      <n-data-table :columns="columns" :data="filtered" :bordered="false" :single-line="false" size="medium" />
    </n-card>
  </div>
</template>
