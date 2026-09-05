// ==================== 模拟面试记录路由 ====================
import { Router } from 'express'
import { pool } from '../config/db.js'
import { authCandidate } from '../middleware/auth.js'
import { mapInterview } from '../utils/mappers.js'

const router = Router()

// 我的面试记录列表
router.get('/c/interviews', authCandidate, async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM mock_interviews WHERE candidate_id = ? ORDER BY created_at DESC',
    [req.candidateId]
  )
  res.json({ list: rows.map(mapInterview) })
})

// 新增一条模拟面试记录（练习结束回写）
router.post('/c/interviews', authCandidate, async (req, res) => {
  const b = req.body || {}
  const id = 'mi_' + Date.now()
  const date = b.date || new Date().toISOString().replace('T', ' ').slice(0, 16)
  await pool.execute(
    `INSERT INTO mock_interviews
      (id,candidate_id,type,type_id,position_title,date,duration,overall_score,recommend_level,radar,dimensions_covered,question_count,summary,shortboards)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, req.candidateId, b.type || 'mock', b.typeId || null, b.positionTitle || '模拟面试',
      date, b.duration || 30, b.overallScore || 0, b.recommendLevel || 'pending',
      JSON.stringify(b.radar || {}), JSON.stringify(b.dimensionsCovered || []),
      b.questionCount || 0, b.summary || '', JSON.stringify(b.shortboards || [])
    ]
  )
  const [rows] = await pool.execute('SELECT * FROM mock_interviews WHERE id = ?', [id])
  res.json({ interview: mapInterview(rows[0]) })
})

export default router
