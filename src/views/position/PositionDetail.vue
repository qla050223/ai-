<script setup>
import { computed, h } from 'vue'
import { NTag } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { usePositionStore, useCandidateStore, useQuestionStore } from '@/stores/data'
import { candidateStatusMap } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const positionStore = usePositionStore()
const candidateStore = useCandidateStore()
const questionStore = useQuestionStore()

const position = computed(() => positionStore.getById(route.params.id))
const candidates = computed(() => position.value ? candidateStore.byPosition(position.value.id) : [])
const bank = computed(() => position.value ? questionStore.byPosition(position.value.id) : null)

const statusMap = {
  open: { label: '招聘中', type: 'success' },
  closed: { label: '已关闭', type: 'default' },
  on_hold: { label: '暂停', type: 'warning' }
}

const skillColumns = [
  { title: '技能点', key: 'skill' },
  {
    title: '权重', key: 'weight', width: 120,
    render: (r) => h(NTag, { type: r.weight === '高' ? 'error' : r.weight === '中' ? 'warning' : 'default', size: 'small', bordered: false }, () => r.weight)
  }
]
</script>

<template>
  <div class="page-container" v-if="position">
    <div class="flex-between mb-16">
      <div>
        <n-space align="center">
          <h2 class="page-title">{{ position.title }}</h2>
          <n-tag :type="statusMap[position.status].type" :bordered="false">{{ statusMap[position.status].label }}</n-tag>
        </n-space>
        <p class="page-desc">{{ position.department }} · 创建于 {{ position.createdAt }} · 招聘 {{ position.headcount }} 人</p>
      </div>
      <n-space>
        <n-button @click="router.push(`/position/create/${position.id}`)">编辑岗位</n-button>
        <n-button type="primary" @click="router.push(`/interview/create?positionId=${position.id}`)">发起面试</n-button>
      </n-space>
    </div>

    <n-grid :cols="3" :x-gap="16" :y-gap="16">
      <n-grid-item span="2">
        <n-card title="岗位 JD" :bordered="false" class="mb-16">
          <p style="line-height: 1.8; color: #4e5969; margin: 0">{{ position.jdText }}</p>
        </n-card>

        <n-card title="AI 结构化技能点" :bordered="false" class="mb-16">
          <template #header-extra>
            <n-button text type="primary">⚡ 重新解析</n-button>
          </template>
          <n-data-table :columns="skillColumns" :data="position.structuredSkills || []" :bordered="false" :single-line="false" />
          <div class="mt-16">
            <span class="text-muted text-sm">技能标签：</span>
            <n-space :size="6" wrap style="display: inline-flex; margin-left: 8px; vertical-align: middle">
              <n-tag v-for="t in position.skillTags" :key="t" size="small" :bordered="false" type="info">{{ t }}</n-tag>
            </n-space>
          </div>
        </n-card>

        <n-card title="关联候选人" :bordered="false">
          <template #header-extra>
            <n-button text type="primary" @click="router.push('/candidate')">管理候选人</n-button>
          </template>
          <n-list>
            <n-list-item v-for="c in candidates" :key="c.id" @click="router.push(`/candidate/${c.id}`)">
              <n-thing>
                <template #avatar><n-avatar round :src="c.avatar">{{ c.name[0] }}</n-avatar></template>
                <template #header><span style="font-weight: 500">{{ c.name }}</span></template>
                <template #description>
                  <n-space :size="16" style="font-size: 12px; color: #86909c">
                    <span>{{ c.source }}</span>
                    <span>{{ c.resumeParsed.lastCompany }}</span>
                    <span>{{ c.resumeParsed.workYears }} 年经验</span>
                  </n-space>
                </template>
                <template #action>
                  <n-tag :type="candidateStatusMap[c.status].type" size="small" :bordered="false">{{ candidateStatusMap[c.status].label }}</n-tag>
                </template>
              </n-thing>
            </n-list-item>
            <n-empty v-if="candidates.length === 0" description="暂无候选人" style="padding: 24px" />
          </n-list>
        </n-card>
      </n-grid-item>

      <n-grid-item span="1">
        <n-card title="关联题库" :bordered="false" class="mb-16">
          <div v-if="bank">
            <n-statistic label="题目数量" :value="bank.questions.length" />
            <n-space vertical style="margin-top: 16px">
              <n-button block type="primary" @click="router.push('/question')">查看题库</n-button>
              <n-button block @click="router.push(`/interview/create?positionId=${position.id}`)">发起面试</n-button>
            </n-space>
          </div>
          <div v-else>
            <n-empty description="暂无题库" style="padding: 20px 0">
              <template #footer>
                <n-button type="primary" size="small" @click="router.push('/question')">AI 生成题库</n-button>
              </template>
            </n-empty>
          </div>
        </n-card>

        <n-card title="岗位模板" :bordered="false">
          <n-space vertical :size="8">
            <div class="text-sm text-muted">将当前岗位保存为模板，便于后续复用。</div>
            <n-button block :disabled="!position.template">保存为模板</n-button>
            <n-button block quirk>从模板库选择</n-button>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
  <n-empty v-else description="岗位不存在" style="padding: 100px">
    <template #footer><n-button type="primary" @click="router.push('/position')">返回列表</n-button></template>
  </n-empty>
</template>
