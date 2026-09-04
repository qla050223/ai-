<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateDataStore } from '@/stores/candidate'
import ChartBase from '@/components/ChartBase.vue'

const router = useRouter()
const dataStore = useCandidateDataStore()

// 雷达图叠加：选择场次
const selectedIds = ref(dataStore.interviews.slice(0, 3).map(i => i.id))
const maxSelect = 5

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    if (selectedIds.value.length > 1) selectedIds.value.splice(idx, 1)
  } else {
    if (selectedIds.value.length < maxSelect) selectedIds.value.push(id)
  }
}

const selectedInterviews = computed(() =>
  selectedIds.value.map(id => dataStore.interviewById(id)).filter(Boolean)
)

// 雷达图叠加 option
const radarCompareOption = computed(() => {
  const first = selectedInterviews.value[0]
  if (!first) return {}
  const dims = Object.keys(first.radar)
  const colors = ['#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']
  return {
    tooltip: { trigger: 'item' },
    legend: {
      data: selectedInterviews.value.map((iv, i) => `${iv.date}（${iv.overallScore}分）`),
      bottom: 0, textStyle: { fontSize: 11 }
    },
    radar: {
      indicator: dims.map(name => ({ name, max: 100 })),
      shape: 'polygon', splitNumber: 5,
      axisName: { color: '#4e5969', fontSize: 12 },
      splitArea: { areaStyle: { color: ['#fafbfc', '#f2f3f5', '#fafbfc', '#f2f3f5', '#fafbfc'] } },
      splitLine: { lineStyle: { color: '#e5e6eb' } },
      axisLine: { lineStyle: { color: '#e5e6eb' } }
    },
    series: [{
      type: 'radar',
      data: selectedInterviews.value.map((iv, i) => ({
        value: dims.map(d => iv.radar[d] || 0),
        name: `${iv.date}（${iv.overallScore}分）`,
        areaStyle: { color: colors[i % colors.length] + '33' },
        lineStyle: { color: colors[i % colors.length], width: 2 },
        itemStyle: { color: colors[i % colors.length] },
        symbolSize: 5
      }))
    }]
  }
})

// 成长曲线维度选择
const selectedDim = ref('专业技能')
const dimOptions = computed(() => Object.keys(dataStore.growth))

// 成长曲线 option
const growthOption = computed(() => {
  const data = dataStore.growth[selectedDim.value] || []
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category', data: data.map(d => d.date),
      axisLine: { lineStyle: { color: '#e5e6eb' } },
      axisLabel: { color: '#86909c', fontSize: 11 }
    },
    yAxis: {
      type: 'value', min: 50, max: 100,
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f2f3f5' } },
      axisLabel: { color: '#86909c', fontSize: 11 }
    },
    series: [{
      type: 'line', smooth: true, data: data.map(d => d.score),
      symbol: 'circle', symbolSize: 8,
      lineStyle: { color: '#7c3aed', width: 3 },
      itemStyle: { color: '#7c3aed', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
          { offset: 0, color: 'rgba(124,58,237,.3)' }, { offset: 1, color: 'rgba(124,58,237,0)' }
        ] }
      },
      markPoint: {
        data: [
          { type: 'max', name: '最高', symbolSize: 42, itemStyle: { color: '#10b981' }, label: { fontSize: 10 } }
        ]
      }
    }]
  }
})

const diagnosis = computed(() => dataStore.diagnosis)
const trendUp = computed(() => diagnosis.value.trend === 'up')

function goPractice(positionId) {
  router.push(`/c/mock/config/${positionId}`)
}
</script>

<template>
  <div class="ap-page">
    <!-- 概要 -->
    <div class="ap-hero">
      <div>
        <h1>能力档案</h1>
        <p class="ap-sub">跨场次沉淀你的能力曲线，识别短板，定向提升。</p>
      </div>
      <div class="ap-trend" :class="{ up: trendUp, down: !trendUp }">
        <span class="ap-trend-icon">{{ trendUp ? '📈' : '📉' }}</span>
        <div>
          <div class="ap-trend-val">{{ diagnosis.trendValue }}</div>
          <div class="ap-trend-label">较首次提升</div>
        </div>
      </div>
    </div>

    <!-- 雷达图叠加 -->
    <div class="card">
      <div class="card-head">
        <h2>📊 能力雷达图叠加对比</h2>
        <span class="card-tip">选择 2-{{ maxSelect }} 场面试，对比能力变化</span>
      </div>
      <div class="select-row">
        <div
          v-for="iv in dataStore.interviews"
          :key="iv.id"
          class="iv-chip"
          :class="{ active: selectedIds.includes(iv.id) }"
          @click="toggleSelect(iv.id)"
        >
          <span class="ic-date">{{ iv.date.slice(5) }}</span>
          <span class="ic-score">{{ iv.overallScore }}分</span>
        </div>
      </div>
      <ChartBase :option="radarCompareOption" height="380px" />
    </div>

    <!-- 成长曲线 -->
    <div class="card">
      <div class="card-head">
        <h2>📈 能力成长曲线</h2>
        <div class="dim-sel-row">
          <button v-for="d in dimOptions" :key="d" class="dim-sel" :class="{ active: selectedDim === d }" @click="selectedDim = d">{{ d }}</button>
        </div>
      </div>
      <ChartBase :option="growthOption" height="300px" />
    </div>

    <!-- 短板诊断 -->
    <div class="card">
      <div class="card-head">
        <h2>🎯 短板诊断与练习推荐</h2>
        <span class="card-tip">基于 {{ diagnosis.totalPractices }} 场练习 AI 诊断</span>
      </div>
      <div class="sb-section">
        <div class="sb-section-title">⚠ 能力短板 Top 3</div>
        <div class="sb-list">
          <div v-for="(s, i) in diagnosis.top3" :key="i" class="sb-item">
            <div class="sb-rank">{{ i + 1 }}</div>
            <div class="sb-body">
              <div class="sb-head">
                <span class="sb-name">{{ s.dimension }}</span>
                <span class="sb-score" :class="{ low: s.score < 60 }">{{ s.score }} 分</span>
              </div>
              <p class="sb-suggestion">{{ s.suggestion }}</p>
            </div>
            <button class="sb-btn" @click="goPractice('mp_001')">去练习</button>
          </div>
        </div>
      </div>
      <div class="sb-section">
        <div class="sb-section-title good">✓ 优势能力</div>
        <div class="strength-row">
          <div v-for="(s, i) in diagnosis.strengths" :key="i" class="st-item">
            <span class="st-name">{{ s.dimension }}</span>
            <span class="st-score">{{ s.score }} 分</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ap-page { display: flex; flex-direction: column; gap: 20px; }
.ap-hero {
  background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 20px; padding: 28px 32px;
  color: #fff; display: flex; justify-content: space-between; align-items: center;
}
.ap-hero h1 { font-size: 24px; margin-bottom: 6px; }
.ap-sub { font-size: 13px; opacity: .9; }
.ap-trend { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,.15); padding: 12px 20px; border-radius: 12px; }
.ap-trend-icon { font-size: 28px; }
.ap-trend-val { font-size: 22px; font-weight: 700; }
.ap-trend-label { font-size: 11px; opacity: .85; }

.card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
.card-head h2 { font-size: 16px; font-weight: 700; color: #1f2937; }
.card-tip { font-size: 12px; color: #9ca3af; }

.select-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.iv-chip {
  padding: 8px 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff;
  cursor: pointer; transition: all .2s; display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.iv-chip:hover { border-color: #c4b5fd; }
.iv-chip.active { border-color: #7c3aed; background: #ede9fe; }
.ic-date { font-size: 11px; color: #9ca3af; }
.iv-chip.active .ic-date { color: #6d28d9; }
.ic-score { font-size: 13px; font-weight: 700; color: #1f2937; }

.dim-sel-row { display: flex; gap: 6px; flex-wrap: wrap; }
.dim-sel { padding: 5px 12px; border: 1px solid #e5e7eb; background: #fff; border-radius: 999px; font-size: 12px; color: #6b7280; cursor: pointer; transition: all .2s; }
.dim-sel:hover { border-color: #c4b5fd; }
.dim-sel.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }

.sb-section { margin-bottom: 24px; }
.sb-section:last-child { margin-bottom: 0; }
.sb-section-title { font-size: 13px; font-weight: 600; color: #92400e; margin-bottom: 12px; }
.sb-section-title.good { color: #059669; }
.sb-list { display: flex; flex-direction: column; gap: 10px; }
.sb-item { display: flex; align-items: center; gap: 14px; padding: 14px; background: #fefce8; border-radius: 12px; border: 1px solid #fde68a; }
.sb-rank { width: 28px; height: 28px; border-radius: 50%; background: #f59e0b; color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sb-body { flex: 1; }
.sb-head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.sb-name { font-size: 14px; font-weight: 600; color: #92400e; }
.sb-score { font-size: 13px; font-weight: 700; color: #d97706; }
.sb-score.low { color: #ef4444; }
.sb-suggestion { font-size: 12px; color: #78350f; line-height: 1.6; margin: 0; }
.sb-btn { padding: 8px 16px; border: none; border-radius: 8px; background: #7c3aed; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0; }
.sb-btn:hover { background: #6d28d9; }

.strength-row { display: flex; gap: 12px; }
.st-item { flex: 1; padding: 14px; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 12px; text-align: center; }
.st-name { display: block; font-size: 13px; font-weight: 600; color: #065f46; margin-bottom: 4px; }
.st-score { font-size: 20px; font-weight: 700; color: #059669; }
</style>
