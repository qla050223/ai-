// ==================== MySQL 连接层（共享） ====================
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

export const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_interview',
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  charset: 'utf8mb4',
  multipleStatements: true
}

// 业务查询用连接池
export const pool = mysql.createPool(dbConfig)

// 启动时自动建库
export async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    charset: 'utf8mb4'
  })
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await conn.end()
  console.log(`✅ 数据库 ${dbConfig.database} 已就绪（${dbConfig.user}@${dbConfig.host}:${dbConfig.port}）`)
}

// 便捷查询封装
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}
