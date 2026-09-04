<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAsyncInterviewStore } from '@/stores/candidate'
import { useCandidateAuthStore } from '@/stores/candidate'

const router = useRouter()
const store = useAsyncInterviewStore()
const auth = useCandidateAuthStore()
const registered = ref(false)

function goLogin() {
  router.push('/c/login')
}
function goMock() {
  router.push('/c/mock')
}
</script>

<template>
  <div class="thx-page">
    <div class="thx-bg"><div class="tb tb1"></div><div class="tb tb2"></div></div>
    <div class="thx-card">
      <div class="thx-icon">🎉</div>
      <h1>面试已提交</h1>
      <p class="thx-hello">{{ store.invitation?.candidateName }}，感谢你完成本次面试。</p>

      <div class="thx-summary">
        <div class="ts-item">
          <div class="ts-label">企业</div>
          <div class="ts-value">{{ store.invitation?.orgName }}</div>
        </div>
        <div class="ts-item">
          <div class="ts-label">岗位</div>
          <div class="ts-value">{{ store.invitation?.positionTitle }}</div>
        </div>
        <div class="ts-item">
          <div class="ts-label">用时</div>
          <div class="ts-value">{{ store.invitation?.duration }} 分钟</div>
        </div>
      </div>

      <div class="thx-notice">
        <div class="tn-title">📍 接下来</div>
        <ul>
          <li>AI 正在生成评估报告，HR 将在 3 个工作日内与你同步结果。</li>
          <li v-if="store.invitation?.reportVisibility !== 'closed'">报告生成后，你可在候选人端查看能力反馈。</li>
          <li v-else>本次报告可见性由企业设置为"不公开"，如有疑问请联系 HR。</li>
        </ul>
      </div>

      <div v-if="!auth.isLoggedIn" class="thx-register">
        <div class="tr-title">想沉淀自己的能力档案？</div>
        <p class="tr-desc">注册账号后，可将本次面试关联到个人档案，随时回看记录，并使用 AI 模拟面试持续提升。</p>
        <button class="thx-btn primary" @click="goLogin">注册 / 登录关联档案</button>
      </div>

      <div class="thx-actions">
        <button v-if="auth.isLoggedIn" class="thx-btn primary" @click="goMock">前往模拟练习</button>
        <button class="thx-btn ghost" @click="goLogin">前往候选人端</button>
      </div>

      <p class="thx-foot">Token 已失效 · 单设备绑定已解除 · 数据加密传输完成</p>
    </div>
  </div>
</template>

<style scoped>
.thx-page {
  min-height: 100vh; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; padding: 24px;
}
.thx-bg { position: absolute; inset: 0; pointer-events: none; }
.tb { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .5; }
.tb1 { width: 450px; height: 450px; background: #34d399; top: -120px; right: -120px; }
.tb2 { width: 500px; height: 500px; background: #6ee7b7; bottom: -150px; left: -150px; }
.thx-card {
  width: 520px; max-width: 100%; background: #fff; border-radius: 24px; padding: 40px;
  box-shadow: 0 20px 60px rgba(16,185,129,.2); text-align: center; position: relative; z-index: 1;
}
.thx-icon { font-size: 64px; margin-bottom: 12px; }
.thx-card h1 { font-size: 26px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
.thx-hello { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
.thx-summary {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;
  padding: 20px; background: #f0fdf4; border-radius: 14px;
}
.ts-item { text-align: center; }
.ts-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.ts-value { font-size: 14px; font-weight: 600; color: #1f2937; }
.thx-notice {
  background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px;
  margin-bottom: 24px; text-align: left;
}
.tn-title { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 8px; }
.thx-notice ul { margin: 0; padding-left: 18px; }
.thx-notice li { font-size: 12px; color: #78350f; line-height: 1.8; }
.thx-register { padding: 20px; background: #eef2ff; border-radius: 12px; margin-bottom: 20px; }
.tr-title { font-size: 14px; font-weight: 600; color: #4338ca; margin-bottom: 6px; }
.tr-desc { font-size: 12px; color: #6366f1; line-height: 1.6; margin-bottom: 14px; }
.thx-actions { display: flex; flex-direction: column; gap: 10px; }
.thx-btn {
  height: 46px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.thx-btn.primary { border: none; background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
.thx-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,.4); }
.thx-btn.ghost { border: 1px solid #d1d5db; background: #fff; color: #6b7280; }
.thx-btn.ghost:hover { background: #f9fafb; }
.thx-foot { margin-top: 20px; font-size: 11px; color: #9ca3af; }
</style>
