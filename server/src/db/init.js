// ==================== 数据库初始化 ====================
// 启动时：建库 → 建表 → 灌种子
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool, ensureDatabase } from '../config/db.js'
import { seed } from './seed.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function initDatabase() {
  await ensureDatabase()
  const sql = await readFile(join(__dirname, 'schema.sql'), 'utf-8')
  await pool.query(sql)
  console.log('✅ 数据表已就绪')
  await migrate()
  await seed()
}

// 轻量迁移：为已存在的 resumes 表补充文件字段（MySQL 8 不支持 ADD COLUMN IF NOT EXISTS）
async function migrate() {
  const { dbConfig } = await import('../config/db.js')
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'resumes'`,
    [dbConfig.database]
  )
  const exist = new Set(cols.map(c => c.COLUMN_NAME))
  const additions = [
    ['file_name', "VARCHAR(255) DEFAULT NULL COMMENT '上传的源文件名'"],
    ['file_path', "VARCHAR(255) DEFAULT NULL COMMENT '服务器存储相对路径'"],
    ['raw_text', "MEDIUMTEXT DEFAULT NULL COMMENT '解析出的简历原文'"]
  ]
  for (const [col, ddl] of additions) {
    if (!exist.has(col)) {
      await pool.query(`ALTER TABLE resumes ADD COLUMN ${col} ${ddl}`)
      console.log(`  ✓ 迁移：resumes 表新增字段 ${col}`)
    }
  }
}
