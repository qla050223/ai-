import { defineStore } from 'pinia'
import {
  currentCandidate,
  mockPositions,
  mockInterviews,
  asyncInvitations,
  dataConsents,
  abilityGrowth,
  shortboardDiagnosis
} from '@/mock/candidateData'
import { api } from '@/api/client'

// 求职者登录态 store（独立于企业端 auth）
// 优先走真实后端 API，后端不可用时回退 mock，保证界面不崩
export const useCandidateAuthStore = defineStore('candidateAuth', {
  state: () => ({
    token: localStorage.getItem('c_interview_token') || null,
    user: JSON.parse(localStorage.getItem('c_interview_user') || 'null') || null,
    apiOnline: null // null=未知 true/false
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    displayName: (s) => s.user?.name || '访客',
    defaultResume: (s) => s.user?.resumes?.find(r => r.isDefault) || s.user?.resumes?.[0] || null
  },
  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      this.apiOnline = true
      localStorage.setItem('c_interview_token', token)
      localStorage.setItem('c_interview_user', JSON.stringify(user))
    },
    // 登录：真实 API → 失败回退 mock
    async login({ email, password }) {
      if (!email || !password) return { ok: false, msg: '请输入邮箱和密码' }
      try {
        const data = await api.post('/c/auth/login', { email, password }, { auth: false })
        this.setSession(data.token, data.user)
        return { ok: true }
      } catch (e) {
        // 后端返回 401（账号/密码错误）→ 直接提示，不回退
        if (e.status === 401 || e.status === 400) return { ok: false, msg: e.message }
        // 后端未启动 / 网络错误 → mock 兜底（演示模式）
        this.token = 'c_mock_jwt_' + Date.now()
        this.user = { ...currentCandidate, email }
        this.apiOnline = false
        localStorage.setItem('c_interview_token', this.token)
        localStorage.setItem('c_interview_user', JSON.stringify(this.user))
        return { ok: true, offline: true }
      }
    },
    // 注册
    async register({ email, password, name }) {
      if (!email || !password || !name) return { ok: false, msg: '请填写完整信息' }
      try {
        const data = await api.post('/c/auth/register', { email, password, name }, { auth: false })
        this.setSession(data.token, data.user)
        return { ok: true }
      } catch (e) {
        if (e.status === 409 || e.status === 400) return { ok: false, msg: e.message }
        this.token = 'c_mock_jwt_' + Date.now()
        this.user = {
          ...currentCandidate,
          id: 'ca_' + Date.now(),
          name, email,
          registeredAt: new Date().toISOString().slice(0, 10),
          resumes: []
        }
        this.apiOnline = false
        localStorage.setItem('c_interview_token', this.token)
        localStorage.setItem('c_interview_user', JSON.stringify(this.user))
        return { ok: true, offline: true }
      }
    },
    // 刷新当前用户信息（含简历）
    async hydrateMe() {
      if (!this.token) return
      try {
        const data = await api.get('/c/auth/me')
        this.user = data.user
        this.apiOnline = true
        localStorage.setItem('c_interview_user', JSON.stringify(this.user))
      } catch (e) {
        if (e.status === 401) { this.logout(); return }
        this.apiOnline = false
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.apiOnline = null
      localStorage.removeItem('c_interview_token')
      localStorage.removeItem('c_interview_user')
    },
    updateUser(data) {
      this.user = { ...this.user, ...data }
      localStorage.setItem('c_interview_user', JSON.stringify(this.user))
    }
  }
})

// 异步面试 Token 校验 store（免登录）
export const useAsyncInterviewStore = defineStore('asyncInterview', {
  state: () => ({
    token: null,
    invitation: null,
    status: 'idle' // idle / verified / expired / used / device_mismatch
  }),
  getters: {
    isVerified: (s) => s.status === 'verified'
  },
  actions: {
    verifyToken(token) {
      const inv = asyncInvitations.find(i => i.token === token)
      if (!inv) {
        this.status = 'expired'
        return { ok: false, msg: 'Token 无效或已过期' }
      }
      this.token = token
      this.invitation = inv
      this.status = 'verified'
      return { ok: true }
    },
    start() {
      if (this.invitation) this.invitation.status = 'in_progress'
    },
    finish() {
      if (this.invitation) this.invitation.status = 'completed'
    },
    reset() {
      this.token = null
      this.invitation = null
      this.status = 'idle'
    }
  }
})

// 求职者端数据 store（岗位题库、模拟练习、能力档案、授权）
// 初始为 mock 数据；hydrate() 拉取后端真实数据覆盖
export const useCandidateDataStore = defineStore('candidateData', {
  state: () => ({
    positions: [...mockPositions],
    interviews: [...mockInterviews],
    consents: [...dataConsents],
    growth: abilityGrowth,
    diagnosis: shortboardDiagnosis,
    hydrated: false,
    apiOnline: null
  }),
  getters: {
    getPositionById: (s) => (id) => s.positions.find(p => p.id === id),
    mockInterviews: (s) => s.interviews.filter(i => i.type === 'mock'),
    interviewById: (s) => (id) => s.interviews.find(i => i.id === id),
    latestScore: (s) => s.interviews[0]?.overallScore || 0,
    bestScore: (s) => s.interviews.length ? Math.max(...s.interviews.map(i => i.overallScore)) : 0,
    avgScore: (s) => s.interviews.length ? Math.round(s.interviews.reduce((sum, i) => sum + i.overallScore, 0) / s.interviews.length) : 0
  },
  actions: {
    // 从后端同步岗位 + 面试记录
    async hydrate() {
      if (this.hydrated) return
      const auth = useCandidateAuthStore()
      if (!auth.isLoggedIn) return
      try {
        const [posRes, ivRes] = await Promise.all([
          api.get('/c/positions', { auth: false }),
          api.get('/c/interviews')
        ])
        if (posRes.list?.length) this.positions = posRes.list
        if (ivRes.list) this.interviews = ivRes.list
        this.apiOnline = true
      } catch (e) {
        this.apiOnline = false
      } finally {
        this.hydrated = true
      }
    },
    // 新增模拟面试记录
    // persist=false：仅本地占位（配置页创建草稿，不写库）
    // persist=true：交卷时持久化到后端
    async addMockInterview(data, { persist = true } = {}) {
      const id = data.id || 'mi_' + Date.now()
      const iv = {
        id,
        type: 'mock',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        recommendLevel: 'recommended',
        ...data
      }
      // 始终先落本地，保证会话内 id 一致、UI 立即可用
      this.interviews.unshift(iv)
      if (persist) {
        // 交卷持久化：失败静默（本地已有数据，不影响使用）
        try {
          const { id: _omit, ...payload } = data
          await api.post('/c/interviews', payload)
        } catch { /* 离线兜底 */ }
      }
      return iv
    },
    revokeConsent(id) {
      const c = this.consents.find(c => c.id === id)
      if (c) {
        c.status = 'revoked'
        c.revokedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
      }
    },
    addResume(name) {
      // 通过 auth store 更新，这里仅占位
    },
    deleteAccount() {
      this.interviews = []
      this.consents = []
    }
  }
})
