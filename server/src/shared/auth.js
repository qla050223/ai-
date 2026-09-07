// ==================== JWT 鉴权中间件（共享） ====================
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'ai_interview_dev_secret_change_me'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

// 求职者鉴权
export function authCandidate(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ msg: '未登录' })
  try {
    const decoded = verifyToken(token)
    if (decoded.type !== 'candidate') return res.status(401).json({ msg: '账号类型不匹配' })
    req.candidateId = decoded.sub
    next()
  } catch {
    return res.status(401).json({ msg: '登录已过期，请重新登录' })
  }
}

// 企业端鉴权
export function authOrg(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ msg: '未登录' })
  try {
    const decoded = verifyToken(token)
    if (decoded.type !== 'org') return res.status(401).json({ msg: '账号类型不匹配' })
    req.orgUserId = decoded.sub
    next()
  } catch {
    return res.status(401).json({ msg: '登录已过期，请重新登录' })
  }
}
