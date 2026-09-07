# Auth 模块 · 技术实现报告

> 生成时间：2026-09-07
> 模块路径：`server/src/modules/auth/`
> 测试状态：12/12 全部通过

## 一、模块职责

负责 B/C 双端的身份认证，包括求职者注册、求职者登录、当前用户查询、企业用户登录，以及 JWT Token 的签发与校验。

## 二、分层架构

```
auth.routes.js     → HTTP 入参解析、响应组装、调用 service
auth.service.js    → 业务逻辑（参数校验、密码加密、token 签发、用户组装）
auth.repository.js → 纯数据库读写（candidates / org_users 表）
auth.test.js       → 单元/集成测试
```

### 依赖方向（严格单向）
```
routes → service → repository → shared/db
```
routes 不直接访问数据库，repository 不含业务逻辑。

## 三、API 清单

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/c/auth/register` | 否 | 求职者注册 |
| POST | `/api/c/auth/login` | 否 | 求职者登录 |
| GET | `/api/c/auth/me` |求职者 | 当前用户信息（含简历） |
| POST | `/api/b/auth/login` | 否 | 企业用户登录 |

## 四、核心实现

### 4.1 Repository 层
- `findCandidateByEmail(email)` — 按邮箱查求职者
- `findCandidateById(id)` — 按 ID 查求职者
- `findResumesByCandidateId(id)` — 查求职者全部简历
- `insertCandidate(...)` — 新增求职者
- `findOrgUserByEmail(email)` — 按邮箱查企业用户

### 4.2 Service 层
- `registerCandidate({email, password, name})`
  - 参数校验 → 邮箱查重 → bcrypt 加密 → 入库 → 签发 token
- `loginCandidate({email, password})`
  - 参数校验 → 查用户 → bcrypt.compare → 签发 token
- `loadCandidate(id)`
  - 查用户 + 简历 → mapCandidate 组装
- `loginOrg({email, password})`
  - 同上，面向 org_users 表

### 4.3 错误码约定
| 状态码 | 场景 |
|--------|------|
| 400 | 缺失必填参数 |
| 401 | 邮箱或密码错误 / token 无效 |
| 409 | 邮箱已注册 |
| 404 | 用户不存在 |

## 五、测试用例（12 项）

| # | 用例 | 预期 | 结果 |
|---|------|------|------|
| 1 | 健康检查 | 200, ok:true | ✅ |
| 2 | 注册成功 | 200, 返回 token+user | ✅ |
| 3 | 注册缺失字段 | 400 | ✅ |
| 4 | 注册重复邮箱 | 409 | ✅ |
| 5 | 登录正确密码 | 200, token | ✅ |
| 6 | 登录错误密码 | 401 | ✅ |
| 7 | 登录缺失参数 | 400 | ✅ |
| 8 | me 携带有效 token | 200, 用户信息 | ✅ |
| 9 | me 未携带 token | 401 | ✅ |
| 10 | me 无效 token | 401 | ✅ |
| 11 | 企业登录正确 | 200, token | ✅ |
| 12 | 企业登录错误 | 401 | ✅ |

## 六、安全设计

- 密码使用 bcryptjs（cost=10）加盐哈希存储，不存明文
- JWT 密钥从 `JWT_SECRET` 环境变量读取，默认值仅用于开发
- token 有效期 `JWT_EXPIRES_IN`（默认 7 天）
- 求职者与企业 token 通过 `type` 字段区分，`authCandidate`/`authOrg` 中间件校验类型
- 错误信息不泄露用户是否存在（统一"邮箱或密码错误"）

## 七、运行测试

```bash
cd server
node --test src/modules/auth/auth.test.js
```
