<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCandidateDataStore } from '@/stores/candidate'

const router = useRouter()
const route = useRoute()
const dataStore = useCandidateDataStore()

const position = computed(() => dataStore.getPositionById(route.params.positionId))

const config = reactive({
  dimensions: ['专业技能', '项目经验', '逻辑思维'],
  duration: 30,
  questionCount: 8,
  difficulty: 'auto',
  followUpDepth: 1
})

const dimensionOptions = [
  { label: '专业技能', value: '专业技能', desc: '岗位核心技术深度' },
  { label: '项目经验', value: '项目经验', desc: '项目复盘与量化结果' },
  { label: '逻辑思维', value: '逻辑思维', desc: '系统设计与抽象能力' },
  { label: '沟通表达', value: '沟通表达', desc: '结构化表达与协作' },
  { label: '学习能力', value: '学习能力', desc: '新技术学习与迁移' },
  { label: '文化匹配', value: '文化匹配', desc: '价值观与团队契合' }
]

const durations = [15, 30, 45, 60]
const questionCounts = [5, 8, 10, 12, 15]
const difficulties = [
  { label: '自动匹配', value: 'auto' },
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]
const followUpDepths = [
  { label: '不追问', value: 0 },
  { label: '追问 1 次', value: 1 },
  { label: '追问 2 次', value: 2 }
]

function toggleDimension(val) {
  const idx = config.dimensions.indexOf(val)
  if (idx > -1) config.dimensions.splice(idx, 1)
  else config.dimensions.push(val)
}

// AI 生成题库模拟
const generating = ref(false)
const genStep = ref(0)
const genSteps = ['解析岗位能力模型', '检索题库语义匹配', '生成结构化题目', '校准难度分布']
const questions = ref([])
const generated = ref(false)

async function generateBank() {
  generating.value = true
  for (let i = 0; i < genSteps.length; i++) {
    genStep.value = i
    await new Promise(r => setTimeout(r, 700))
  }
  // 生成模拟题目
  const banks = {
    '专业技能': [
      'Vue3 的 ref 与 reactive 区别及响应式原理？什么场景该用哪个？',
      '请说明虚拟 DOM 的 Diff 算法，以及 key 的作用。',
      'Vite 为什么比 Webpack 快？ESM 与按需编译如何实现？'
    ],
    '项目经验': [
      '还原一次性能优化的完整路径：如何定位瓶颈、采取手段、度量结果？',
      '请描述你主导的最有挑战的项目，你承担什么角色、解决了什么关键问题？'
    ],
    '逻辑思维': [
      '团队要从单仓库迁移到 Monorepo，你会如何规划？考虑哪些风险？',
      '设计一个前端监控 SDK，需要采集哪些指标？如何保证不阻塞业务？'
    ],
    '沟通表达': [
      '举一个你和后端协作出现分歧的例子，如何沟通并达成一致？',
      '当你发现需求文档有歧义时，你会如何处理？'
    ],
    '学习能力': [
      '你最近学习了什么新技术？是如何快速上手的？',
      '面对一个完全不熟悉的技术栈，你的学习路径是什么？'
    ],
    '文化匹配': [
      '你理想中的团队是什么样的？为什么？',
      '你如何看待加班与工作生活平衡？'
    ]
  }
  const result = []
  config.dimensions.forEach(d => {
    const arr = banks[d] || []
    arr.slice(0, Math.ceil(config.questionCount / config.dimensions.length)).forEach(q => {
      result.push({ dimension: d, question: q })
    })
  })
  questions.value = result.slice(0, config.questionCount)
  generating.value = false
  generated.value = true
}

function startInterview() {
  // 创建模拟练习记录
  const iv = dataStore.addMockInterview({
    typeId: position.value.id,
    positionTitle: position.value.title,
    duration: config.duration,
    overallScore: 0,
    radar: {},
    dimensionsCovered: [...config.dimensions],
    questionCount: questions.value.length,
    summary: '',
    shortboards: []
  })
  router.push(`/c/mock/room/${iv.id}`)
}

function back() {
  router.push('/c/mock')
}
</script>

<template>
  <div class="config-page">
    <button class="back-btn" @click="back">← 返回岗位选择</button>

    <!-- 岗位信息 -->
    <div class="pos-banner">
      <div>
        <h1>{{ position?.title }}</h1>
        <div class="pos-tags">
          <span class="pt">{{ position?.category }}</span>
          <span class="pt">{{ position?.difficulty }}</span>
          <span v-for="s in position?.skillTags" :key="s" class="pt skill">{{ s }}</span>
        </div>
      </div>
      <div class="pos-desc">{{ position?.description }}</div>
    </div>

    <div class="config-body">
      <!-- 配置区 -->
      <div class="config-section">
        <h2 class="sec-title">练习配置</h2>

        <!-- 重点维度 -->
        <div class="cfg-block">
          <label class="cfg-label">重点考察维度 <span class="cfg-hint">（已选 {{ config.dimensions.length }} 个）</span></label>
          <div class="dim-grid">
            <div
              v-for="d in dimensionOptions"
              :key="d.value"
              class="dim-card"
              :class="{ active: config.dimensions.includes(d.value) }"
              @click="toggleDimension(d.value)"
            >
              <div class="dim-card-head">
                <span class="dim-check">{{ config.dimensions.includes(d.value) ? '✓' : '' }}</span>
                <span class="dim-name">{{ d.label }}</span>
              </div>
              <p class="dim-desc">{{ d.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 时长 / 题量 / 难度 / 追问 -->
        <div class="cfg-row">
          <div class="cfg-block">
            <label class="cfg-label">面试时长</label>
            <div class="opt-row">
              <button v-for="d in durations" :key="d" class="opt-btn" :class="{ active: config.duration === d }" @click="config.duration = d">{{ d }} 分钟</button>
            </div>
          </div>
          <div class="cfg-block">
            <label class="cfg-label">题量</label>
            <div class="opt-row">
              <button v-for="c in questionCounts" :key="c" class="opt-btn" :class="{ active: config.questionCount === c }" @click="config.questionCount = c">{{ c }} 题</button>
            </div>
          </div>
        </div>

        <div class="cfg-row">
          <div class="cfg-block">
            <label class="cfg-label">难度</label>
            <div class="opt-row">
              <button v-for="d in difficulties" :key="d.value" class="opt-btn" :class="{ active: config.difficulty === d.value }" @click="config.difficulty = d.value">{{ d.label }}</button>
            </div>
          </div>
          <div class="cfg-block">
            <label class="cfg-label">追问深度</label>
            <div class="opt-row">
              <button v-for="f in followUpDepths" :key="f.value" class="opt-btn" :class="{ active: config.followUpDepth === f.value }" @click="config.followUpDepth = f.value">{{ f.label }}</button>
            </div>
          </div>
        </div>

        <button class="gen-btn" :disabled="!config.dimensions.length || generating" @click="generateBank">
          {{ generating ? 'AI 题库生成中...' : '🤖 AI 生成题库' }}
        </button>
      </div>

      <!-- 生成进度 / 题目预览 -->
      <div class="preview-section">
        <div v-if="generating" class="gen-loading">
          <div class="gen-spin"></div>
          <h3>AI 正在为你生成专属题库</h3>
          <div class="gen-steps">
            <div v-for="(s, i) in genSteps" :key="i" class="gen-step" :class="{ done: i < genStep, active: i === genStep }">
              <span class="gs-icon">{{ i < genStep ? '✓' : i === genStep ? '⏳' : '○' }}</span>
              {{ s }}
            </div>
          </div>
        </div>

        <div v-else-if="generated" class="gen-done">
          <div class="gd-head">
            <h3>✓ 题库已生成</h3>
            <span class="gd-count">{{ questions.length }} 题 · 预计 {{ config.duration }} 分钟</span>
          </div>
          <div class="q-list">
            <div v-for="(q, i) in questions" :key="i" class="q-item">
              <div class="q-num">{{ i + 1 }}</div>
              <div class="q-body">
                <div class="q-dim">{{ q.dimension }}</div>
                <div class="q-text">{{ q.question }}</div>
              </div>
            </div>
          </div>
          <button class="start-btn" @click="startInterview">开始模拟面试 →</button>
        </div>

        <div v-else class="gen-empty">
          <div class="ge-icon">🎯</div>
          <p>配置完成后，点击"AI 生成题库"获取专属题目</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-page { display: flex; flex-direction: column; gap: 20px; }
.back-btn {
  align-self: flex-start; padding: 8px 16px; border: 1px solid #e5e7eb; background: #fff;
  border-radius: 8px; color: #6b7280; font-size: 13px; cursor: pointer; transition: all .2s;
}
.back-btn:hover { color: #7c3aed; border-color: #c4b5fd; }
.pos-banner {
  background: #fff; border-radius: 16px; padding: 24px; display: flex;
  justify-content: space-between; gap: 24px; align-items: flex-start;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.pos-banner h1 { font-size: 22px; color: #1f2937; margin-bottom: 10px; }
.pos-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.pt { padding: 3px 10px; background: #f3f4f6; color: #4b5563; border-radius: 6px; font-size: 12px; }
.pt.skill { background: #ede9fe; color: #6d28d9; }
.pos-desc { font-size: 13px; color: #6b7280; max-width: 300px; line-height: 1.6; text-align: right; }

.config-body { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.config-section, .preview-section {
  background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.sec-title { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 20px; }
.cfg-block { margin-bottom: 20px; }
.cfg-label { display: block; font-size: 13px; color: #374151; font-weight: 500; margin-bottom: 10px; }
.cfg-hint { font-weight: 400; color: #9ca3af; font-size: 12px; }
.dim-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dim-card {
  padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer;
  transition: all .2s; background: #fff;
}
.dim-card:hover { border-color: #c4b5fd; background: #faf5ff; }
.dim-card.active { border-color: #7c3aed; background: #ede9fe; }
.dim-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.dim-check {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1d5db;
  display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff;
}
.dim-card.active .dim-check { background: #7c3aed; border-color: #7c3aed; }
.dim-name { font-size: 13px; font-weight: 600; color: #1f2937; }
.dim-desc { font-size: 11px; color: #9ca3af; line-height: 1.4; }
.cfg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.opt-row { display: flex; flex-wrap: wrap; gap: 6px; }
.opt-btn {
  padding: 6px 14px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px;
  font-size: 12px; color: #6b7280; cursor: pointer; transition: all .2s;
}
.opt-btn:hover { border-color: #c4b5fd; }
.opt-btn.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }
.gen-btn {
  width: 100%; height: 46px; border: none; border-radius: 10px; margin-top: 8px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.gen-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,.3); }
.gen-btn:disabled { opacity: .5; cursor: not-allowed; background: #c4b5fd; }

.gen-loading { text-align: center; padding: 30px 0; }
.gen-spin {
  width: 48px; height: 48px; border: 4px solid #ede9fe; border-top-color: #7c3aed;
  border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.gen-loading h3 { font-size: 16px; color: #1f2937; margin-bottom: 20px; }
.gen-steps { display: flex; flex-direction: column; gap: 10px; text-align: left; }
.gen-step {
  padding: 10px 14px; border-radius: 8px; font-size: 13px;
  display: flex; align-items: center; gap: 8px; color: #9ca3af; background: #f9fafb;
}
.gen-step.done { color: #059669; }
.gen-step.active { color: #7c3aed; background: #ede9fe; }
.gs-icon { font-size: 14px; }
.gen-empty { text-align: center; padding: 60px 0; color: #9ca3af; }
.ge-icon { font-size: 48px; margin-bottom: 12px; opacity: .5; }
.gen-done { }
.gd-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }
.gd-head h3 { font-size: 16px; color: #059669; }
.gd-count { font-size: 12px; color: #9ca3af; }
.q-list { display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto; padding-right: 4px; }
.q-item { display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 10px; }
.q-num {
  width: 24px; height: 24px; border-radius: 50%; background: #7c3aed; color: #fff;
  font-size: 12px; font-weight: 600; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
}
.q-body { flex: 1; }
.q-dim { font-size: 11px; color: #7c3aed; font-weight: 600; margin-bottom: 4px; }
.q-text { font-size: 13px; color: #1f2937; line-height: 1.6; }
.start-btn {
  width: 100%; height: 50px; border: none; border-radius: 12px; margin-top: 20px;
  background: linear-gradient(135deg, #059669, #10b981); color: #fff;
  font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.start-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(16,185,129,.3); }
</style>
