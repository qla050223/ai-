// ==================== Auth 模块 · Service 层 ====================
// 职责：业务逻辑编排（校验、密码加密、token 签发），调用 repository
import bcrypt from 'bcryptjs'
import { authRepository } from './auth.repository.js'
import { signToken } from '../../shared/auth.js'
import { mapCandidate, mapOrgUser } from '../../shared/mappers.js'

export const authService = {
  // 求职者注册
  async registerCandidate({ email, password, name }) {
    if (!email || !password || !name) {
      return { error: { status: 400, msg: '请填写完整信息' } }
    }
    const exist = await authRepository.findCandidateByEmail(email)
    if (exist) {
      return { error: { status: 409, msg: '该邮箱已注册' } }
    }
    const id = 'ca_' + Date.now()
    const passwordHash = await bcrypt.hash(password, 10)
    await authRepository.insertCandidate({
      id, name, email, passwordHash,
      registeredAt: new Date().toISOString().slice(0, 10)
    })
    const user = await this.loadCandidate(id)
    const token = signToken({ sub: id, type: 'candidate' })
    return { token, user }
  },

  // 求职者登录
  async loginCandidate({ email, password }) {
    if (!email || !password) {
      return { error: { status: 400, msg: '请输入邮箱和密码' } }
    }
    const row = await authRepository.findCandidateByEmail(email)
    if (!row) {
      return { error: { status: 401, msg: '邮箱或密码错误（演示账号 luxinghe@email.com / demo1234）' } }
    }
    const ok = await bcrypt.compare(password, row.password_hash)
    if (!ok) {
      return { error: { status: 401, msg: '邮箱或密码错误' } }
    }
    const user = await this.loadCandidate(row.id)
    const token = signToken({ sub: row.id, type: 'candidate' })
    return { token, user }
  },

  // 加载求职者完整信息（含简历）
  async loadCandidate(id) {
    const row = await authRepository.findCandidateById(id)
    if (!row) return null
    const resumes = await authRepository.findResumesByCandidateId(id)
    return mapCandidate(row, resumes)
  },

  // 企业用户登录
  async loginOrg({ email, password }) {
    if (!email || !password) {
      return { error: { status: 400, msg: '请输入邮箱和密码' } }
    }
    const row = await authRepository.findOrgUserByEmail(email)
    if (!row) {
      return { error: { status: 401, msg: '企业账号不存在（演示 linshuhao@yuntu.com / demo1234）' } }
    }
    const ok = await bcrypt.compare(password, row.password_hash)
    if (!ok) {
      return { error: { status: 401, msg: '邮箱或密码错误' } }
    }
    const user = mapOrgUser(row)
    const token = signToken({ sub: row.id, type: 'org' })
    return { token, user }
  }
}
