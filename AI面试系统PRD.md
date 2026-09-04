# AI 智能面试系统 PRD（产品需求文档）

> **版本**：V1.0
> **日期**：2026-09-04
> **适用阶段**：PC 端 Web 应用（第一版本）
> **文档状态**：待评审

---

## 一、产品概述

### 1.1 产品名称
**AI 智能面试平台（AI Interview Pro）**

### 1.2 产品定位
面向企业招聘方（HR、用人经理）的 AI 辅助面试工具。通过 AI 大模型驱动多轮文字问答，结合候选人简历自动生成个性化面试题库，最终输出结构化能力评估报告，帮助招聘方提升面试效率、降低主观偏差、沉淀面试资产。

### 1.3 产品愿景
让每一次面试都可量化、可追溯、可复用——把面试官的经验沉淀为系统能力。

### 1.4 核心价值主张
- **提效**：AI 自动出题、自动评估，单场面试准备时间降低 60%。
- **降偏**：结构化评分模型 + 多维度雷达图，减少面试官主观偏见。
- **沉淀**：面试记录、评估报告、题库资产永久留存，支撑团队复盘与人才库建设。

---

## 二、目标用户与场景

### 2.1 目标用户

| 角色 | 说明 | 核心诉求 |
| --- | --- | --- |
| **企业 HR** | 负责初筛与组织面试 | 批量面试、快速评估、标准化报告 |
| **用人经理** | 深度专业面试 | 岗位匹配度、专业能力深度评估 |
| **面试官** | 实际参与面试 | 出题辅助、过程记录、评分参考 |

> 第一版本仅服务 B 端企业内部招聘流程，不开放 C 端求职者自助练习入口。

### 2.2 核心使用场景

**场景一：AI 自主面试**
HR 上传候选人简历与岗位 JD，系统自动生成面试题库并启动 AI 文字面试。AI 根据候选人作答动态追问，面试结束后生成评估报告，HR 据此决定是否进入下一轮。

**场景二：面试官辅助面试**
面试官手动发起面试，AI 实时提供题目推荐、追问建议与评分参考，面试官保留最终评分权。面试过程同步记录，输出报告供决策。

**场景三：题库与练习**
招聘方基于历史面试沉淀岗位题库，新建面试时一键复用；支持 HR 内部演练以统一面试标准。

---

## 三、系统架构与技术选型

### 3.1 总体架构
采用**前后端分离架构**。

```
┌──────────────────────────────────────────────┐
│              PC 端 Web 前端（Vue3）            │
│   Naive UI / Pinia / Vite / WebSocket 客户端  │
└────────────────┬─────────────────────────────┘
                 │ HTTP REST + WebSocket
┌────────────────▼─────────────────────────────┐
│            后端服务（Python + FastAPI）        │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ 业务API  │ │ 面试引擎 │ │ 评估报告服务 │  │
│  └─────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────────────────────────────────┐    │
│  │   LLM 网关（对接大模型服务）          │    │
│  └──────────────────────────────────────┘    │
└────────────────┬─────────────────────────────┘
                 │
   ┌─────────────┼─────────────┐
   ▼             ▼             ▼
┌──────┐   ┌─────────┐   ┌──────────┐
│ 数据库│   │对象存储  │   │ 向量库    │
│MySQL │   │简历/录音 │   │题库/简历 │
└──────┘   └─────────┘   └──────────┘
```

### 3.2 技术选型

| 层级 | 技术 | 说明 |
| --- | --- | --- |
| 前端 | Vue 3 + Vite + Pinia + Naive UI | PC 端 Web 单页应用 |
| 实时通信 | WebSocket | 面试过程 AI 流式回复 |
| 后端 | Python 3.11 + FastAPI | 高性能异步 API |
| 数据库 | MySQL 8.x | 业务数据持久化 |
| 向量库 | Milvus / Chroma | 简历与题库语义检索 |
| 对象存储 | MinIO / OSS | 简历文件、报告附件 |
| LLM | 接入主流大模型（如 GLM、通义、DeepSeek 等） | 多轮问答、评分、报告生成 |

### 3.3 第二版本规划（移动端）
- 第一版本仅 PC 端 Web，响应式适配桌面分辨率（≥1280px）。
- V2 规划：移动端 App（iOS/Android）与小程序，支持面试官移动出题、候选人移动端面试、报告移动查看。

---

## 四、功能模块详细设计

### 4.1 功能架构总览

```
AI 智能面试平台
├── 1. 账号与组织管理
│   ├── 登录/注册
│   ├── 企业组织与角色
│   └── 成员管理
├── 2. 岗位与候选人管理
│   ├── 岗位 JD 管理
│   ├── 候选人档案
│   └── 简历解析
├── 3. 面试管理（核心）
│   ├── 创建面试
│   ├── AI 自主面试模式
│   ├── 面试官辅助模式
│   └── 面试记录
├── 4. 题库中心
│   ├── AI 题库生成
│   ├── 题库分类与标签
│   └── 题库复用
├── 5. 评估报告
│   ├── 能力雷达图
│   ├── 答题表现分析
│   └── 改进建议
└── 6. 数据统计
    ├── 面试数据看板
    └── 人才库分析
```

### 4.2 模块一：账号与组织管理

#### 4.2.1 登录注册
- 支持企业邮箱注册、密码登录。
- 支持企业 SSO（V2 接入）。
- 登录态基于 JWT，支持多端互踢策略。

#### 4.2.2 企业组织与角色
| 角色 | 权限 |
| --- | --- |
| 超级管理员 | 企业信息、计费、全部数据 |
| HR 管理员 | 岗位/候选人/面试/题库全权限 |
| 面试官 | 参与面试、查看分配的候选人 |
| 普通成员 | 仅查看本人参与的面试报告 |

#### 4.2.3 成员管理
- 邮箱邀请加入，支持批量导入。
- 成员可归属多个岗位组。

### 4.3 模块二：岗位与候选人管理

#### 4.3.1 岗位 JD 管理
- 创建岗位：岗位名称、职责描述、任职要求、技能标签、难度等级。
- JD 结构化解析：AI 自动抽取关键技能点，作为出题依据。
- 支持岗位模板复用。

#### 4.3.2 候选人档案
- 候选人基本信息：姓名、联系方式、应聘岗位、来源渠道。
- 候选人状态机：待面试 → 面试中 → 待评估 → 已通过/已淘汰/待定。
- 历史面试记录关联展示。

#### 4.3.3 简历解析
- 支持 PDF / Word 上传。
- AI 解析为结构化字段：基本信息、教育经历、工作经历、项目经验、技能清单。
- 解析结果可人工校对修正。
- 简历向量化入向量库，支撑后续出题。

### 4.4 模块三：面试管理（核心模块）

#### 4.4.1 创建面试
**输入：**
- 候选人（关联简历）
- 目标岗位（关联 JD）
- 面试模式：AI 自主 / 面试官辅助
- 面试时长（默认 30 分钟）
- 面试重点维度（可多选：专业技能、项目经验、沟通表达、逻辑思维、文化匹配）

**系统行为：**
1. 基于简历 + JD + 重点维度，AI 生成个性化面试题库（见 4.5）。
2. 生成面试大纲与开场白。
3. 创建面试会话房间（WebSocket 长连接）。

#### 4.4.2 AI 自主面试模式
- AI 扮演面试官，纯文字多轮问答。
- AI 行为规则：
  - **开场**：自我介绍 + 说明流程。
  - **追问机制**：根据候选人作答动态追问（深度追问 / 换题 / 下钻项目细节）。
  - **题目推进**：单题作答充分后推进下一题，覆盖预设重点维度。
  - **收尾**：候选人提问环节 + 结束语。
- 流式输出：AI 回复通过 WebSocket 流式返回，提升体验。
- 候选人作答实时记录并结构化存储。
- 面试官（HR）可旁听观察整个对话过程。
- 支持中途暂停 / 恢复 / 提前结束。
- 超时自动收尾。

#### 4.4.3 面试官辅助模式
- 面试官主导对话，AI 提供实时辅助：
  - **题目推荐**：右侧面板展示下一题建议，可一键发送。
  - **追问建议**：AI 基于当前对话给出 2-3 条追问选项。
  - **评分参考**：AI 实时对候选人作答给出预评分与点评。
  - **维度覆盖提示**：提示尚未考察的能力维度。
- 最终评分以面试官手动评分为准。

#### 4.4.4 面试记录
- 全量对话记录（含时间戳、发言人）。
- 每题作答原文 + AI 摘要。
- 面试官批注。
- 支持导出（PDF / Word）。

### 4.5 模块四：题库中心

#### 4.5.1 AI 题库生成
- 触发时机：创建面试时自动生成 / 手动基于岗位生成。
- 输入：岗位 JD + 候选人简历（可选）+ 重点维度。
- 输出题目结构：
  ```
  {
    "题目ID": "...",
    "维度": "专业技能",
    "技能点": "Vue3 响应式原理",
    "题型": "开放题",        // 开放题/场景题/项目题/行为题
    "难度": "中等",
    "题目内容": "...",
    "参考答案要点": ["...","..."],
    "评分标准": { "优秀": "...", "合格": "...", "不合格": "..." },
    "追问建议": ["...","..."]
  }
  ```
- 单次生成建议 8-15 题，可二次编辑增删改。
- 支持重新生成、单独重新生成某题。

#### 4.5.2 题库分类与标签
- 按岗位、维度、技能点、难度多维分类。
- 支持自定义标签。

#### 4.5.3 题库复用
- 题库可保存为企业公共题库 / 岗位模板题库。
- 新建面试时可选择"从已有题库加载"。
- 题目使用次数与平均得分统计。

### 4.6 模块五：评估报告

面试结束自动生成，支持人工修正。

#### 4.6.1 能力雷达图
- 维度（可配置，默认 6 项）：
  - 专业技能
  - 项目经验
  - 逻辑思维
  - 沟通表达
  - 学习能力
  - 文化匹配
- 每维度 0-100 分，雷达图可视化。
- 各维度附 AI 评分依据（对应题目与作答摘要）。

#### 4.6.2 答题表现分析
- 逐题列表：题目、候选人作答摘要、参考答案、AI 评分、面试官评分、点评。
- 高亮优秀作答与不足作答。
- 维度得分聚合统计。

#### 4.6.3 改进建议
- 针对候选人的能力短板给出发展建议（可用于候选人反馈）。
- 针对招聘方的招聘建议：是否推进、适配岗位、培养成本评估。
- 综合推荐等级：**强烈推荐 / 推荐 / 待定 / 不推荐**。

#### 4.6.4 报告产出格式
- 在线 HTML 报告（支持交互）。
- 一键导出 PDF。
- 支持分享链接（带权限与有效期）。

### 4.7 模块六：数据统计

#### 4.7.1 面试数据看板
- 时间范围内：面试场次、候选人数量、通过率、平均分。
- 按岗位、面试官维度统计。

#### 4.7.2 人才库分析
- 候选人能力对比（多份报告叠加雷达图）。
- 高潜力人才标记与跟进提醒。

---

## 五、详细业务流程

### 5.1 核心面试流程

```
[HR 上传简历]
     │
     ▼
[JD 选择 / 创建] ──► [AI 解析简历 + JD]
     │
     ▼
[创建面试] ──► [AI 生成题库] ──► [HR 校对题目]
     │
     ▼
[启动面试会话（WebSocket）]
     │
     ├── AI 自主模式 ──► AI 多轮问答 ──► 动态追问
     │
     └── 面试官辅助模式 ──► 面试官主导 + AI 辅助
     │
     ▼
[面试结束]
     │
     ▼
[AI 生成评估报告] ──► [HR/面试官 修正评分]
     │
     ▼
[输出最终报告] ──► [候选人状态流转] ──► [归档人才库]
```

### 5.2 状态流转

**候选人状态机：**
```
待面试 ──启动──► 面试中 ──结束──► 待评估 ──报告确认──► 已通过 / 已淘汰 / 待定
```

**面试会话状态：**
```
未开始 ──► 进行中 ──► 已暂停 ──► 已结束
                 └──► 已结束
```

---

## 六、数据模型（核心实体）

> 仅列出核心实体与关键字段，详细表结构在技术设计阶段补充。

| 实体 | 关键字段 |
| --- | --- |
| **企业（Organization）** | id, 名称, 行业, 规模, 套餐, 创建时间 |
| **用户（User）** | id, org_id, 姓名, 邮箱, 角色, 状态 |
| **岗位（Position）** | id, org_id, 名称, JD原文, 结构化技能点[], 模板标记 |
| **候选人（Candidate）** | id, org_id, 姓名, 联系方式, 应聘岗位, 来源, 状态 |
| **简历（Resume）** | id, candidate_id, 文件URL, 解析结果JSON, 向量ID |
| **题库（QuestionBank）** | id, org_id, 岗位id, 题目[], 来源(自动/手动) |
| **题目（Question）** | id, bank_id, 维度, 题型, 难度, 内容, 参考答案, 评分标准 |
| **面试（Interview）** | id, org_id, candidate_id, position_id, 模式, 状态, 创建人, 时长 |
| **面试记录（InterviewMessage）** | id, interview_id, 角色(AI/候选人/面试官), 内容, 时间戳 |
| **评估报告（Report）** | id, interview_id, 雷达图JSON, 逐题评分[], 综合建议, 推荐等级 |
| **评分（Score）** | id, report_id, question_id, AI评分, 面试官评分, 点评 |

---

## 七、非功能需求

| 维度 | 要求 |
| --- | --- |
| **性能** | AI 单次回复首字延迟 ≤ 2s；页面首屏加载 ≤ 2s；支持 100 并发面试会话 |
| **可用性** | 系统可用性 99.5%；LLM 调用失败自动降级重试 |
| **安全** | 简历与面试数据加密存储；传输 HTTPS；最小权限；操作审计日志 |
| **合规** | 候选人简历使用需授权；数据保留期可配置；支持数据导出与删除（GDPR 友好） |
| **兼容** | Chrome / Edge / Firefox 最新两个大版本；分辨率 ≥1280px |
| **可扩展** | LLM 网关支持多模型切换；题库与报告模型支持自定义维度 |

---

## 八、项目里程碑

| 阶段 | 交付内容 |
| --- | --- |
| **M1：基础底座** | 账号/组织/角色、岗位与候选人管理、简历解析 |
| **M2：面试核心** | 题库 AI 生成、AI 自主面试模式、面试记录 |
| **M3：评估与统计** | 评估报告、雷达图、数据看板、导出分享 |
| **M4：增强体验** | 面试官辅助模式、题库复用、报告人工修正 |

> 具体排期由项目管理阶段结合资源确定，本 PRD 不含时间承诺。

---

## 九、风险与依赖

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| LLM 评分稳定性不足 | 报告可信度下降 | AI 评分仅作参考，面试官保留终评权；持续调优 Prompt |
| 简历解析准确率 | 影响出题质量 | 支持人工校对；解析模型持续训练 |
| 大模型调用成本 | 运营成本上升 | 题库缓存复用；分级调用模型 |
| 数据合规风险 | 法律风险 | 候选人授权机制；数据保留策略 |

---

## 十、附录

### 10.1 术语表
- **JD**：Job Description，岗位描述。
- **雷达图**：多维能力可视化图表。
- **LLM**：Large Language Model，大语言模型。
- **向量库**：用于简历与题库语义相似度检索的存储系统。

### 10.2 待评审问题
1. 是否需要对接企业现有 ATS（招聘管理系统）？建议 V2 开放 API。
2. 候选人端是否需要独立登录入口进行"异步面试"（候选人自行作答）？建议 V2 评估。
3. 是否支持多语言面试？建议 V1 仅中文。

---

## 十一、扩展方案：ATS 对接与异步面试

> 本章节为 V2 规划的详细实现方案，供 V1 架构预留与 V2 落地参考。

### 11.1 ATS 对接方案

#### 11.1.1 对接目标
让企业无需在两个系统间重复维护候选人、岗位、面试进度数据，实现 AI 面试平台与企业现有 ATS（如 Moka、北森、HiBob、Greenhouse、Lever 等）的双向同步。

#### 11.1.2 对接能力矩阵

| 同步方向 | 数据对象 | 触发方式 | 说明 |
| --- | --- | --- | --- |
| ATS → 本系统 | 候选人档案 | Webhook / 定时拉取 | 候选人进入某阶段时自动同步 |
| ATS → 本系统 | 岗位 JD | Webhook / 定时拉取 | 岗位创建/变更时同步 |
| ATS → 本系统 | 简历附件 | 拉取 | 同步候选人时一并拉取 |
| 本系统 → ATS | 面试状态 | 事件回调 | 面试启动/结束同步回 ATS |
| 本系统 → ATS | 评估报告 | 事件回调 | 报告生成后回写候选人备注/自定义字段 |
| 本系统 → ATS | 推荐结论 | 事件回调 | 同步"通过/淘汰"决策到 ATS 阶段流转 |

#### 11.1.3 集成架构

```
┌─────────────┐         Webhook          ┌──────────────────────┐
│   ATS 系统  │ ───────────────────────► │  适配器层（Adapter）  │
│ (Moka/北森) │ ◄─────────────────────── │  统一数据模型转换      │
└─────────────┘      回调(状态/报告)     └──────────┬───────────┘
                                                    │
                              ┌─────────────────────┴──────────────┐
                              │                                      │
                    ┌──────────▼──────────┐         ┌──────────────▼──────────┐
                    │  同步任务队列         │         │  事件分发器（Event Bus）│
                    │  (Celery + Redis)    │         │  对内发布领域事件        │
                    └─────────────────────┘         └─────────────────────────┘
```

#### 11.1.4 适配器层设计（关键）
不同 ATS 厂商接口差异大，采用**适配器 + 统一数据模型**隔离差异：

- **统一数据模型（Canonical Model）**：定义标准化的候选人、岗位、简历、面试、报告字段。
- **适配器接口**：每个 ATS 厂商实现一个 Adapter，包含：
  - `fetch_candidate(ats_candidate_id)` — 拉取候选人
  - `fetch_position(ats_position_id)` — 拉取岗位
  - `push_interview_status(interview)` — 回写面试状态
  - `push_report(report)` — 回写报告
- **配置化接入**：企业管理后台选择 ATS 厂商，填入 API Key / Webhook Secret，即可启用。

#### 11.1.5 适配器接口方法签名细化

> 采用 Python `abc.ABC` 定义抽象基类，统一所有 ATS 厂商适配器的行为契约。方法签名基于后端 Python + FastAPI 技术栈，返回值为「统一数据模型」对象（Pydantic Schema）。

##### 1. 统一数据模型（Canonical Schema）

适配器层所有方法的输入输出均使用以下标准化模型，与厂商原始字段解耦：

```python
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

# ============ 统一枚举 ============
AtsEntityType = Literal["candidate", "position", "resume", "interview", "report"]
SyncDirection = Literal["inbound", "outbound"]
InterviewStatus = Literal["not_started", "in_progress", "paused", "completed", "expired"]
RecommendLevel = Literal["strongly_recommended", "recommended", "pending", "not_recommended"]

# ============ 统一数据模型 ============
class CanonicalCandidate(BaseModel):
    """标准化候选人档案"""
    ats_candidate_id: str                      # ATS 侧候选人唯一 ID
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None               # 渠道来源
    applied_position_id: Optional[str] = None  # 应聘岗位的 ATS ID
    stage: Optional[str] = None                 # ATS 流程阶段
    raw_payload: Optional[dict] = None          # ATS 原始数据（排查/扩展用）

class CanonicalPosition(BaseModel):
    """标准化岗位"""
    ats_position_id: str
    title: str
    department: Optional[str] = None
    jd_text: Optional[str] = None              # JD 原文
    skill_tags: list[str] = Field(default_factory=list)
    headcount: Optional[int] = None
    status: Optional[str] = None               # open / closed / on_hold
    raw_payload: Optional[dict] = None

class CanonicalResume(BaseModel):
    """标准化简历附件"""
    ats_resume_id: str
    ats_candidate_id: str
    file_name: str
    download_url: str                          # ATS 提供的临时下载地址
    mime_type: Optional[str] = None
    uploaded_at: Optional[datetime] = None

class CanonicalInterviewStatus(BaseModel):
    """回写到 ATS 的面试状态"""
    ats_interview_id: Optional[str] = None     # 若 ATS 侧有面试实体
    ats_candidate_id: str
    status: InterviewStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None

class CanonicalReport(BaseModel):
    """回写到 ATS 的评估报告摘要"""
    ats_candidate_id: str
    overall_score: float                       # 0-100 综合分
    radar: dict[str, float]                   # 维度 → 分数
    recommend_level: RecommendLevel
    summary: str                               # AI 综合评语（限 500 字）
    report_url: Optional[str] = None           # 本系统报告链接
    generated_at: datetime
```

##### 2. 抽象适配器基类

```python
from abc import ABC, abstractmethod

class AtsAdapter(ABC):
    """ATS 厂商适配器抽象基类，子类按厂商实现具体调用逻辑。"""

    @property
    @abstractmethod
    def vendor_code(self) -> str:
        """厂商标识，如 'moka' / 'beisen' / 'greenhouse'"""
        ...

    # ---------- 入站：ATS → 本系统 ----------
    @abstractmethod
    async def fetch_candidate(self, ats_candidate_id: str) -> CanonicalCandidate:
        """根据 ATS 候选人 ID 拉取候选人档案"""
        ...

    @abstractmethod
    async def fetch_position(self, ats_position_id: str) -> CanonicalPosition:
        """根据 ATS 岗位 ID 拉取岗位信息"""
        ...

    @abstractmethod
    async def fetch_resume(self, ats_candidate_id: str) -> list[CanonicalResume]:
        """拉取候选人关联的简历附件列表"""
        ...

    @abstractmethod
    async def list_changed_candidates(
        self, since: datetime, page_size: int = 100
    ) -> tuple[list[CanonicalCandidate], Optional[str]]:
        """增量拉取变更候选人，返回 (候选人列表, 下一页游标)"""
        ...

    @abstractmethod
    async def verify_webhook(self, headers: dict, raw_body: bytes) -> bool:
        """校验 ATS Webhook 签名，防伪造"""
        ...

    @abstractmethod
    async def parse_webhook_event(
        self, headers: dict, raw_body: bytes
    ) -> "WebhookEvent":
        """解析 Webhook 载荷为统一事件结构"""
        ...

    # ---------- 出站：本系统 → ATS ----------
    @abstractmethod
    async def push_interview_status(self, payload: CanonicalInterviewStatus) -> bool:
        """回写面试状态到 ATS（候选人阶段流转/备注）"""
        ...

    @abstractmethod
    async def push_report(self, payload: CanonicalReport) -> bool:
        """将评估报告摘要回写到候选人备注或自定义字段"""
        ...

    @abstractmethod
    async def push_decision(
        self, ats_candidate_id: str, decision: RecommendLevel, reason: str
    ) -> bool:
        """将最终推荐结论同步到 ATS，触发候选人阶段流转"""
        ...

    # ---------- 能力探测 ----------
    def supports(self, capability: str) -> bool:
        """声明该厂商是否支持某能力（如 'webhook' / 'resume_download' / 'decision_writeback'）"""
        return capability in self._capabilities()

    def _capabilities(self) -> set[str]:
        """子类覆盖，返回该厂商支持的能力集合"""
        return set()
```

##### 3. Webhook 统一事件结构

```python
class WebhookEvent(BaseModel):
    """Webhook 解析后的统一事件"""
    event_id: str                               # 幂等去重用
    event_type: Literal[
        "candidate.created", "candidate.updated", "candidate.stage_changed",
        "position.created", "position.updated",
        "resume.uploaded",
    ]
    entity_type: AtsEntityType
    entity_id: str
    occurred_at: datetime
    raw_payload: Optional[dict] = None
```

##### 4. 适配器工厂与注册

```python
from typing import Callable

class AtsAdapterFactory:
    """适配器工厂，按厂商标识创建实例并注入凭证"""

    _registry: dict[str, Callable[["AtsCredentials"], "AtsAdapter"]] = {}

    @classmethod
    def register(cls, vendor_code: str):
        """装饰器：注册厂商适配器类"""
        def wrapper(adapter_cls):
            cls._registry[vendor_code] = lambda cred: adapter_cls(cred)
            return adapter_cls
        return wrapper

    @classmethod
    def create(cls, vendor_code: str, credentials: "AtsCredentials") -> "AtsAdapter":
        if vendor_code not in cls._registry:
            raise ValueError(f"不支持的 ATS 厂商: {vendor_code}")
        return cls._registry[vendor_code](credentials)

class AtsCredentials(BaseModel):
    """企业配置的 ATS 接入凭证"""
    vendor_code: str
    api_key: str
    api_secret: Optional[str] = None
    webhook_secret: Optional[str] = None
    base_url: Optional[str] = None              # 私有化部署时覆盖默认域名
    extra: dict = Field(default_factory=dict)   # 厂商专属扩展字段
```

##### 5. 厂商适配器实现示例（Moka）

```python
@AtsAdapterFactory.register("moka")
class MokaAdapter(AtsAdapter):
    def __init__(self, cred: AtsCredentials):
        self.cred = cred
        self._client = MokaApiClient(cred.api_key, cred.base_url)

    @property
    def vendor_code(self) -> str:
        return "moka"

    async def fetch_candidate(self, ats_candidate_id: str) -> CanonicalCandidate:
        raw = await self._client.get_candidate(ats_candidate_id)
        # Moka 字段 → Canonical 字段映射
        return CanonicalCandidate(
            ats_candidate_id=raw["id"],
            name=raw["basicInfo"]["name"],
            email=raw["basicInfo"].get("email"),
            phone=raw["basicInfo"].get("phone"),
            source=raw.get("source"),
            applied_position_id=raw.get("jobId"),
            stage=raw.get("stage"),
            raw_payload=raw,
        )

    async def fetch_position(self, ats_position_id: str) -> CanonicalPosition:
        raw = await self._client.get_position(ats_position_id)
        return CanonicalPosition(
            ats_position_id=raw["id"],
            title=raw["title"],
            department=raw.get("departmentName"),
            jd_text=raw.get("description"),
            skill_tags=raw.get("skillTags", []),
            headcount=raw.get("headcount"),
            status=raw.get("status"),
            raw_payload=raw,
        )

    async def fetch_resume(self, ats_candidate_id: str) -> list[CanonicalResume]:
        raw_list = await self._client.list_resumes(ats_candidate_id)
        return [
            CanonicalResume(
                ats_resume_id=item["id"],
                ats_candidate_id=ats_candidate_id,
                file_name=item["fileName"],
                download_url=item["downloadUrl"],
                mime_type=item.get("mimeType"),
                uploaded_at=item.get("uploadedAt"),
            )
            for item in raw_list
        ]

    async def list_changed_candidates(
        self, since: datetime, page_size: int = 100
    ) -> tuple[list[CanonicalCandidate], Optional[str]]:
        raw_page, next_cursor = await self._client.list_candidates(
            updated_after=since, limit=page_size
        )
        candidates = [self._map_candidate(r) for r in raw_page]
        return candidates, next_cursor

    async def verify_webhook(self, headers: dict, raw_body: bytes) -> bool:
        return MokaWebhookVerifier(self.cred.webhook_secret).verify(headers, raw_body)

    async def parse_webhook_event(
        self, headers: dict, raw_body: bytes
    ) -> WebhookEvent:
        payload = MokaWebhookParser.parse(raw_body)
        return WebhookEvent(
            event_id=payload["eventId"],
            event_type=payload["eventType"],
            entity_type=payload["entityType"],
            entity_id=payload["entityId"],
            occurred_at=payload["occurredAt"],
            raw_payload=payload,
        )

    async def push_interview_status(self, payload: CanonicalInterviewStatus) -> bool:
        return await self._client.update_candidate_stage(
            candidate_id=payload.ats_candidate_id,
            stage=self._map_status_to_stage(payload.status),
            note=f"AI面试状态: {payload.status}",
        )

    async def push_report(self, payload: CanonicalReport) -> bool:
        return await self._client.add_candidate_note(
            candidate_id=payload.ats_candidate_id,
            content=(
                f"AI面试报告\n综合分: {payload.overall_score}\n"
                f"推荐等级: {payload.recommend_level}\n摘要: {payload.summary}\n"
                f"报告链接: {payload.report_url}"
            ),
        )

    async def push_decision(
        self, ats_candidate_id: str, decision: RecommendLevel, reason: str
    ) -> bool:
        return await self._client.move_stage(
            candidate_id=ats_candidate_id,
            target_stage="offer" if decision == "strongly_recommended" else "rejected",
            reason=reason,
        )

    def _capabilities(self) -> set[str]:
        return {"webhook", "resume_download", "decision_writeback"}

    def _map_candidate(self, raw: dict) -> CanonicalCandidate:
        # 内部映射方法（与 fetch_candidate 共用）
        ...
    def _map_status_to_stage(self, status: InterviewStatus) -> str:
        # 本系统状态 → Moka 阶段映射
        ...
```

##### 6. 厂商适配器实现示例（北森 Beisen）

> 北森与 Moka 在 API 鉴权、字段结构、能力支持上差异较大，重点体现「能力降级」与「字段映射」的适配实现。根据 11.1.5 节能力矩阵，北森在「增量变更拉取」「面试状态回写」「决策触发流转」三项能力上受限或缺失。

```python
@AtsAdapterFactory.register("beisen")
class BeisenAdapter(AtsAdapter):
    """北森 ATS 适配器。

    北森开放平台特点：
    1. 鉴权采用 app_id + app_secret 换取 access_token（非 API Key 直传），需处理 token 续期。
    2. 候选人/岗位/简历主数据可拉取，但增量变更接口能力有限（仅支持按 updated_at 过滤，无游标分页）。
    3. Webhook 支持接收，但签名机制为 HMAC-SHA256 + 时间戳防重放。
    4. 面试状态回写不支持（无开放接口），需降级为仅写备注。
    5. 决策流转通过「候选人阶段推进」接口实现，但仅支持预置阶段，自定义阶段不可用。
    """

    # 北森 token 有效期 2 小时，提前 5 分钟续期
    _TOKEN_REFRESH_BUFFER_SECONDS = 300

    def __init__(self, cred: AtsCredentials):
        self.cred = cred
        # 北森凭证从 extra 字段取 app_id / app_secret
        self._app_id = cred.extra["app_id"]
        self._app_secret = cred.extra["app_secret"]
        self._tenant_code = cred.extra.get("tenant_code")  # 北森租户码
        self._base_url = cred.base_url or "https://openapi.beisen.com"
        self._client = httpx.AsyncClient(timeout=30.0)
        self._token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None

    @property
    def vendor_code(self) -> str:
        return "beisen"

    # ---------- 鉴权：token 管理 ----------
    async def _ensure_token(self) -> str:
        """获取或续期 access_token，保证调用前 token 有效。"""
        now = datetime.utcnow()
        if (
            self._token
            and self._token_expires_at
            and now < self._token_expires_at - timedelta(seconds=self._TOKEN_REFRESH_BUFFER_SECONDS)
        ):
            return self._token

        resp = await self._client.post(
            f"{self._base_url}/oauth/token",
            json={
                "app_id": self._app_id,
                "app_secret": self._app_secret,
                "tenant_code": self._tenant_code,
                "grant_type": "client_credentials",
            },
        )
        data = resp.json()
        self._token = data["access_token"]
        self._token_expires_at = now + timedelta(seconds=data["expires_in"])
        return self._token

    async def _request(self, method: str, path: str, **kwargs) -> dict:
        """统一请求封装，自动注入 token 并处理北森错误码。"""
        token = await self._ensure_token()
        headers = kwargs.pop("headers", {})
        headers["Authorization"] = f"Bearer {token}"
        resp = await self._client.request(method, f"{self._base_url}{path}", headers=headers, **kwargs)
        return self._handle_response(resp)

    def _handle_response(self, resp: "httpx.Response") -> dict:
        """统一处理北森响应：错误码 → AtsAdapterError 映射。"""
        if resp.status_code >= 500:
            raise AtsAdapterError(
                code="ATS_UPSTREAM_ERROR",
                vendor_code=self.vendor_code,
                retryable=True,
                detail=f"北森服务异常: {resp.status_code}",
            )
        body = resp.json()
        # 北森业务错误码：code != 200 表示失败
        if body.get("code") != 200:
            err_code = body.get("code")
            retryable = err_code in (429, 504)  # 限流/网关超时可重试
            raise AtsAdapterError(
                code=f"BEISEN_{err_code}",
                vendor_code=self.vendor_code,
                retryable=retryable,
                detail=body.get("message", "北森接口业务错误"),
            )
        return body.get("data", body)

    # ---------- 入站：ATS → 本系统 ----------
    async def fetch_candidate(self, ats_candidate_id: str) -> CanonicalCandidate:
        raw = await self._request("GET", f"/api/v1/candidates/{ats_candidate_id}")
        # 北森字段：候选人在 CandidateBaseInfoVO 节点下
        base = raw.get("CandidateBaseInfoVO", {})
        return CanonicalCandidate(
            ats_candidate_id=str(raw.get("CandidateId") or ats_candidate_id),
            name=base.get("Name", ""),
            email=base.get("Email"),
            phone=base.get("Mobile"),
            source=raw.get("ChannelName"),
            applied_position_id=str(raw["JobId"]) if raw.get("JobId") else None,
            stage=str(raw["StepId"]) if raw.get("StepId") else None,
            raw_payload=raw,
        )

    async def fetch_position(self, ats_position_id: str) -> CanonicalPosition:
        raw = await self._request("GET", f"/api/v1/jobs/{ats_position_id}")
        # 北森字段：岗位在 JobBaseInfoVO 节点下
        base = raw.get("JobBaseInfoVO", {})
        return CanonicalPosition(
            ats_position_id=str(raw.get("JobId") or ats_position_id),
            title=base.get("JobTitle", ""),
            department=raw.get("DepartmentName"),
            jd_text=raw.get("JobDescription"),
            skill_tags=raw.get("SkillTags", []),
            headcount=base.get("HeadCount"),
            status=self._map_position_status(base.get("JobStatus")),
            raw_payload=raw,
        )

    async def fetch_resume(self, ats_candidate_id: str) -> list[CanonicalResume]:
        raw_list = await self._request(
            "GET",
            "/api/v1/candidates/attachments",
            params={"candidateId": ats_candidate_id, "type": "resume"},
        )
        # 北森返回附件列表，每项含 FileId / FileName / DownloadUrl（临时链接，有效期 1 小时）
        return [
            CanonicalResume(
                ats_resume_id=str(item["FileId"]),
                ats_candidate_id=ats_candidate_id,
                file_name=item.get("FileName", ""),
                download_url=item["DownloadUrl"],
                mime_type=item.get("FileType"),
                uploaded_at=self._parse_beisen_time(item.get("UploadTime")),
            )
            for item in raw_list.get("Attachments", [])
        ]

    async def list_changed_candidates(
        self, since: datetime, page_size: int = 100
    ) -> tuple[list[CanonicalCandidate], Optional[str]]:
        """北森增量拉取受限：无游标分页，仅支持 updated_from + page/size 翻页。

        降级方案：
        - 使用 updated_from 参数按修改时间过滤
        - 通过 page 翻页，next_cursor 编码为 "page=N+1" 或 None（无更多）
        """
        # 从 since 推断当前页码（首次调用由上层传入 page=1）
        # 这里返回的 next_cursor 为字符串形式的下一页页码
        params = {
            "updated_from": since.strftime("%Y-%m-%d %H:%M:%S"),
            "page": 1,
            "size": page_size,
        }
        raw = await self._request("GET", "/api/v1/candidates/list", params=params)
        candidates = [self._map_candidate(r) for r in raw.get("Candidates", [])]
        total = raw.get("TotalCount", 0)
        has_more = len(candidates) < total and len(candidates) == page_size
        next_cursor = "2" if has_more else None
        return candidates, next_cursor

    async def verify_webhook(self, headers: dict, raw_body: bytes) -> bool:
        """北森 Webhook 签名校验：HMAC-SHA256 + 时间戳防重放。

        头部字段：
        - X-Beisen-Signature: HMAC-SHA256(secret, timestamp + body)
        - X-Beisen-Timestamp: 发送时间戳（秒）
        """
        signature = headers.get("X-Beisen-Signature", "")
        timestamp = headers.get("X-Beisen-Timestamp", "")
        if not signature or not timestamp:
            return False
        # 防重放：时间戳偏差超过 5 分钟拒绝
        if abs(time.time() - int(timestamp)) > 300:
            return False
        expected = hmac.new(
            self.cred.webhook_secret.encode(),
            (timestamp + raw_body.decode("utf-8")).encode(),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(signature, expected)

    async def parse_webhook_event(
        self, headers: dict, raw_body: bytes
    ) -> WebhookEvent:
        payload = json.loads(raw_body)
        # 北森事件类型映射：beisen_event_type → 统一 event_type
        beisen_type = payload.get("EventType")
        event_type_map = {
            "candidate.add": "candidate.created",
            "candidate.update": "candidate.updated",
            "candidate.stagemove": "candidate.stage_changed",
            "job.add": "position.created",
            "job.update": "position.updated",
            "resume.add": "resume.uploaded",
        }
        unified_type = event_type_map.get(beisen_type)
        if not unified_type:
            raise AtsAdapterError(
                code="UNSUPPORTED_WEBHOOK_EVENT",
                vendor_code=self.vendor_code,
                retryable=False,
                detail=f"北森未支持的事件类型: {beisen_type}",
            )
        return WebhookEvent(
            event_id=payload.get("EventId", f"{beisen_type}-{payload.get('EntityId')}"),
            event_type=unified_type,
            entity_type=self._infer_entity_type(unified_type),
            entity_id=str(payload["EntityId"]),
            occurred_at=self._parse_beisen_time(payload.get("OccurTime")),
            raw_payload=payload,
        )

    # ---------- 出站：本系统 → ATS ----------
    async def push_interview_status(self, payload: CanonicalInterviewStatus) -> bool:
        """北森不支持面试状态回写开放接口 → 降级为写候选人备注。

        通过 supports('interview_status_writeback') 返回 False，
        上层调用前应先探测能力，此处实现为降级兜底。
        """
        if not self.supports("interview_status_writeback"):
            # 降级：仅写备注
            return await self._add_candidate_note(
                payload.ats_candidate_id,
                f"[AI面试状态同步] 状态: {payload.status}，"
                f"开始: {payload.started_at}，结束: {payload.completed_at}",
            )
        return await self._request(
            "POST",
            f"/api/v1/candidates/{payload.ats_candidate_id}/interview-status",
            json={"status": payload.status},
        )

    async def push_report(self, payload: CanonicalReport) -> bool:
        """北森报告回写：写入候选人备注（北森无自定义字段写入能力）。"""
        radar_text = "；".join(f"{k}: {v}" for k, v in payload.radar.items())
        return await self._add_candidate_note(
            payload.ats_candidate_id,
            (
                f"【AI面试报告】\n综合分: {payload.overall_score}\n"
                f"推荐等级: {payload.recommend_level}\n能力维度: {radar_text}\n"
                f"摘要: {payload.summary}\n报告链接: {payload.report_url or '无'}"
            ),
        )

    async def push_decision(
        self, ats_candidate_id: str, decision: RecommendLevel, reason: str
    ) -> bool:
        """北森决策流转：仅支持推进到预置阶段。

        降级规则：
        - strongly_recommended / recommended → 推进到「offer」阶段
        - pending → 不流转，仅写备注
        - not_recommended → 推进到「淘汰」阶段
        """
        if decision == "pending":
            return await self._add_candidate_note(
                ats_candidate_id, f"[决策] 待定。原因: {reason}"
            )
        target_stage = "offer" if decision in ("strongly_recommended", "recommended") else "rejected"
        try:
            return await self._request(
                "POST",
                f"/api/v1/candidates/{ats_candidate_id}/stage/move",
                json={"targetStage": target_stage, "reason": reason},
            )
        except AtsAdapterError as e:
            # 自定义阶段不可用 → 降级写备注
            if e.code == "BEISEN_INVALID_STAGE":
                return await self._add_candidate_note(
                    ats_candidate_id,
                    f"[决策流转降级] 目标阶段 {target_stage} 不可用。推荐: {decision}。原因: {reason}",
                )
            raise

    # ---------- 能力声明 ----------
    def _capabilities(self) -> set[str]:
        # 对比 Moka：北森缺少 interview_status_writeback；decision_writeback 受限
        return {"webhook", "resume_download", "note_writeback", "decision_writeback"}

    # ---------- 内部工具方法 ----------
    async def _add_candidate_note(self, candidate_id: str, content: str) -> bool:
        """写候选人备注（北森通用降级通道）。"""
        return await self._request(
            "POST",
            f"/api/v1/candidates/{candidate_id}/notes",
            json={"content": content},
        )

    def _map_candidate(self, raw: dict) -> CanonicalCandidate:
        base = raw.get("CandidateBaseInfoVO", {})
        return CanonicalCandidate(
            ats_candidate_id=str(raw.get("CandidateId")),
            name=base.get("Name", ""),
            email=base.get("Email"),
            phone=base.get("Mobile"),
            source=raw.get("ChannelName"),
            applied_position_id=str(raw["JobId"]) if raw.get("JobId") else None,
            stage=str(raw["StepId"]) if raw.get("StepId") else None,
            raw_payload=raw,
        )

    def _map_position_status(self, beisen_status: Optional[str]) -> Optional[str]:
        """北森岗位状态码 → 统一状态。"""
        mapping = {"1": "open", "2": "closed", "3": "on_hold"}
        return mapping.get(beisen_status) if beisen_status else None

    def _infer_entity_type(self, event_type: str) -> str:
        if event_type.startswith("candidate"):
            return "candidate"
        if event_type.startswith("position"):
            return "position"
        if event_type.startswith("resume"):
            return "resume"
        return "candidate"

    @staticmethod
    def _parse_beisen_time(value: Optional[str]) -> Optional[datetime]:
        """北森时间格式：'YYYY-MM-DD HH:mm:ss'（北京时间）。"""
        if not value:
            return None
        return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
```

##### 7. Moka 与北森适配器差异对比

| 维度 | Moka | 北森 |
| --- | --- | --- |
| 鉴权 | API Key 直传 Header | app_id + app_secret 换 access_token，需续期 |
| 候选人字段 | `basicInfo.name` | `CandidateBaseInfoVO.Name`（嵌套层级更深） |
| 岗位字段 | `title` / `description` | `JobBaseInfoVO.JobTitle` / `JobDescription` |
| 简历下载 | 临时 URL，长期有效 | 临时 URL，**有效期 1 小时**，需即时下载 |
| 增量拉取 | 游标分页 | 仅 `updated_from` + page 翻页，无游标 |
| Webhook 签名 | 厂商 SDK 校验 | HMAC-SHA256 + 时间戳防重放 |
| 面试状态回写 | ✅ 直接调用阶段流转接口 | ❌ 无开放接口 → 降级写备注 |
| 报告回写 | 候选人备注 | 候选人备注（相同） |
| 决策流转 | 直接 move_stage | 仅支持预置阶段，自定义阶段降级写备注 |
| 能力声明 | `webhook / resume_download / decision_writeback` | `webhook / resume_download / note_writeback / decision_writeback` |

##### 8. 关键设计约定

| 约定 | 说明 |
| --- | --- |
| 异步优先 | 所有方法均为 `async`，适配器内部使用 `httpx.AsyncClient` 调用 ATS HTTP 接口 |
| 异常分层 | 适配器抛 `AtsAdapterError`（含 `code` / `vendor_code` / `retryable`），由上层统一捕获并决定是否重试 |
| 幂等保证 | `push_*` 系列方法需基于 `ats_candidate_id + event_id` 幂等，避免重复写入 ATS |
| 重试边界 | 网络错误 / 5xx → 可重试；4xx（鉴权/参数）→ 不重试，立即告警 |
| 凭证安全 | `AtsCredentials` 在内存中加密存储，日志脱敏（api_key 仅显示前 4 位） |
| 超时控制 | 单次 ATS 调用超时 10s；批量拉取单页超时 30s |
| 字段缺失 | ATS 原始字段缺失时统一返回 `None`，不抛异常；关键标识字段（如 `ats_candidate_id`）缺失才报错 |

##### 9. 适配器能力矩阵（首期支持规划）

| 能力 | Moka | 北森 | Greenhouse | Lever |
| --- | --- | --- | --- | --- |
| 候选人拉取 | ✅ | ✅ | ✅ | ✅ |
| 岗位拉取 | ✅ | ✅ | ✅ | ✅ |
| 简历下载 | ✅ | ✅ | ✅ | ✅ |
| Webhook 接收 | ✅ | ✅ | ✅ | ✅ |
| 增量变更拉取 | ✅ | ⚠️（部分） | ✅ | ✅ |
| 面试状态回写 | ✅ | ❌ | ✅ | ✅ |
| 报告回写备注 | ✅ | ✅ | ✅ | ✅ |
| 决策触发流转 | ✅ | ⚠️（部分） | ✅ | ✅ |

> ✅ 支持 / ⚠️ 受限 / ❌ 不支持（通过 `supports()` 方法在运行时降级）

#### 11.1.6 同步策略

| 场景 | 策略 |
| --- | --- |
| 实时性要求高 | Webhook 推送（ATS → 本系统） |
| 实时性要求一般 | 定时全量/增量拉取（每小时） |
| 数据冲突 | 以 ATS 为候选人/岗位的主数据源，本系统为面试记录主数据源 |
| 失败重试 | 队列任务指数退避重试 3 次，失败告警 |
| 幂等性 | 基于 ATS 实体 ID + 事件 ID 去重 |

#### 11.1.7 V1 架构预留
- 候选人/岗位实体预留 `ats_source`、`ats_entity_id`、`ats_raw_payload` 字段。
- 业务事件（面试启动/结束、报告生成）统一走内部事件总线，便于后续挂接 ATS 回调。
- 简历解析流程支持接收"外部 URL"作为输入，而非仅本地上传。

#### 11.1.8 V2 交付里程碑拆分
| 子阶段 | 交付 |
| --- | --- |
| ATS-1 | 适配器框架 + 统一数据模型 + 1 家厂商（如 Moka）候选人/岗位单向同步 |
| ATS-2 | 简历附件同步 + Webhook 实时推送 |
| ATS-3 | 面试状态/报告/结论回写 ATS |
| ATS-4 | 接入第 2 家厂商 + 企业自助配置接入 |

---

### 11.2 异步面试方案

#### 11.2.1 业务定义
**异步面试**：候选人无需与 AI 在同一时间在线，由系统发送面试邀请链接，候选人在**预约时长窗口内**自行登录、独立完成 AI 文字问答面试。面试结束后系统自动评估并通知 HR。

> 与同步面试的区别：同步面试是 HR 实时旁听 AI 与候选人对话；异步面试是候选人独自完成，HR 事后查看。

#### 11.2.2 适用场景
- 初筛阶段批量筛选大量候选人。
- 跨时区候选人。
- 候选人时间不固定，难以约同步面试。

#### 11.2.3 核心流程

```
[HR 创建异步面试任务]
     │
     ▼
[配置：题库 + 时长 + 有效期窗口 + 限制作答时长]
     │
     ▼
[系统生成候选人专属邀请链接（带 Token）]
     │
     ▼
[发送邀请（邮件 / 短信 / 分享链接）]
     │
     ▼
[候选人点击链接 → 校验 Token → 身份确认]
     │
     ▼
[候选人进入面试房间 → AI 多轮文字问答]
     │  （候选人可暂停，但总时长受限制）
     ▼
[候选人提交结束 / 超时自动收尾]
     │
     ▼
[AI 生成评估报告] ──► [通知 HR 查看报告]
     │
     ▼
[HR 查看报告 + 候选人作答原文] ──► [决策流转]
```

#### 11.2.4 关键设计点

**1. 邀请与鉴权**
- 每个异步面试生成**一次性访问 Token**（JWT，含候选人 ID、面试 ID、有效期）。
- 候选人无需注册本系统账号，凭 Token 进入专属面试页。
- Token 单设备绑定（首次访问记录设备指纹，防止转交）。
- 链接过期前 24 小时自动邮件提醒。

**2. 时长控制**
| 控制项 | 说明 |
| --- | --- |
| 有效窗口 | HR 配置（如：链接生效后 7 天内可用） |
| 单次作答时长 | 例如 45 分钟，从候选人正式开始计 |
| 暂停/恢复 | 允许暂停累计 N 次，总时长扣除暂停时长 |
| 超时处理 | 倒计时归零自动提交当前作答 |

**3. 防作弊机制**
- 离开页面（失焦）次数与时长记录，写入报告。
- 禁止复制粘贴题目内容。
- 可选：开启摄像头快照（每 60s 拍照存档，V2 评估）。
- 文本查重：与公开题库/网络答案相似度检测。

**4. AI 对话策略调整**
- 异步场景下 AI 不做实时流式，但仍采用多轮追问。
- 追问深度限制（每题最多 2 次追问），避免候选人陷入无限循环。
- 题目数量适配时长（如 45 分钟 → 8-10 题）。

**5. 候选人体验**
- 面试开始前：阅读面试说明、测试输入法、确认环境。
- 面试中：右侧展示进度（已答题数/总题数、剩余时长）。
- 面试结束：感谢页 + 预计反馈时间。

#### 11.2.5 前端页面设计
- **候选人端独立路由**（无需登录主系统）：`/interview/async/:token`
- 极简 UI：对话区 + 顶部倒计时 + 右侧进度面板。
- 移动端友好（为 V2 移动端铺垫）。
- 离线保护：网络中断时本地缓存作答内容，恢复后自动同步。

#### 11.2.6 后端实现要点

| 模块 | 要点 |
| --- | --- |
| 鉴权 | Token 校验中间件，独立于企业用户 JWT 体系 |
| 会话 | 异步面试会话状态独立：待开始 / 进行中 / 已暂停 / 已提交 / 已过期 |
| 持久化 | 候选人每条作答实时落库（防丢失），而非会话结束才保存 |
| 通知 | 面试完成 → 事件总线 → 邮件/站内信通知 HR |
| 报告 | 复用同步面试的评估报告生成逻辑，无额外开发 |

#### 11.2.7 数据模型补充

| 新增实体 | 关键字段 |
| --- | --- |
| **异步面试任务（AsyncInterviewTask）** | id, interview_id, token, 有效期起止, 单次时长, 暂停次数上限, 状态 |
| **作答会话（AnswerSession）** | id, task_id, 实际开始时间, 累计暂停时长, 提交时间, 设备指纹 |
| **作答日志（AnswerEvent）** | id, session_id, 事件类型(失焦/恢复/切屏/提交), 时间戳, 元数据 |

#### 11.2.8 V1 架构预留
- 面试实体新增 `mode` 字段取值 `sync` / `async`。
- 面试会话状态机预留"已暂停/已提交/已过期"状态。
- 候选人实体预留 `email` 字段（异步邀请必备）。
- 通知服务抽象（短信/邮件/站内信）从 V1 即统一接口，便于异步场景复用。

#### 11.2.9 V2 交付里程碑拆分
| 子阶段 | 交付 |
| --- | --- |
| ASYNC-1 | 邀请链接 + Token 鉴权 + 候选人端页面 + 基础文字面试 |
| ASYNC-2 | 时长控制 + 暂停恢复 + 超时自动提交 |
| ASYNC-3 | 防作弊（失焦记录、复制限制、查重） |
| ASYNC-4 | 完成通知 + 报告自动推送 + 候选人体验优化 |

---

**文档结束。**
