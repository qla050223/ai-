// ==================== 数据库行 → 前端结构 映射（共享） ====================
function parseJson(v, fallback) {
  if (v == null) return fallback
  if (typeof v === 'object') return v
  try { return JSON.parse(v) } catch { return fallback }
}

export function mapResume(row) {
  return {
    id: row.id,
    name: row.name,
    uploadedAt: row.uploaded_at ? String(row.uploaded_at).slice(0, 10) : null,
    isDefault: !!row.is_default,
    parsed: {
      education: row.education || '',
      workYears: row.work_years || 0,
      lastCompany: row.last_company || '',
      skills: parseJson(row.skills, []),
      projects: parseJson(row.projects, [])
    }
  }
}

export function mapCandidate(row, resumes = []) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    avatar: row.avatar || '',
    registeredAt: row.registered_at ? String(row.registered_at).slice(0, 10) : null,
    jobIntention: parseJson(row.intention, {}),
    resumes: resumes.map(mapResume)
  }
}

export function mapPosition(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    skillTags: parseJson(row.skill_tags, []),
    practiceCount: row.practice_count,
    avgScore: row.avg_score,
    description: row.description,
    hot: !!row.hot
  }
}

export function mapInterview(row) {
  return {
    id: row.id,
    type: row.type || 'mock',
    typeId: row.type_id,
    positionTitle: row.position_title,
    date: row.date,
    duration: row.duration,
    overallScore: row.overall_score,
    recommendLevel: row.recommend_level,
    radar: parseJson(row.radar, {}),
    dimensionsCovered: parseJson(row.dimensions_covered, []),
    questionCount: row.question_count,
    summary: row.summary,
    shortboards: parseJson(row.shortboards, [])
  }
}

export function mapOrgUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    roleText: row.role_text,
    orgName: row.org_name
  }
}
