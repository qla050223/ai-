// ==================== AI 改简历服务（结构化分段优化） ====================
// 基于简历解析结果，产出与前端同构的分段优化建议：
// [{ section, original, optimized, rationale }]
// 说明：当前为规则/模板生成（不依赖外部大模型），输出强结构化 JSON，前端直接消费。

// 技能领域分组规则（关键词 → 领域）
const SKILL_GROUPS = [
  { field: '前端', keywords: ['Vue', 'React', 'TypeScript', 'JavaScript', 'Vite', 'Webpack', '可视化', 'CSS', 'HTML', '微前端'] },
  { field: '性能', keywords: ['性能优化', '性能', '火焰图', 'Worker', '长任务', '首屏'] },
  { field: '工程化', keywords: ['CI/CD', 'Monorepo', 'Docker', 'K8s', 'ESLint', '工程化', 'Jenkins'] },
  { field: '后端', keywords: ['Node', 'Express', 'MySQL', 'Redis', 'Python', 'FastAPI', 'Java', 'Go', '微服务', '高并发'] }
]

// 各领域建议补充的 ATS 高频词（原简历未覆盖时追加）
const GROUP_BOOST = {
  前端: ['响应式原理', '组件设计'],
  性能: ['火焰图分析', '长任务治理'],
  工程化: ['Monorepo(pnpm)', 'CI/CD 流水线'],
  后端: ['接口契约', '监控告警']
}

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
      // 追加该领域推荐词（去重、且不与原技能重复）
      const boost = (GROUP_BOOST[g.field] || []).filter(b => !skills.some(s => s.toLowerCase().includes(b.toLowerCase())))
      groups[g.field] = [...hit, ...boost]
    }
  }
  // 未归类技能放入"其他"
  const rest = skills.filter(s => !used.has(s))
  if (rest.length) groups['其他'] = rest
  return groups
}

export function optimizeResume(resume, ctx = {}) {
  const p = resume.parsed || {}
  const name = ctx.name || '求职者'
  const years = p.workYears || ctx.workYears || 3
  const target = ctx.position || '目标岗位'
  const edu = p.education || ''
  const company = p.lastCompany || ''
  const skills = Array.isArray(p.skills) ? p.skills : []
  const projects = Array.isArray(p.projects) ? p.projects : []
  const proj = projects[0]

  const sections = []

  // ---------- 1. 个人摘要 ----------
  const eduShort = edu ? edu.split(' ').slice(0, 2).join(' ') : ''
  sections.push({
    section: '个人信息 / 摘要',
    original: `${name} / ${years} 年经验${company ? ' / ' + company : ''}`,
    optimized:
      `${name}｜${target}｜${years} 年经验\n` +
      `${eduShort ? eduShort + ' · ' : ''}${company ? company + ' 背景 · ' : ''}` +
      `专注${target}方向，具备从需求到上线的完整交付经验`,
    rationale: '把零散的"姓名/年限/公司"升级为"定位 + 方向 + 背书"三段式摘要，让 HR 在 6 秒内抓住你的核心竞争力。'
  })

  // ---------- 2. 核心项目（STAR 重构） ----------
  if (proj) {
    const mainSkill = skills[0] || '核心技术栈'
    sections.push({
      section: `项目经验① ${proj.name || '核心项目'}`,
      original: proj.summary || '（项目一句话描述）',
      optimized:
        `【${proj.name || '核心项目'}】${proj.role || '核心成员'} · 在职周期\n` +
        `• 背景：${company ? company + ' ' : ''}该业务存在【性能/效率痛点，如首屏慢、迭代慢】，影响【留存/交付效率】。\n` +
        `• 行动：① 基于 ${mainSkill} 主导【重构/搭建】，解决【具体问题】；② 引入【${skills[1] || '工程化手段'}】优化【流程/性能】。\n` +
        `• 结果：【关键指标】提升【X%，如首屏 3.2s→1.1s、FPS 28→55】，带动【业务指标，如次留 +3%】。`,
      rationale: '补全 STAR（情境-任务-行动-结果）结构，把模糊的"做了什么"落到"动作 + 可量化结果"。【】内请替换为你的真实数据，这是高级岗最看重的表达。'
    })
  }

  // ---------- 3. 技能栈分组 + ATS 关键词 ----------
  const groups = groupSkills(skills)
  const optimizedSkills = Object.entries(groups)
    .map(([field, list]) => `• ${field}：${list.join(' · ')}`)
    .join('\n')
  sections.push({
    section: '技能栈',
    original: skills.join(' / ') || '（未填写技能）',
    optimized: optimizedSkills || '• 请补充你的核心技能栈',
    rationale: '把技能按"领域 + 关键词"分组，可读性更强；并自动补充 CI/CD、Monorepo、监控等 ATS 高频词，提升机器简历筛选的过筛率。'
  })

  return sections
}
