<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateDataStore, useCandidateAuthStore } from '@/stores/candidate'

const router = useRouter()
const dataStore = useCandidateDataStore()
const auth = useCandidateAuthStore()

// 三大 AI 功能入口
const features = [
  {
    key: 'interview',
    title: 'AI 面试',
    desc: 'AI 面试官多轮追问，30 分钟还原真实面试场景，输出能力雷达图与改进建议。',
    icon: '🎯',
    gradient: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
    tags: ['多轮对话', '动态追问', '能力雷达'],
    to: '/c/mock'
  },
  {
    key: 'edit',
    title: 'AI 改简历',
    desc: '上传简历，AI 按段落逐条优化：摘要、项目经验、技能栈，并给出修改理由。',
    icon: '✍️',
    gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
    tags: ['分段优化', 'STAR 重构', 'ATS 关键词'],
    to: '/c/resume/edit'
  },
  {
    key: 'assess',
    title: '简历测评',
    desc: '六维度雷达图打分：匹配度、完整性、STAR、关键词命中，给出可执行改进清单。',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    tags: ['6 维评分', '关键词命中', '改进清单'],
    to: '/c/resume/assess'
  }
]

const stats = computed(() => ({
  total: dataStore.interviews.length,
  avg: dataStore.avgScore,
  best: dataStore.bestScore,
  resumeCount: auth.user?.resumes?.length || 0
}))

const defaultResume = computed(() => auth.defaultResume)

const latestInterview = computed(() => dataStore.interviews[0] || null)

function go(path) {
  router.push(path)
}
</script>

<template>
  <div class="wb">
    <!-- 欢迎横幅 -->
    <section class="hero">
      <div class="hero-left">
        <h1>Hi，{{ auth.displayName }} 👋</h1>
        <p class="hero-sub">这里是你的求职作战中心。AI 面试、AI 改简历、简历测评，三大能力助你拿下心仪 offer。</p>
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
          <div class="hs-item">
            <div class="hs-num">{{ stats.resumeCount }}</div>
            <div class="hs-label">简历数</div>
          </div>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-card" v-if="defaultResume">
          <div class="hc-icon">📄</div>
          <div class="hc-title">默认简历</div>
          <div class="hc-name">{{ defaultResume.name }}</div>
          <div class="hc-meta">{{ defaultResume.parsed?.lastCompany }} · {{ defaultResume.parsed?.workYears }} 年</div>
          <button class="hc-btn" @click="go('/c/resume/edit')">优化这份 →</button>
        </div>
        <div class="hero-card" v-else>
          <div class="hc-icon">📥</div>
          <div class="hc-title">还没有简历</div>
          <p class="hc-desc">上传一份简历，开启 AI 优化与测评</p>
          <button class="hc-btn" @click="go('/c/resume/edit')">去上传 →</button>
        </div>
      </div>
    </section>

    <!-- 三大 AI 功能入口 -->
    <section class="features">
      <h2 class="sec-title">🤖 AI 求职工具箱</h2>
      <div class="feat-grid">
        <div
          v-for="f in features"
          :key="f.key"
          class="feat-card"
          @click="go(f.to)"
        >
          <div class="feat-icon" :style="{ background: f.gradient }">{{ f.icon }}</div>
          <div class="feat-body">
            <h3 class="feat-title">{{ f.title }}</h3>
            <p class="feat-desc">{{ f.desc }}</p>
            <div class="feat-tags">
              <span v-for="t in f.tags" :key="t" class="feat-tag">{{ t }}</span>
            </div>
          </div>
          <div class="feat-go">进入 →</div>
        </div>
      </div>
    </section>

    <!-- 快捷信息：默认简历 + 最近练习 -->
    <section class="quick">
      <div class="quick-card">
        <div class="qc-head">
          <h3>📄 当前默认简历</h3>
          <button class="qc-link" @click="go('/c/resume/assess')">测评 →</button>
        </div>
        <div v-if="defaultResume" class="qc-body">
          <div class="qc-row"><span>简历名称</span><b>{{ defaultResume.name }}</b></div>
          <div class="qc-row"><span>学历</span><b>{{ defaultResume.parsed?.education }}</b></div>
          <div class="qc-row"><span>最近公司</span><b>{{ defaultResume.parsed?.lastCompany }}</b></div>
          <div class="qc-row"><span>技能栈</span>
            <div class="qc-skills">
              <span v-for="s in defaultResume.parsed?.skills" :key="s" class="qc-skill">{{ s }}</span>
            </div>
          </div>
        </div>
        <div v-else class="qc-empty">暂无简历，去 AI 改简历上传一份</div>
      </div>

      <div class="quick-card">
        <div class="qc-head">
          <h3>⏱️ 最近一次模拟</h3>
          <button class="qc-link" @click="go('/c/my')">查看全部 →</button>
        </div>
        <div v-if="latestInterview" class="qc-body">
          <div class="qc-row"><span>岗位</span><b>{{ latestInterview.positionTitle }}</b></div>
          <div class="qc-row"><span>时间</span><b>{{ latestInterview.date }}</b></div>
          <div class="qc-row"><span>得分</span><b class="qc-score">{{ latestInterview.overallScore }} 分</b></div>
          <p class="qc-summary">{{ latestInterview.summary }}</p>
          <button class="qc-btn" @click="go('/c/mock')">再练一场</button>
        </div>
        <div v-else class="qc-empty">还没有练习记录，去 AI 面试发起一场吧</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.wb { display: flex; flex-direction: column; gap: 32px; }

/* 横幅 */
.hero {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 20px; padding: 32px; color: #fff;
  display: flex; gap: 32px; align-items: center; justify-content: space-between;
  position: relative; overflow: hidden;
}
.hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 240px; height: 240px; border-radius: 50%; background: rgba(255,255,255,.1); }
.hero-left { flex: 1; position: relative; z-index: 1; }
.hero h1 { font-size: 26px; margin-bottom: 8px; }
.hero-sub { font-size: 14px; opacity: .9; line-height: 1.6; margin-bottom: 20px; max-width: 480px; }
.hero-stats { display: flex; gap: 28px; flex-wrap: wrap; }
.hs-num { font-size: 24px; font-weight: 700; }
.hs-label { font-size: 12px; opacity: .85; }
.hero-right { position: relative; z-index: 1; }
.hero-card {
  background: rgba(255,255,255,.15); backdrop-filter: blur(10px);
  border-radius: 16px; padding: 20px; width: 240px; text-align: center;
  border: 1px solid rgba(255,255,255,.2);
}
.hc-icon { font-size: 32px; margin-bottom: 8px; }
.hc-title { font-size: 13px; opacity: .9; margin-bottom: 4px; }
.hc-name { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
.hc-meta { font-size: 12px; opacity: .85; margin-bottom: 14px; }
.hc-desc { font-size: 12px; opacity: .9; line-height: 1.5; margin-bottom: 14px; }
.hc-btn {
  padding: 8px 20px; border: none; border-radius: 8px; background: #fff;
  color: #4f46e5; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.hc-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.2); }

/* 功能卡片 */
.sec-title { font-size: 20px; color: #1f2937; margin-bottom: 16px; }
.feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.feat-card {
  background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.05);
  transition: all .2s; cursor: pointer; display: flex; gap: 16px; border: 1px solid #f3f4f6; position: relative;
}
.feat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,.1); border-color: #c4b5fd; }
.feat-icon {
  width: 52px; height: 52px; border-radius: 14px; color: #fff;
  font-size: 26px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.feat-body { flex: 1; }
.feat-title { font-size: 17px; font-weight: 700; color: #1f2937; margin-bottom: 6px; }
.feat-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 10px; }
.feat-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.feat-tag {
  padding: 3px 10px; background: #f3f4f6; color: #4b5563; border-radius: 6px; font-size: 11px;
}
.feat-go {
  align-self: center; font-size: 13px; font-weight: 600; color: #7c3aed;
  white-space: nowrap; transition: transform .2s;
}
.feat-card:hover .feat-go { transform: translateX(4px); }

/* 快捷信息 */
.quick { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.quick-card {
  background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.qc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.qc-head h3 { font-size: 15px; font-weight: 700; color: #1f2937; }
.qc-link { border: none; background: transparent; color: #7c3aed; font-size: 13px; font-weight: 600; cursor: pointer; }
.qc-link:hover { text-decoration: underline; }
.qc-body { display: flex; flex-direction: column; gap: 10px; }
.qc-row { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.qc-row > span { color: #9ca3af; width: 72px; flex-shrink: 0; }
.qc-row > b { color: #1f2937; font-weight: 600; }
.qc-score { color: #7c3aed !important; font-size: 15px !important; }
.qc-skills { display: flex; flex-wrap: wrap; gap: 6px; }
.qc-skill { padding: 3px 10px; background: #ede9fe; color: #6d28d9; border-radius: 6px; font-size: 11px; font-weight: 500; }
.qc-summary { font-size: 13px; color: #4b5563; line-height: 1.6; margin: 6px 0 0 0; padding: 10px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #7c3aed; }
.qc-btn { margin-top: 12px; align-self: flex-start; padding: 8px 18px; border: none; border-radius: 8px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
.qc-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,58,237,.3); }
.qc-empty { font-size: 13px; color: #9ca3af; padding: 12px 0; }
</style>
