<script setup>
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore, usePositionStore } from '@/stores/data'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NSpace, NPopconfirm } from 'naive-ui'

const router = useRouter()
const questionStore = useQuestionStore()
const positionStore = usePositionStore()
const message = useMessage()

const dimensionFilter = ref(null)
const difficultyFilter = ref(null)
const generating = ref(false)

const allQuestions = computed(() => questionStore.allQuestions)
const filtered = computed(() => allQuestions.value.filter(q => {
  if (dimensionFilter.value && q.dimension !== dimensionFilter.value) return false
  if (difficultyFilter.value && q.difficulty !== difficultyFilter.value) return false
  return true
}))

const dimensionOptions = computed(() => {
  const dims = [...new Set(allQuestions.value.map(q => q.dimension))]
  return [{ label: '全部维度', value: null }, ...dims.map(d => ({ label: d, value: d }))]
})

const difficultyOptions = [
  { label: '全部难度', value: null },
  { label: '简单', value: '简单' },
  { label: '中等', value: '中等' },
  { label: '困难', value: '困难' }
]

const columns = [
  {
    title: '题目', key: 'content', render(row) {
      return h('a', { style: 'color:#4e5969;line-height:1.6', onClick: () => router.push(`/question/${row.id}`) }, row.content)
    }
  },
  { title: '岗位', key: 'positionTitle', width: 140 },
  {
    title: '维度', key: 'dimension', width: 100, render: (r) => h(NTag, { size: 'small', bordered: false, type: 'info' }, () => r.dimension)
  },
  { title: '技能点', key: 'skill', width: 140 },
  { title: '题型', key: 'type', width: 80 },
  {
    title: '难度', key: 'difficulty', width: 80, render: (r) => h(NTag, { size: 'small', bordered: false, type: r.difficulty === '困难' ? 'error' : r.difficulty === '中等' ? 'warning' : 'default' }, () => r.difficulty)
  },
  { title: '使用', key: 'usageCount', width: 70, render: (r) => `${r.usageCount} 次` },
  { title: '平均分', key: 'avgScore', width: 80, render: (r) => r.avgScore || '-' },
  {
    title: '操作', key: 'actions', width: 140, fixed: 'right', render(row) {
      return h(NSpace, { size: 6 }, () => [
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/question/${row.id}`) }, () => '详情'),
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => message.info('编辑功能') }, () => '编辑'),
        h(NPopconfirm, { onPositiveClick: () => message.success('已删除') }, {
          default: () => '确认删除该题？',
          trigger: () => h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除')
        })
      ])
    }
  }
]

function generateForPosition() {
  // 模拟基于岗位生成题库
  message.info('请选择岗位后点击「AI 生成题库」')
}
</script>

<template>
  <div class="page-container">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">题库中心</h2>
        <p class="page-desc">AI 生成 + 人工沉淀的岗位题库，支持分类筛选与复用</p>
      </div>
      <n-space>
        <n-button @click="generateForPosition">⚡ AI 生成题库</n-button>
        <n-button type="primary" @click="message.info('手动添加题目')">+ 手动添加</n-button>
      </n-space>
    </div>

    <!-- 题库统计卡 -->
    <n-grid :cols="4" :x-gap="16" class="mb-16" responsive="screen" item-responsive>
      <n-grid-item span="4 m:2 l:1">
        <n-card :bordered="false" size="small"><n-statistic label="题目总数" :value="allQuestions.length" /></n-card>
      </n-grid-item>
      <n-grid-item span="4 m:2 l:1">
        <n-card :bordered="false" size="small"><n-statistic label="自动生成" :value="allQuestions.length" /></n-card>
      </n-grid-item>
      <n-grid-item span="4 m:2 l:1">
        <n-card :bordered="false" size="small"><n-statistic label="覆盖岗位" :value="questionStore.banks.length" /></n-card>
      </n-grid-item>
      <n-grid-item span="4 m:2 l:1">
        <n-card :bordered="false" size="small"><n-statistic label="平均使用次数" :value="Math.round(allQuestions.reduce((s, q) => s + q.usageCount, 0) / allQuestions.length)" /></n-card>
      </n-grid-item>
    </n-grid>

    <n-card :bordered="false">
      <div class="mb-16 flex gap-12">
        <n-select v-model:value="dimensionFilter" :options="dimensionOptions" style="width: 180px" />
        <n-select v-model:value="difficultyFilter" :options="difficultyOptions" style="width: 140px" />
        <n-button quirk @click="dimensionFilter = null; difficultyFilter = null">重置</n-button>
      </div>
      <n-data-table :columns="columns" :data="filtered" :bordered="false" :single-line="false" size="medium" />
    </n-card>
  </div>
</template>
