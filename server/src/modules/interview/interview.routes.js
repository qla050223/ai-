// ==================== Interview 模块 · Routes 层 ====================
import { Router } from 'express'
import { interviewService } from './interview.service.js'
import { authCandidate } from '../../shared/auth.js'

const router = Router()

// 我的面试记录列表
router.get('/c/interviews', authCandidate, async (req, res) => {
  const list = await interviewService.listInterviews(req.candidateId)
  res.json({ list })
})

// 新增一条模拟面试记录
router.post('/c/interviews', authCandidate, async (req, res) => {
  const interview = await interviewService.createInterview(req.candidateId, req.body)
  res.json({ interview })
})

export default router
