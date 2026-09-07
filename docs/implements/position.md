# Position 模块 · 技术实现报告

> 生成时间：2026-09-07
> 模块路径：`server/src/modules/position/`
> 测试状态：4/4 全部通过

## 一、模块职责

提供岗位题库的公开查询接口，供求职者端模拟面试练习时选择目标岗位。数据由 `db/seed.js` 初始化，包含 6 个岗位（高级前端、后端、产品、数据分析、全栈、UI 设计）。

## 二、分层架构

```
position.routes.js     → HTTP 处理
position.service.js    → 数据转换（mapPosition）
position.repository.js → 数据库查询（positions 表）
position.test.js       → 测试
```

## 三、API 清单

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/c/positions` | 否 | 岗位列表（按热度+练习量排序） |

## 四、核心实现

### 4.1 Repository 层
- `findAllOrdered()` — `SELECT * FROM positions ORDER BY hot DESC, practice_count DESC`

### 4.2 Service 层
- `listPositions()` — 调用 repository，对每行执行 `mapPosition` 转换为前端结构（camelCase 字段名、JSON 字段解析）

### 4.3 数据结构
```js
{
  id, title, category, difficulty,
  skillTags: [],          // JSON 解析
  practiceCount, avgScore, description, hot: boolean
}
```

## 五、测试用例（4 项）

| # | 用例 | 预期 | 结果 |
|---|------|------|------|
| 1 | 返回岗位列表 | 200, list 数组非空 | ✅ |
| 2 | 按 hot 降序 | hot=true 排在前面 | ✅ |
| 3 | 必需字段完整 | id/title/skillTags/practiceCount | ✅ |
| 4 | 无需鉴权 | 200 | ✅ |

## 六、设计说明

- 接口公开（无鉴权），因为岗位题库是练习素材，所有求职者可见
- 排序策略：热门岗位优先，同热度按练习量降序，提升高价值岗位曝光
- skill_tags 字段在 MySQL 中以 JSON 存储，`mapPosition` 通过 `parseJson` 安全解析

## 七、运行测试

```bash
cd server
node --test src/modules/position/position.test.js
```
