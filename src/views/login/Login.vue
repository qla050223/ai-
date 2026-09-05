<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMessage } from 'naive-ui'

const router = useRouter()
const auth = useAuthStore()
const message = useMessage()

const form = reactive({
  email: 'linshuhao@yuntu.com',
  password: 'demo1234'
})
const loading = ref(false)

function handleLogin() {
  if (!form.email || !form.password) {
    message.warning('请输入邮箱和密码')
    return
  }
  loading.value = true
  setTimeout(async () => {
    const res = await auth.login(form)
    loading.value = false
    if (res.ok) {
      message.success(res.offline ? '登录成功（演示模式：后端未连接）' : '登录成功')
      router.push('/dashboard')
    } else {
      message.error(res.msg || '登录失败')
    }
  }, 600)
}

function goCandidate() {
  router.push('/c/login')
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg-left">
      <div class="brand">
        <span class="brand-icon">🎯</span>
        <span class="brand-name">AI Interview Pro</span>
      </div>
      <h1>AI 智能面试平台</h1>
      <p class="subtitle">让每一次面试都可量化、可追溯、可复用<br/>把面试官的经验沉淀为系统能力</p>
      <div class="features">
        <div class="feature-item">
          <span class="fi-icon">⚡</span>
          <div>
            <div class="fi-title">提效</div>
            <div class="fi-desc">AI 自动出题评估，单场面试准备时间降低 60%</div>
          </div>
        </div>
        <div class="feature-item">
          <span class="fi-icon">⚖️</span>
          <div>
            <div class="fi-title">降偏</div>
            <div class="fi-desc">结构化评分模型 + 雷达图，减少主观偏见</div>
          </div>
        </div>
        <div class="feature-item">
          <span class="fi-icon">📦</span>
          <div>
            <div class="fi-title">沉淀</div>
            <div class="fi-desc">面试记录与题库永久留存，支撑团队复盘</div>
          </div>
        </div>
      </div>
    </div>

    <div class="login-bg-right">
      <n-card class="login-card" :bordered="false" size="large">
        <div class="card-title">欢迎回来</div>
        <div class="card-desc">企业账号登录</div>

        <n-form @submit.prevent="handleLogin" class="mt-20">
          <n-form-item label="企业邮箱">
            <n-input v-model:value="form.email" placeholder="请输入企业邮箱" size="large" @keyup.enter="handleLogin">
              <template #prefix>📧</template>
            </n-input>
          </n-form-item>
          <n-form-item label="密码">
            <n-input v-model:value="form.password" type="password" show-password-on="click" placeholder="请输入密码" size="large" @keyup.enter="handleLogin">
              <template #prefix>🔒</template>
            </n-input>
          </n-form-item>
          <div class="login-options">
            <n-checkbox>7 天内自动登录</n-checkbox>
            <n-button text type="primary">忘记密码？</n-button>
          </div>
          <n-button type="primary" block size="large" :loading="loading" @click="handleLogin" style="margin-top: 16px">
            登 录
          </n-button>
        </n-form>

        <n-divider style="margin: 20px 0">其他登录方式</n-divider>
        <n-space justify="center" :size="16">
          <n-button quirk circle>SSO</n-button>
          <n-button quirk circle>钉</n-button>
          <n-button quirk circle>飞</n-button>
        </n-space>
        <div class="login-tip">演示账号：linshuhao@yuntu.com / demo1234</div>

        <n-divider style="margin: 16px 0">
          <span class="divider-text">身份切换</span>
        </n-divider>
        <div class="candidate-entry" @click="goCandidate">
          <span class="ce-icon">🙂</span>
          <div class="ce-body">
            <div class="ce-title">我是求职者</div>
            <div class="ce-desc">进入候选人端，练习模拟面试</div>
          </div>
          <span class="ce-arrow">→</span>
        </div>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
}
.login-bg-left {
  flex: 1.1;
  background: linear-gradient(135deg, #0f1f3d 0%, #1e3a6d 55%, #2b5fa3 100%);
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  position: relative;
}
.login-bg-left::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(91,143,249,0.25), transparent 50%);
}
.brand { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; position: relative; }
.brand-icon { font-size: 28px; }
.brand-name { font-size: 18px; font-weight: 600; }
.login-bg-left h1 { font-size: 38px; margin: 0 0 16px; font-weight: 700; position: relative; }
.subtitle { font-size: 15px; color: #ffffffc0; line-height: 1.8; margin: 0 0 48px; position: relative; }
.features { display: flex; flex-direction: column; gap: 22px; position: relative; }
.feature-item { display: flex; gap: 14px; align-items: flex-start; }
.fi-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.fi-title { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.fi-desc { font-size: 12px; color: #ffffffa0; }
.login-bg-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f9fc;
}
.login-card {
  width: 380px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.08);
  border-radius: 12px;
}
.card-title { font-size: 22px; font-weight: 700; color: #1f2329; }
.card-desc { font-size: 13px; color: #86909c; margin-top: 4px; }
.login-options { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.login-tip { text-align: center; font-size: 12px; color: #c0c4cc; margin-top: 16px; }
.divider-text { font-size: 12px; color: #c0c4cc; }
.candidate-entry {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 10px;
  cursor: pointer; transition: all .2s; border: 1px solid #ddd6fe;
}
.candidate-entry:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,58,237,.18); border-color: #c4b5fd; }
.ce-icon {
  width: 40px; height: 40px; border-radius: 10px; background: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
}
.ce-body { flex: 1; }
.ce-title { font-size: 14px; font-weight: 600; color: #4c1d95; }
.ce-desc { font-size: 12px; color: #7c3aed; margin-top: 2px; }
.ce-arrow { color: #7c3aed; font-size: 18px; font-weight: 600; }
@media (max-width: 900px) {
  .login-bg-left { display: none; }
}
</style>
