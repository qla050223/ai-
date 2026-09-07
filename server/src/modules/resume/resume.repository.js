// ==================== Resume 模块 · Repository 层 ====================
import { pool } from '../../shared/db.js'

export const resumeRepository = {
  // 求职者的简历列表
  async findByCandidateId(candidateId) {
    const [rows] = await pool.execute(
      'SELECT * FROM resumes WHERE candidate_id = ? ORDER BY is_default DESC, uploaded_at DESC',
      [candidateId]
    )
    return rows
  },

  // 按 ID + 归属查简历
  async findByIdAndCandidate(id, candidateId) {
    const [rows] = await pool.execute(
      'SELECT * FROM resumes WHERE id = ? AND candidate_id = ?',
      [id, candidateId]
    )
    return rows[0] || null
  },

  // 查求职者基本信息（用于改简历上下文）
  async findCandidateInfo(candidateId) {
    const [rows] = await pool.execute(
      'SELECT name, phone, email, intention FROM candidates WHERE id = ?',
      [candidateId]
    )
    return rows[0] || null
  },

  // 将该求职者所有简历置为非默认
  async clearDefault(candidateId) {
    await pool.execute('UPDATE resumes SET is_default = 0 WHERE candidate_id = ?', [candidateId])
  },

  // 新增简历
  async insert({
    id, candidateId, name, uploadedAt, isDefault, education, workYears,
    lastCompany, skills, projects, fileName, filePath, rawText
  }) {
    await pool.execute(
      `INSERT INTO resumes
        (id,candidate_id,name,uploaded_at,is_default,education,work_years,last_company,skills,projects,file_name,file_path,raw_text)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, candidateId, name, uploadedAt, isDefault, education, workYears,
        lastCompany, JSON.stringify(skills), JSON.stringify(projects),
        fileName, filePath, rawText
      ]
    )
  },

  // 按 ID 查简历
  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM resumes WHERE id = ?', [id])
    return rows[0] || null
  }
}
