// ==================== 求职者端 Mock 数据 ====================
// 对应求职者端 PRD 第四章功能模块

// 当前登录的求职者
export const currentCandidate = {
  id: 'ca_001',
  name: '陆星河',
  email: 'luxinghe@email.com',
  phone: '138****2233',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20young%20asian%20job%20seeker%20avatar%20flat%20minimal%20illustration&image_size=square_hd',
  registeredAt: '2026-08-01',
  jobIntention: {
    position: '高级前端工程师',
    city: '杭州',
    salary: '25-40K',
    workYears: 4
  },
  resumes: [
    {
      id: 'rs_001',
      name: '前端版简历',
      uploadedAt: '2026-08-15',
      isDefault: true,
      parsed: {
        education: '浙江大学 计算机科学 硕士 2022',
        workYears: 4,
        lastCompany: '网易',
        skills: ['Vue3', 'TypeScript', 'Vite', 'Node.js', '可视化'],
        projects: [
          { name: '云音乐播放器', role: '前端负责人', summary: '主导音频可视化与性能优化' }
        ]
      }
    },
    {
      id: 'rs_002',
      name: '全栈版简历',
      uploadedAt: '2026-08-20',
      isDefault: false,
      parsed: {
        education: '浙江大学 计算机科学 硕士 2022',
        workYears: 4,
        lastCompany: '网易',
        skills: ['Vue3', 'Node.js', 'Express', 'MySQL', 'Docker'],
        projects: [
          { name: '内部 B 端平台', role: '全栈', summary: '从 0 搭建前后端架构' }
        ]
      }
    }
  ]
}

// 公共岗位题库（求职者端可练习的岗位）
export const mockPositions = [
  {
    id: 'mp_001',
    title: '高级前端工程师',
    category: '前端',
    difficulty: '高级',
    skillTags: ['Vue3', 'TypeScript', 'Vite', '性能优化', '工程化'],
    practiceCount: 1280,
    avgScore: 72,
    description: '考察 Vue3 响应式、组件设计、性能优化、工程化等核心能力',
    hot: true
  },
  {
    id: 'mp_002',
    title: '后端开发工程师',
    category: '后端',
    difficulty: '中级',
    skillTags: ['Python', 'FastAPI', 'MySQL', 'Redis', '高并发'],
    practiceCount: 960,
    avgScore: 68,
    description: '考察后端架构、数据库设计、分布式与高并发处理',
    hot: true
  },
  {
    id: 'mp_003',
    title: '产品经理',
    category: '产品',
    difficulty: '中级',
    skillTags: ['PRD', '用户研究', '数据分析', 'B 端产品'],
    practiceCount: 720,
    avgScore: 70,
    description: '考察需求洞察、PRD 撰写、数据驱动决策',
    hot: false
  },
  {
    id: 'mp_004',
    title: '数据分析师',
    category: '数据',
    difficulty: '中级',
    skillTags: ['SQL', 'Python', '统计学', 'BI'],
    practiceCount: 540,
    avgScore: 74,
    description: '考察 SQL 复杂查询、业务指标体系、数据可视化',
    hot: false
  },
  {
    id: 'mp_005',
    title: '全栈工程师',
    category: '前端',
    difficulty: '高级',
    skillTags: ['Vue3', 'Node.js', 'MySQL', 'Docker', 'CI/CD'],
    practiceCount: 380,
    avgScore: 66,
    description: '考察前后端全链路开发与工程化能力',
    hot: false
  },
  {
    id: 'mp_006',
    title: 'UI/UX 设计师',
    category: '设计',
    difficulty: '中级',
    skillTags: ['Figma', '交互设计', '设计系统', '用户研究'],
    practiceCount: 420,
    avgScore: 71,
    description: '考察设计思维、交互逻辑、设计系统建设',
    hot: false
  }
]

// 求职者的历史模拟练习记录
export const mockInterviews = [
  {
    id: 'mi_001',
    type: 'mock',
    typeId: 'mp_001',
    positionTitle: '高级前端工程师',
    date: '2026-09-02 20:15',
    duration: 30,
    overallScore: 78,
    recommendLevel: 'recommended',
    radar: { 专业技能: 82, 项目经验: 80, 逻辑思维: 75, 沟通表达: 72, 学习能力: 85, 文化匹配: 74 },
    dimensionsCovered: ['专业技能', '项目经验', '逻辑思维', '沟通表达'],
    questionCount: 8,
    summary: '前端基础扎实，Vue3 响应式理解到位。性能优化有量化结果，但工程化体系性可加强。',
    shortboards: ['工程化', '跨团队协作']
  },
  {
    id: 'mi_002',
    type: 'mock',
    typeId: 'mp_001',
    positionTitle: '高级前端工程师',
    date: '2026-08-28 19:30',
    duration: 30,
    overallScore: 72,
    recommendLevel: 'recommended',
    radar: { 专业技能: 75, 项目经验: 78, 逻辑思维: 70, 沟通表达: 68, 学习能力: 80, 文化匹配: 70 },
    dimensionsCovered: ['专业技能', '项目经验', '逻辑思维'],
    questionCount: 7,
    summary: '基础概念清晰，但项目复盘深度不足，缺少量化结果。',
    shortboards: ['项目复盘深度', '量化表达']
  },
  {
    id: 'mi_003',
    type: 'mock',
    typeId: 'mp_005',
    positionTitle: '全栈工程师',
    date: '2026-08-20 21:00',
    duration: 45,
    overallScore: 68,
    recommendLevel: 'pending',
    radar: { 专业技能: 65, 项目经验: 72, 逻辑思维: 68, 沟通表达: 70, 学习能力: 75, 文化匹配: 66 },
    dimensionsCovered: ['专业技能', '项目经验', '逻辑思维', '沟通表达', '文化匹配'],
    questionCount: 10,
    summary: '全栈视野不错，但后端深度储备不足，分布式场景需加强。',
    shortboards: ['后端深度', '分布式']
  },
  {
    id: 'mi_004',
    type: 'mock',
    typeId: 'mp_001',
    positionTitle: '高级前端工程师',
    date: '2026-08-10 20:00',
    duration: 30,
    overallScore: 65,
    recommendLevel: 'pending',
    radar: { 专业技能: 68, 项目经验: 65, 逻辑思维: 62, 沟通表达: 66, 学习能力: 72, 文化匹配: 64 },
    dimensionsCovered: ['专业技能', '项目经验', '沟通表达'],
    questionCount: 6,
    summary: '首次练习，概念掌握尚可，但表达不够结构化。',
    shortboards: ['结构化表达', '性能优化']
  }
]

// 企业异步面试邀请（被动入口）
export const asyncInvitations = [
  {
    id: 'ai_001',
    token: 'mock_token_yuntu_zhangmingyuan_001',
    orgName: '云图科技有限公司',
    orgLogo: '🎯',
    positionTitle: '高级前端工程师',
    candidateName: '陆星河',
    duration: 45,
    validFrom: '2026-09-03 00:00',
    validUntil: '2026-09-10 23:59',
    status: 'pending',
    questionCount: 10,
    focusDimensions: ['专业技能', '项目经验', '逻辑思维', '沟通表达'],
    interviewId: 'ai_interview_001',
    reportVisibility: 'summary'
  }
]

// 异步面试对话流（候选人视角，复用 aiSimulator 风格）
export const asyncInterviewFlows = [
  {
    stage: 'opening',
    aiSay: '你好，陆星河。我是云图科技的 AI 面试官，今天由我与你进行本次面试。\n\n本次面试约 45 分钟，覆盖专业技能、项目经验、逻辑思维、沟通表达等维度。过程中你可以随时思考，回答完毕后回复"好的，下一题"我将推进后续问题。\n\n准备好了我们就开始：首先请用 1 分钟做个简短的自我介绍，重点放在你的前端技术栈与近期项目。'
  },
  {
    stage: 'q1',
    aiSay: '感谢介绍。我们直接进入技术部分。\n\nVue3 的响应式是核心，请详细说明 ref 与 reactive 的区别，以及它们各自的响应式原理。什么场景下应该使用哪个？',
    questionId: 'aq_001',
    dimension: '专业技能'
  },
  {
    stage: 'q1_followup',
    aiSay: '你提到 reactive 解构会丢失响应性，能否进一步说明原因？使用 toRefs 又是如何解决的？',
    questionId: 'aq_001',
    dimension: '专业技能',
    isFollowUp: true
  },
  {
    stage: 'q2',
    aiSay: '理解得很清晰。接下来看你的项目：简历中提到云音乐播放器的可视化与性能优化，请还原这次优化的完整路径——如何定位瓶颈、采取了哪些手段、如何度量结果？',
    questionId: 'aq_002',
    dimension: '项目经验'
  },
  {
    stage: 'q2_followup',
    aiSay: '如果数据量再翻 10 倍，你的方案还能支撑吗？你会从哪些维度重新设计？',
    questionId: 'aq_002',
    dimension: '项目经验',
    isFollowUp: true
  },
  {
    stage: 'q3',
    aiSay: '非常好。换个工程化角度：团队要从单仓库迁移到 Monorepo（pnpm workspace），你会如何规划？需要考虑哪些风险？',
    questionId: 'aq_003',
    dimension: '逻辑思维'
  },
  {
    stage: 'q4',
    aiSay: '最后聊聊协作：请举一个你和后端协作过程中出现分歧的例子，你是如何沟通并最终达成一致的？',
    questionId: 'aq_004',
    dimension: '沟通表达'
  },
  {
    stage: 'closing',
    aiSay: '回答很有体系。今天的面试就到这里，我来做一个简要反馈：\n\n- Vue3 响应式：理解到位，能讲到 Proxy 依赖收集\n- 性能优化：方法论完整，有量化结果\n- 工程化：考虑到了风险与回滚，思路清晰\n- 协作：事件描述清晰，复盘深度可加强\n\n整体表现良好。感谢你的时间，结果将在 3 个工作日内由 HR 同步给你。你有什么想问我的吗？',
    isClosing: true
  }
]

// 数据授权记录
export const dataConsents = [
  {
    id: 'dc_001',
    orgId: 'org_001',
    orgName: '云图科技有限公司',
    type: '异步面试',
    consentAt: '2026-09-03 10:00',
    status: 'active',
    scope: '简历使用、面试作答、评估报告',
    canRevoke: true
  },
  {
    id: 'dc_002',
    orgId: 'org_002',
    orgName: '字节跳动',
    type: '简历查阅',
    consentAt: '2026-08-15 14:30',
    status: 'revoked',
    scope: '简历查阅',
    canRevoke: false,
    revokedAt: '2026-08-25 09:00'
  }
]

// 能力成长曲线（按时间维度）
export const abilityGrowth = {
  '专业技能': [
    { date: '08-10', score: 68 },
    { date: '08-20', score: 65 },
    { date: '08-28', score: 75 },
    { date: '09-02', score: 82 }
  ],
  '项目经验': [
    { date: '08-10', score: 65 },
    { date: '08-20', score: 72 },
    { date: '08-28', score: 78 },
    { date: '09-02', score: 80 }
  ],
  '逻辑思维': [
    { date: '08-10', score: 62 },
    { date: '08-20', score: 68 },
    { date: '08-28', score: 70 },
    { date: '09-02', score: 75 }
  ],
  '沟通表达': [
    { date: '08-10', score: 66 },
    { date: '08-20', score: 70 },
    { date: '08-28', score: 68 },
    { date: '09-02', score: 72 }
  ]
}

// 短板诊断结果
export const shortboardDiagnosis = {
  top3: [
    { dimension: '工程化', score: 58, suggestion: '建议练习 3 场工程化专项，覆盖 Monorepo/CI/构建优化' },
    { dimension: '跨团队协作', score: 62, suggestion: '建议练习 2 场行为题，强化 STAR 结构与复盘' },
    { dimension: '性能监控长效机制', score: 64, suggestion: '建议练习 1 场项目题，深度复盘监控体系' }
  ],
  strengths: [
    { dimension: 'Vue3 响应式', score: 85 },
    { dimension: '学习能力', score: 85 }
  ],
  trend: 'up',
  trendValue: '+13',
  totalPractices: 4
}

export const recommendLevelMap = {
  strongly_recommended: { label: '强烈推荐', type: 'success' },
  recommended: { label: '推荐', type: 'info' },
  pending: { label: '待定', type: 'warning' },
  not_recommended: { label: '不推荐', type: 'error' }
}

export const dimensionOptions = [
  { label: '专业技能', value: '专业技能' },
  { label: '项目经验', value: '项目经验' },
  { label: '逻辑思维', value: '逻辑思维' },
  { label: '沟通表达', value: '沟通表达' },
  { label: '学习能力', value: '学习能力' },
  { label: '文化匹配', value: '文化匹配' }
]

// ==================== 简历测评 Mock ====================
// 简历测评维度雷达图数据（按简历 id 缓存结果）
export const resumeAssessResults = {
  rs_001: {
    overallScore: 76,
    radar: { 匹配度: 82, 完整性: 70, 结构性: 78, 亮点度: 68, STAR: 64, 关键词: 85 },
    dimensions: [
      { name: '岗位匹配度', score: 82, comment: '技能栈与高级前端岗位高度匹配，Vue3/性能优化等关键词覆盖到位。' },
      { name: '内容完整性', score: 70, comment: '缺少近期培训、开源贡献等板块，建议补充 GitHub 链接与个人项目。' },
      { name: '结构清晰度', score: 78, comment: '模块划分合理，但"项目经验"缺少职责-动作-结果的递进层次。' },
      { name: '亮点呈现', score: 68, comment: '量化结果偏少，建议把"主导""优化"等动作后补具体数字与影响。' },
      { name: 'STAR 完整度', score: 64, comment: '项目描述多为概述，未拆分情境-任务-行动-结果，复盘深度不足。' },
      { name: '关键词命中', score: 85, comment: '响应式、Proxy、性能优化等 ATS 关键词命中良好。' }
    ],
    keywords: { hit: ['Vue3', '性能优化', '响应式', 'TypeScript', '可视化'], miss: ['CI/CD', 'Monorepo', '微前端', '工程化体系'] },
    summary: '整体质量良好，岗位匹配度高，但亮点呈现与 STAR 结构是主要短板，建议优先打磨项目经验的量化表达。',
    suggestions: [
      { type: '结构', text: '项目经验统一使用"背景 → 行动 → 结果"三段式，结果必须带数字。' },
      { type: '亮点', text: '把云音乐可视化项目提到首位，补充首屏/帧率/包体积等具体指标。' },
      { type: '关键词', text: '补充 CI/CD、Monorepo 等工程化关键词，提升 ATS 过筛率。' }
    ]
  },
  rs_002: {
    overallScore: 71,
    radar: { 匹配度: 75, 完整性: 72, 结构性: 74, 亮点度: 66, STAR: 60, 关键词: 78 },
    dimensions: [
      { name: '岗位匹配度', score: 75, comment: '全栈方向匹配良好，前端深度略弱于后端。' },
      { name: '内容完整性', score: 72, comment: '基础信息完整，建议补充技术博客或开源项目链接。' },
      { name: '结构清晰度', score: 74, comment: '前后端分离清晰，但项目时间线略凌乱。' },
      { name: '亮点呈现', score: 66, comment: '从 0 搭建的故事有张力，但缺少用户量、QPS 等业务结果。' },
      { name: 'STAR 完整度', score: 60, comment: '全栈项目描述偏流水账，未体现你的不可替代性。' },
      { name: '关键词命中', score: 78, comment: 'Docker、MySQL 等命中良好，可补充 K8s、监控等关键词。' }
    ],
    keywords: { hit: ['Vue3', 'Node.js', 'Express', 'MySQL', 'Docker'], miss: ['K8s', '监控', '高并发', '微服务'] },
    summary: '全栈视野是优势，但项目复盘深度与量化表达是主要短板，建议强化业务结果与架构决策的呈现。',
    suggestions: [
      { type: '结构', text: 'B 端平台项目按"业务背景 → 架构决策 → 上线结果"重新组织。' },
      { type: '亮点', text: '补充 DAU、接口响应时间、迭代提速等可量化指标。' },
      { type: '关键词', text: '补 K8s、Prometheus 等关键词，提升中高级岗位过筛率。' }
    ]
  }
}

// ==================== AI 帮你改简历 Mock ====================
// AI 改简历：分段优化建议流（流式输出模拟）
export const resumeOptimizeFlow = {
  rs_001: [
    {
      section: '个人信息 / 摘要',
      original: '陆星河 / 4 年前端 / 浙大硕士',
      optimized: '陆星河｜高级前端工程师｜4 年经验\n浙大计算机硕士 · 前端工程化 & 性能优化方向 · 累计服务 MAU 2000w+ 产品',
      rationale: '将"摘要"升级为"定位 + 方向 + 量化背书"三段式，让 HR 6 秒内抓住你的核心竞争力。'
    },
    {
      section: '项目经验① 云音乐播放器',
      original: '主导音频可视化与性能优化',
      optimized: '【云音乐播放器】前端负责人 · 2024.03–2025.06\n• 背景：DAU 800w 的播放器首屏 3.2s、滚动 FPS 28，影响留存。\n• 行动：① 用 Web Audio + Canvas 重构可视化，Worker 化计算；② 路由分包 + 图片懒加载，首屏体积 -42%。\n• 结果：首屏 3.2s → 1.1s，FPS 28 → 55，次留 +3.2%。',
      rationale: '补全 STAR 结构，把模糊的"优化"落到具体动作 + 可量化结果，是高级岗最看重的表达。'
    },
    {
      section: '技能栈',
      original: 'Vue3 / TypeScript / Vite / Node.js / 可视化',
      optimized: '• 前端：Vue3(响应式/Composition API) · TypeScript · Vite · Webpack\n• 性能：首屏优化 · 火焰图分析 · Worker · 长任务治理\n• 工程化：Monorepo(pnpm) · CI/CD · ESLint 自动化\n• 后端：Node.js · Express · MySQL',
      rationale: '把技能按"领域 + 关键词"分组，并显式加入 CI/CD、Monorepo 等 ATS 高频词，提升机器过筛率。'
    }
  ],
  rs_002: [
    {
      section: '个人信息 / 摘要',
      original: '陆星河 / 全栈 / 浙大硕士',
      optimized: '陆星河｜全栈工程师｜4 年经验\n浙大计算机硕士 · 前后端全链路 · 主导 B 端平台从 0 到 1 服务 200+ 内部用户',
      rationale: '补充"全链路 + 从 0 到 1 + 用户量级"三段定位，让全栈价值一眼可见。'
    },
    {
      section: '项目经验① B 端平台',
      original: '从 0 搭建前后端架构',
      optimized: '【内部 B 端平台】全栈负责人 · 2023.05–2024.02\n• 背景：旧系统迭代慢、接口响应 1.2s，影响 5 个业务方效率。\n• 行动：① 前端 Vue3 + Vite 工程化；② 后端 Node + Express 分层 + Redis 缓存；③ 统一 JSON Schema 规范。\n• 结果：接口响应 1.2s → 280ms，迭代周期 2 周 → 3 天，覆盖 5 个业务方 200+ 用户。',
      rationale: '把"从 0 搭建"升级为完整 STAR，并补充响应时间、迭代周期等可量化指标。'
    },
    {
      section: '技能栈',
      original: 'Vue3 / Node.js / Express / MySQL / Docker',
      optimized: '• 前端：Vue3 · TypeScript · Vite\n• 后端：Node.js · Express · MySQL · Redis\n• 运维：Docker · K8s · Prometheus · CI/CD\n• 全栈：JSON Schema 规范 · 接口契约 · 监控告警',
      rationale: '补 K8s、Prometheus 等中高级岗位关键词，强化"全栈 + 运维"复合能力。'
    }
  ]
}
