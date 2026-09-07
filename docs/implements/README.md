# 后端架构 · 技术实现总览

> 生成时间：2026-09-07
> 架构模式：分层架构（Router → Service → Repository）

## 一、目录结构

```
server/src/
├── app.js                  # Express 应用入口
├── server.js               # 启动脚本
├── config/db.js            # 兼容转发（→ shared/db.js）
├── db/                     # 建库/建表/种子
│   ├── init.js
│   ├── schema.sql
│   └── seed.js
├── shared/                 # 共享层（跨模块复用）
│   ├── db.js               # MySQL 连接池
│   ├── auth.js             # JWT 鉴权中间件
│   ├── mappers.js          # DB 行 → 前端结构映射
│   └── upload.js           # multer 文件上传中间件
├── services/               # 纯逻辑服务（无 DB 依赖）
│   ├── assess.js           # 简历测评评分引擎
│   ├── resumeOptimize.js   # AI 改简历生成
│   └── resumeParser.js     # 简历文本提取与解析
└── modules/                # 业务模块（每模块一个包）
    ├── auth/               # 认证模块
    │   ├── auth.routes.js
    │   ├── auth.service.js
    │   ├── auth.repository.js
    │   └── auth.test.js
    ├── position/           # 岗位题库模块
    │   ├── position.routes.js
    │   ├── position.service.js
    │   ├── position.repository.js
    │   └── position.test.js
    ├── interview/          # 面试记录模块
    │   ├── interview.routes.js
    │   ├── interview.service.js
    │   ├── interview.repository.js
    │   └── interview.test.js
    └── resume/             # 简历模块
        ├── resume.routes.js
        ├── resume.service.js
        ├── resume.repository.js
        └── resume.test.js
```

## 二、分层职责

| 层 | 职责 | 禁止 |
|----|------|------|
| **Routes** | HTTP 入参解析、响应组装、错误码映射、调用 service | 直接访问 DB、含业务逻辑 |
| **Service** | 业务编排、参数校验、默认值、调用 repository 和纯逻辑服务 | 直接写 SQL、处理 HTTP |
| **Repository** | 纯数据库读写（SQL + 参数绑定） | 含业务逻辑、处理 HTTP |

**依赖方向**：`routes → service → repository → shared/db`（严格单向）

## 三、模块 API 汇总

| 模块 | API 数 | 测试数 | 通过 |
|------|--------|--------|------|
| auth | 4 | 12 | 12/12 |
| position | 1 | 4 | 4/4 |
| interview | 2 | 6 | 6/6 |
| resume | 4 | 14 | 14/14 |
| **合计** | **11** | **36** | **36/36** |

## 四、技术栈

- **运行时**：Node.js (ES Modules)
- **框架**：Express 4
- **数据库**：MySQL 8.0（mysql2 连接池）
- **认证**：JWT（jsonwebtoken）
- **密码**：bcryptjs
- **文件上传**：multer + pdf-parse + mammoth
- **测试**：node:test（内置）+ supertest

## 五、模块详细报告

- [Auth 模块](./auth.md)
- [Position 模块](./position.md)
- [Interview 模块](./interview.md)
- [Resume 模块](./resume.md)

## 六、运行测试

```bash
cd server

# 全部测试
node --test src/modules/auth/auth.test.js src/modules/position/position.test.js src/modules/interview/interview.test.js src/modules/resume/resume.test.js

# 或逐模块
node --test src/modules/auth/auth.test.js
node --test src/modules/position/position.test.js
node --test src/modules/interview/interview.test.js
node --test src/modules/resume/resume.test.js
```
