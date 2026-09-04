<script setup>
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateStore, usePositionStore } from '@/stores/data'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NSpace, NAvatar } from 'naive-ui'
import { candidateStatusMap } from '@/mock/data'

const router = useRouter()
const candidateStore = useCandidateStore()
const positionStore = usePositionStore()
const message = useMessage()

const search = ref('')
const statusFilter = ref(null)
const showUpload = ref(false)
const uploadForm = ref({ name: '', email: '', positionId: null })

const statusOptions = [
  { label: '全部状态', value: null },
  { label: '待面试', value: 'pending' },
  { label: '面试中', value: 'interviewing' },
  { label: '待评估', value: 'pending_eval' },
  { label: '已通过', value: 'passed' },
  { label: '已淘汰', value: 'rejected' }
]

const filtered = computed(() => {
  return candidateStore.list.filter(c => {
    if (search.value && !c.name.includes(search.value)) return false
    if (statusFilter.value && c.status !== statusFilter.value) return false
    return true
  })
})

const columns = [
  {
    title: '候选人', key: 'name', width: 200, render(row) {
      return h(NSpace, { size: 12, align: 'center' }, () => [
        h(NAvatar, { round: true, size: 'medium', src: row.avatar, color: '#5B8FF9' }, () => row.name[0]),
        h('a', { style: 'font-weight: 500', onClick: () => router.push(`/candidate/${row.id}`) }, row.name)
      ])
    }
  },
  { title: '应聘岗位', key: 'positionTitle', width: 160 },
  {
    title: '来源', key: 'source', width: 100, render: (r) => h(NTag, { size: 'small', bordered: false }, () => r.source)
  },
  { title: '最近公司', key: 'lastCompany', width: 140, render: (r) => r.resumeParsed?.lastCompany },
  { title: '经验', key: 'workYears', width: 80, render: (r) => `${r.resumeParsed?.workYears || 0} 年` },
  {
    title: '状态', key: 'status', width: 110, render(row) {
      return h(NTag, { type: candidateStatusMap[row.status].type, bordered: false, size: 'small' }, () => candidateStatusMap[row.status].label)
    }
  },
  { title: '阶段', key: 'stage', width: 100 },
  {
    title: '操作', key: 'actions', width: 200, fixed: 'right', render(row) {
      return h(NSpace, { size: 8 }, () => [
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/candidate/${row.id}`) }, () => '档案'),
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => router.push(`/interview/create?candidateId=${row.id}`) }, () => '发起面试'),
        h(NButton, { size: 'small', text: true, type: 'info', onClick: () => router.push(`/report?candidateId=${row.id}`) }, () => '报告')
      ])
    }
  }
]

const positionOptions = computed(() => positionStore.list.map(p => ({ label: p.title, value: p.id })))

function handleUpload() {
  if (!uploadForm.value.name || !uploadForm.value.positionId) {
    message.warning('请填写姓名与应聘岗位')
    return
  }
  const pos = positionStore.getById(uploadForm.value.positionId)
  candidateStore.create({
    name: uploadForm.value.name,
    email: uploadForm.value.email,
    phone: '138****' + Math.floor(1000 + Math.random() * 9000),
    appliedPositionId: uploadForm.value.positionId,
    positionTitle: pos.title,
    source: '手动添加',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20minimal%20flat%20illustration&image_size=square_hd',
    resumeParsed: { education: '待解析', workYears: 0, lastCompany: '待解析', skills: [], projects: [] }
  })
  message.success('候选人已添加，请上传简历进行解析')
  showUpload.value = false
  uploadForm.value = { name: '', email: '', positionId: null }
}
</script>

<template>
  <div class="page-container">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">候选人档案</h2>
        <p class="page-desc">管理候选人档案，支持简历上传与 AI 结构化解析</p>
      </div>
      <n-button type="primary" @click="showUpload = true">+ 添加候选人</n-button>
    </div>

    <n-card :bordered="false">
      <div class="mb-16 flex gap-12">
        <n-input v-model:value="search" placeholder="搜索候选人姓名" clearable style="width: 240px">
          <template #prefix>🔍</template>
        </n-input>
        <n-select v-model:value="statusFilter" :options="statusOptions" style="width: 160px" />
      </div>
      <n-data-table :columns="columns" :data="filtered" :bordered="false" :single-line="false" size="medium" />
    </n-card>

    <!-- 添加候选人弹窗 -->
    <n-modal v-model:show="showUpload" preset="card" title="添加候选人" style="width: 480px">
      <n-form label-placement="top">
        <n-form-item label="姓名" required><n-input v-model:value="uploadForm.name" placeholder="候选人姓名" /></n-form-item>
        <n-form-item label="邮箱"><n-input v-model:value="uploadForm.email" placeholder="候选人邮箱" /></n-form-item>
        <n-form-item label="应聘岗位" required>
          <n-select v-model:value="uploadForm.positionId" :options="positionOptions" placeholder="选择岗位" />
        </n-form-item>
        <n-form-item label="简历上传">
          <n-upload action="#" :max="1" accept=".pdf,.doc,.docx" :default-upload="false">
            <n-upload-dragger>
              <div style="padding: 20px 0">📄<br/><span class="text-muted">点击或拖拽 PDF/Word 简历</span></div>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showUpload = false">取消</n-button>
          <n-button type="primary" @click="handleUpload">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
