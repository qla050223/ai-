// ==================== Mock 数据（基于 PRD 数据模型） ====================
// 企业
export const organization = {
  id: 'org_001',
  name: '云图科技有限公司',
  industry: '互联网/科技',
  scale: '200-500人',
  plan: '企业专业版',
  createdAt: '2025-06-01'
}

// 当前登录用户
export const currentUser = {
  id: 'u_001',
  name: '林书豪',
  email: 'linshuhao@yuntu.com',
  role: 'hr_admin',
  roleText: 'HR 管理员',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20HR%20manager%20avatar%20minimal%20flat%20illustration%20blue%20background&image_size=square_hd'
}

// 成员列表
export const members = [
  { id: 'u_001', name: '林书豪', email: 'linshuhao@yuntu.com', role: 'hr_admin', roleText: 'HR 管理员', status: 'active', joinedAt: '2025-06-01' },
  { id: 'u_002', name: '陈晓薇', email: 'chenxiaowei@yuntu.com', role: 'interviewer', roleText: '面试官', status: 'active', joinedAt: '2025-06-05' },
  { id: 'u_003', name: '王哲彦', email: 'wangzheyan@yuntu.com', role: 'interviewer', roleText: '面试官', status: 'active', joinedAt: '2025-06-10' },
  { id: 'u_004', name: '赵敏', email: 'zhaomin@yuntu.com', role: 'hiring_manager', roleText: '用人经理', status: 'active', joinedAt: '2025-06-12' },
  { id: 'u_005', name: '刘思源', email: 'liusiyuan@yuntu.com', role: 'member', roleText: '普通成员', status: 'inactive', joinedAt: '2025-07-01' }
]

// 岗位 JD
export const positions = [
  {
    id: 'p_001',
    title: '高级前端工程师',
    department: '技术部 / 前端组',
    jdText: '负责公司核心 SaaS 产品的 Web 前端研发。要求精通 Vue3 全家桶，深入理解响应式原理与组件化架构；主导过中大型项目的性能优化与工程化建设；具备良好的跨团队协作与 Code Review 经验。',
    skillTags: ['Vue3', 'TypeScript', 'Vite', 'Pinia', '性能优化', '工程化', '可视化', 'Node.js'],
    difficulty: '高级',
    headcount: 2,
    status: 'open',
    createdAt: '2026-08-10',
    template: false,
    structuredSkills: [
      { skill: 'Vue3 响应式原理', weight: '高' },
      { skill: '组件设计与复用', weight: '高' },
      { skill: '前端工程化(Vite/Monorepo)', weight: '中' },
      { skill: '性能优化手段', weight: '高' },
      { skill: 'TypeScript 类型体系', weight: '中' }
    ]
  },
  {
    id: 'p_002',
    title: '后端开发工程师',
    department: '技术部 / 平台组',
    jdText: '负责后端服务的设计与开发，要求精通 Python + FastAPI，熟悉微服务架构、分布式系统设计，有高并发场景处理经验，熟练使用 MySQL、Redis、消息队列。',
    skillTags: ['Python', 'FastAPI', 'MySQL', 'Redis', '微服务', '分布式', '高并发'],
    difficulty: '中级',
    headcount: 3,
    status: 'open',
    createdAt: '2026-08-15',
    template: false,
    structuredSkills: [
      { skill: 'FastAPI 异步编程', weight: '高' },
      { skill: '数据库设计与调优', weight: '高' },
      { skill: '微服务拆分与治理', weight: '中' },
      { skill: '缓存与消息队列', weight: '中' }
    ]
  },
  {
    id: 'p_003',
    title: '产品经理',
    department: '产品部',
    jdText: '负责 B 端 SaaS 产品的规划与设计，要求 3 年以上 toB 产品经验，能独立完成需求调研、PRD 撰写、原型设计，具备数据驱动决策能力。',
    skillTags: ['产品规划', 'PRD', '用户研究', '数据分析', 'B端产品', '原型设计'],
    difficulty: '中级',
    headcount: 1,
    status: 'on_hold',
    createdAt: '2026-07-20',
    template: true,
    structuredSkills: [
      { skill: '需求洞察与拆解', weight: '高' },
      { skill: 'PRD 撰写', weight: '高' },
      { skill: '数据驱动决策', weight: '中' },
      { skill: 'B 端产品思维', weight: '高' }
    ]
  },
  {
    id: 'p_004',
    title: '数据分析师',
    department: '数据部',
    jdText: '负责业务数据分析与可视化体系建设，要求熟练使用 SQL、Python，掌握统计学基础，有 BI 工具使用经验。',
    skillTags: ['SQL', 'Python', '统计学', 'BI', '数据可视化', '业务建模'],
    difficulty: '中级',
    headcount: 2,
    status: 'open',
    createdAt: '2026-08-20',
    template: false,
    structuredSkills: [
      { skill: 'SQL 复杂查询', weight: '高' },
      { skill: '业务指标体系', weight: '高' },
      { skill: '数据可视化', weight: '中' }
    ]
  }
]

// 候选人
export const candidates = [
  {
    id: 'c_001',
    name: '张明远',
    email: 'zhangmingyuan@email.com',
    phone: '138****6621',
    appliedPositionId: 'p_001',
    positionTitle: '高级前端工程师',
    source: '内推',
    status: 'interviewing',
    stage: '二面',
    createdAt: '2026-08-25',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20young%20asian%20man%20software%20engineer%20avatar%20flat%20minimal&image_size=square_hd',
    resumeParsed: {
      education: '浙江大学 计算机科学 硕士 2022',
      workYears: 4,
      lastCompany: '字节跳动',
      skills: ['Vue3', 'TypeScript', 'Vite', 'Node.js', '可视化'],
      projects: [
        { name: '飞书文档表格模块', role: '前端负责人', summary: '主导表格渲染性能优化，FPS 从 30 提升至 55' },
        { name: '内部 BI 平台', role: '核心开发', summary: '基于 Vue3 + ECharts 构建可视化看板' }
      ]
    }
  },
  {
    id: 'c_002',
    name: '李静雯',
    email: 'lijingwen@email.com',
    phone: '139****8834',
    appliedPositionId: 'p_001',
    positionTitle: '高级前端工程师',
    source: '猎头',
    status: 'pending_eval',
    stage: '待评估',
    createdAt: '2026-08-28',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20young%20woman%20engineer%20avatar%20flat%20minimal%20illustration&image_size=square_hd',
    resumeParsed: {
      education: '上海交通大学 软件工程 本科 2020',
      workYears: 6,
      lastCompany: '阿里巴巴',
      skills: ['Vue3', 'React', 'Webpack', '微前端', '性能优化'],
      projects: [
        { name: '支付宝商家平台', role: '高级前端', summary: '主导微前端架构落地，支撑 10+ 子应用' }
      ]
    }
  },
  {
    id: 'c_003',
    name: '周昊',
    email: 'zhouhao@email.com',
    phone: '137****2298',
    appliedPositionId: 'p_002',
    positionTitle: '后端开发工程师',
    source: '招聘平台',
    status: 'passed',
    stage: '已通过',
    createdAt: '2026-08-18',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20backend%20developer%20avatar%20flat%20illustration&image_size=square_hd',
    resumeParsed: {
      education: '南京大学 软件工程 硕士 2021',
      workYears: 5,
      lastCompany: '美团',
      skills: ['Python', 'FastAPI', 'MySQL', 'Redis', 'Kafka'],
      projects: [
        { name: '配送调度系统', role: '后端负责人', summary: 'QPS 从 2k 提升至 1.2w，可用性 99.99%' }
      ]
    }
  },
  {
    id: 'c_004',
    name: '孙雨萱',
    email: 'sunyuxuan@email.com',
    phone: '136****5512',
    appliedPositionId: 'p_003',
    positionTitle: '产品经理',
    source: '内推',
    status: 'pending',
    stage: '待面试',
    createdAt: '2026-09-01',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20young%20woman%20product%20manager%20avatar%20flat%20illustration&image_size=square_hd',
    resumeParsed: {
      education: '复旦大学 工商管理 本科 2019',
      workYears: 5,
      lastCompany: '腾讯',
      skills: ['产品规划', 'PRD', '用户研究', 'SQL'],
      projects: [
        { name: '企业微信行业方案', role: '产品经理', summary: '完成 3 个行业解决方案从 0 到 1' }
      ]
    }
  },
  {
    id: 'c_005',
    name: '吴俊豪',
    email: 'wujunhao@email.com',
    phone: '135****7745',
    appliedPositionId: 'p_001',
    positionTitle: '高级前端工程师',
    source: '招聘平台',
    status: 'rejected',
    stage: '已淘汰',
    createdAt: '2026-08-22',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20young%20man%20developer%20avatar%20flat%20illustration&image_size=square_hd',
    resumeParsed: {
      education: '华中科技大学 计算机 本科 2021',
      workYears: 3,
      lastCompany: '拼多多',
      skills: ['Vue2', 'JavaScript', 'jQuery'],
      projects: [{ name: '商家后台', role: '前端开发', summary: '日常迭代维护' }]
    }
  },
  {
    id: 'c_006',
    name: '郑雅琴',
    email: 'zhengyaqin@email.com',
    phone: '134****3387',
    appliedPositionId: 'p_004',
    positionTitle: '数据分析师',
    source: '猎头',
    status: 'interviewing',
    stage: '一面',
    createdAt: '2026-09-02',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20data%20analyst%20avatar%20flat%20illustration&image_size=square_hd',
    resumeParsed: {
      education: '人民大学 统计学 硕士 2022',
      workYears: 3,
      lastCompany: '京东',
      skills: ['SQL', 'Python', 'Tableau', '统计学'],
      projects: [{ name: '用户增长分析平台', role: '数据分析', summary: '搭建 AARRR 指标体系' }]
    }
  }
]

export const candidateStatusMap = {
  pending: { label: '待面试', type: 'default' },
  interviewing: { label: '面试中', type: 'info' },
  pending_eval: { label: '待评估', type: 'warning' },
  passed: { label: '已通过', type: 'success' },
  rejected: { label: '已淘汰', type: 'error' },
  pending_decision: { label: '待定', type: 'default' }
}

// 题库
export const questionBank = [
  {
    id: 'qb_001',
    positionId: 'p_001',
    positionTitle: '高级前端工程师',
    source: 'auto',
    createdAt: '2026-08-25',
    questions: [
      {
        id: 'q_001',
        dimension: '专业技能',
        skill: 'Vue3 响应式原理',
        type: '开放题',
        difficulty: '中等',
        content: '请详细说明 Vue3 中 ref 与 reactive 的区别，以及它们各自的响应式原理。什么场景下应该使用哪个？',
        referencePoints: ['ref 用于基本类型/对象，reactive 用于对象', 'ref 通过对象包装 RefImpl，访问需 .value', 'reactive 基于 Proxy 深度响应', 'reactive 解构会失去响应性', '场景选择原则'],
        scoreStandard: {
          excellent: '能讲清 Proxy 机制、依赖收集与触发，对比 Vue2 差异',
          qualified: '能说出基本用法差异与常见场景',
          unqualified: '概念混淆或仅停留在 API 使用层面'
        },
        followUps: ['为什么 reactive 解构会丢失响应性？如何解决？', 'shallowRef 和 shallowReactive 的应用场景？'],
        usageCount: 12,
        avgScore: 78
      },
      {
        id: 'q_002',
        dimension: '专业技能',
        skill: '组件设计与复用',
        type: '场景题',
        difficulty: '困难',
        content: '设计一个可复用的表格组件，需要支持动态列、自定义渲染、分页、排序、行展开。你会如何设计其 Props 和插槽？',
        referencePoints: ['columns 配置化', '作用域插槽自定义单元格', 'v-model 双向绑定分页', '透传 attrs/emits', '组件复合而非继承'],
        scoreStandard: {
          excellent: '考虑可扩展性、类型推导、性能与无障碍',
          qualified: '能给出合理的 props 与插槽设计',
          unqualified: '设计混乱或遗漏关键能力'
        },
        followUps: ['如何处理 10000 行数据的渲染性能？', '如何实现单元格编辑联动校验？'],
        usageCount: 8,
        avgScore: 72
      },
      {
        id: 'q_003',
        dimension: '项目经验',
        skill: '性能优化',
        type: '项目题',
        difficulty: '困难',
        content: '简历中提到飞书文档表格性能优化，FPS 从 30 提升到 55。请还原这次优化的完整路径：如何定位瓶颈、采取了哪些手段、如何度量结果？',
        referencePoints: ['Performance 火焰图定位', '虚拟滚动', '时间切片/防抖', '减少重排重绘', 'Worker 卸载计算', '量化指标对比'],
        scoreStandard: {
          excellent: '具备完整性能分析方法论与可量化结果',
          qualified: '能讲清主要优化方向与结果',
          unqualified: '仅罗列零散优化点，缺乏体系'
        },
        followUps: ['如果数据量再翻 10 倍，你的方案还能支撑吗？', '如何建立性能监控的长效机制？'],
        usageCount: 5,
        avgScore: 80
      },
      {
        id: 'q_004',
        dimension: '逻辑思维',
        skill: '工程化',
        type: '场景题',
        difficulty: '中等',
        content: '团队要从单仓库迁移到 Monorepo（pnpm workspace）。你会如何规划这次迁移？需要考虑哪些风险？',
        referencePoints: ['分阶段迁移策略', '依赖版本统一', '构建缓存(Turbo/Nx)', 'CI 流水线调整', '发布流程变更', '回滚预案'],
        scoreStandard: {
          excellent: '有完整迁移方案、风险预案与度量',
          qualified: '能识别关键步骤与风险',
          unqualified: '仅停留在工具层面'
        },
        followUps: ['如何处理跨包类型共享？', 'Monorepo 下 CI 如何提速？'],
        usageCount: 3,
        avgScore: 75
      },
      {
        id: 'q_005',
        dimension: '沟通表达',
        skill: '协作',
        type: '行为题',
        difficulty: '简单',
        content: '请举一个你和后端协作过程中出现分歧的例子，你是如何沟通并最终达成一致的？',
        referencePoints: ['STAR 结构清晰', '分歧点客观陈述', '沟通手段', '达成共识的结果', '复盘反思'],
        scoreStandard: {
          excellent: '结构完整、有同理心、能复盘改进',
          qualified: '能清晰描述事件经过',
          unqualified: '描述散乱或推卸责任'
        },
        followUps: ['如果当时没达成一致你会怎么办？'],
        usageCount: 15,
        avgScore: 76
      },
      {
        id: 'q_006',
        dimension: '文化匹配',
        skill: '学习能力',
        type: '行为题',
        difficulty: '简单',
        content: '近半年你主动学习了什么新技术？是如何学习的？',
        referencePoints: ['具体技术', '学习路径', '产出/落地', '对团队的反哺'],
        scoreStandard: {
          excellent: '有体系学习路径并落地分享',
          qualified: '能说出学习内容与方式',
          unqualified: '泛泛而谈无具体内容'
        },
        followUps: ['学习过程中遇到的最大障碍是什么？'],
        usageCount: 10,
        avgScore: 82
      }
    ]
  }
]

// 面试记录
export const interviews = [
  {
    id: 'i_001',
    candidateId: 'c_001',
    candidateName: '张明远',
    positionId: 'p_001',
    positionTitle: '高级前端工程师',
    mode: 'ai_auto',
    modeText: 'AI 自主面试',
    status: 'completed',
    statusText: '已结束',
    duration: 32,
    focusDimensions: ['专业技能', '项目经验', '逻辑思维', '沟通表达'],
    createdBy: '林书豪',
    createdAt: '2026-08-26 10:00',
    startedAt: '2026-08-26 10:05',
    completedAt: '2026-08-26 10:37',
    questionBankId: 'qb_001',
    messages: []
  },
  {
    id: 'i_002',
    candidateId: 'c_002',
    candidateName: '李静雯',
    positionId: 'p_001',
    positionTitle: '高级前端工程师',
    mode: 'assist',
    modeText: '面试官辅助',
    status: 'in_progress',
    statusText: '进行中',
    duration: 25,
    focusDimensions: ['专业技能', '项目经验'],
    createdBy: '陈晓薇',
    createdAt: '2026-09-03 14:00',
    startedAt: '2026-09-03 14:02',
    completedAt: null,
    questionBankId: 'qb_001',
    messages: []
  },
  {
    id: 'i_003',
    candidateId: 'c_003',
    candidateName: '周昊',
    positionId: 'p_002',
    positionTitle: '后端开发工程师',
    mode: 'ai_auto',
    modeText: 'AI 自主面试',
    status: 'completed',
    statusText: '已结束',
    duration: 38,
    focusDimensions: ['专业技能', '项目经验', '逻辑思维', '文化匹配'],
    createdBy: '林书豪',
    createdAt: '2026-08-19 15:00',
    startedAt: '2026-08-19 15:03',
    completedAt: '2026-08-19 15:41',
    questionBankId: null,
    messages: []
  },
  {
    id: 'i_004',
    candidateId: 'c_006',
    candidateName: '郑雅琴',
    positionId: 'p_004',
    positionTitle: '数据分析师',
    mode: 'ai_auto',
    modeText: 'AI 自主面试',
    status: 'not_started',
    statusText: '未开始',
    duration: 30,
    focusDimensions: ['专业技能', '逻辑思维', '沟通表达'],
    createdBy: '林书豪',
    createdAt: '2026-09-02 18:00',
    startedAt: null,
    completedAt: null,
    questionBankId: null,
    messages: []
  }
]

export const interviewStatusMap = {
  not_started: { label: '未开始', type: 'default' },
  in_progress: { label: '进行中', type: 'info' },
  paused: { label: '已暂停', type: 'warning' },
  completed: { label: '已结束', type: 'success' },
  expired: { label: '已过期', type: 'error' }
}

export const interviewModeMap = {
  ai_auto: { label: 'AI 自主面试', desc: 'AI 扮演面试官，全程多轮问答并动态追问' },
  assist: { label: '面试官辅助', desc: '面试官主导对话，AI 提供题目与评分辅助' }
}

// 评估报告
export const reports = [
  {
    id: 'r_001',
    interviewId: 'i_001',
    candidateId: 'c_001',
    candidateName: '张明远',
    positionTitle: '高级前端工程师',
    overallScore: 82,
    recommendLevel: 'recommended',
    radar: {
      专业技能: 85,
      项目经验: 88,
      逻辑思维: 80,
      沟通表达: 78,
      学习能力: 84,
      文化匹配: 76
    },
    summary: '候选人前端基础扎实，对 Vue3 响应式与性能优化有深入理解并能给出量化结果，项目经验丰富且具备体系化思维。沟通表达清晰，逻辑连贯。建议重点考察其在跨团队协作与团队文化适配方面的表现。',
    generatedAt: '2026-08-26 10:40',
    revised: false,
    scores: [
      {
        questionId: 'q_001',
        questionTitle: 'ref 与 reactive 区别及响应式原理',
        candidateAnswer: 'ref 用于基本类型，reactive 用于对象。ref 包了一层对象需 .value 访问，reactive 基于 Proxy 实现深度响应。场景上我一般基本类型用 ref，复杂对象用 reactive...',
        aiScore: 85,
        interviewerScore: 85,
        comment: '回答准确，能讲到 Proxy 依赖收集，但未对比 Vue2 差异'
      },
      {
        questionId: 'q_003',
        questionTitle: '飞书表格性能优化路径',
        candidateAnswer: '先用 Performance 火焰图定位渲染瓶颈在同步计算与频繁重绘，随后引入虚拟滚动+时间切片，FPS 从 30 提到 55，并通过 Lighthouse 建立长期监控...',
        aiScore: 90,
        interviewerScore: 92,
        comment: '方法论完整，有量化结果与长效机制'
      },
      {
        questionId: 'q_005',
        questionTitle: '与后端协作分歧案例',
        candidateAnswer: '在一次接口字段约定上与后端有分歧，我组织了会议对齐业务语义，最终采用前后端共维护一份 schema...',
        aiScore: 72,
        interviewerScore: 70,
        comment: '事件描述清晰，但复盘深度可加强'
      }
    ],
    suggestions: {
      candidate: '建议加强跨团队协作中的同理心表达，复盘时可引入更系统的沟通框架（如非暴力沟通）。',
      recruiter: '建议推进至下一轮，重点考察团队文化适配与高压场景下的决策。培养成本较低，可快速上手 Vue3 项目。',
      training: '入职后可参与工程化建设方向，发挥其性能优化与体系化思维优势。'
    }
  },
  {
    id: 'r_002',
    interviewId: 'i_003',
    candidateId: 'c_003',
    candidateName: '周昊',
    positionTitle: '后端开发工程师',
    overallScore: 88,
    recommendLevel: 'strongly_recommended',
    radar: {
      专业技能: 90,
      项目经验: 92,
      逻辑思维: 85,
      沟通表达: 82,
      学习能力: 86,
      文化匹配: 88
    },
    summary: '候选人后端功底深厚，高并发场景经验突出，有完整的可用性建设与量化结果。逻辑严密，沟通顺畅。强烈推荐推进。',
    generatedAt: '2026-08-19 15:45',
    revised: true,
    scores: [
      {
        questionId: null,
        questionTitle: '配送调度系统高并发优化',
        candidateAnswer: '从 2k QPS 提到 1.2w，主要做了读写分离、缓存预热、限流降级与异步化...',
        aiScore: 92,
        interviewerScore: 95,
        comment: '体系完整，有结果有取舍'
      }
    ],
    suggestions: {
      candidate: '建议补充分布式事务与一致性方向的深度储备。',
      recruiter: '强烈推荐推进 offer，候选人与岗位匹配度极高，培养成本低。',
      training: '可作为后端方向 Tech Lead 储备培养。'
    }
  }
]

export const recommendLevelMap = {
  strongly_recommended: { label: '强烈推荐', type: 'success' },
  recommended: { label: '推荐', type: 'info' },
  pending: { label: '待定', type: 'warning' },
  not_recommended: { label: '不推荐', type: 'error' }
}

// 数据看板统计
export const dashboardStats = {
  totalInterviews: 48,
  totalCandidates: 126,
  passRate: 38,
  avgScore: 76.5,
  // 近 7 天面试趋势
  trend: {
    dates: ['08-29', '08-30', '08-31', '09-01', '09-02', '09-03', '09-04'],
    interviews: [4, 6, 3, 8, 5, 7, 2],
    passes: [1, 3, 1, 4, 2, 3, 1]
  },
  // 按岗位分布
  byPosition: [
    { name: '高级前端工程师', value: 18 },
    { name: '后端开发工程师', value: 15 },
    { name: '产品经理', value: 8 },
    { name: '数据分析师', value: 7 }
  ],
  // 按面试官分布
  byInterviewer: [
    { name: '林书豪', value: 22 },
    { name: '陈晓薇', value: 14 },
    { name: '王哲彦', value: 12 }
  ]
}

// 高潜力人才
export const talents = [
  { candidateId: 'c_003', name: '周昊', position: '后端开发工程师', score: 88, level: 'strongly_recommended', status: 'passed' },
  { candidateId: 'c_001', name: '张明远', position: '高级前端工程师', score: 82, level: 'recommended', status: 'interviewing' }
]
