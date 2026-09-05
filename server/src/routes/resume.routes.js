// ==================== 简历路由 ====================
import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pool } from '../config/db.js'
import { authCandidate } from '../middleware/auth.js'
import { mapResume } from '../utils/mappers.js'
import { assessResume } from '../services/assess.js'
import { optimizeResume } from '../services/resumeOptimize.js'
import { extractText, parseResumeText } from '../services/resumeParser.js'

const router = Router()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// 允许的简历类型
const ALLOWED_EXT = ['.pdf', '.docx', '.txt', '.md']

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    // 中文名用 candidateId + 时间戳避免编码问题，扩展名保留
    cb(null, `${req.candidateId || 'guest'}_${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_EXT.includes(ext)) return cb(null, true)
    cb(new Error('仅支持 PDF / Word(.docx) / TXT / Markdown 格式的简历文件'))
  }
})

// multer 错误统一转可读响应
function uploadMiddleware(req, res, next) {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? '文件过大，请上传 10MB 以内的简历'
        : err.message || '文件上传失败'
      return res.status(400).json({ msg })
    }
    next()
  })
}

// 我的简历列表
router.get('/c/resumes', authCandidate, async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM resumes WHERE candidate_id = ? ORDER BY is_default DESC, uploaded_at DESC',
    [req.candidateId]
  )
  res.json({ list: rows.map(mapResume) })
})

// 上传简历文件 → 提取文本 → 解析 → 落库
router.post('/c/resumes/upload', authCandidate, uploadMiddleware, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: '未收到文件：字段名应为 resume，且必须为 multipart/form-data 上传' })
  }
  try {
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf-8')
    let text = ''
    let parseWarning = ''
    try {
      text = await extractText(req.file.path, originalName)
    } catch (e) {
      parseWarning = '文件已上传，但文本解析失败（可能是扫描版 PDF），已按文件名建档'
    }
    const parsed = parseResumeText(text)
    const relPath = path.relative(path.join(__dirname, '..', '..'), req.file.path).replace(/\\/g, '/')

    const id = 'rs_' + Date.now()
    // 简历名：去掉扩展名的原文件名
    const baseName = path.basename(originalName, path.extname(originalName)) || '上传的简历'
    // 上传的新简历默认置为默认简历
    await pool.execute('UPDATE resumes SET is_default = 0 WHERE candidate_id = ?', [req.candidateId])
    await pool.execute(
      `INSERT INTO resumes (id,candidate_id,name,uploaded_at,is_default,education,work_years,last_company,skills,projects,file_name,file_path,raw_text)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, req.candidateId, baseName, new Date().toISOString().slice(0, 10), 1,
        parsed.education || null, parsed.workYears || 0, parsed.lastCompany || null,
        JSON.stringify(parsed.skills), JSON.stringify(parsed.projects),
        originalName, relPath, text.slice(0, 60000) || null
      ]
    )
    const [rows] = await pool.execute('SELECT * FROM resumes WHERE id = ?', [id])
    res.json({
      resume: mapResume(rows[0]),
      extracted: {
        textLength: text.length,
        skills: parsed.skills,
        workYears: parsed.workYears,
        education: parsed.education,
        warning: parseWarning
      }
    })
  } catch (err) {
    console.error('上传处理失败：', err)
    res.status(500).json({ msg: '简历处理失败：' + err.message })
  }
})

// 简历测评：对指定简历做 6 维评分
router.post('/c/resumes/:id/assess', authCandidate, async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM resumes WHERE id = ? AND candidate_id = ?',
    [req.params.id, req.candidateId]
  )
  if (!rows.length) return res.status(404).json({ msg: '简历不存在' })
  const resume = mapResume(rows[0])
  await new Promise(r => setTimeout(r, 1200))
  const result = assessResume(resume)
  res.json({ result })
})

// AI 改简历：对指定简历生成分段优化建议
router.post('/c/resumes/:id/optimize', authCandidate, async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM resumes WHERE id = ? AND candidate_id = ?',
    [req.params.id, req.candidateId]
  )
  if (!rows.length) return res.status(404).json({ msg: '简历不存在' })
  const resume = mapResume(rows[0])
  const [canRows] = await pool.execute('SELECT name, phone, email, intention FROM candidates WHERE id = ?', [req.candidateId])
  let intention = {}
  const raw = canRows[0]?.intention
  if (raw) intention = typeof raw === 'string' ? JSON.parse(raw) : raw
  const ctx = {
    name: canRows[0]?.name,
    phone: canRows[0]?.phone,
    email: canRows[0]?.email,
    position: intention.position,
    workYears: intention.workYears
  }
  await new Promise(r => setTimeout(r, 1200))
  const { sections, fullResume } = optimizeResume(resume, ctx)
  res.json({ sections, fullResume })
})

export default router
