import { defineStore } from 'pinia'
import { currentUser, organization } from '@/mock/data'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('ai_interview_token') || null,
    user: JSON.parse(localStorage.getItem('ai_interview_user') || 'null') || null,
    organization: organization
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    displayName: (s) => s.user?.name || '访客',
    roleText: (s) => s.user?.roleText || ''
  },
  actions: {
    login({ email, password }) {
      // 模拟登录：任意企业邮箱 + 密码即可
      if (!email || !password) return { ok: false, msg: '请输入邮箱和密码' }
      if (!email.endsWith('@yuntu.com')) return { ok: false, msg: '仅支持企业邮箱登录' }
      this.token = 'mock_jwt_' + Date.now()
      this.user = { ...currentUser, email }
      localStorage.setItem('ai_interview_token', this.token)
      localStorage.setItem('ai_interview_user', JSON.stringify(this.user))
      return { ok: true }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('ai_interview_token')
      localStorage.removeItem('ai_interview_user')
    }
  }
})
