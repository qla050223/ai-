// ==================== 岗位题库路由 ====================
import { Router } from 'express'
import { pool } from '../config/db.js'
import { mapPosition } from '../utils/mappers.js'

const router = Router()

// 岗位列表（求职者端练习用，公开可读）
router.get('/c/positions', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM positions ORDER BY hot DESC, practice_count DESC')
  res.json({ list: rows.map(mapPosition) })
})

export default router
