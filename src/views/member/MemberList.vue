<script setup>
import { ref, h } from 'vue'
import { useMemberStore } from '@/stores/data'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NSpace, NAvatar, NPopconfirm } from 'naive-ui'

const memberStore = useMemberStore()
const message = useMessage()

const showInvite = ref(false)
const inviteForm = ref({ email: '', role: 'member' })

const roleMap = {
  super_admin: { label: '超级管理员', type: 'error' },
  hr_admin: { label: 'HR 管理员', type: 'info' },
  hiring_manager: { label: '用人经理', type: 'warning' },
  interviewer: { label: '面试官', type: 'success' },
  member: { label: '普通成员', type: 'default' }
}

const roleOptions = [
  { label: 'HR 管理员', value: 'hr_admin' },
  { label: '用人经理', value: 'hiring_manager' },
  { label: '面试官', value: 'interviewer' },
  { label: '普通成员', value: 'member' }
]

const columns = [
  {
    title: '成员', key: 'name', width: 200, render(row) {
      return h(NSpace, { size: 10, align: 'center' }, () => [
        h(NAvatar, { round: true, size: 'small', color: '#5B8FF9' }, () => row.name[0]),
        h('span', { style: 'font-weight: 500' }, row.name)
      ])
    }
  },
  { title: '邮箱', key: 'email', width: 220 },
  {
    title: '角色', key: 'role', width: 120, render(row) {
      return h(NTag, { type: roleMap[row.role].type, bordered: false, size: 'small' }, () => roleMap[row.role].label)
    }
  },
  {
    title: '状态', key: 'status', width: 100, render: (r) => h(NTag, { size: 'small', bordered: false, type: r.status === 'active' ? 'success' : 'default' }, () => r.status === 'active' ? '在职' : '停用')
  },
  { title: '加入时间', key: 'joinedAt', width: 120 },
  {
    title: '操作', key: 'actions', width: 140, fixed: 'right', render(row) {
      return h(NSpace, { size: 8 }, () => [
        h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => message.info('编辑角色') }, () => '编辑'),
        h(NPopconfirm, { onPositiveClick: () => { memberStore.remove(row.id); message.success('已移除') } }, {
          default: () => '确认移除该成员？',
          trigger: () => h(NButton, { size: 'small', text: true, type: 'error' }, () => '移除')
        })
      ])
    }
  }
]

function sendInvite() {
  if (!inviteForm.value.email) { message.warning('请输入邮箱'); return }
  memberStore.invite(inviteForm.value.email, inviteForm.value.role)
  message.success('邀请已发送')
  showInvite.value = false
  inviteForm.value = { email: '', role: 'member' }
}

function batchImport() {
  message.success('批量导入模板已下载，请填写后上传')
}
</script>

<template>
  <div class="page-container">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">成员管理</h2>
        <p class="page-desc">企业组织成员与角色权限管理</p>
      </div>
      <n-space>
        <n-button @click="batchImport">📥 批量导入</n-button>
        <n-button type="primary" @click="showInvite = true">+ 邀请成员</n-button>
      </n-space>
    </div>

    <n-card :bordered="false">
      <div class="mb-16 flex gap-12">
        <n-input placeholder="搜索成员姓名/邮箱" clearable style="width: 240px">
          <template #prefix>🔍</template>
        </n-input>
      </div>
      <n-data-table :columns="columns" :data="memberStore.list" :bordered="false" :single-line="false" size="medium" />
    </n-card>

    <n-modal v-model:show="showInvite" preset="card" title="邀请成员" style="width: 440px">
      <n-form label-placement="top">
        <n-form-item label="邮箱" required><n-input v-model:value="inviteForm.email" placeholder="member@yuntu.com" /></n-form-item>
        <n-form-item label="角色" required>
          <n-select v-model:value="inviteForm.role" :options="roleOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showInvite = false">取消</n-button>
          <n-button type="primary" @click="sendInvite">发送邀请</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
