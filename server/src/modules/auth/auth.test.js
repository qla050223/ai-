// ==================== Auth 模块 · 单元/集成测试 ====================
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import supertest from 'supertest'
import app from '../../app.js'

const request = supertest(app)
const DEMO = { email: 'luxinghe@email.com', password: 'demo1234' }
// 注册测试用唯一邮箱
const uniqueEmail = 'test_auth_' + Date.now() + '@test.com'
let registeredToken = null

describe('Auth 模块 API', () => {
  // 健康检查
  test('GET /api/health 返回 ok:true', async () => {
    const res = await request.get('/api/health')
    assert.equal(res.status, 200)
    assert.equal(res.body.ok, true)
  })

  // ---------- 求职者注册 ----------
  test('POST /api/c/auth/register 注册成功返回 token+user', async () => {
    const res = await request.post('/api/c/auth/register').send({
      email: uniqueEmail, password: 'test1234', name: '测试用户'
    })
    assert.equal(res.status, 200)
    assert.ok(res.body.token, '应返回 token')
    assert.equal(res.body.user.email, uniqueEmail)
    assert.equal(res.body.user.name, '测试用户')
    registeredToken = res.body.token
  })

  test('POST /api/c/auth/register 缺失字段返回 400', async () => {
    const res = await request.post('/api/c/auth/register').send({ email: 'a@b.com' })
    assert.equal(res.status, 400)
    assert.match(res.body.msg, /请填写完整信息/)
  })

  test('POST /api/c/auth/register 重复邮箱返回 409', async () => {
    const res = await request.post('/api/c/auth/register').send({
      email: uniqueEmail, password: 'test1234', name: '重复'
    })
    assert.equal(res.status, 409)
    assert.match(res.body.msg, /已注册/)
  })

  // ---------- 求职者登录 ----------
  test('POST /api/c/auth/login 正确密码返回 token', async () => {
    const res = await request.post('/api/c/auth/login').send(DEMO)
    assert.equal(res.status, 200)
    assert.ok(res.body.token)
    assert.equal(res.body.user.email, DEMO.email)
    assert.ok(Array.isArray(res.body.user.resumes))
  })

  test('POST /api/c/auth/login 错误密码返回 401', async () => {
    const res = await request.post('/api/c/auth/login').send({ ...DEMO, password: 'wrong' })
    assert.equal(res.status, 401)
    assert.match(res.body.msg, /邮箱或密码错误/)
  })

  test('POST /api/c/auth/login 缺失参数返回 400', async () => {
    const res = await request.post('/api/c/auth/login').send({ email: DEMO.email })
    assert.equal(res.status, 400)
  })

  // ---------- 当前用户 ----------
  test('GET /api/c/auth/me 携带 token 返回用户信息', async () => {
    const loginRes = await request.post('/api/c/auth/login').send(DEMO)
    const res = await request.get('/api/c/auth/me').set('Authorization', 'Bearer ' + loginRes.body.token)
    assert.equal(res.status, 200)
    assert.equal(res.body.user.email, DEMO.email)
  })

  test('GET /api/c/auth/me 未携带 token 返回 401', async () => {
    const res = await request.get('/api/c/auth/me')
    assert.equal(res.status, 401)
  })

  test('GET /api/c/auth/me 携带无效 token 返回 401', async () => {
    const res = await request.get('/api/c/auth/me').set('Authorization', 'Bearer invalid.token.here')
    assert.equal(res.status, 401)
  })

  // ---------- 企业登录 ----------
  test('POST /api/b/auth/login 正确密码返回 token', async () => {
    const res = await request.post('/api/b/auth/login').send({
      email: 'linshuhao@yuntu.com', password: 'demo1234'
    })
    assert.equal(res.status, 200)
    assert.ok(res.body.token)
    assert.ok(res.body.user.role)
  })

  test('POST /api/b/auth/login 错误密码返回 401', async () => {
    const res = await request.post('/api/b/auth/login').send({
      email: 'linshuhao@yuntu.com', password: 'wrong'
    })
    assert.equal(res.status, 401)
  })
})
