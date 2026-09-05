// ==================== 服务启动 ====================
import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import { initDatabase } from './db/init.js'

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await initDatabase()
    app.listen(PORT, () => {
      console.log(`🚀 后端服务已启动：http://localhost:${PORT}`)
      console.log(`   健康检查：http://localhost:${PORT}/api/health`)
    })
  } catch (err) {
    console.error('❌ 启动失败：', err.message)
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 数据库账号或密码错误，请修改 server/.env 中的 DB_USER / DB_PASSWORD')
    } else if (err.code === 'ECONNREFUSED') {
      console.error('👉 无法连接 MySQL，请确认 MySQL80 服务已启动，且 DB_HOST/DB_PORT 正确')
    }
    process.exit(1)
  }
}

start()
