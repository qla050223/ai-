// ==================== 前端 API 请求封装 ====================
// 统一走相对路径 /api（由 vite 代理到 Express 后端）
// 请求失败（后端未启动/网络错误）时抛出异常，由各 store 捕获并回退 mock，保证界面不崩

const BASE = '/api'

// 求职者 / 企业端 token 分别存在 localStorage
function getToken(portal) {
  return localStorage.getItem(portal === 'org' ? 'ai_interview_token' : 'c_interview_token')
}

export async function request(path, { method = 'GET', body, auth = true, portal = 'candidate' } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken(portal)
    if (token) headers.Authorization = 'Bearer ' + token
  }
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.msg || '请求失败（' + res.status + '）')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

// 文件上传：multipart/form-data，不能手动设置 Content-Type（浏览器需自动带 boundary）
export async function upload(path, formData, { auth = true, portal = 'candidate' } = {}) {
  const headers = {}
  if (auth) {
    const token = getToken(portal)
    if (token) headers.Authorization = 'Bearer ' + token
  }
  const res = await fetch(BASE + path, { method: 'POST', headers, body: formData })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.msg || '上传失败（' + res.status + '）')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

// 便捷方法
export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  upload
}
