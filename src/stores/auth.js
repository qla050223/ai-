import { defineStore } from 'pinia'
import { currentUser, organization } from '@/mock/data'
import { api } from '@/api/client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('ai_interview_token') || null,
    user: JSON.parse(localStorage.getItem('ai_interview_user') || 'null') || null,
    organization: organization,
    apiOnline: null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    displayName: (s) => s.user?.name || '访客',
    roleText: (s) => s.user?.roleText || ''
  },
  actions: {
    // 企业登录：真实 API → 失败回退 mock（需企业邮箱）
    async login({ email, password }) {
      if (!email || !password) return { ok: false, msg: '请输入邮箱和密码' }
      if (!email.endsWith('@yuntu.com')) return { ok: false, msg: '仅支持企业邮箱登录' }
      try {
        const data = await api.post('/b/auth/login', { email, password }, { auth: false, portal: 'org' })
        this.token = data.token
        this.user = data.user
        this.apiOnline = true
        localStorage.setItem('ai_interview_token', this.token)
        localStorage.setItem('ai_interview_user', JSON.stringify(this.user))
        return { ok: true }
      } catch (e) {
        if (e.status === 401 || e.status === 400) return { ok: false, msg: e.message }
        // 后端未启动 → mock 兜底
        this.token = 'mock_jwt_' + Date.now()
        this.user = { ...currentUser, email }
        this.apiOnline = false
        localStorage.setItem('ai_interview_token', this.token)
        localStorage.setItem('ai_interview_user', JSON.stringify(this.user))
        return { ok: true, offline: true }
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.apiOnline = null
      localStorage.removeItem('ai_interview_token')
      localStorage.removeItem('ai_interview_user')
    }
  }
})
