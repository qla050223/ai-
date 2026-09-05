// ==================== MySQL 连接层 ====================
// 统一从环境变量读取连接配置（避免写死，见排障经验）
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_interview',
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  charset: 'utf8mb4',
  multipleStatements: true
}

// 业务查询用连接池（指定数据库）
export const pool = mysql.createPool(config)

// 启动时调用：连接 MySQL 服务（不指定库）→ 自动创建数据库
export async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    charset: 'utf8mb4'
  })
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await conn.end()
  console.log(`✅ 数据库 ${config.database} 已就绪（${config.user}@${config.host}:${config.port}）`)
}

// 便捷查询封装
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export { config as dbConfig }
