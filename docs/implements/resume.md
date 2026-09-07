# Resume 模块 · 技术实现报告

> 生成时间：2026-09-07
> 模块路径：`server/src/modules/resume/`
> 测试状态：14/14 全部通过

## 一、模块职责

简历全生命周期管理：简历列表查询、文件上传解析、AI 简历测评（6 维打分 + 职业匹配度）、AI 改简历（分段优化 + 完整简历生成）。是系统中最复杂的模块。

## 二、分层架构

```
resume.routes.js     → HTTP 处理 + authCandidate + uploadMiddleware
resume.service.js    → 业务编排（解析、测评、优化、文件路径处理）
resume.repository.js → 数据库读写（resumes / candidates 表）
resume.test.js       → 测试
```

**外部服务依赖**（`src/services/`，纯逻辑无 DB）：
- `assess.js` — 6 维评分 + 职业匹配度
- `resumeOptimize.js` — 分段优化建议 + 完整简历
- `resumeParser.js` — 文本提取（PDF/Word/TXT）+ 结构化解析

## 三、API 清单

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/c/resumes` | 求职者 | 简历列表 |
| POST | `/api/c/resumes/upload` | 求职者 | 上传简历文件并解析 |
| POST | `/api/c/resumes/:id/assess` | 求职者 | 简历测评（含职业匹配度） |
| POST | `/api/c/resumes/:id/optimize` | 求职者 | AI 改简历 |

## 四、核心实现

### 4.1 文件上传
- 使用 `multer` 中间件，存储到 `server/uploads/`
- 允许类型：`.pdf` / `.docx` / `.txt` / `.md`，大小限制 10MB
- 文件名：`{candidateId}_{timestamp}{ext}`，避免中文编码问题
- 上传后自动置为默认简历（`UPDATE ... SET is_default=0` 再 INSERT）

### 4.2 文本解析
- `extractText(path, name)` — 按扩展名调用 pdf-parse / mammoth / 纯文本
- `parseResumeText(text)` — 启发式提取：技能词典命中、工作年限正则、项目行抽取、学历识别

### 4.3 简历测评
- 6 个维度：岗位匹配度、内容完整性、结构清晰度、亮点呈现、STAR 完整度、关键词命中
- **职业匹配度**：根据 `POSITION_KEYWORDS`（6 职业关键词池）计算简历技能命中率
- 综合分 = 6 维平均分（范围 40-95）
- 输出：overallScore / radar / dimensions / keywords / summary / suggestions / positionMatch

### 4.4 AI 改简历
- 输入：简历解析结果 + 求职者上下文（姓名/电话/邮箱/求职意向）
- 输出：8 段分段建议（每段含原文/优化后/理由/加分技巧）+ 完整 Markdown 简历

## 五、测试用例（14 项）

| # | 用例 | 预期 | 结果 |
|---|------|------|------|
| 1 | 列表未授权 | 401 | ✅ |
| 2 | 列表已授权 | 200, list 数组 | ✅ |
| 3 | 默认简历排最前 | list[0].isDefault=true | ✅ |
| 4 | 上传未授权 | 401 | ✅ |
| 5 | 上传未传文件 | 400 | ✅ |
| 6 | 上传 TXT 解析成功 | 200, skills 非空 | ✅ |
| 7 | 上传非法格式 | 400 | ✅ |
| 8 | 测评未授权 | 401 | ✅ |
| 9 | 测评不存在简历 | 404 | ✅ |
| 10 | 测评返回 6 维结果 | overallScore 40-95, 6 dimensions | ✅ |
| 11 | 不同职业匹配度有差异 | 前端岗 ≥ UI 岗匹配度 | ✅ |
| 12 | 改简历未授权 | 401 | ✅ |
| 13 | 改简历不存在 | 404 | ✅ |
| 14 | 改简历返回结果 | sections 非空, fullResume>100字 | ✅ |

## 六、错误码约定

| 状态码 | 场景 |
|--------|------|
| 400 | 未收到文件 / 非法格式 / 文件过大 |
| 401 | 未登录 |
| 404 | 简历不存在 |
| 500 | 文件解析失败 |

## 七、设计说明

- 上传与解析分离：解析失败不阻断建档，返回 `warning` 提示
- 测评/优化有 1.2s 模拟延迟（后续接入真实 AI 后替换）
- 职业匹配度独立于 6 维评分，作为单独字段突出展示
- JSON 字段（skills/projects）通过 `parseJson` 安全解析，兼容 string/object/null

## 八、运行测试

```bash
cd server
node --test src/modules/resume/resume.test.js
```
