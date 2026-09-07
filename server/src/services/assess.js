// ==================== 简历测评服务（规则评分 + 职业匹配度） ====================
// 根据简历解析结果，按 6 个维度打分，并计算与目标职业的匹配度

// 各职业关键词池（用于计算职业匹配度）
const POSITION_KEYWORDS = {
  '高级前端工程师': ['Vue3', 'TypeScript', 'Vite', '性能优化', '工程化', 'React', '响应式', '微前端', 'Monorepo', 'Node.js'],
  '后端开发工程师': ['Python', 'FastAPI', 'MySQL', 'Redis', '高并发', 'Java', 'Spring', 'Docker', 'K8s', '微服务'],
  '产品经理': ['PRD', '用户研究', '数据分析', 'B 端产品', 'Axure', '需求分析', '原型设计', '竞品分析', '指标体系', 'A/B测试'],
  '数据分析师': ['SQL', 'Python', '统计学', 'BI', 'Excel', '数据可视化', '指标体系', 'Tableau', 'Pandas', 'ETL'],
  '全栈工程师': ['Vue3', 'Node.js', 'MySQL', 'Docker', 'CI/CD', 'React', 'Express', 'MongoDB', 'Redis', 'Nginx'],
  'UI/UX 设计师': ['Figma', '交互设计', '设计系统', '用户研究', 'Sketch', '用户体验', '视觉设计', '原型设计', '动效', '可用性测试'],
  '前端工程师': ['Vue3', 'TypeScript', 'Vite', '性能优化', '工程化', 'React', '响应式', 'JavaScript', 'CSS', 'HTML']
}

// 通用关键词兜底
const TARGET_KEYWORDS = [
  'Vue3', 'TypeScript', 'Vite', '性能优化', '工程化', '响应式',
  'Node.js', 'MySQL', 'Docker', 'CI/CD', 'Monorepo', '微前端',
  'Redis', 'K8s', '监控', '高并发', '可视化', 'Express'
]

const clamp = (n) => Math.max(40, Math.min(95, Math.round(n)))

// 计算职业匹配度
function calcPositionMatch(skills, position) {
  const pool = POSITION_KEYWORDS[position] || TARGET_KEYWORDS
  const skillText = skills.join(' ')
  const hit = pool.filter(k => skillText.includes(k))
  const miss = pool.filter(k => !skillText.includes(k))
  // 匹配度 = 命中数 / 总数 * 100，结合技能总数做加权
  const ratio = hit.length / pool.length
  const score = clamp(50 + ratio * 40 + Math.min(skills.length, 6) * 2)
  const comment = score >= 80
    ? `与「${position}」高度匹配，已覆盖 ${hit.length}/${pool.length} 个核心关键词。`
    : score >= 60
      ? `与「${position}」基本匹配，命中 ${hit.length}/${pool.length} 个关键词，建议补充 ${miss.slice(0, 3).join('、')}。`
      : `与「${position}」匹配度偏低，仅命中 ${hit.length}/${pool.length} 个关键词，建议重点补充 ${miss.slice(0, 4).join('、')}。`
  return { position, score, hit, miss: miss.slice(0, 6), comment }
}

export function assessResume(resume, position) {
  const parsed = resume.parsed || {}
  const skills = Array.isArray(parsed.skills) ? parsed.skills : []
  const projects = Array.isArray(parsed.projects) ? parsed.projects : []

  // ---- 职业匹配度 ----
  const positionMatch = position ? calcPositionMatch(skills, position) : null

  // ---- 关键词命中（通用） ----
  const skillText = skills.join(' ')
  const pool = POSITION_KEYWORDS[position] || TARGET_KEYWORDS
  const hit = pool.filter(k => skillText.includes(k))
  const miss = pool.filter(k => !skillText.includes(k)).slice(0, 4)
  const keywordScore = clamp(55 + hit.length * 6)

  // ---- 各维度打分 ----
  // 岗位匹配度结合职业匹配度
  const matchScore = positionMatch
    ? clamp(positionMatch.score * 0.6 + (50 + Math.min(skills.length, 8) * 4) * 0.4)
    : clamp(50 + Math.min(skills.length, 8) * 4 + (parsed.workYears >= 3 ? 8 : 0))

  const completeScore = clamp(
    45 + (parsed.education ? 12 : 0) + (projects.length >= 1 ? 10 : 0) +
    (skills.length >= 5 ? 12 : skills.length * 2) + (resume.phone ? 6 : 0)
  )
  const wellStructured = projects.filter(p => p.name && p.role).length
  const structureScore = clamp(55 + wellStructured * 12 + (projects.length >= 2 ? 8 : 0))
  const quantified = projects.filter(p => /\d|%|秒|ms|FPS|QPS|w|万/.test(p.summary || '')).length
  const highlightScore = clamp(50 + quantified * 15 + projects.length * 3)
  const starScore = clamp(45 + quantified * 18 + (projects.some(p => (p.summary || '').length > 20) ? 8 : 0))

  const radar = {
    匹配度: matchScore,
    完整性: completeScore,
    结构性: structureScore,
    亮点度: highlightScore,
    STAR: starScore,
    关键词: keywordScore
  }

  const dim = (name, score) => {
    const commentMap = {
      岗位匹配度: score >= 80 ? '技能栈与目标岗位高度匹配，核心关键词覆盖到位。' : score >= 60 ? '岗位方向基本匹配，部分核心技能关键词可再强化。' : '与目标岗位匹配度偏低，建议补充岗位要求的核心技能。',
      内容完整性: score >= 80 ? '各板块信息完整，信息密度良好。' : score >= 60 ? '基础信息完整，建议补充开源项目/博客等加分板块。' : '信息板块缺失较多，建议补全教育、项目、技能等模块。',
      结构清晰度: score >= 80 ? '项目结构清晰，职责角色明确。' : score >= 60 ? '模块划分合理，项目经验可加强职责-动作-结果层次。' : '结构偏松散，建议按模块重新组织简历内容。',
      亮点呈现: score >= 80 ? '量化结果突出，个人贡献清晰。' : score >= 60 ? '有项目成果但量化不足，建议补充具体数字与影响。' : '缺少量化亮点，建议用数据呈现工作成果。',
      'STAR 完整度': score >= 80 ? '项目描述符合 STAR 结构，复盘有深度。' : score >= 60 ? '项目描述偏概述，建议拆分情境-任务-行动-结果。' : '未体现 STAR 结构，建议按背景-行动-结果重写项目。',
      关键词命中: score >= 80 ? `已命中 ${hit.length} 个核心关键词，过筛表现良好。` : score >= 60 ? `命中 ${hit.length} 个关键词，可补充工程化相关词汇。` : `关键词命中偏少（${hit.length} 个），过筛风险较高。`
    }
    return { name, score, comment: commentMap[name] }
  }

  const dimensions = [
    dim('岗位匹配度', matchScore),
    dim('内容完整性', completeScore),
    dim('结构清晰度', structureScore),
    dim('亮点呈现', highlightScore),
    dim('STAR 完整度', starScore),
    dim('关键词命中', keywordScore)
  ]

  const overallScore = Math.round(
    (matchScore + completeScore + structureScore + highlightScore + starScore + keywordScore) / 6
  )

  const weakest = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 3)
  const suggestions = weakest.map(d => {
    const typeMap = { 'STAR 完整度': '结构', '亮点呈现': '亮点', '关键词命中': '关键词', '内容完整性': '内容', '结构清晰度': '结构', '岗位匹配度': '匹配' }
    const textMap = {
      'STAR 完整度': '项目经验统一使用"背景 → 行动 → 结果"三段式，结果必须带数字。',
      '亮点呈现': '为核心项目补充首屏/帧率/包体积/用户量等可量化指标。',
      '关键词命中': `补充 ${miss.slice(0, 3).join('、') || '工程化'} 等关键词，提升 ATS 过筛率。`,
      '内容完整性': '补充 GitHub、技术博客或开源项目链接，丰富简历板块。',
      '结构清晰度': '项目按"业务背景 → 架构决策 → 上线结果"重新组织。',
      '岗位匹配度': positionMatch
        ? `针对「${position}」JD 调整技能排序，补充 ${positionMatch.miss.slice(0, 3).join('、') || '相关'} 关键词。`
        : '针对目标岗位 JD 调整技能排序与项目侧重。'
    }
    return { type: typeMap[d.name] || '优化', text: textMap[d.name] || '建议针对性优化该维度。' }
  })

  const summary = `整体质量${overallScore >= 80 ? '优秀' : overallScore >= 70 ? '良好' : '有待提升'}：${positionMatch ? `与「${position}」匹配度 ${positionMatch.score} 分，` : ''}主要短板为「${weakest[0].name}」与「${weakest[1].name}」，建议优先打磨项目经验的量化表达与 STAR 结构。`

  const result = {
    overallScore,
    radar,
    dimensions,
    keywords: { hit, miss },
    summary,
    suggestions
  }
  // 职业匹配度作为单独字段（突出展示）
  if (positionMatch) result.positionMatch = positionMatch
  return result
}
