// ==================== Resume 模块 · Routes 层 ====================
import { Router } from 'express'
import { resumeService } from './resume.service.js'
import { authCandidate } from '../../shared/auth.js'
import { uploadMiddleware } from '../../shared/upload.js'

const router = Router()

// 我的简历列表
router.get('/c/resumes', authCandidate, async (req, res) => {
  const list = await resumeService.listResumes(req.candidateId)
  res.json({ list })
})

// 上传简历
router.post('/c/resumes/upload', authCandidate, uploadMiddleware, async (req, res) => {
  const result = await resumeService.uploadResume(req.candidateId, req.file)
  if (result.error) return res.status(result.error.status).json({ msg: result.error.msg })
  res.json(result)
})

// 简历测评
router.post('/c/resumes/:id/assess', authCandidate, async (req, res) => {
  const result = await resumeService.assessResume(req.candidateId, req.params.id, req.body?.position)
  if (result.error) return res.status(result.error.status).json({ msg: result.error.msg })
  res.json(result)
})

// AI 改简历
router.post('/c/resumes/:id/optimize', authCandidate, async (req, res) => {
  const result = await resumeService.optimizeResume(req.candidateId, req.params.id)
  if (result.error) return res.status(result.error.status).json({ msg: result.error.msg })
  res.json(result)
})

export default router
