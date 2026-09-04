<script setup>
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { usePositionStore, useCandidateStore } from '@/stores/data'
import { useMessage, useDialog } from 'naive-ui'
import { NTag, NButton, NSpace, NPopconfirm } from 'naive-ui'

const router = useRouter()
const positionStore = usePositionStore()
const candidateStore = useCandidateStore()
const message = useMessage()
const dialog = useDialog()

const search = ref('')
const statusFilter = ref(null)

const statusMap = {
  open: { label: '招聘中', type: 'success' },
  closed: { label: '已关闭', type: 'default' },
  on_hold: { label: '暂停', type: 'warning' }
}

const filtered = computed(() => {
  return positionStore.list.filter(p => {
    if (search.value && !p.title.includes(search.value) && !p.skillTags.join(',').toLowerCase().includes(search.value.toLowerCase())) return false
    if (statusFilter.value && p.status !== statusFilter.value) return false
    return true
  })
})

const columns = [
  {
    title: '岗位名称', key: 'title', render(row) {
      return h('a', { style: 'color:#5B8FF9;font-weight:500', onClick: () => router.push(`/position/${row.id}`) }, row.title)
    }
  },
  { title: '部门', key: 'department', width: 200 },
  {
    title: '技能标签', key: 'skillTags', width: 280, render(row) {
      return h(NSpace, { size: 4 }, () => row.skillTags.slice(0, 4).map(t => h(NTag, { size: 'small', bordered: false, type: 'info' }, () => t)))
    }
  },
  { title: '难度', key: 'difficulty', width: 80, render: (r) => h(NTag, { size: 'small', bordered: false, type: r.difficulty === '高级' ? 'error' : r.difficulty === '中级' ? 'warning' : 'default' }, () => r.difficulty) },
  {
    title: '状态', key: 'status', width: 100, render(row) {
      return h(NTag, { type: statusMap[row.status].type, bordered: false, size: 'small' }, () => statusMap[row.status].label)
    }
  },
  { title: '候选人数', key: 'candidateCount', width: 100, render: (r) => candidateStore.byPosition(r.id).length },
  { title: '创建时间', key: 'createdAt', width: 120 },
  {
    title: '操作', key: 'actions', width: 180, fixed: 'right', render(row) {
      return h(NSpace, { size: 8 }, () => [
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/position/${row.id}`) }, () => '详情'),
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/interview/create?positionId=${row.id}`) }, () => '发起面试'),
        h(NPopconfirm, { onPositiveClick: () => removePosition(row.id) }, {
          default: () => '确认删除该岗位？',
          trigger: () => h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除')
        })
      ])
    }
  }
]

function removePosition(id) {
  positionStore.remove(id)
  message.success('岗位已删除')
}

function parseJD() {
  message.success('AI 已从 JD 中抽取结构化技能点')
}
</script>

<template>
  <div class="page-container">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">岗位 JD 管理</h2>
        <p class="page-desc">管理企业招聘岗位，AI 自动结构化解析技能点</p>
      </div>
      <n-space>
        <n-button @click="parseJD">⚡ AI 解析 JD</n-button>
        <n-button type="primary" @click="router.push('/position/create')">+ 创建岗位</n-button>
      </n-space>
    </div>

    <n-card :bordered="false">
      <div class="mb-16 flex gap-12">
        <n-input v-model:value="search" placeholder="搜索岗位名称或技能标签" clearable style="width: 280px">
          <template #prefix>🔍</template>
        </n-input>
        <n-select v-model:value="statusFilter" :options="[
          { label: '全部状态', value: null },
          { label: '招聘中', value: 'open' },
          { label: '暂停', value: 'on_hold' },
          { label: '已关闭', value: 'closed' }
        ]" style="width: 160px" clearable />
      </div>
      <n-data-table :columns="columns" :data="filtered" :bordered="false" :single-line="false" size="medium" />
    </n-card>
  </div>
</template>
