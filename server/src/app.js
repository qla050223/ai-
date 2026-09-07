// ==================== Express 应用 ====================
import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes.js'
import positionRoutes from './modules/position/position.routes.js'
import interviewRoutes from './modules/interview/interview.routes.js'
import resumeRoutes from './modules/resume/resume.routes.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

// 健康检查
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }))

// 业务路由（统一 /api 前缀）
app.use('/api', authRoutes)
app.use('/api', positionRoutes)
app.use('/api', interviewRoutes)
app.use('/api', resumeRoutes)

// 兜底错误处理
app.use((err, req, res, next) => {
  console.error('❌ 服务异常：', err.message)
  res.status(500).json({ msg: '服务器异常：' + err.message })
})

export default app
