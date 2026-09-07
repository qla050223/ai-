// ==================== Resume 模块 · 单元/集成测试 ====================
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

// 获取一份有技能的简历 ID
async function getResumeId(token) {
  const res = await request.get('/api/c/resumes').set('Authorization', 'Bearer ' + token)
  const withSkills = res.body.list.find(r => r.parsed?.skills?.length > 0)
  return (withSkills || res.body.list[0])?.id
}

describe('Resume 模块 API', () => {
  // ---------- 列表 ----------
  test('GET /api/c/resumes 未授权返回 401', async () => {
    const res = await request.get('/api/c/resumes')
    assert.equal(res.status, 401)
  })

  test('GET /api/c/resumes 已授权返回简历列表', async () => {
    const token = await login()
    const res = await request.get('/api/c/resumes').set('Authorization', 'Bearer ' + token)
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body.list))
  })

  test('简历列表默认简历排在最前', async () => {
    const token = await login()
    const res = await request.get('/api/c/resumes').set('Authorization', 'Bearer ' + token)
    if (res.body.list.length >= 1) {
      assert.equal(res.body.list[0].isDefault, true, '第一份应为默认简历')
    }
  })

  // ---------- 上传 ----------
  test('POST /api/c/resumes/upload 未授权返回 401', async () => {
    const res = await request.post('/api/c/resumes/upload')
    assert.equal(res.status, 401)
  })

  test('POST /api/c/resumes/upload 未传文件返回 400', async () => {
    const token = await login()
    const res = await request.post('/api/c/resumes/upload')
      .set('Authorization', 'Bearer ' + token)
    assert.equal(res.status, 400)
    assert.match(res.body.msg, /未收到文件/)
  })

  test('POST /api/c/resumes/upload TXT 文件解析成功', async () => {
    const token = await login()
    const content = '张三\n前端工程师\n5年经验\n本科\n技能：Vue3, TypeScript, React, Node.js\n项目：电商平台后台管理系统'
    const res = await request.post('/api/c/resumes/upload')
      .set('Authorization', 'Bearer ' + token)
      .attach('resume', Buffer.from(content), 'test_resume.txt')
    assert.equal(res.status, 200)
    assert.ok(res.body.resume, '应返回 resume')
    assert.ok(res.body.extracted, '应返回 extracted 解析结果')
    assert.ok(Array.isArray(res.body.extracted.skills))
    assert.ok(res.body.extracted.skills.length > 0, '应解析出技能')
    assert.equal(typeof res.body.extracted.workYears, 'number')
  })

  test('POST /api/c/resumes/upload 非法格式返回 400', async () => {
    const token = await login()
    const res = await request.post('/api/c/resumes/upload')
      .set('Authorization', 'Bearer ' + token)
      .attach('resume', Buffer.from('fake'), 'test.exe')
    assert.equal(res.status, 400)
    assert.match(res.body.msg, /仅支持/)
  })

  // ---------- 测评 ----------
  test('POST /api/c/resumes/:id/assess 未授权返回 401', async () => {
    const res = await request.post('/api/c/resumes/rs_001/assess')
    assert.equal(res.status, 401)
  })

  test('POST /api/c/resumes/:id/assess 不存在的简历返回 404', async () => {
    const token = await login()
    const res = await request.post('/api/c/resumes/nonexistent/assess')
      .set('Authorization', 'Bearer ' + token)
      .send({})
    assert.equal(res.status, 404)
  })

  test('POST /api/c/resumes/:id/assess 返回 6 维测评结果', async () => {
    const token = await login()
    const id = await getResumeId(token)
    const res = await request.post('/api/c/resumes/' + id + '/assess')
      .set('Authorization', 'Bearer ' + token)
      .send({ position: '高级前端工程师' })
    assert.equal(res.status, 200)
    assert.ok(res.body.result)
    assert.equal(typeof res.body.result.overallScore, 'number')
    assert.ok(res.body.result.overallScore >= 40 && res.body.result.overallScore <= 95)
    assert.ok(res.body.result.radar, '应有 radar')
    assert.equal(res.body.result.dimensions.length, 6, '应有 6 个维度')
    assert.ok(Array.isArray(res.body.result.suggestions))
  })

  test('POST /api/c/resumes/:id/assess 不同职业匹配度有差异', async () => {
    const token = await login()
    const id = await getResumeId(token)
    // 选一份有技能的简历
    const listRes = await request.get('/api/c/resumes').set('Authorization', 'Bearer ' + token)
    const skilled = listRes.body.list.find(r => r.parsed?.skills?.length >= 3)
    if (!skilled) return // 无合适简历则跳过
    const r1 = await request.post('/api/c/resumes/' + skilled.id + '/assess')
      .set('Authorization', 'Bearer ' + token).send({ position: '高级前端工程师' })
    const r2 = await request.post('/api/c/resumes/' + skilled.id + '/assess')
      .set('Authorization', 'Bearer ' + token).send({ position: 'UI/UX 设计师' })
    assert.ok(r1.body.result.positionMatch)
    assert.ok(r2.body.result.positionMatch)
    // 前端简历对前端岗匹配度应不低于对 UI 岗
    assert.ok(r1.body.result.positionMatch.score >= r2.body.result.positionMatch.score)
  })

  // ---------- AI 改简历 ----------
  test('POST /api/c/resumes/:id/optimize 未授权返回 401', async () => {
    const res = await request.post('/api/c/resumes/rs_001/optimize')
    assert.equal(res.status, 401)
  })

  test('POST /api/c/resumes/:id/optimize 不存在的简历返回 404', async () => {
    const token = await login()
    const res = await request.post('/api/c/resumes/nonexistent/optimize')
      .set('Authorization', 'Bearer ' + token)
    assert.equal(res.status, 404)
  })

  test('POST /api/c/resumes/:id/optimize 返回分段建议+完整简历', async () => {
    const token = await login()
    const id = await getResumeId(token)
    const res = await request.post('/api/c/resumes/' + id + '/optimize')
      .set('Authorization', 'Bearer ' + token)
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body.sections), '应返回 sections 数组')
    assert.ok(res.body.sections.length > 0, '建议段数应大于 0')
    assert.ok(res.body.fullResume, '应返回 fullResume 完整简历')
    assert.ok(res.body.fullResume.length > 100, '完整简历应足够长')
  })
})
