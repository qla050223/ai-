// ==================== Position 模块 · Routes 层 ====================
import { Router } from 'express'
import { positionService } from './position.service.js'

const router = Router()

// 岗位列表（公开可读）
router.get('/c/positions', async (req, res) => {
  const list = await positionService.listPositions()
  res.json({ list })
})

export default router
