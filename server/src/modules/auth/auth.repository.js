// ==================== Auth 模块 · Repository 层 ====================
// 职责：仅负责数据库读写，不含业务逻辑
import { pool } from '../../shared/db.js'

export const authRepository = {
  // 按邮箱查求职者
  async findCandidateByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM candidates WHERE email = ?', [email])
    return rows[0] || null
  },

  // 按 ID 查求职者
  async findCandidateById(id) {
    const [rows] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id])
    return rows[0] || null
  },

  // 查求职者的全部简历
  async findResumesByCandidateId(candidateId) {
    const [rows] = await pool.execute(
      'SELECT * FROM resumes WHERE candidate_id = ? ORDER BY is_default DESC, uploaded_at DESC',
      [candidateId]
    )
    return rows
  },

  // 新增求职者
  async insertCandidate({ id, name, email, passwordHash, registeredAt }) {
    await pool.execute(
      'INSERT INTO candidates (id,name,email,password_hash,registered_at,intention) VALUES (?,?,?,?,?,?)',
      [id, name, email, passwordHash, registeredAt, JSON.stringify({})]
    )
  },

  // 按邮箱查企业用户
  async findOrgUserByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM org_users WHERE email = ?', [email])
    return rows[0] || null
  }
}
