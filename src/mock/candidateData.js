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
