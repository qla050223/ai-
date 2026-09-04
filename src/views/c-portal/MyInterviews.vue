<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateDataStore } from '@/stores/candidate'
import { recommendLevelMap } from '@/mock/candidateData'

const router = useRouter()
const dataStore = useCandidateDataStore()

const filterType = ref('all')
const sortType = ref('time')

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '模拟练习', value: 'mock' },
  { label: '企业面试', value: 'enterprise' }
]

const list = computed(() => {
  let arr = [...dataStore.interviews]
  if (filterType.value !== 'all') {
    arr = arr.filter(i => i.type === filterType.value)
  }
  if (sortType.value === 'time') arr.sort((a,b) => new Date(b.date) - new Date(a.date))
  else if (sortType.value === 'score') arr.sort((a,b) => b.overallScore - a.overallScore)
  return arr
})

const stats = computed(() => ({
  total: dataStore.interviews.length,
  avg: dataStore.avgScore,
  best: dataStore.bestScore,
  latest: dataStore.latestScore
}))

function goReview(id) {
  router.push(`/c/my/${id}`)
}
function goMock() {
  router.push('/c/mock')
}
function levelInfo(level) {
  return recommendLevelMap[level] || recommendLevelMap.pending
}
</script>

<template>
  <div class="my-page">
    <!-- 顶部统计 -->
    <section class="stats-row">
      <div class="stat-card">
        <div class="sc-icon">📋</div>
        <div><div class="sc-num">{{ stats.total }}</div><div class="sc-label">累计面试</div></div>
      </div>
      <div class="stat-card">
        <div class="sc-icon">📊</div>
        <div><div class="sc-num">{{ stats.avg }}</div><div class="sc-label">平均分</div></div>
      </div>
      <div class="stat-card">
        <div class="sc-icon">🏆</div>
        <div><div class="sc-num">{{ stats.best }}</div><div class="sc-label">最高分</div></div>
      </div>
      <div class="stat-card">
        <div class="sc-icon">📈</div>
        <div><div class="sc-num">{{ stats.latest }}</div><div class="sc-label">最近分</div></div>
      </div>
    </section>

    <!-- 列表 -->
    <div class="list-card">
      <div class="list-head">
        <h2>历史面试</h2>
        <div class="list-actions">
          <div class="filter-tabs">
            <button v-for="f in filterOptions" :key="f.value" class="ft" :class="{ active: filterType === f.value }" @click="filterType = f.value">{{ f.label }}</button>
          </div>
          <select v-model="sortType" class="sort-sel">
            <option value="time">按时间</option>
            <option value="score">按分数</option>
          </select>
          <button class="new-btn" @click="goMock">+ 新模拟</button>
        </div>
      </div>

      <div class="list-body">
        <div v-for="iv in list" :key="iv.id" class="iv-row" @click="goReview(iv.id)">
          <div class="iv-main">
            <div class="iv-head">
              <span class="iv-type" :class="iv.type">{{ iv.type === 'mock' ? '🤖 模拟' : '🏢 企业' }}</span>
              <span class="iv-pos">{{ iv.positionTitle }}</span>
            </div>
            <div class="iv-meta">
              <span>📅 {{ iv.date }}</span>
              <span>⏱ {{ iv.duration }} 分钟</span>
              <span>📝 {{ iv.questionCount }} 题</span>
            </div>
          </div>
          <div class="iv-score-block">
            <div class="iv-score" :class="iv.overallScore >= 80 ? 'good' : iv.overallScore >= 60 ? 'mid' : 'low'">{{ iv.overallScore }}</div>
            <span class="iv-level" :class="levelInfo(iv.recommendLevel).type">{{ levelInfo(iv.recommendLevel).label }}</span>
          </div>
          <button class="iv-go">查看 ›</button>
        </div>
        <div v-if="!list.length" class="empty">
          <div class="empty-icon">📭</div>
          <p>暂无面试记录</p>
          <button class="empty-btn" @click="goMock">发起第一场模拟</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-page { display: flex; flex-direction: column; gap: 20px; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card {
  background: #fff; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.sc-icon {
  width: 44px; height: 44px; border-radius: 12px; background: #ede9fe;
  font-size: 22px; display: flex; align-items: center; justify-content: center;
}
.sc-num { font-size: 24px; font-weight: 700; color: #1f2937; }
.sc-label { font-size: 12px; color: #9ca3af; }

.list-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.list-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.list-head h2 { font-size: 18px; color: #1f2937; }
.list-actions { display: flex; align-items: center; gap: 12px; }
.filter-tabs { display: flex; gap: 4px; background: #f3f4f6; border-radius: 8px; padding: 3px; }
.ft { padding: 6px 14px; border: none; background: transparent; color: #6b7280; font-size: 12px; border-radius: 6px; cursor: pointer; transition: all .2s; }
.ft.active { background: #fff; color: #7c3aed; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.sort-sel { height: 32px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 12px; color: #6b7280; background: #fff; outline: none; }
.new-btn { padding: 8px 16px; border: none; border-radius: 8px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }

.list-body { display: flex; flex-direction: column; gap: 10px; }
.iv-row {
  display: flex; align-items: center; gap: 16px; padding: 16px; background: #f9fafb;
  border-radius: 12px; cursor: pointer; transition: all .2s; border: 1px solid transparent;
}
.iv-row:hover { background: #faf5ff; border-color: #c4b5fd; transform: translateX(2px); }
.iv-main { flex: 1; }
.iv-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.iv-type { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.iv-type.mock { background: #ede9fe; color: #6d28d9; }
.iv-type.enterprise { background: #dbeafe; color: #2563eb; }
.iv-pos { font-size: 15px; font-weight: 600; color: #1f2937; }
.iv-meta { display: flex; gap: 16px; font-size: 12px; color: #9ca3af; }
.iv-score-block { text-align: center; }
.iv-score { font-size: 28px; font-weight: 700; line-height: 1; }
.iv-score.good { color: #059669; }
.iv-score.mid { color: #7c3aed; }
.iv-score.low { color: #ef4444; }
.iv-level { display: block; font-size: 11px; margin-top: 4px; padding: 1px 8px; border-radius: 4px; }
.iv-level.success { background: #d1fae5; color: #059669; }
.iv-level.info { background: #dbeafe; color: #2563eb; }
.iv-level.warning { background: #fef3c7; color: #b45309; }
.iv-level.error { background: #fee2e2; color: #dc2626; }
.iv-go { padding: 8px 14px; border: 1px solid #e5e7eb; background: #fff; color: #6b7280; border-radius: 8px; font-size: 13px; cursor: pointer; }
.iv-row:hover .iv-go { background: #7c3aed; color: #fff; border-color: #7c3aed; }

.empty { text-align: center; padding: 40px 0; color: #9ca3af; }
.empty-icon { font-size: 40px; margin-bottom: 8px; opacity: .5; }
.empty-btn { margin-top: 12px; padding: 8px 20px; border: none; border-radius: 8px; background: #7c3aed; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
</style>
