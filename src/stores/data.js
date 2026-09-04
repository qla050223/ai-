import { defineStore } from 'pinia'
import {
  positions as mockPositions,
  candidates as mockCandidates,
  interviews as mockInterviews,
  questionBank as mockQuestionBank,
  reports as mockReports,
  members as mockMembers
} from '@/mock/data'

// 岗位 store
export const usePositionStore = defineStore('position', {
  state: () => ({ list: [...mockPositions] }),
  getters: {
    getById: (s) => (id) => s.list.find(p => p.id === id),
    activeCount: (s) => s.list.filter(p => p.status === 'open').length
  },
  actions: {
    create(data) {
      const id = 'p_' + String(Date.now()).slice(-6)
      const pos = { id, status: 'open', createdAt: new Date().toISOString().slice(0, 10), ...data }
      this.list.unshift(pos)
      return pos
    },
    update(id, data) {
      const idx = this.list.findIndex(p => p.id === id)
      if (idx > -1) this.list[idx] = { ...this.list[idx], ...data }
    },
    remove(id) {
      this.list = this.list.filter(p => p.id !== id)
    }
  }
})

// 候选人 store
export const useCandidateStore = defineStore('candidate', {
  state: () => ({ list: [...mockCandidates] }),
  getters: {
    getById: (s) => (id) => s.list.find(c => c.id === id),
    byPosition: (s) => (pid) => s.list.filter(c => c.appliedPositionId === pid),
    byStatus: (s) => (status) => s.list.filter(c => c.status === status)
  },
  actions: {
    create(data) {
      const id = 'c_' + String(Date.now()).slice(-6)
      const cand = { id, status: 'pending', stage: '待面试', createdAt: new Date().toISOString().slice(0, 10), ...data }
      this.list.unshift(cand)
      return cand
    },
    updateStatus(id, status, stage) {
      const c = this.list.find(c => c.id === id)
      if (c) {
        c.status = status
        if (stage) c.stage = stage
      }
    }
  }
})

// 面试 store
export const useInterviewStore = defineStore('interview', {
  state: () => ({ list: [...mockInterviews] }),
  getters: {
    getById: (s) => (id) => s.list.find(i => i.id === id),
    byCandidate: (s) => (cid) => s.list.filter(i => i.candidateId === cid),
    active: (s) => s.list.filter(i => i.status === 'in_progress' || i.status === 'not_started')
  },
  actions: {
    create(data) {
      const id = 'i_' + String(Date.now()).slice(-6)
      const iv = {
        id,
        status: 'not_started',
        statusText: '未开始',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        completedAt: null,
        messages: [],
        ...data
      }
      this.list.unshift(iv)
      return iv
    },
    updateStatus(id, status, statusText) {
      const iv = this.list.find(i => i.id === id)
      if (iv) {
        iv.status = status
        if (statusText) iv.statusText = statusText
      }
    },
    appendMessage(id, msg) {
      const iv = this.list.find(i => i.id === id)
      if (iv) {
        if (!iv.messages) iv.messages = []
        iv.messages.push({ ts: Date.now(), ...msg })
      }
    }
  }
})

// 题库 store
export const useQuestionStore = defineStore('question', {
  state: () => ({ banks: [...mockQuestionBank] }),
  getters: {
    allQuestions: (s) => s.banks.flatMap(b => b.questions.map(q => ({ ...q, bankId: b.id, positionTitle: b.positionTitle }))),
    byId: (s) => (qid) => s.banks.flatMap(b => b.questions).find(q => q.id === qid),
    byPosition: (s) => (pid) => s.banks.find(b => b.positionId === pid)
  },
  actions: {
    generateForPosition(positionId, positionTitle) {
      // 模拟 AI 生成题库
      const id = 'qb_' + String(Date.now()).slice(-6)
      const bank = {
        id,
        positionId,
        positionTitle,
        source: 'auto',
        createdAt: new Date().toISOString().slice(0, 10),
        questions: this._mockQuestions()
      }
      this.banks.unshift(bank)
      return bank
    },
    _mockQuestions() {
      const dims = ['专业技能', '项目经验', '逻辑思维', '沟通表达', '文化匹配']
      return dims.slice(0, 4).map((d, i) => ({
        id: 'q_g_' + Date.now() + '_' + i,
        dimension: d,
        skill: ['核心技术', '项目复盘', '场景设计', '行为问答'][i],
        type: ['开放题', '项目题', '场景题', '行为题'][i],
        difficulty: ['中等', '困难', '中等', '简单'][i],
        content: `基于${d}维度的考察问题示例：请结合你的实际经历，阐述对该维度的理解与应用。`,
        referencePoints: ['结构清晰', '有具体案例', '量化结果', '复盘改进'],
        scoreStandard: {
          excellent: '结构完整、有量化、能复盘',
          qualified: '能清晰描述',
          unqualified: '描述散乱'
        },
        followUps: ['能举一个反例吗？', '如果重来你会怎么改进？'],
        usageCount: 0,
        avgScore: 0
      }))
    }
  }
})

// 报告 store
export const useReportStore = defineStore('report', {
  state: () => ({ list: [...mockReports] }),
  getters: {
    getById: (s) => (id) => s.list.find(r => r.id === id),
    byCandidate: (s) => (cid) => s.list.filter(r => r.candidateId === cid)
  }
})

// 成员 store
export const useMemberStore = defineStore('member', {
  state: () => ({ list: [...mockMembers] }),
  actions: {
    invite(email, role) {
      const id = 'u_' + String(Date.now()).slice(-6)
      this.list.push({
        id,
        name: email.split('@')[0],
        email,
        role: role || 'member',
        roleText: { hr_admin: 'HR 管理员', interviewer: '面试官', hiring_manager: '用人经理', member: '普通成员' }[role || 'member'],
        status: 'active',
        joinedAt: new Date().toISOString().slice(0, 10)
      })
    },
    remove(id) {
      this.list = this.list.filter(m => m.id !== id)
    }
  }
})
