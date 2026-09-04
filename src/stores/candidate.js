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

// 求职者登录态 store（独立于企业端 auth）
export const useCandidateAuthStore = defineStore('candidateAuth', {
  state: () => ({
    token: localStorage.getItem('c_interview_token') || null,
    user: JSON.parse(localStorage.getItem('c_interview_user') || 'null') || null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    displayName: (s) => s.user?.name || '访客',
    defaultResume: (s) => s.user?.resumes?.find(r => r.isDefault) || s.user?.resumes?.[0] || null
  },
  actions: {
    login({ email, password }) {
      if (!email || !password) return { ok: false, msg: '请输入邮箱和密码' }
      this.token = 'c_mock_jwt_' + Date.now()
      this.user = { ...currentCandidate, email }
      localStorage.setItem('c_interview_token', this.token)
      localStorage.setItem('c_interview_user', JSON.stringify(this.user))
      return { ok: true }
    },
    register({ email, password, name }) {
      if (!email || !password || !name) return { ok: false, msg: '请填写完整信息' }
      this.token = 'c_mock_jwt_' + Date.now()
      this.user = {
        ...currentCandidate,
        id: 'ca_' + Date.now(),
        name,
        email,
        registeredAt: new Date().toISOString().slice(0, 10),
        resumes: []
      }
      localStorage.setItem('c_interview_token', this.token)
      localStorage.setItem('c_interview_user', JSON.stringify(this.user))
      return { ok: true }
    },
    logout() {
      this.token = null
      this.user = null
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
      // 模拟：检测状态
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
export const useCandidateDataStore = defineStore('candidateData', {
  state: () => ({
    positions: [...mockPositions],
    interviews: [...mockInterviews],
    consents: [...dataConsents],
    growth: abilityGrowth,
    diagnosis: shortboardDiagnosis
  }),
  getters: {
    getPositionById: (s) => (id) => s.positions.find(p => p.id === id),
    mockInterviews: (s) => s.interviews.filter(i => i.type === 'mock'),
    interviewById: (s) => (id) => s.interviews.find(i => i.id === id),
    latestScore: (s) => s.interviews[0]?.overallScore || 0,
    bestScore: (s) => Math.max(...s.interviews.map(i => i.overallScore)),
    avgScore: (s) => Math.round(s.interviews.reduce((sum, i) => sum + i.overallScore, 0) / s.interviews.length)
  },
  actions: {
    addMockInterview(data) {
      const id = 'mi_' + Date.now()
      const iv = {
        id,
        type: 'mock',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        recommendLevel: 'recommended',
        ...data
      }
      this.interviews.unshift(iv)
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
