<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateAuthStore } from '@/stores/candidate'

const router = useRouter()
const auth = useCandidateAuthStore()

const form = reactive({ name: '', email: '', password: '' })
const agreed = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  errorMsg.value = ''
  if (!agreed.value) {
    errorMsg.value = '请先阅读并同意隐私协议与数据授权说明'
    return
  }
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  const res = auth.register(form)
  loading.value = false
  if (res.ok) {
    router.push('/c/mock')
  } else {
    errorMsg.value = res.msg
  }
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
          <div class="c-auth-sub">候选人端</div>
        </div>
      </div>

      <h2 class="c-auth-h2">创建账号 ✨</h2>
      <p class="c-auth-desc">注册即可获得 AI 模拟面试能力，免费体验岗位练习与成长追踪。</p>

      <form class="c-auth-form" @submit.prevent="handleRegister">
        <label class="c-field">
          <span class="c-field-label">姓名 / 昵称</span>
          <input v-model="form.name" type="text" placeholder="你的称呼" class="c-input" required />
        </label>
        <label class="c-field">
          <span class="c-field-label">邮箱</span>
          <input v-model="form.email" type="email" placeholder="you@example.com" class="c-input" required />
        </label>
        <label class="c-field">
          <span class="c-field-label">设置密码</span>
          <input v-model="form.password" type="password" placeholder="至少 6 位" class="c-input" required minlength="6" />
        </label>
        <label class="c-consent">
          <input v-model="agreed" type="checkbox" />
          <span>我已阅读并同意 <a href="#">《求职者隐私协议》</a> 与 <a href="#">《AI 面试数据授权说明》</a></span>
        </label>
        <div v-if="errorMsg" class="c-error">{{ errorMsg }}</div>
        <button type="submit" class="c-submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册并开始练习' }}
        </button>
      </form>

      <div class="c-auth-foot">
        已有账号？<router-link to="/c/login" class="c-link">直接登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  position: relative; overflow: hidden;
}
.c-auth-bg { position: absolute; inset: 0; pointer-events: none; }
.c-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .5; }
.blob-1 { width: 400px; height: 400px; background: #a78bfa; top: -100px; right: -100px; }
.blob-2 { width: 500px; height: 500px; background: #f0abfc; bottom: -150px; left: -150px; }
.c-auth-card {
  width: 440px; max-width: 92vw; background: #fff; border-radius: 20px; padding: 40px;
  box-shadow: 0 20px 60px rgba(80,50,150,.18); position: relative; z-index: 1;
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
.c-consent { display: flex; gap: 8px; align-items: flex-start; font-size: 12px; color: #6b7280; line-height: 1.5; }
.c-consent input { margin-top: 2px; }
.c-consent a { color: #6d28d9; text-decoration: none; }
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
.c-link { color: #6d28d9; font-weight: 600; text-decoration: none; }
.c-link:hover { text-decoration: underline; }
</style>
