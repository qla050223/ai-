// ==================== JWT 鉴权中间件 ====================
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'ai_interview_dev_secret_change_me'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

// 校验求职者 token：Authorization: Bearer <token>，payload { sub: candidateId, type: 'candidate' }
export function authCandidate(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ msg: '未登录' })
  try {
    const decoded = jwt.verify(token, SECRET)
    if (decoded.type !== 'candidate') return res.status(401).json({ msg: '账号类型不匹配' })
    req.candidateId = decoded.sub
    next()
  } catch {
    return res.status(401).json({ msg: '登录已过期，请重新登录' })
  }
}

// 校验企业端 token：payload { sub: orgUserId, type: 'org' }
export function authOrg(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ msg: '未登录' })
  try {
    const decoded = jwt.verify(token, SECRET)
    if (decoded.type !== 'org') return res.status(401).json({ msg: '账号类型不匹配' })
    req.orgUserId = decoded.sub
    next()
  } catch {
    return res.status(401).json({ msg: '登录已过期，请重新登录' })
  }
}
