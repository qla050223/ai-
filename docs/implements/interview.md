# Interview 模块 · 技术实现报告

> 生成时间：2026-09-07
> 模块路径：`server/src/modules/interview/`
> 测试状态：6/6 全部通过

## 一、模块职责

管理求职者的模拟面试记录，包括记录列表查询和新增（练习结束后回写成绩）。数据持久化到 `mock_interviews` 表。

## 二、分层架构

```
interview.routes.js     → HTTP 处理 + authCandidate 鉴权
interview.service.js    → 业务逻辑（ID 生成、默认值补全、mapInterview）
interview.repository.js → 数据库读写（mock_interviews 表）
interview.test.js       → 测试
```

## 三、API 清单

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/c/interviews` | 求职者 | 我的面试记录列表 |
| POST | `/api/c/interviews` | 求职者 | 新增一条面试记录 |

## 四、核心实现

### 4.1 Repository 层
- `findByCandidateId(candidateId)` — 按候选人查全部记录，按 `created_at DESC` 排序
- `insert({...})` — 新增记录，JSON 字段（radar/dimensions_covered/shortboards）序列化入库
- `findById(id)` — 按 ID 查单条（新增后回查）

### 4.2 Service 层
- `listInterviews(candidateId)` — 查列表并 map
- `createInterview(candidateId, body)`
  - 生成 ID（`mi_` + 时间戳）
  - 默认值补全：type='mock', positionTitle='模拟面试', duration=30, overallScore=0, recommendLevel='pending'
  - radar/dimensionsCovered/shortboards 默认为 `{}` / `[]`
  - 入库后回查并 map

### 4.3 数据结构
```js
{
  id, type, typeId, positionTitle, date, duration,
  overallScore, recommendLevel,
  radar: {},                  // JSON
  dimensionsCovered: [],      // JSON
  questionCount, summary,
  shortboards: []             // JSON
}
```

## 五、测试用例（6 项）

| # | 用例 | 预期 | 结果 |
|---|------|------|------|
| 1 | 列表未授权 | 401 | ✅ |
| 2 | 列表已授权 | 200, list 数组 | ✅ |
| 3 | 新增未授权 | 401 | ✅ |
| 4 | 新增成功 | 200, 返回 interview，字段正确 | ✅ |
| 5 | 新增默认值补全 | type='mock', duration=30 等 | ✅ |
| 6 | 数据隔离验证 | 新增后列表数 +1 | ✅ |

## 六、设计说明

- 所有写操作必须通过 `authCandidate` 鉴权，确保只能操作自己的记录
- repository 层负责 JSON 序列化，service 层负责默认值与 ID 生成，职责分离
- `date` 字段默认取当前时间（`YYYY-MM-DD HH:mm`）
- recommendLevel 枚举：`pending` / `pass` / `strong` / `fail`

## 七、运行测试

```bash
cd server
node --test src/modules/interview/interview.test.js
```
