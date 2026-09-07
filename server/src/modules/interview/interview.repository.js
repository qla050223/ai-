// ==================== Interview 模块 · Repository 层 ====================
import { pool } from '../../shared/db.js'

export const interviewRepository = {
  async findByCandidateId(candidateId) {
    const [rows] = await pool.execute(
      'SELECT * FROM mock_interviews WHERE candidate_id = ? ORDER BY created_at DESC',
      [candidateId]
    )
    return rows
  },

  async insert({
    id, candidateId, type, typeId, positionTitle, date, duration,
    overallScore, recommendLevel, radar, dimensionsCovered, questionCount, summary, shortboards
  }) {
    await pool.execute(
      `INSERT INTO mock_interviews
        (id,candidate_id,type,type_id,position_title,date,duration,overall_score,recommend_level,radar,dimensions_covered,question_count,summary,shortboards)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, candidateId, type, typeId, positionTitle, date, duration,
        overallScore, recommendLevel,
        JSON.stringify(radar), JSON.stringify(dimensionsCovered),
        questionCount, summary, JSON.stringify(shortboards)
      ]
    )
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM mock_interviews WHERE id = ?', [id])
    return rows[0] || null
  }
}
