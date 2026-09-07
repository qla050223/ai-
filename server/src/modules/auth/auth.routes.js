// ==================== Auth 模块 · Routes 层 ====================
// 职责：HTTP 入参解析 + 响应组装，业务逻辑委托 service
import { Router } from 'express'
import { authService } from './auth.service.js'
import { authCandidate } from '../../shared/auth.js'

const router = Router()

// 求职者注册
router.post('/c/auth/register', async (req, res) => {
  const result = await authService.registerCandidate(req.body || {})
  if (result.error) return res.status(result.error.status).json({ msg: result.error.msg })
  res.json({ token: result.token, user: result.user })
})

// 求职者登录
router.post('/c/auth/login', async (req, res) => {
  const result = await authService.loginCandidate(req.body || {})
  if (result.error) return res.status(result.error.status).json({ msg: result.error.msg })
  res.json({ token: result.token, user: result.user })
})

// 求职者当前用户
router.get('/c/auth/me', authCandidate, async (req, res) => {
  const user = await authService.loadCandidate(req.candidateId)
  if (!user) return res.status(404).json({ msg: '用户不存在' })
  res.json({ user })
})

// 企业端登录
router.post('/b/auth/login', async (req, res) => {
  const result = await authService.loginOrg(req.body || {})
  if (result.error) return res.status(result.error.status).json({ msg: result.error.msg })
  res.json({ token: result.token, user: result.user })
})

export default router
