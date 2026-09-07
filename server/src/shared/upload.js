// ==================== 文件上传中间件（共享） ====================
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

export const ALLOWED_EXT = ['.pdf', '.docx', '.txt', '.md']

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${req.candidateId || 'guest'}_${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_EXT.includes(ext)) return cb(null, true)
    cb(new Error('仅支持 PDF / Word(.docx) / TXT / Markdown 格式的简历文件'))
  }
})

// multer 错误统一转可读响应
export function uploadMiddleware(req, res, next) {
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
