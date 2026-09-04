<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/data'
import { useMessage } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()
const message = useMessage()

const question = computed(() => questionStore.byId(route.params.id))
</script>

<template>
  <div class="page-container" v-if="question" style="max-width: 860px">
    <div class="flex-between mb-16">
      <div>
        <n-space align="center" :size="10">
          <h2 class="page-title" style="margin: 0">题目详情</h2>
          <n-tag size="small" :bordered="false" type="info">{{ question.dimension }}</n-tag>
          <n-tag size="small" :bordered="false">{{ question.type }}</n-tag>
          <n-tag size="small" :bordered="false" :type="question.difficulty === '困难' ? 'error' : question.difficulty === '中等' ? 'warning' : 'default'">{{ question.difficulty }}</n-tag>
        </n-space>
        <p class="page-desc">技能点：{{ question.skill }}</p>
      </div>
      <n-space>
        <n-button @click="message.info('编辑题目')">编辑</n-button>
        <n-button @click="message.info('已重新生成')">⚡ 重新生成</n-button>
        <n-button @click="router.back()">返回</n-button>
      </n-space>
    </div>

    <n-card title="题目内容" :bordered="false" class="mb-16">
      <p style="line-height: 1.8; font-size: 15px; margin: 0">{{ question.content }}</p>
    </n-card>

    <n-grid :cols="2" :x-gap="16" :y-gap="16">
      <n-grid-item>
        <n-card title="参考答案要点" :bordered="false">
          <n-list size="small" hover-cancellable>
            <n-list-item v-for="(p, i) in question.referencePoints" :key="i">
              <n-thing><template #header><span style="font-size: 13px">{{ i + 1 }}. {{ p }}</span></template></n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="评分标准" :bordered="false">
          <n-space vertical :size="12">
            <div>
              <n-tag size="small" :bordered="false" type="success">优秀</n-tag>
              <p class="text-sm" style="margin: 6px 0 0; color: #4e5969">{{ question.scoreStandard.excellent }}</p>
            </div>
            <div>
              <n-tag size="small" :bordered="false" type="info">合格</n-tag>
              <p class="text-sm" style="margin: 6px 0 0; color: #4e5969">{{ question.scoreStandard.qualified }}</p>
            </div>
            <div>
              <n-tag size="small" :bordered="false" type="error">不合格</n-tag>
              <p class="text-sm" style="margin: 6px 0 0; color: #4e5969">{{ question.scoreStandard.unqualified }}</p>
            </div>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card title="追问建议" :bordered="false" class="mt-16">
      <n-list size="small" hover-cancellable>
        <n-list-item v-for="(fu, i) in question.followUps" :key="i">
          <n-thing><template #header><span>💡 {{ fu }}</span></template></n-thing>
        </n-list-item>
      </n-list>
    </n-card>

    <n-card title="使用统计" :bordered="false" class="mt-16">
      <n-space :size="40">
        <n-statistic label="使用次数" :value="question.usageCount" />
        <n-statistic label="平均得分" :value="question.avgScore || '-'" suffix="分" />
      </n-space>
    </n-card>
  </div>
  <n-empty v-else description="题目不存在" style="padding: 100px">
    <template #footer><n-button type="primary" @click="router.push('/question')">返回题库</n-button></template>
  </n-empty>
</template>
