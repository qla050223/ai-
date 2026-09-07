// ==================== Position 模块 · Repository 层 ====================
import { pool } from '../../shared/db.js'

export const positionRepository = {
  async findAllOrdered() {
    const [rows] = await pool.query('SELECT * FROM positions ORDER BY hot DESC, practice_count DESC')
    return rows
  }
}
