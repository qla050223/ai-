// ==================== Interview 模块 · 单元/集成测试 ====================
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import supertest from 'supertest'
import app from '../../app.js'

const request = supertest(app)
const DEMO = { email: 'luxinghe@email.com', password: 'demo1234' }

async function login() {
  const res = await request.post('/api/c/auth/login').send(DEMO)
  return res.body.token
}

describe('Interview 模块 API', () => {
  // ---------- 列表 ----------
  test('GET /api/c/interviews 未授权返回 401', async () => {
    const res = await request.get('/api/c/interviews')
    assert.equal(res.status, 401)
  })

  test('GET /api/c/interviews 已授权返回列表', async () => {
    const token = await login()
    const res = await request.get('/api/c/interviews').set('Authorization', 'Bearer ' + token)
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body.list))
  })

  // ---------- 新增 ----------
  test('POST /api/c/interviews 未授权返回 401', async () => {
    const res = await request.post('/api/c/interviews').send({ positionTitle: '测试' })
    assert.equal(res.status, 401)
  })

  test('POST /api/c/interviews 新增成功返回 interview', async () => {
    const token = await login()
    const res = await request.post('/api/c/interviews')
      .set('Authorization', 'Bearer ' + token)
      .send({
        positionTitle: '前端工程师',
        overallScore: 85,
        recommendLevel: 'strong',
        radar: { '专业能力': 80, '沟通表达': 90 },
        dimensionsCovered: ['专业技能', '项目经验'],
        questionCount: 6,
        summary: '表现优秀',
        shortboards: ['系统设计']
      })
    assert.equal(res.status, 200)
    assert.ok(res.body.interview, '应返回 interview 对象')
    assert.equal(res.body.interview.positionTitle, '前端工程师')
    assert.equal(res.body.interview.overallScore, 85)
    assert.equal(res.body.interview.recommendLevel, 'strong')
    assert.equal(res.body.interview.questionCount, 6)
  })

  test('POST /api/c/interviews 使用默认值补全字段', async () => {
    const token = await login()
    const res = await request.post('/api/c/interviews')
      .set('Authorization', 'Bearer ' + token)
      .send({})
    assert.equal(res.status, 200)
    assert.equal(res.body.interview.type, 'mock')
    assert.equal(res.body.interview.positionTitle, '模拟面试')
    assert.equal(res.body.interview.duration, 30)
    assert.equal(res.body.interview.overallScore, 0)
  })

  // ---------- 数据隔离 ----------
  test('新增后列表数量增加', async () => {
    const token = await login()
    const before = await request.get('/api/c/interviews').set('Authorization', 'Bearer ' + token)
    await request.post('/api/c/interviews').set('Authorization', 'Bearer ' + token).send({ positionTitle: '隔离测试' })
    const after = await request.get('/api/c/interviews').set('Authorization', 'Bearer ' + token)
    assert.equal(after.body.list.length, before.body.list.length + 1)
  })
})
