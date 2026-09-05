// ==================== 鉴权路由 ====================
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../config/db.js'
import { signToken, authCandidate } from '../middleware/auth.js'
import { mapCandidate, mapOrgUser } from '../utils/mappers.js'

const router = Router()

// 加载求职者完整信息（含简历）
async function loadCandidate(id) {
  const [rows] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id])
  if (!rows.length) return null
  const [resumes] = await pool.execute('SELECT * FROM resumes WHERE candidate_id = ? ORDER BY is_default DESC, uploaded_at DESC', [id])
  return mapCandidate(rows[0], resumes)
}

// ---------- 求职者注册 ----------
router.post('/c/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {}
  if (!email || !password || !name) return res.status(400).json({ msg: '请填写完整信息' })
  const [exist] = await pool.execute('SELECT id FROM candidates WHERE email = ?', [email])
  if (exist.length) return res.status(409).json({ msg: '该邮箱已注册' })
  const id = 'ca_' + Date.now()
  const hash = await bcrypt.hash(password, 10)
  await pool.execute(
    'INSERT INTO candidates (id,name,email,password_hash,registered_at,intention) VALUES (?,?,?,?,?,?)',
    [id, name, email, hash, new Date().toISOString().slice(0, 10), JSON.stringify({})]
  )
  const user = await loadCandidate(id)
  const token = signToken({ sub: id, type: 'candidate' })
  res.json({ token, user })
})

// ---------- 求职者登录 ----------
router.post('/c/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ msg: '请输入邮箱和密码' })
  const [rows] = await pool.execute('SELECT * FROM candidates WHERE email = ?', [email])
  if (!rows.length) return res.status(401).json({ msg: '邮箱或密码错误（演示账号 luxinghe@email.com / demo1234）' })
  const ok = await bcrypt.compare(password, rows[0].password_hash)
  if (!ok) return res.status(401).json({ msg: '邮箱或密码错误' })
  const user = await loadCandidate(rows[0].id)
  const token = signToken({ sub: rows[0].id, type: 'candidate' })
  res.json({ token, user })
})

// ---------- 求职者当前用户 ----------
router.get('/c/auth/me', authCandidate, async (req, res) => {
  const user = await loadCandidate(req.candidateId)
  if (!user) return res.status(404).json({ msg: '用户不存在' })
  res.json({ user })
})

// ---------- 企业端登录 ----------
router.post('/b/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ msg: '请输入邮箱和密码' })
  const [rows] = await pool.execute('SELECT * FROM org_users WHERE email = ?', [email])
  if (!rows.length) return res.status(401).json({ msg: '企业账号不存在（演示 linshuhao@yuntu.com / demo1234）' })
  const ok = await bcrypt.compare(password, rows[0].password_hash)
  if (!ok) return res.status(401).json({ msg: '邮箱或密码错误' })
  const user = mapOrgUser(rows[0])
  const token = signToken({ sub: rows[0].id, type: 'org' })
  res.json({ token, user })
})

export default router
