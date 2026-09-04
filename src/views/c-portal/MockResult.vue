<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCandidateDataStore } from '@/stores/candidate'
import { recommendLevelMap } from '@/mock/candidateData'
import RadarChart from '@/components/RadarChart.vue'

const router = useRouter()
const route = useRoute()
const dataStore = useCandidateDataStore()

const interviewId = route.params.interviewId
const interview = computed(() => dataStore.interviewById(interviewId))

const recommendInfo = computed(() => recommendLevelMap[interview.value?.recommendLevel] || recommendLevelMap.pending)

const radarData = computed(() => interview.value?.radar || {})

// 逐题点评
const questionReviews = ref([
  {
    dimension: '专业技能',
    question: 'Vue3 的 ref 与 reactive 区别及响应式原理？',
    answer: '（作答原文摘要）ref 用于基本类型，reactive 用于对象；reactive 基于 Proxy 实现深度响应式，ref 通过 .value 访问...',
    score: 84,
    comment: '概念准确，能讲到 Proxy 依赖收集。建议补充 effect 副作用与 track/trigger 触发时机的说明。'
  },
  {
    dimension: '专业技能',
    question: 'reactive 解构为何丢失响应性？toRefs 如何解决？',
    answer: '（追问回答摘要）解构后得到的是原始值，脱离了 Proxy 代理；toRefs 将每个属性包装成 ref...',
    score: 80,
    comment: '理解到位。可补充 toRef 与 toRefs 的差异，以及 toRefs 在 Composition API 解构场景的最佳实践。'
  },
  {
    dimension: '项目经验',
    question: '还原一次性能优化的完整路径...',
    answer: '（作答原文摘要）通过 Lighthouse 定位首屏瓶颈，发现主因是大包体积；采取分包、懒加载、CDN 优化，首屏从 3.2s 降至 1.1s...',
    score: 78,
    comment: '方法论完整且有量化结果。建议在"瓶颈定位"环节补充火焰图分析，让诊断更具说服力。'
  },
  {
    dimension: '逻辑思维',
    question: 'Monorepo 迁移规划...',
    answer: '（作答原文摘要）分四阶段：脚手架搭建→依赖收敛→CI 改造→渐进迁移；风险考虑了幽灵依赖与构建缓存...',
    score: 76,
    comment: '思路清晰，考虑了风险与回滚。可强化"迁移过程的双跑对比"机制，降低切换风险。'
  },
  {
    dimension: '沟通表达',
    question: '与后端协作分歧的例子...',
    answer: '（作答原文摘要）字段命名风格分歧，最终通过制定 JSON Schema 规范统一...',
    score: 70,
    comment: '事件描述清晰。建议用 STAR 结构强化复盘深度，突出"你"的具体动作与最终影响。'
  }
])

const improvements = ref([
  { dimension: '工程化体系', suggestion: '建议练习 3 场工程化专项（Monorepo / CI / 构建优化），强化体系化表达' },
  { dimension: '项目复盘深度', suggestion: '多用 STAR 结构，量化结果 + 火焰图等证据，让说服力倍增' },
  { dimension: '协作沟通', suggestion: '行为题可练习 2 场，重点突出个人贡献与最终团队影响' }
])

const overallScore = computed(() => interview.value?.overallScore || 0)

function goPractice() {
  router.push('/c/ability')
}
function goHome() {
  router.push('/c/mock')
}
function back() {
  router.push('/c/my')
}
</script>

<template>
  <div class="result-page" v-if="interview">
    <!-- 顶部评分卡 -->
    <div class="score-hero">
      <div class="sh-left">
        <div class="sh-label">本次模拟综合评分</div>
        <div class="sh-score">{{ overallScore }}</div>
        <div class="sh-level">
          <span class="sh-tag" :class="recommendInfo.type">{{ recommendInfo.label }}</span>
          <span class="sh-pos">{{ interview.positionTitle }}</span>
        </div>
      </div>
      <div class="sh-right">
        <div class="sh-stat"><span>用时</span><b>{{ interview.duration }} 分钟</b></div>
        <div class="sh-stat"><span>题量</span><b>{{ interview.questionCount }} 题</b></div>
        <div class="sh-stat"><span>维度</span><b>{{ interview.dimensionsCovered?.length }} 个</b></div>
      </div>
    </div>

    <!-- AI 综合评语 -->
    <div class="card">
      <div class="card-title">🎯 AI 综合评语</div>
      <p class="ai-summary">{{ interview.summary }}</p>
    </div>

    <div class="two-col">
      <!-- 雷达图 -->
      <div class="card">
        <div class="card-title">📊 能力雷达图</div>
        <RadarChart :data="radarData" height="320px" />
        <div class="dim-list">
          <div v-for="(v, k) in interview.radar" :key="k" class="dim-row">
            <span class="dim-name">{{ k }}</span>
            <div class="dim-bar"><div class="dim-bar-inner" :style="{ width: v + '%', background: v >= 80 ? '#10b981' : v >= 60 ? '#7c3aed' : '#ef4444' }"></div></div>
            <span class="dim-score">{{ v }}</span>
          </div>
        </div>
      </div>

      <!-- 逐题点评 -->
      <div class="card">
        <div class="card-title">📝 逐题点评</div>
        <div class="q-review-list">
          <div v-for="(q, i) in questionReviews" :key="i" class="q-review">
            <div class="qr-head">
              <span class="qr-num">{{ i + 1 }}</span>
              <span class="qr-dim">{{ q.dimension }}</span>
              <span class="qr-score" :class="q.score >= 80 ? 'good' : q.score >= 60 ? 'mid' : 'low'">{{ q.score }} 分</span>
            </div>
            <div class="qr-question">{{ q.question }}</div>
            <div class="qr-answer">
              <span class="qr-label">你的作答</span>
              <p>{{ q.answer }}</p>
            </div>
            <div class="qr-comment">
              <span class="qr-label">AI 点评</span>
              <p>{{ q.comment }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 改进建议 -->
    <div class="card">
      <div class="card-title">💡 改进建议与专项练习</div>
      <div class="improve-list">
        <div v-for="(im, i) in improvements" :key="i" class="improve-item">
          <div class="im-num">{{ i + 1 }}</div>
          <div class="im-body">
            <div class="im-dim">{{ im.dimension }}</div>
            <p class="im-suggestion">{{ im.suggestion }}</p>
          </div>
          <button class="im-btn" @click="goPractice">去练习</button>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="actions">
      <button class="act-btn ghost" @click="back">查看历史</button>
      <button class="act-btn ghost" @click="goHome">再练一场</button>
      <button class="act-btn primary" @click="goPractice">查看能力档案</button>
    </div>
  </div>
</template>

<style scoped>
.result-page { display: flex; flex-direction: column; gap: 20px; }
.score-hero {
  background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 20px; padding: 32px;
  color: #fff; display: flex; justify-content: space-between; align-items: center;
}
.sh-label { font-size: 13px; opacity: .9; margin-bottom: 4px; }
.sh-score { font-size: 56px; font-weight: 700; line-height: 1; margin-bottom: 12px; }
.sh-level { display: flex; align-items: center; gap: 10px; }
.sh-tag { padding: 4px 12px; background: rgba(255,255,255,.2); border-radius: 999px; font-size: 12px; font-weight: 600; }
.sh-tag.success { background: #d1fae5; color: #059669; }
.sh-tag.info { background: #dbeafe; color: #2563eb; }
.sh-tag.warning { background: #fef3c7; color: #b45309; }
.sh-pos { font-size: 13px; opacity: .9; }
.sh-right { display: flex; flex-direction: column; gap: 8px; }
.sh-stat { display: flex; gap: 12px; align-items: center; font-size: 14px; }
.sh-stat span { opacity: .85; }
.sh-stat b { font-weight: 700; }

.card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.card-title { font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 16px; }
.ai-summary { font-size: 14px; color: #4b5563; line-height: 1.8; background: #f9fafb; padding: 14px; border-radius: 10px; border-left: 3px solid #7c3aed; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.dim-list { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
.dim-row { display: flex; align-items: center; gap: 10px; }
.dim-name { width: 80px; font-size: 13px; color: #4b5563; }
.dim-bar { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.dim-bar-inner { height: 100%; border-radius: 4px; transition: width .6s; }
.dim-score { width: 36px; text-align: right; font-size: 13px; font-weight: 700; color: #1f2937; }

.q-review-list { display: flex; flex-direction: column; gap: 14px; max-height: 500px; overflow-y: auto; padding-right: 4px; }
.q-review { padding: 14px; background: #f9fafb; border-radius: 12px; }
.qr-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.qr-num { width: 22px; height: 22px; border-radius: 50%; background: #7c3aed; color: #fff; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.qr-dim { padding: 2px 8px; background: #ede9fe; color: #6d28d9; border-radius: 4px; font-size: 11px; font-weight: 500; }
.qr-score { margin-left: auto; font-size: 13px; font-weight: 700; }
.qr-score.good { color: #059669; }
.qr-score.mid { color: #7c3aed; }
.qr-score.low { color: #ef4444; }
.qr-question { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 10px; line-height: 1.5; }
.qr-answer, .qr-comment { margin-bottom: 8px; }
.qr-label { font-size: 11px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; display: block; }
.qr-answer p, .qr-comment p { font-size: 12px; color: #4b5563; line-height: 1.7; margin: 0; }

.improve-list { display: flex; flex-direction: column; gap: 12px; }
.improve-item { display: flex; align-items: center; gap: 14px; padding: 14px; background: #fefce8; border-radius: 12px; border: 1px solid #fde68a; }
.im-num { width: 28px; height: 28px; border-radius: 50%; background: #f59e0b; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.im-body { flex: 1; }
.im-dim { font-size: 13px; font-weight: 600; color: #92400e; margin-bottom: 2px; }
.im-suggestion { font-size: 12px; color: #78350f; line-height: 1.6; margin: 0; }
.im-btn { padding: 8px 16px; border: none; border-radius: 8px; background: #7c3aed; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; flex-shrink: 0; }
.im-btn:hover { background: #6d28d9; }

.actions { display: flex; gap: 12px; justify-content: center; padding: 12px 0; }
.act-btn { height: 44px; padding: 0 28px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; }
.act-btn.ghost { border: 1px solid #e5e7eb; background: #fff; color: #6b7280; }
.act-btn.ghost:hover { background: #f9fafb; }
.act-btn.primary { border: none; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
.act-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,.3); }
</style>
