<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCandidateStore, useInterviewStore, useReportStore } from '@/stores/data'
import { useMessage } from 'naive-ui'
import { candidateStatusMap, interviewStatusMap, recommendLevelMap } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const candidateStore = useCandidateStore()
const interviewStore = useInterviewStore()
const reportStore = useReportStore()
const message = useMessage()

const candidate = computed(() => candidateStore.getById(route.params.id))
const interviews = computed(() => candidate.value ? interviewStore.byCandidate(candidate.value.id) : [])
const reports = computed(() => candidate.value ? reportStore.byCandidate(candidate.value.id) : [])
const activeTab = ref('resume')

const statusOptions = [
  { label: '待面试', value: 'pending' },
  { label: '面试中', value: 'interviewing' },
  { label: '待评估', value: 'pending_eval' },
  { label: '已通过', value: 'passed' },
  { label: '已淘汰', value: 'rejected' },
  { label: '待定', value: 'pending_decision' }
]

function updateStatus(status) {
  const stageMap = { pending: '待面试', interviewing: '面试中', pending_eval: '待评估', passed: '已通过', rejected: '已淘汰', pending_decision: '待定' }
  candidateStore.updateStatus(route.params.id, status, stageMap[status])
  message.success('状态已更新')
}

function reparseResume() {
  message.success('AI 已重新解析简历，结果已更新')
}

function gotoRecord(id) { router.push(`/interview/${id}/record`) }
function gotoRoom(id) { router.push(`/interview/${id}/room`) }
function gotoReportByCandidate(cid) { router.push(`/report?candidateId=${cid}`) }
</script>

<template>
  <div class="page-container" v-if="candidate">
    <div class="flex-between mb-16">
      <n-space align="center" :size="16">
        <n-avatar round :size="56" :src="candidate.avatar" color="#5B8FF9">{{ candidate.name[0] }}</n-avatar>
        <div>
          <n-space align="center" :size="10">
            <h2 class="page-title" style="margin: 0">{{ candidate.name }}</h2>
            <n-tag :type="candidateStatusMap[candidate.status].type" :bordered="false">{{ candidateStatusMap[candidate.status].label }}</n-tag>
          </n-space>
          <p class="page-desc" style="margin: 4px 0 0 0">
            {{ candidate.positionTitle }} · {{ candidate.source }} · {{ candidate.resumeParsed.workYears }} 年经验
          </p>
        </div>
      </n-space>
      <n-space>
        <n-select :value="candidate.status" :options="statusOptions" style="width: 140px" @update:value="updateStatus" />
        <n-button type="primary" @click="router.push(`/interview/create?candidateId=${candidate.id}`)">发起面试</n-button>
      </n-space>
    </div>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <!-- 简历解析 -->
      <n-tab-pane name="resume" tab="简历解析">
        <n-card :bordered="false">
          <template #header-extra>
            <n-space :size="12">
              <n-button text type="primary" @click="reparseResume">⚡ 重新解析</n-button>
              <n-button text type="primary">校对修正</n-button>
            </n-space>
          </template>
          <n-descriptions label-placement="top" :column="3" bordered>
            <n-descriptions-item label="姓名">{{ candidate.name }}</n-descriptions-item>
            <n-descriptions-item label="邮箱">{{ candidate.email }}</n-descriptions-item>
            <n-descriptions-item label="电话">{{ candidate.phone }}</n-descriptions-item>
            <n-descriptions-item label="教育经历" :span="3">{{ candidate.resumeParsed.education }}</n-descriptions-item>
            <n-descriptions-item label="工作年限">{{ candidate.resumeParsed.workYears }} 年</n-descriptions-item>
            <n-descriptions-item label="最近公司">{{ candidate.resumeParsed.lastCompany }}</n-descriptions-item>
            <n-descriptions-item label="应聘岗位">{{ candidate.positionTitle }}</n-descriptions-item>
            <n-descriptions-item label="技能清单" :span="3">
              <n-space :size="6" wrap>
                <n-tag v-for="s in candidate.resumeParsed.skills" :key="s" size="small" :bordered="false" type="info">{{ s }}</n-tag>
              </n-space>
            </n-descriptions-item>
          </n-descriptions>

          <h3 style="margin: 24px 0 12px; font-size: 15px">项目经验</h3>
          <n-card v-for="(p, i) in candidate.resumeParsed.projects" :key="i" size="small" :bordered="false" class="mb-12" style="background: #f7f9fc">
            <template #header>
              <span style="font-weight: 500">{{ p.name }}</span>
              <n-tag size="tiny" :bordered="false" style="margin-left: 8px">{{ p.role }}</n-tag>
            </template>
            <p style="margin: 0; color: #4e5969; font-size: 13px; line-height: 1.6">{{ p.summary }}</p>
          </n-card>
        </n-card>
      </n-tab-pane>

      <!-- 历史面试 -->
      <n-tab-pane name="interviews" tab="历史面试">
        <n-card :bordered="false">
          <n-empty v-if="interviews.length === 0" description="暂无面试记录" style="padding: 40px">
            <template #footer><n-button type="primary" @click="router.push(`/interview/create?candidateId=${candidate.id}`)">发起首次面试</n-button></template>
          </n-empty>
          <n-timeline v-else>
            <n-timeline-item v-for="iv in interviews" :key="iv.id" :type="iv.status === 'completed' ? 'success' : iv.status === 'in_progress' ? 'info' : 'default'">
              <template #header>
                <n-space align="center" :size="8">
                  <span style="font-weight: 500">{{ iv.modeText }}</span>
                  <n-tag :type="interviewStatusMap[iv.status].type" size="small" :bordered="false">{{ iv.statusText }}</n-tag>
                </n-space>
              </template>
              <template #default>
                <n-space vertical :size="4" style="font-size: 12px; color: #86909c">
                  <span>创建：{{ iv.createdAt }}</span>
                  <span v-if="iv.completedAt">完成：{{ iv.completedAt }}</span>
                  <span>时长：{{ iv.duration }} 分钟</span>
                  <span>考察维度：{{ iv.focusDimensions.join('、') }}</span>
                </n-space>
                <n-space :size="8" style="margin-top: 8px">
                  <n-button size="small" type="primary" @click="gotoRecord(iv.id)">查看记录</n-button>
                  <n-button v-if="iv.status === 'not_started'" size="small" type="primary" @click="gotoRoom(iv.id)">进入面试</n-button>
                  <n-button v-if="iv.status === 'completed'" size="small" @click="gotoReportByCandidate(candidate.id)">查看报告</n-button>
                </n-space>
              </template>
            </n-timeline-item>
          </n-timeline>
        </n-card>
      </n-tab-pane>

      <!-- 评估报告 -->
      <n-tab-pane name="reports" tab="评估报告">
        <n-card :bordered="false">
          <n-empty v-if="reports.length === 0" description="暂无评估报告" style="padding: 40px" />
          <n-list v-else hover-cancellable>
            <n-list-item v-for="r in reports" :key="r.id" @click="router.push(`/report/${r.id}`)">
              <n-thing>
                <template #header>
                  <span style="font-weight: 500">{{ r.candidateName }} · {{ r.positionTitle }}</span>
                </template>
                <template #description>
                  <n-space :size="20">
                    <span>综合分：<b style="color: #5B8FF9">{{ r.overallScore }}</b></span>
                    <n-tag :type="recommendLevelMap[r.recommendLevel].type" size="small" :bordered="false">{{ recommendLevelMap[r.recommendLevel].label }}</n-tag>
                    <span>{{ r.generatedAt }}</span>
                  </n-space>
                </template>
                <template #action><n-button text type="primary">查看 →</n-button></template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
  <n-empty v-else description="候选人不存在" style="padding: 100px">
    <template #footer><n-button type="primary" @click="router.push('/candidate')">返回列表</n-button></template>
  </n-empty>
</template>
