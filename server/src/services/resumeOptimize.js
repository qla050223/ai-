// ==================== AI 改简历服务（详细分段优化 + 完整简历输出） ====================
// 基于简历解析结果，产出两部分：
//   1) sections：详细的分段优化建议 [{ section, original, optimized, rationale, tips[] }]
//   2) fullResume：一份可直接使用的「优化后完整简历」（Markdown 文本，可复制/下载）
// 说明：当前为规则/模板生成（不依赖外部大模型），输出强结构化 JSON，前端直接消费。

// 技能领域分组规则（关键词 → 领域）
const SKILL_GROUPS = [
  { field: '前端开发', keywords: ['Vue', 'React', 'TypeScript', 'JavaScript', 'Vite', 'Webpack', '可视化', 'CSS', 'HTML', 'Sass', 'Less', '微前端', '小程序', 'Taro'] },
  { field: '性能优化', keywords: ['性能优化', '性能', '火焰图', 'Worker', '长任务', '首屏', 'FPS', '加载'] },
  { field: '工程化', keywords: ['CI/CD', 'Monorepo', 'Docker', 'K8s', 'Kubernetes', 'ESLint', '工程化', 'Jenkins', 'Git', 'pnpm'] },
  { field: '后端/数据', keywords: ['Node', 'Express', 'MySQL', 'Redis', 'Python', 'FastAPI', 'Java', 'Go', '微服务', '高并发', 'MongoDB', 'Nginx', 'Linux'] }
]

// 各领域建议补充的 ATS 高频词（原简历未覆盖时追加）
const GROUP_BOOST = {
  前端开发: ['响应式原理', '组件库设计', '浏览器渲染机制'],
  性能优化: ['火焰图分析', '长任务治理', 'Core Web Vitals'],
  工程化: ['Monorepo(pnpm)', 'CI/CD 流水线', '自动化测试'],
  '后端/数据': ['接口契约设计', '监控告警', '缓存策略']
}

// 强力动作动词（让表达更专业）
const ACTION_VERBS = ['主导', '搭建', '重构', '推动', '设计', '落地', '优化', '牵头', '负责', '沉淀']

function groupSkills(skills) {
  const groups = {}
  const used = new Set()
  for (const g of SKILL_GROUPS) {
    const hit = skills.filter(s => {
      if (used.has(s)) return false
      return g.keywords.some(k => s.toLowerCase().includes(k.toLowerCase()))
    })
    if (hit.length) {
      hit.forEach(s => used.add(s))
      const boost = (GROUP_BOOST[g.field] || []).filter(b => !skills.some(s => s.toLowerCase().includes(b.toLowerCase())))
      groups[g.field] = [...hit, ...boost]
    }
  }
  const rest = skills.filter(s => !used.has(s))
  if (rest.length) groups['其他'] = rest
  return groups
}

// 把单个项目重写为 STAR 结构文本
function starProject(proj, idx, skills, company) {
  const name = proj.name || `项目${idx + 1}`
  const role = proj.role || '核心开发'
  const main = skills[idx % Math.max(skills.length, 1)] || '核心技术栈'
  const second = skills[(idx + 1) % Math.max(skills.length, 1)] || '工程化手段'
  return [
    `【${name}】${role}`,
    `• 项目背景：${company ? company + ' ' : ''}该业务面临【具体业务痛点，如页面加载慢、多团队协作效率低、数据看板缺失】，直接影响【用户留存 / 交付效率 / 转化】。`,
    `• 我的职责：作为${role}，负责【模块】的方案设计与落地，对【交付结果 / 线上指标】负责。`,
    `• 关键行动：① 基于 ${main} 主导【重构 / 从零搭建】，解决【具体技术问题】；② 引入 ${second} 优化【性能 / 流程 / 可维护性】；③ 沉淀【组件 / 文档 / 规范】供团队复用。`,
    `• 项目成果：【核心指标】提升【X%，如首屏 3.2s→1.1s、构建耗时下降 40%、FPS 28→55】，并带动【业务结果，如转化率 +5%、需求交付周期缩短 30%】。`
  ].join('\n')
}

export function optimizeResume(resume, ctx = {}) {
  const p = resume.parsed || {}
  const name = ctx.name || '求职者'
  const years = p.workYears || ctx.workYears || 3
  const target = ctx.position || '目标岗位'
  const edu = p.education || ''
  const company = p.lastCompany || ''
  const phone = ctx.phone || '138-XXXX-XXXX'
  const email = ctx.email || 'your@email.com'
  const skills = Array.isArray(p.skills) ? p.skills : []
  const projects = Array.isArray(p.projects) ? p.projects : []
  const groups = groupSkills(skills)
  const eduShort = edu ? edu.split(' ').slice(0, 2).join(' ') : ''

  const sections = []

  // ---------- 1. 求职意向 ----------
  sections.push({
    section: '求职意向',
    original: '（简历中通常缺少明确的求职意向栏）',
    optimized:
      `求职意向：${target}\n` +
      `期望城市：【城市，如 杭州 / 上海】　期望薪资：【X-X K】　到岗时间：【一周内 / 随时】`,
    rationale: 'HR 筛简历第一眼会看"你想做什么、能否匹配在招岗位"。明确的求职意向能让你的简历被精准推送到对应岗位池。',
    tips: ['意向岗位要与投递的 JD 标题一致，便于 ATS 关键词命中', '期望薪资给区间而非固定值，留出谈判空间', '若接受异地/远程，可在此注明，扩大匹配面']
  })

  // ---------- 2. 个人摘要 ----------
  sections.push({
    section: '个人摘要 / 职业概述',
    original: `${name} / ${years} 年经验${company ? ' / ' + company : ''}`,
    optimized:
      `${years} 年${target}经验，${eduShort ? eduShort + '背景，' : ''}` +
      `${company ? '曾任职于 ' + company + '，' : ''}` +
      `精通 ${skills.slice(0, 3).join('、') || '核心技术栈'}，` +
      `具备从需求分析、方案设计到上线运维的完整交付能力。\n` +
      `主导过【1-2 个有量级的项目，如百万级 DAU 产品 / 中后台系统】，擅长【性能优化 / 工程化建设 / 复杂业务抽象】，` +
      `注重代码质量与团队协作，能独立承担核心模块并推动落地。`,
    rationale: '把零散的"姓名/年限/公司"升级为"年限 + 背景 + 技术栈 + 亮点成果"的概述，让 HR 在 6 秒内抓住你的核心竞争力。',
    tips: ['摘要控制在 3-4 行，突出"年限 + 最强技术 + 最大亮点"', '用"精通/熟悉/了解"分层描述技术掌握程度', '量化项目量级（用户数/DAU/团队规模）比形容词更有说服力']
  })

  // ---------- 3. 核心优势 ----------
  const topSkills = skills.slice(0, 4)
  sections.push({
    section: '核心优势 / 个人亮点',
    original: '（简历中通常没有独立的亮点总结）',
    optimized:
      `• 技术深度：精通 ${topSkills.slice(0, 2).join('、') || '核心技术'}，深入理解【底层原理，如响应式原理 / 渲染机制】，能快速定位并解决复杂问题。\n` +
      `• 工程能力：${groups['工程化'] ? '具备 Monorepo、CI/CD、组件库建设等工程化经验' : '具备规范的工程化与代码质量意识'}，推动团队研发效率提升。\n` +
      `• 业务结果：以数据驱动，多个项目取得【可量化成果，如性能提升 X%、效率提升 Y%】。\n` +
      `• 协作影响力：担任过【模块 Owner / 技术分享 / 带教新人】，具备跨团队沟通与推动能力。`,
    rationale: '在简历靠前位置放 3-4 条"差异化优势"，引导面试官围绕你的强项提问，掌握面试主动权。',
    tips: ['每条优势都要"能力 + 证据"，避免空泛的"学习能力强"', '优势要与目标岗位 JD 的要求一一呼应', '放 3-4 条即可，过多会稀释重点']
  })

  // ---------- 4. 工作经历 ----------
  sections.push({
    section: '工作经历',
    original: company ? `${company}　岗位　在职时间（描述较简略）` : '（未规范填写公司 / 时间 / 职责）',
    optimized:
      `${company || '【公司名称】'}　|　${target}　|　【20XX.XX - 至今】\n` +
      `• 负责【业务线 / 系统】的前端研发与架构设计，支撑【业务规模，如 X 个业务方 / 日活 X 万】。\n` +
      `• ${ACTION_VERBS[0]}${topSkills[0] || '核心技术'}技术栈的【重构 / 升级】，使【性能 / 效率指标】提升【X%】。\n` +
      `• 推动【工程化 / 组件库 / 规范】建设，统一团队开发模式，需求交付周期缩短【X%】。\n` +
      `• 与产品、设计、后端紧密协作，保障【X 个】重点项目高质量按期上线。`,
    rationale: '工作经历按"公司 + 岗位 + 时间 + 量化职责"组织，每条职责都用"动作动词 + 做了什么 + 结果"，而不是罗列日常工作。',
    tips: ['时间倒序排列，最近的工作放最前', '每段经历 3-5 条职责，优先写与目标岗位相关的', '用"主导/推动/搭建"等强动词开头，避免"负责/参与"等弱表达', '尽量量化：团队规模、业务量级、提升百分比']
  })

  // ---------- 5. 项目经验（逐项目 STAR） ----------
  const projList = projects.length ? projects : [{ name: '核心项目', role: '核心开发', summary: '' }]
  projList.slice(0, 3).forEach((proj, i) => {
    sections.push({
      section: `项目经验 ${i + 1}｜${proj.name || '核心项目'}`,
      original: proj.summary || '（项目只有一句话描述，缺少背景与成果）',
      optimized: starProject(proj, i, skills, company),
      rationale: '用 STAR（情境-任务-行动-结果）重构项目描述，把"做了什么"升级为"面对什么问题、怎么做、拿到什么结果"。【】内替换为真实数据。',
      tips: [
        '成果一定要量化：性能百分比、用户/数据量级、效率提升、上线项目数',
        '突出"我"的个人贡献，而非整个团队做了什么',
        '技术难点写 1-2 个即可，体现思考深度（为什么这么选型、踩过什么坑）',
        '与目标岗位无关的项目可以精简或删除'
      ]
    })
  })

  // ---------- 6. 专业技能 ----------
  const skillLines = Object.entries(groups).map(([field, list]) => `• ${field}：${list.join('、')}`)
  sections.push({
    section: '专业技能',
    original: skills.join(' / ') || '（未填写技能）',
    optimized: (skillLines.length ? skillLines.join('\n') : '• 请补充你的核心技能栈') +
      `\n• 熟练掌握：${topSkills.slice(0, 2).join('、') || '核心技术'}（能独立架构与排障）\n• 熟悉了解：${skills.slice(2, 6).join('、') || '相关生态工具'}`,
    rationale: '技能按"领域分组 + 掌握程度分层"呈现，可读性更强；自动补充 CI/CD、性能、监控等 ATS 高频词，提升机器筛选过筛率。',
    tips: ['按"精通/熟练/了解"分层，诚实但有策略地突出强项', '技能关键词尽量覆盖 JD 中出现的技术名词', '不要堆砌没用过的技术，面试容易被追问穿帮', '把最相关、最强的技能放最前面']
  })

  // ---------- 7. 教育背景 ----------
  sections.push({
    section: '教育背景',
    original: edu || '（未规范填写学校 / 专业 / 学历 / 时间）',
    optimized:
      `${edu ? edu.split(' ')[0] : '【学校名称】'}　|　${edu.includes('硕士') || edu.includes('博士') ? '硕士/博士' : edu.includes('大专') ? '大专' : '本科'}　|　【专业】　|　【20XX.09 - 20XX.06】\n` +
      `• 主修课程：【与岗位相关的 3-4 门核心课程】\n` +
      `• 在校荣誉：【奖学金 / 竞赛 / GPA 前 X%，如有则写，无则省略】`,
    rationale: '教育背景格式统一为"学校 + 学历 + 专业 + 时间"；工作 3 年以上可精简，应届生则补充课程与荣誉。',
    tips: ['工作经验丰富后，教育背景放简历靠后并精简', '985/211/硕士等亮点可适当突出', '应届生可加 GPA、奖学金、相关竞赛；社招一般省略']
  })

  // ---------- 8. 自我评价 ----------
  sections.push({
    section: '自我评价',
    original: '（常见问题："性格开朗、学习能力强、能吃苦耐劳"等空话）',
    optimized:
      `• ${years} 年${target}经验，技术栈全面，能独立负责核心模块从 0 到 1 的设计与落地。\n` +
      `• 结果导向，习惯用数据衡量工作价值，主导的优化项目均有明确的指标提升。\n` +
      `• 关注技术前沿，持续学习${skills[1] || '新技术'}并在团队内部分享，带动团队技术氛围。\n` +
      `• 沟通协作能力强，能高效对接产品、设计与后端，推动跨团队项目落地。`,
    rationale: '自我评价避免性格形容词，改为"经验背书 + 工作方式 + 软技能佐证"，每条都能在面试中举例证明。',
    tips: ['删掉"性格开朗、吃苦耐劳"这类无信息量的套话', '自我评价是摘要的补充，不要与前面内容重复', '3-4 条即可，围绕"技术 + 结果 + 协作"展开']
  })

  // ==================== 组装完整简历（Markdown） ====================
  const fullResume = buildFullResume({
    name, target, years, phone, email, edu, company, skills, groups, projects, topSkills
  })

  return { sections, fullResume }
}

// 生成一份结构完整、可直接使用的优化后简历（Markdown）
function buildFullResume({ name, target, years, phone, email, edu, company, skills, groups, projects, topSkills }) {
  const eduSchool = edu ? edu.split(' ')[0] : '【学校名称】'
  const degree = /硕士|博士/.test(edu) ? '硕士' : /大专/.test(edu) ? '大专' : '本科'
  const skillBlock = Object.entries(groups)
    .map(([field, list]) => `- **${field}**：${list.join('、')}`)
    .join('\n')
  const projBlock = (projects.length ? projects : [{ name: '核心项目', role: '核心开发' }]).slice(0, 3)
    .map((proj, i) => {
      const main = skills[i % Math.max(skills.length, 1)] || '核心技术栈'
      return [
        `### ${proj.name || '核心项目'}　|　${proj.role || '核心开发'}　|　【20XX.XX - 20XX.XX】`,
        `- **项目背景**：${company ? company + ' ' : ''}【业务场景】中存在【痛点】，影响【业务指标】。`,
        `- **技术栈**：${main}${skills[i + 1] ? '、' + skills[(i + 1) % skills.length] : ''}`,
        `- **我的职责**：负责【核心模块】的方案设计与开发，对【交付结果】负责。`,
        `- **关键行动**：基于 ${main} 主导【重构/搭建】，引入【技术手段】解决【具体问题】。`,
        `- **项目成果**：【核心指标】提升【X%】，带动【业务结果】。`
      ].join('\n')
    }).join('\n\n')

  return `# ${name}

**求职意向**：${target}　|　**经验**：${years} 年　|　**电话**：${phone}　|　**邮箱**：${email}
**期望城市**：【城市】　|　**期望薪资**：【X-X K】　|　**到岗时间**：【一周内】

---

## 个人摘要

${years} 年${target}经验，${edu ? edu.split(' ').slice(0, 2).join(' ') + '背景，' : ''}${company ? '曾任职于 ' + company + '，' : ''}精通 ${topSkills.slice(0, 3).join('、') || '核心技术栈'}，具备从需求分析、方案设计到上线运维的完整交付能力。主导过【百万级 DAU 产品 / 核心中后台系统】，擅长【性能优化 / 工程化建设 / 复杂业务抽象】，注重代码质量与团队协作。

## 核心优势

- **技术深度**：精通 ${topSkills.slice(0, 2).join('、') || '核心技术'}，深入理解底层原理，能快速定位并解决复杂技术问题。
- **工程能力**：${groups['工程化'] ? '具备 Monorepo、CI/CD、组件库建设等完整工程化经验' : '具备规范的工程化与代码质量意识'}，有效提升团队研发效率。
- **业务结果**：数据驱动，多个项目取得可量化的性能与效率提升成果。
- **协作影响**：担任过模块 Owner，具备跨团队沟通、技术分享与带教能力。

## 工作经历

### ${company || '【公司名称】'}　|　${target}　|　【20XX.XX - 至今】

- 负责【业务线 / 系统】的研发与架构设计，支撑【X 个业务方 / 日活 X 万】。
- ${ACTION_VERBS[0]}${topSkills[0] || '核心技术'}技术栈的重构与升级，使【性能 / 效率指标】提升【X%】。
- 推动【工程化 / 组件库 / 规范】建设，统一团队开发模式，需求交付周期缩短【X%】。
- 与产品、设计、后端紧密协作，保障重点项目高质量按期上线。

## 项目经验

${projBlock}

## 专业技能

${skillBlock || '- 请补充核心技能栈'}
- **掌握程度**：精通 ${topSkills.slice(0, 2).join('、') || '核心技术'}（独立架构与排障）；熟悉 ${skills.slice(2, 6).join('、') || '相关生态工具'}。

## 教育背景

### ${eduSchool}　|　${degree}　|　【专业】　|　【20XX.09 - 20XX.06】

- 主修课程：【与岗位相关的 3-4 门核心课程】
- 在校荣誉：【奖学金 / 竞赛 / GPA，如有】

## 自我评价

- ${years} 年${target}经验，技术栈全面，能独立负责核心模块从 0 到 1 的设计与落地。
- 结果导向，习惯用数据衡量工作价值，主导的优化项目均有明确指标提升。
- 关注技术前沿，持续学习并在团队内部分享，带动团队技术氛围。
- 沟通协作能力强，能高效推动跨团队项目落地。

---

> 📌 使用说明：本简历由 AI 基于你的简历生成，**【】内为需要替换为你真实信息的占位符**，请逐条补全后再投递。
`
}
