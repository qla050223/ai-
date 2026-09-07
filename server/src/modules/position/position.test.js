// ==================== Position 模块 · 单元/集成测试 ====================
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import supertest from 'supertest'
import app from '../../app.js'

const request = supertest(app)

describe('Position 模块 API', () => {
  test('GET /api/c/positions 返回岗位列表', async () => {
    const res = await request.get('/api/c/positions')
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body.list), '应返回 list 数组')
    assert.ok(res.body.list.length > 0, '应有种子岗位数据')
  })

  test('岗位列表按 hot 降序排列', async () => {
    const res = await request.get('/api/c/positions')
    const list = res.body.list
    for (let i = 1; i < list.length; i++) {
      // hot 的应排在前面（1 > 0）
      if (list[i - 1].hot && !list[i].hot) {
        // 正确
      } else if (!list[i - 1].hot && list[i].hot) {
        assert.fail('hot 岗位应排在前面')
      }
    }
  })

  test('每个岗位包含必需字段', async () => {
    const res = await request.get('/api/c/positions')
    const first = res.body.list[0]
    assert.ok(first.id, '应有 id')
    assert.ok(first.title, '应有 title')
    assert.ok(Array.isArray(first.skillTags), 'skillTags 应为数组')
    assert.equal(typeof first.practiceCount, 'number')
  })

  test('接口无需鉴权即可访问', async () => {
    const res = await request.get('/api/c/positions')
    assert.equal(res.status, 200, '公开接口不应要求登录')
  })
})
