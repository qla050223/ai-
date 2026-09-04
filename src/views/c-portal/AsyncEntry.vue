<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsyncInterviewStore } from '@/stores/candidate'

const route = useRoute()
const router = useRouter()
const store = useAsyncInterviewStore()

const verifying = ref(true)

onMounted(async () => {
  const token = route.params.token
  await new Promise(r => setTimeout(r, 900)) // 模拟后端校验
  store.verifyToken(token)
  verifying.value = false
})

function goPrep() {
  store.start()
  router.push('/c/async/prep')
}

function goLogin() {
  router.push('/c/login')
}
</script>

<template>
  <div class="async-page">
    <div class="async-bg">
      <div class="ab ab1"></div><div class="ab ab2"></div><div class="ab ab3"></div>
    </div>

    <div class="async-container">
      <!-- 校验中 -->
      <div v-if="verifying" class="async-card">
        <div class="spin"></div>
        <h2>正在校验邀请链接</h2>
        <p>请稍候，正在验证你的面试邀请 Token...</p>
      </div>

      <!-- 校验失败 -->
      <div v-else-if="!store.isVerified" class="async-card">
        <div class="big-icon fail">⚠️</div>
        <h2>邀请链接无效</h2>
        <p>{{ store.status === 'expired' ? '链接已过期或已被使用' : 'Token 校验失败' }}</p>
        <p class="async-tip">请联系企业 HR 重新发送面试邀请。</p>
        <button class="btn-ghost" @click="goLogin">前往候选人登录</button>
      </div>

      <!-- 校验通过 -->
      <div v-else class="async-card">
        <div class="org-badge">
          <span class="org-logo">{{ store.invitation.orgLogo }}</span>
          <div>
            <div class="org-name">{{ store.invitation.orgName }}</div>
            <div class="org-sub">异步面试邀请</div>
          </div>
        </div>

        <h1 class="async-hello">你好，{{ store.invitation.candidateName }} 👋</h1>
        <p class="async-welcome">你收到一份来自 <b>{{ store.invitation.orgName }}</b> 的 AI 面试邀请，岗位为 <b>{{ store.invitation.positionTitle }}</b>。请在有效期内独立完成本次面试。</p>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">岗位</div>
            <div class="info-value">{{ store.invitation.positionTitle }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">面试时长</div>
            <div class="info-value">{{ store.invitation.duration }} 分钟</div>
          </div>
          <div class="info-item">
            <div class="info-label">题量</div>
            <div class="info-value">约 {{ store.invitation.questionCount }} 题</div>
          </div>
          <div class="info-item">
            <div class="info-label">有效期</div>
            <div class="info-value small">{{ store.invitation.validFrom }}<br>~ {{ store.invitation.validUntil }}</div>
          </div>
        </div>

        <div class="dim-tags">
          <span class="dim-label">考察维度</span>
          <span v-for="d in store.invitation.focusDimensions" :key="d" class="dim-tag">{{ d }}</span>
        </div>

        <div class="notice">
          <div class="notice-title">📌 请知悉</div>
          <ul>
            <li>本次面试为 AI 文字多轮问答，无需与 HR 同时在线。</li>
            <li>建议使用 Chrome / Edge 浏览器，确保网络稳定。</li>
            <li>开始后将进入倒计时，可暂停，但总时长受控。</li>
            <li>请独立完成，离页次数与时长将记录在报告中。</li>
          </ul>
        </div>

        <button class="btn-primary big" @click="goPrep">进入面试准备</button>
        <p class="async-foot">凭 Token 免登录 · 单设备绑定 · 数据加密传输</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.async-page {
  min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; padding: 24px;
}
.async-bg { position: absolute; inset: 0; pointer-events: none; }
.ab { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .4; }
.ab1 { width: 500px; height: 500px; background: #7c3aed; top: -150px; right: -150px; }
.ab2 { width: 600px; height: 600px; background: #db2777; bottom: -200px; left: -200px; }
.ab3 { width: 300px; height: 300px; background: #4f46e5; top: 40%; left: 50%; }
.async-container { position: relative; z-index: 1; width: 600px; max-width: 100%; }
.async-card {
  background: rgba(255,255,255,.98); border-radius: 24px; padding: 40px;
  box-shadow: 0 30px 80px rgba(0,0,0,.3);
  text-align: center;
}
.spin {
  width: 56px; height: 56px; border: 4px solid #ede9fe; border-top-color: #7c3aed;
  border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.async-card h2 { font-size: 20px; color: #1f2937; margin-bottom: 8px; }
.async-card p { color: #6b7280; font-size: 14px; line-height: 1.6; }
.async-tip { margin-top: 12px; color: #9ca3af; font-size: 13px; }
.big-icon { font-size: 56px; margin-bottom: 12px; }
.big-icon.fail { color: #ef4444; }
.org-badge { display: flex; align-items: center; gap: 12px; justify-content: center; margin-bottom: 24px; }
.org-logo {
  width: 52px; height: 52px; border-radius: 14px; background: #ede9fe;
  font-size: 28px; display: flex; align-items: center; justify-content: center;
}
.org-name { font-size: 16px; font-weight: 700; color: #1f2937; text-align: left; }
.org-sub { font-size: 12px; color: #9ca3af; text-align: left; }
.async-hello { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
.async-welcome { font-size: 14px; color: #4b5563; line-height: 1.7; margin-bottom: 24px; text-align: left; }
.async-welcome b { color: #7c3aed; }
.info-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;
}
.info-item {
  background: #f9fafb; border-radius: 12px; padding: 14px; text-align: left;
}
.info-label { font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.info-value { font-size: 15px; font-weight: 600; color: #1f2937; }
.info-value.small { font-size: 12px; line-height: 1.5; }
.dim-tags { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 20px; justify-content: center; }
.dim-label { font-size: 12px; color: #9ca3af; margin-right: 4px; }
.dim-tag {
  padding: 4px 12px; background: #ede9fe; color: #6d28d9; border-radius: 999px;
  font-size: 12px; font-weight: 500;
}
.notice {
  background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px;
  margin-bottom: 24px; text-align: left;
}
.notice-title { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 8px; }
.notice ul { margin: 0; padding-left: 18px; }
.notice li { font-size: 12px; color: #78350f; line-height: 1.8; }
.btn-primary {
  height: 48px; padding: 0 32px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all .2s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,.4); }
.btn-primary.big { width: 100%; }
.btn-ghost {
  margin-top: 8px; padding: 10px 24px; border: 1px solid #e5e7eb; background: #fff;
  color: #6b7280; border-radius: 10px; font-size: 14px; cursor: pointer;
}
.async-foot { margin-top: 16px; font-size: 12px; color: #9ca3af; }
</style>
