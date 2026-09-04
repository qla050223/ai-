<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateDataStore, useCandidateAuthStore } from '@/stores/candidate'

const router = useRouter()
const dataStore = useCandidateDataStore()
const auth = useCandidateAuthStore()

const selectedCategory = ref('all')
const searchText = ref('')

const categories = [
  { label: '全部', value: 'all' },
  { label: '前端', value: '前端' },
  { label: '后端', value: '后端' },
  { label: '产品', value: '产品' },
  { label: '数据', value: '数据' },
  { label: '设计', value: '设计' }
]

const filteredPositions = computed(() => {
  return dataStore.positions.filter(p => {
    const matchCat = selectedCategory.value === 'all' || p.category === selectedCategory.value
    const matchText = !searchText.value || p.title.includes(searchText.value) || p.skillTags.some(s => s.toLowerCase().includes(searchText.value.toLowerCase()))
    return matchCat && matchText
  })
})

function startPractice(positionId) {
  router.push(`/c/mock/config/${positionId}`)
}

const stats = computed(() => ({
  total: dataStore.interviews.length,
  avg: dataStore.avgScore,
  best: dataStore.bestScore
}))
</script>

<template>
  <div class="mock-home">
    <!-- 欢迎横幅 -->
    <section class="hero">
      <div class="hero-left">
        <h1>Hi，{{ auth.displayName }} 👋</h1>
        <p class="hero-sub">选一个目标岗位，发起一场 30 分钟 AI 模拟面试，获取能力雷达图与改进建议。</p>
        <div class="hero-stats">
          <div class="hs-item">
            <div class="hs-num">{{ stats.total }}</div>
            <div class="hs-label">累计练习</div>
          </div>
          <div class="hs-item">
            <div class="hs-num">{{ stats.avg }}</div>
            <div class="hs-label">平均分</div>
          </div>
          <div class="hs-item">
            <div class="hs-num">{{ stats.best }}</div>
            <div class="hs-label">最高分</div>
          </div>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-card">
          <div class="hc-icon">🚀</div>
          <div class="hc-title">智能推荐</div>
          <p class="hc-desc">基于你的简历，AI 推荐最匹配的岗位题库</p>
          <button class="hc-btn" @click="startPractice('mp_001')">为我推荐 →</button>
        </div>
      </div>
    </section>

    <!-- 岗位题库 -->
    <section class="positions">
      <div class="pos-head">
        <h2>岗位题库</h2>
        <input v-model="searchText" class="pos-search" placeholder="搜索岗位或技能..." />
      </div>
      <div class="cat-tabs">
        <button
          v-for="c in categories"
          :key="c.value"
          class="cat-tab"
          :class="{ active: selectedCategory === c.value }"
          @click="selectedCategory = c.value"
        >{{ c.label }}</button>
      </div>

      <div class="pos-grid">
        <div v-for="p in filteredPositions" :key="p.id" class="pos-card" :class="{ hot: p.hot }">
          <div class="pos-card-head">
            <div>
              <h3 class="pos-title">{{ p.title }}</h3>
              <span class="pos-cat">{{ p.category }} · {{ p.difficulty }}</span>
            </div>
            <span v-if="p.hot" class="hot-badge">🔥 热门</span>
          </div>
          <p class="pos-desc">{{ p.description }}</p>
          <div class="pos-skills">
            <span v-for="s in p.skillTags" :key="s" class="skill-tag">{{ s }}</span>
          </div>
          <div class="pos-meta">
            <span>📋 {{ p.practiceCount }} 人练过</span>
            <span>📊 平均 {{ p.avgScore }} 分</span>
          </div>
          <button class="pos-btn" @click="startPractice(p.id)">开始练习</button>
        </div>
        <div v-if="!filteredPositions.length" class="empty">
          <div class="empty-icon">🔍</div>
          <p>没有找到匹配的岗位</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.mock-home { display: flex; flex-direction: column; gap: 32px; }
.hero {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 20px; padding: 32px; color: #fff;
  display: flex; gap: 32px; align-items: center; justify-content: space-between;
  position: relative; overflow: hidden;
}
.hero::before { content: ''; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,.1); }
.hero-left { flex: 1; position: relative; z-index: 1; }
.hero h1 { font-size: 26px; margin-bottom: 8px; }
.hero-sub { font-size: 14px; opacity: .9; line-height: 1.6; margin-bottom: 20px; max-width: 420px; }
.hero-stats { display: flex; gap: 28px; }
.hs-num { font-size: 24px; font-weight: 700; }
.hs-label { font-size: 12px; opacity: .85; }
.hero-right { position: relative; z-index: 1; }
.hero-card {
  background: rgba(255,255,255,.15); backdrop-filter: blur(10px);
  border-radius: 16px; padding: 20px; width: 240px; text-align: center;
  border: 1px solid rgba(255,255,255,.2);
}
.hc-icon { font-size: 32px; margin-bottom: 8px; }
.hc-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
.hc-desc { font-size: 12px; opacity: .9; line-height: 1.5; margin-bottom: 14px; }
.hc-btn {
  padding: 8px 20px; border: none; border-radius: 8px; background: #fff;
  color: #4f46e5; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.hc-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.2); }

.pos-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.pos-head h2 { font-size: 20px; color: #1f2937; }
.pos-search {
  height: 40px; padding: 0 16px; border: 1px solid #e5e7eb; border-radius: 10px;
  font-size: 14px; outline: none; width: 240px; background: #fff; transition: border-color .2s;
}
.pos-search:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.cat-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.cat-tab {
  padding: 6px 16px; border: 1px solid #e5e7eb; background: #fff; border-radius: 999px;
  font-size: 13px; color: #6b7280; cursor: pointer; transition: all .2s;
}
.cat-tab:hover { border-color: #c4b5fd; color: #6d28d9; }
.cat-tab.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
.pos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.pos-card {
  background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.05);
  transition: all .2s; display: flex; flex-direction: column; border: 1px solid #f3f4f6;
}
.pos-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
.pos-card.hot { border-color: #fde68a; }
.pos-card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.pos-title { font-size: 17px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
.pos-cat { font-size: 12px; color: #9ca3af; }
.hot-badge {
  font-size: 11px; padding: 3px 8px; background: #fef3c7; color: #b45309;
  border-radius: 999px; font-weight: 600;
}
.pos-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 12px; }
.pos-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.skill-tag {
  padding: 3px 10px; background: #f3f4f6; color: #4b5563; border-radius: 6px;
  font-size: 11px;
}
.pos-meta { display: flex; gap: 16px; font-size: 12px; color: #9ca3af; margin-bottom: 16px; }
.pos-btn {
  margin-top: auto; height: 40px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.pos-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,58,237,.3); }
.empty { grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af; }
.empty-icon { font-size: 40px; margin-bottom: 8px; }
</style>
