<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCandidateAuthStore } from '@/stores/candidate'

const router = useRouter()
const route = useRoute()
const auth = useCandidateAuthStore()

const form = reactive({ email: 'luxinghe@email.com', password: 'demo1234' })
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  await new Promise(r => setTimeout(r, 600))
  const res = auth.login(form)
  loading.value = false
  if (res.ok) {
    const redirect = route.query.redirect || '/c/mock'
    router.push(redirect)
  } else {
    errorMsg.value = res.msg
  }
}

function goRegister() {
  router.push('/c/register')
}
function goEnterprise() {
  router.push('/login')
}
</script>

<template>
  <div class="c-auth-page">
    <div class="c-auth-bg">
      <div class="c-blob blob-1"></div>
      <div class="c-blob blob-2"></div>
    </div>
    <div class="c-auth-card">
      <div class="c-auth-brand">
        <div class="c-auth-mark">AI</div>
        <div>
          <div class="c-auth-title">AI 面试助手</div>
          <div class="c-auth-sub">候选人端 · 随时随地，练出 offer</div>
        </div>
      </div>

      <h2 class="c-auth-h2">欢迎回来 👋</h2>
      <p class="c-auth-desc">登录后即可发起 AI 模拟面试，沉淀能力档案，追踪成长曲线。</p>

      <form class="c-auth-form" @submit.prevent="handleLogin">
        <label class="c-field">
          <span class="c-field-label">邮箱</span>
          <input v-model="form.email" type="email" placeholder="you@example.com" class="c-input" required />
        </label>
        <label class="c-field">
          <span class="c-field-label">密码</span>
          <input v-model="form.password" type="password" placeholder="请输入密码" class="c-input" required />
        </label>
        <div v-if="errorMsg" class="c-error">{{ errorMsg }}</div>
        <button type="submit" class="c-submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="c-auth-foot">
        还没有账号？<button class="c-link" @click="goRegister">立即注册</button>
      </div>

      <div class="c-auth-divider"><span>身份切换</span></div>
      <div class="c-auth-switch" @click="goEnterprise">
        <span class="es-icon">🏢</span>
        <div class="es-body">
          <div class="es-title">我是企业 HR</div>
          <div class="es-desc">进入企业端管理后台</div>
        </div>
        <span class="es-arrow">→</span>
      </div>

      <div class="c-auth-demo">
        <div class="c-auth-demo-title">演示账号</div>
        <div class="c-auth-demo-row"><span>邮箱</span><code>luxinghe@email.com</code></div>
        <div class="c-auth-demo-row"><span>密码</span><code>任意</code></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  position: relative;
  overflow: hidden;
}
.c-auth-bg { position: absolute; inset: 0; pointer-events: none; }
.c-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .5; }
.blob-1 { width: 400px; height: 400px; background: #a78bfa; top: -100px; right: -100px; }
.blob-2 { width: 500px; height: 500px; background: #f0abfc; bottom: -150px; left: -150px; }
.c-auth-card {
  width: 440px;
  max-width: 92vw;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(80,50,150,.18);
  position: relative;
  z-index: 1;
}
.c-auth-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.c-auth-mark {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  color: #fff; font-weight: 700; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
}
.c-auth-title { font-size: 18px; font-weight: 700; color: #1f2937; }
.c-auth-sub { font-size: 12px; color: #9ca3af; }
.c-auth-h2 { font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
.c-auth-desc { font-size: 13px; color: #6b7280; margin-bottom: 24px; line-height: 1.6; }
.c-auth-form { display: flex; flex-direction: column; gap: 16px; }
.c-field { display: flex; flex-direction: column; gap: 6px; }
.c-field-label { font-size: 13px; color: #374151; font-weight: 500; }
.c-input {
  height: 44px; padding: 0 14px; border: 1px solid #e5e7eb; border-radius: 10px;
  font-size: 14px; outline: none; transition: all .2s; background: #fafafa;
}
.c-input:focus { border-color: #6d28d9; background: #fff; box-shadow: 0 0 0 3px rgba(109,40,217,.1); }
.c-error { color: #ef4444; font-size: 13px; background: #fef2f2; padding: 8px 12px; border-radius: 8px; }
.c-submit {
  height: 46px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all .2s; margin-top: 4px;
}
.c-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(109,40,217,.4); }
.c-submit:disabled { opacity: .6; cursor: not-allowed; }
.c-auth-foot { text-align: center; margin-top: 20px; font-size: 13px; color: #6b7280; }
.c-link { background: none; border: none; color: #6d28d9; font-weight: 600; cursor: pointer; font-size: 13px; }
.c-link:hover { text-decoration: underline; }
.c-auth-divider { text-align: center; margin: 16px 0 12px; position: relative; }
.c-auth-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e5e7eb; }
.c-auth-divider span { position: relative; background: #fff; padding: 0 12px; font-size: 11px; color: #9ca3af; }
.c-auth-switch {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 10px;
  cursor: pointer; transition: all .2s; border: 1px solid #bfdbfe;
}
.c-auth-switch:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,.15); border-color: #93c5fd; }
.es-icon {
  width: 36px; height: 36px; border-radius: 10px; background: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
}
.es-body { flex: 1; }
.es-title { font-size: 13px; font-weight: 600; color: #1e40af; }
.es-desc { font-size: 11px; color: #2563eb; margin-top: 1px; }
.es-arrow { color: #2563eb; font-size: 16px; font-weight: 600; }
.c-auth-demo {
  margin-top: 28px; padding: 16px; background: #f9fafb; border-radius: 12px;
  border: 1px dashed #e5e7eb;
}
.c-auth-demo-title { font-size: 12px; color: #9ca3af; margin-bottom: 8px; font-weight: 600; }
.c-auth-demo-row { display: flex; justify-content: space-between; font-size: 12px; color: #4b5563; padding: 3px 0; }
.c-auth-demo-row code { font-family: 'SF Mono', Consolas, monospace; color: #6d28d9; }
</style>
