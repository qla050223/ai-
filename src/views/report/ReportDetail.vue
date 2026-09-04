<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReportStore, useCandidateStore, useInterviewStore } from '@/stores/data'
import { useMessage } from 'naive-ui'
import RadarChart from '@/components/RadarChart.vue'
import { recommendLevelMap } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const reportStore = useReportStore()
const candidateStore = useCandidateStore()
const interviewStore = useInterviewStore()
const message = useMessage()

const report = computed(() => reportStore.getById(route.params.id))
const candidate = computed(() => report.value ? candidateStore.getById(report.value.candidateId) : null)
const interview = computed(() => report.value ? interviewStore.getById(report.value.interviewId) : null)
const activeTab = ref('radar')

const radarData = computed(() => report.value?.radar || {})

const scoreColumns = [
  { title: '题目', key: 'questionTitle', render: (r) => r.questionTitle },
  {
    title: '候选人作答摘要', key: 'candidateAnswer', render: (r) => {
      const txt = r.candidateAnswer || ''
      return txt.length > 50 ? txt.slice(0, 50) + '...' : txt
    }
  },
  { title: 'AI 评分', key: 'aiScore', width: 90, render: (r) => r.aiScore },
  { title: '面试官评分', key: 'interviewerScore', width: 110, render: (r) => r.interviewerScore || '-' },
  { title: '点评', key: 'comment', width: 240, render: (r) => r.comment }
]

function exportPdf() { message.success('报告已导出为 PDF') }
function shareLink() { message.success('分享链接已复制，有效期 7 天') }
function revise() { message.info('进入修正模式') }
</script>

<template>
  <div class="page-container" v-if="report">
    <div class="flex-between mb-16">
      <div>
        <n-space align="center" :size="12">
          <h2 class="page-title" style="margin: 0">{{ report.candidateName }} · 评估报告</h2>
          <n-tag :type="recommendLevelMap[report.recommendLevel].type" :bordered="false">{{ recommendLevelMap[report.recommendLevel].label }}</n-tag>
          <n-tag v-if="report.revised" size="small" :bordered="false" type="warning">已修正</n-tag>
        </n-space>
        <p class="page-desc">{{ report.positionTitle }} · 生成于 {{ report.generatedAt }}</p>
      </div>
      <n-space>
        <n-button @click="revise">✏️ 修正评分</n-button>
        <n-button @click="shareLink">🔗 分享链接</n-button>
        <n-button type="primary" @click="exportPdf">📥 导出 PDF</n-button>
      </n-space>
    </div>

    <!-- 综合结论 -->
    <n-card :bordered="false" class="mb-16" style="background: linear-gradient(135deg, #5B8FF9 0%, #4a7fe8 100%); color: #fff">
      <div class="flex-between">
        <div>
          <div style="font-size: 13px; opacity: 0.9">综合评分</div>
          <div style="font-size: 42px; font-weight: 800; line-height: 1.1">{{ report.overallScore }}<span style="font-size: 16px; opacity: 0.8"> / 100</span></div>
          <div style="opacity: 0.9; margin-top: 4px">{{ recommendLevelMap[report.recommendLevel].label }}</div>
        </div>
        <div style="max-width: 560px; opacity: 0.95; font-size: 13px; line-height: 1.7">{{ report.summary }}</div>
      </div>
    </n-card>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <!-- 能力雷达图 -->
      <n-tab-pane name="radar" tab="能力雷达图">
        <n-grid :cols="2" :x-gap="16" :y-gap="16">
          <n-grid-item span="1">
            <n-card title="能力维度评分" :bordered="false">
              <RadarChart :data="radarData" height="360px" />
            </n-card>
          </n-grid-item>
          <n-grid-item span="1">
            <n-card title="维度评分明细" :bordered="false">
              <n-list>
                <n-list-item v-for="(val, dim) in radarData" :key="dim">
                  <n-thing>
                    <template #header>{{ dim }}</template>
                    <template #description>
                      <n-progress :percentage="val" :color="val >= 80 ? '#5AD8A6' : val >= 60 ? '#5B8FF9' : '#E86452'" :show-indicator="false" style="width: 200px" />
                    </template>
                    <template #action>
                      <span style="font-weight: 700; color: #1f2329; font-size: 16px">{{ val }}</span>
                    </template>
                  </n-thing>
                </n-list-item>
              </n-list>
              <div class="mt-16 text-sm text-muted">各维度附 AI 评分依据（对应题目与作答摘要）</div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>

      <!-- 答题表现分析 -->
      <n-tab-pane name="answers" tab="答题表现分析">
        <n-card :bordered="false">
          <n-data-table :columns="scoreColumns" :data="report.scores" :bordered="false" :single-line="false" size="medium" />
          <div class="mt-16 flex gap-12">
            <n-tag size="small" :bordered="false" type="success">高亮优秀作答：飞书表格性能优化</n-tag>
            <n-tag size="small" :bordered="false" type="warning">需加强：跨团队协作复盘深度</n-tag>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- 改进建议 -->
      <n-tab-pane name="suggestions" tab="改进建议">
        <n-grid :cols="3" :x-gap="16" :y-gap="16">
          <n-grid-item>
            <n-card title="候选人发展建议" :bordered="false" size="small">
              <template #header-extra><span style="font-size: 18px">👤</span></template>
              <p style="line-height: 1.7; font-size: 13px; color: #4e5960; margin: 0">{{ report.suggestions.candidate }}</p>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="招聘建议" :bordered="false" size="small">
              <template #header-extra><span style="font-size: 18px">💼</span></template>
              <p style="line-height: 1.7; font-size: 13px; color: #4e5960; margin: 0">{{ report.suggestions.recruiter }}</p>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="培养成本评估" :bordered="false" size="small">
              <template #header-extra><span style="font-size: 18px">🎓</span></template>
              <p style="line-height: 1.7; font-size: 13px; color: #4e5960; margin: 0">{{ report.suggestions.training }}</p>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </div>
  <n-empty v-else description="报告不存在" style="padding: 100px">
    <template #footer><n-button type="primary" @click="router.push('/report')">返回列表</n-button></template>
  </n-empty>
</template>
