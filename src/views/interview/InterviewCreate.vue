<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCandidateStore, usePositionStore, useInterviewStore, useQuestionStore } from '@/stores/data'
import { useMessage } from 'naive-ui'
import { interviewModeMap } from '@/mock/data'

const router = useRouter()
const route = useRoute()
const candidateStore = useCandidateStore()
const positionStore = usePositionStore()
const interviewStore = useInterviewStore()
const questionStore = useQuestionStore()
const message = useMessage()

const currentStep = ref(1)

const form = ref({
  candidateId: route.query.candidateId ? String(route.query.candidateId) : null,
  positionId: route.query.positionId ? String(route.query.positionId) : null,
  mode: 'ai_auto',
  duration: 30,
  focusDimensions: ['专业技能', '项目经验']
})

const candidateOptions = computed(() => candidateStore.list.map(c => ({
  label: `${c.name}（${c.positionTitle}）`,
  value: c.id
})))
const positionOptions = computed(() => positionStore.list.map(p => ({ label: p.title, value: p.id })))

const dimensionOptions = [
  { label: '专业技能', value: '专业技能' },
  { label: '项目经验', value: '项目经验' },
  { label: '逻辑思维', value: '逻辑思维' },
  { label: '沟通表达', value: '沟通表达' },
  { label: '学习能力', value: '学习能力' },
  { label: '文化匹配', value: '文化匹配' }
]

// 生成的题库
const generating = ref(false)
const generatedBank = ref(null)
const generatedProgress = ref(0)

function selectCandidate() {
  const c = candidateStore.getById(form.value.candidateId)
  if (c) form.value.positionId = c.appliedPositionId
}

function generateQuestions() {
  if (!form.value.positionId) {
    message.warning('请先选择目标岗位')
    return
  }
  generating.value = true
  generatedBank.value = null
  generatedProgress.value = 0
  
  // 模拟生成进度
  const timer = setInterval(() => {
    generatedProgress.value += 10
    if (generatedProgress.value >= 100) {
      clearInterval(timer)
      const pos = positionStore.getById(form.value.positionId)
      // 复用已有题库或生成新的
      let bank = questionStore.byPosition(form.value.positionId)
      if (!bank) bank = questionStore.generateForPosition(form.value.positionId, pos.title)
      generatedBank.value = bank
      generating.value = false
      message.success(`AI 已生成 ${bank.questions.length} 道面试题`)
    }
  }, 200)
}

function removeQuestion(qid) {
  generatedBank.value.questions = generatedBank.value.questions.filter(q => q.id !== qid)
}

function createInterview() {
  if (!form.value.candidateId || !form.value.positionId) {
    message.warning('请完成基本信息填写')
    return
  }
  const candidate = candidateStore.getById(form.value.candidateId)
  const position = positionStore.getById(form.value.positionId)
  const iv = interviewStore.create({
    candidateId: candidate.id,
    candidateName: candidate.name,
    positionId: position.id,
    positionTitle: position.title,
    mode: form.value.mode,
    modeText: interviewModeMap[form.value.mode].label,
    duration: form.value.duration,
    focusDimensions: form.value.focusDimensions,
    createdBy: '林书豪',
    questionBankId: generatedBank.value?.id || null
  })
  message.success('面试创建成功，即将进入面试房间')
  setTimeout(() => router.push(`/interview/${iv.id}/room`), 800)
}

function next() {
  if (currentStep.value === 1 && (!form.value.candidateId || !form.value.positionId || form.value.focusDimensions.length === 0)) {
    message.warning('请填写候选人、岗位与考察维度')
    return
  }
  if (currentStep.value === 2 && !generatedBank.value) {
    message.warning('请先生成面试题库')
    return
  }
  currentStep.value++
}

function prev() { if (currentStep.value > 1) currentStep.value-- }
</script>

<template>
  <div class="page-container">
    <div class="flex-between mb-16">
      <div>
        <h2 class="page-title">创建面试</h2>
        <p class="page-desc">三步创建个性化 AI 面试：基本信息 → AI 题库生成 → 启动会话</p>
      </div>
      <n-button @click="router.back()">返回</n-button>
    </div>

    <n-card :bordered="false">
      <n-steps :current="currentStep" size="small" class="mb-20">
        <n-step title="面试基本信息" description="候选人 / 岗位 / 模式" />
        <n-step title="AI 题库生成" description="基于简历+JD 自动出题" />
        <n-step title="校对与启动" description="校对题目并进入面试" />
      </n-steps>

      <!-- Step 1 -->
      <div v-show="currentStep === 1">
        <n-form label-placement="top" style="max-width: 720px; margin: 0 auto">
          <n-grid :cols="2" :x-gap="20">
            <n-form-item-gi label="候选人" required>
              <n-select v-model:value="form.candidateId" :options="candidateOptions" placeholder="选择候选人" @update:value="selectCandidate" filterable />
            </n-form-item-gi>
            <n-form-item-gi label="目标岗位" required>
              <n-select v-model:value="form.positionId" :options="positionOptions" placeholder="选择岗位" filterable />
            </n-form-item-gi>
            <n-form-item-gi label="面试模式" required :span="2">
              <n-radio-group v-model:value="form.mode" name="mode">
                <n-space>
                  <n-radio value="ai_auto">
                    <div>
                      <div style="font-weight: 500">🤖 AI 自主面试</div>
                      <div class="text-muted text-sm">{{ interviewModeMap.ai_auto.desc }}</div>
                    </div>
                  </n-radio>
                  <n-radio value="assist">
                    <div>
                      <div style="font-weight: 500">👤 面试官辅助</div>
                      <div class="text-muted text-sm">{{ interviewModeMap.assist.desc }}</div>
                    </div>
                  </n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item-gi>
            <n-form-item-gi label="面试时长（分钟）">
              <n-slider v-model:value="form.duration" :min="15" :max="90" :step="15" :marks="{ 15: '15', 30: '30', 45: '45', 60: '60', 90: '90' }" />
            </n-form-item-gi>
            <n-form-item-gi label="重点考察维度" required :span="2">
              <n-checkbox-group v-model:value="form.focusDimensions">
                <n-space>
                  <n-checkbox v-for="d in dimensionOptions" :key="d.value" :value="d.value">{{ d.label }}</n-checkbox>
                </n-space>
              </n-checkbox-group>
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </div>

      <!-- Step 2 -->
      <div v-show="currentStep === 2">
        <div style="max-width: 860px; margin: 0 auto">
          <n-card size="small" :bordered="false" style="background: #f7f9fc; margin-bottom: 16px">
            <div class="flex-between">
              <div>
                <div style="font-weight: 500">⚡ AI 题库生成</div>
                <div class="text-muted text-sm mt-12">基于候选人简历 + 岗位 JD + 重点维度，自动生成 8-15 道面试题</div>
              </div>
              <n-button type="primary" :loading="generating" @click="generateQuestions">
                {{ generating ? '生成中...' : (generatedBank ? '重新生成' : '开始生成') }}
              </n-button>
            </div>
            <n-progress v-if="generating" :percentage="generatedProgress" style="margin-top: 16px" />
          </n-card>

          <div v-if="generatedBank">
            <div class="flex-between mb-12">
              <span style="font-weight: 500">已生成 {{ generatedBank.questions.length }} 道题</span>
              <n-space :size="8">
                <n-button size="small" @click="generating = false">+ 手动添加</n-button>
              </n-space>
            </div>
            <n-card v-for="(q, i) in generatedBank.questions" :key="q.id" size="small" :bordered="false" class="mb-12" style="background: #fff; border: 1px solid #f0f0f0">
              <template #header>
                <n-space align="center" :size="8">
                  <span style="color: #5B8FF9; font-weight: 600">Q{{ i + 1 }}</span>
                  <n-tag size="tiny" :bordered="false" type="info">{{ q.dimension }}</n-tag>
                  <n-tag size="tiny" :bordered="false">{{ q.type }}</n-tag>
                  <n-tag size="tiny" :bordered="false" :type="q.difficulty === '困难' ? 'error' : q.difficulty === '中等' ? 'warning' : 'default'">{{ q.difficulty }}</n-tag>
                </n-space>
              </template>
              <template #header-extra>
                <n-space :size="4">
                  <n-button size="tiny" text type="primary">编辑</n-button>
                  <n-button size="tiny" text type="primary">重新生成</n-button>
                  <n-button size="tiny" text type="error" @click="removeQuestion(q.id)">删除</n-button>
                </n-space>
              </template>
              <p style="margin: 0 0 8px; line-height: 1.6">{{ q.content }}</p>
              <div class="text-sm text-muted">
                <span>技能点：{{ q.skill }}</span>
                <span style="margin-left: 16px">使用 {{ q.usageCount }} 次</span>
                <span style="margin-left: 16px">平均分 {{ q.avgScore || '-' }}</span>
              </div>
            </n-card>
          </div>

          <n-empty v-else-if="!generating" description="点击「开始生成」由 AI 生成题库" style="padding: 40px" />
        </div>
      </div>

      <!-- Step 3 -->
      <div v-show="currentStep === 3">
        <n-result status="info" title="面试准备就绪" :description="`即将创建 ${interviewModeMap[form.mode].label}，候选人 ${form.candidateId ? candidateStore.getById(form.candidateId)?.name : ''}，时长 ${form.duration} 分钟`">
          <template #footer>
            <n-space justify="center" :size="12">
              <n-button @click="router.push('/interview')">稍后开始</n-button>
              <n-button type="primary" @click="createInterview">🚀 启动面试</n-button>
            </n-space>
          </template>
        </n-result>
      </div>

      <div class="flex-between" style="margin-top: 24px; border-top: 1px solid #f0f0f0; padding-top: 16px">
        <n-button v-if="currentStep > 1" @click="prev">上一步</n-button>
        <span v-else></span>
        <n-button v-if="currentStep < 3" type="primary" @click="next">下一步</n-button>
      </div>
    </n-card>
  </div>
</template>
