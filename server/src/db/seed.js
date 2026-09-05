// ==================== 种子数据 ====================
// 首次启动时灌入演示数据；已有数据则跳过（幂等）
import bcrypt from 'bcryptjs'
import { pool } from '../config/db.js'

const DEMO_PASSWORD = 'demo1234'

const positions = [
  { id: 'mp_001', title: '高级前端工程师', category: '前端', difficulty: '高级', skillTags: ['Vue3', 'TypeScript', 'Vite', '性能优化', '工程化'], practiceCount: 1280, avgScore: 72, description: '考察 Vue3 响应式、组件设计、性能优化、工程化等核心能力', hot: 1 },
  { id: 'mp_002', title: '后端开发工程师', category: '后端', difficulty: '中级', skillTags: ['Python', 'FastAPI', 'MySQL', 'Redis', '高并发'], practiceCount: 960, avgScore: 68, description: '考察后端架构、数据库设计、分布式与高并发处理', hot: 1 },
  { id: 'mp_003', title: '产品经理', category: '产品', difficulty: '中级', skillTags: ['PRD', '用户研究', '数据分析', 'B 端产品'], practiceCount: 720, avgScore: 70, description: '考察需求洞察、PRD 撰写、数据驱动决策', hot: 0 },
  { id: 'mp_004', title: '数据分析师', category: '数据', difficulty: '中级', skillTags: ['SQL', 'Python', '统计学', 'BI'], practiceCount: 540, avgScore: 74, description: '考察 SQL 复杂查询、业务指标体系、数据可视化', hot: 0 },
  { id: 'mp_005', title: '全栈工程师', category: '前端', difficulty: '高级', skillTags: ['Vue3', 'Node.js', 'MySQL', 'Docker', 'CI/CD'], practiceCount: 380, avgScore: 66, description: '考察前后端全链路开发与工程化能力', hot: 0 },
  { id: 'mp_006', title: 'UI/UX 设计师', category: '设计', difficulty: '中级', skillTags: ['Figma', '交互设计', '设计系统', '用户研究'], practiceCount: 420, avgScore: 71, description: '考察设计思维、交互逻辑、设计系统建设', hot: 0 }
]

const candidate = {
  id: 'ca_001',
  name: '陆星河',
  email: 'luxinghe@email.com',
  phone: '138****2233',
  avatar: '',
  registeredAt: '2026-08-01',
  intention: { position: '高级前端工程师', city: '杭州', salary: '25-40K', workYears: 4 }
}

const resumes = [
  {
    id: 'rs_001', name: '前端版简历', uploadedAt: '2026-08-15', isDefault: 1,
    education: '浙江大学 计算机科学 硕士 2022', workYears: 4, lastCompany: '网易',
    skills: ['Vue3', 'TypeScript', 'Vite', 'Node.js', '可视化'],
    projects: [{ name: '云音乐播放器', role: '前端负责人', summary: '主导音频可视化与性能优化' }]
  },
  {
    id: 'rs_002', name: '全栈版简历', uploadedAt: '2026-08-20', isDefault: 0,
    education: '浙江大学 计算机科学 硕士 2022', workYears: 4, lastCompany: '网易',
    skills: ['Vue3', 'Node.js', 'Express', 'MySQL', 'Docker'],
    projects: [{ name: '内部 B 端平台', role: '全栈', summary: '从 0 搭建前后端架构' }]
  }
]

const interviews = [
  { id: 'mi_001', typeId: 'mp_001', positionTitle: '高级前端工程师', date: '2026-09-02 20:15', duration: 30, overallScore: 78, recommendLevel: 'recommended', radar: { 专业技能: 82, 项目经验: 80, 逻辑思维: 75, 沟通表达: 72, 学习能力: 85, 文化匹配: 74 }, dimensionsCovered: ['专业技能', '项目经验', '逻辑思维', '沟通表达'], questionCount: 8, summary: '前端基础扎实，Vue3 响应式理解到位。性能优化有量化结果，但工程化体系性可加强。', shortboards: ['工程化', '跨团队协作'] },
  { id: 'mi_002', typeId: 'mp_001', positionTitle: '高级前端工程师', date: '2026-08-28 19:30', duration: 30, overallScore: 72, recommendLevel: 'recommended', radar: { 专业技能: 75, 项目经验: 78, 逻辑思维: 70, 沟通表达: 68, 学习能力: 80, 文化匹配: 70 }, dimensionsCovered: ['专业技能', '项目经验', '逻辑思维'], questionCount: 7, summary: '基础概念清晰，但项目复盘深度不足，缺少量化结果。', shortboards: ['项目复盘深度', '量化表达'] },
  { id: 'mi_003', typeId: 'mp_005', positionTitle: '全栈工程师', date: '2026-08-20 21:00', duration: 45, overallScore: 68, recommendLevel: 'pending', radar: { 专业技能: 65, 项目经验: 72, 逻辑思维: 68, 沟通表达: 70, 学习能力: 75, 文化匹配: 66 }, dimensionsCovered: ['专业技能', '项目经验', '逻辑思维', '沟通表达', '文化匹配'], questionCount: 10, summary: '全栈视野不错，但后端深度储备不足，分布式场景需加强。', shortboards: ['后端深度', '分布式'] },
  { id: 'mi_004', typeId: 'mp_001', positionTitle: '高级前端工程师', date: '2026-08-10 20:00', duration: 30, overallScore: 65, recommendLevel: 'pending', radar: { 专业技能: 68, 项目经验: 65, 逻辑思维: 62, 沟通表达: 66, 学习能力: 72, 文化匹配: 64 }, dimensionsCovered: ['专业技能', '项目经验', '沟通表达'], questionCount: 6, summary: '首次练习，概念掌握尚可，但表达不够结构化。', shortboards: ['结构化表达', '性能优化'] }
]

export async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10)

  // 岗位
  const [posRows] = await pool.query('SELECT COUNT(*) AS c FROM positions')
  if (posRows[0].c === 0) {
    for (const p of positions) {
      await pool.execute(
        'INSERT INTO positions (id,title,category,difficulty,skill_tags,practice_count,avg_score,description,hot) VALUES (?,?,?,?,?,?,?,?,?)',
        [p.id, p.title, p.category, p.difficulty, JSON.stringify(p.skillTags), p.practiceCount, p.avgScore, p.description, p.hot]
      )
    }
    console.log(`  ✓ 灌入 ${positions.length} 条岗位题库`)
  }

  // 求职者
  const [canRows] = await pool.query('SELECT COUNT(*) AS c FROM candidates')
  if (canRows[0].c === 0) {
    await pool.execute(
      'INSERT INTO candidates (id,name,email,password_hash,phone,avatar,registered_at,intention) VALUES (?,?,?,?,?,?,?,?)',
      [candidate.id, candidate.name, candidate.email, hash, candidate.phone, candidate.avatar, candidate.registeredAt, JSON.stringify(candidate.intention)]
    )
    for (const r of resumes) {
      await pool.execute(
        'INSERT INTO resumes (id,candidate_id,name,uploaded_at,is_default,education,work_years,last_company,skills,projects) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [r.id, candidate.id, r.name, r.uploadedAt, r.isDefault, r.education, r.workYears, r.lastCompany, JSON.stringify(r.skills), JSON.stringify(r.projects)]
      )
    }
    for (const iv of interviews) {
      await pool.execute(
        `INSERT INTO mock_interviews (id,candidate_id,type,type_id,position_title,date,duration,overall_score,recommend_level,radar,dimensions_covered,question_count,summary,shortboards)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [iv.id, candidate.id, 'mock', iv.typeId, iv.positionTitle, iv.date, iv.duration, iv.overallScore, iv.recommendLevel,
         JSON.stringify(iv.radar), JSON.stringify(iv.dimensionsCovered), iv.questionCount, iv.summary, JSON.stringify(iv.shortboards)]
      )
    }
    console.log(`  ✓ 灌入求职者 ${candidate.name}（${candidate.email} / ${DEMO_PASSWORD}）、${resumes.length} 份简历、${interviews.length} 条面试记录`)
  }

  // 企业账号
  const [orgRows] = await pool.query('SELECT COUNT(*) AS c FROM org_users')
  if (orgRows[0].c === 0) {
    await pool.execute(
      'INSERT INTO org_users (id,name,email,password_hash,role,role_text,org_name) VALUES (?,?,?,?,?,?,?)',
      ['ou_001', '林舒豪', 'linshuhao@yuntu.com', hash, 'HR', '招聘 HR', '云图科技有限公司']
    )
    console.log(`  ✓ 灌入企业账号 linshuhao@yuntu.com / ${DEMO_PASSWORD}`)
  }
}
