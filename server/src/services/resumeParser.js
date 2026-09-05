// ==================== 简历文件解析服务 ====================
// 支持 .pdf / .docx / .txt / .md：提取纯文本 → 启发式结构化（技能/年限/学历/项目）
// 说明：无外部大模型依赖，采用关键词词典 + 正则做本地解析。
import { readFile } from 'node:fs/promises'
import path from 'node:path'

// 技术关键词词典（用于从文本中识别技能）
const SKILL_DICT = [
  'Vue3', 'Vue2', 'Vue', 'React', 'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Sass', 'Less',
  'Vite', 'Webpack', 'Rollup', 'Vite', 'Node.js', 'Express', 'Koa', 'NestJS', 'Spring Boot', 'Java', 'Python',
  'FastAPI', 'Django', 'Flask', 'Go', 'Rust', 'C++', 'MySQL', 'PostgreSQL', 'Redis', 'MongoDB', 'Oracle',
  'Docker', 'Kubernetes', 'K8s', 'CI/CD', 'Jenkins', 'Git', 'Monorepo', 'pnpm', '微前端', '微服务',
  '性能优化', '响应式', '可视化', 'ECharts', 'D3.js', 'Three.js', 'Canvas', 'WebGL', 'WebSocket',
  '高并发', '分布式', '消息队列', 'Kafka', 'RabbitMQ', 'Elasticsearch', 'Nginx', 'Linux',
  '小程序', 'Taro', 'uni-app', 'React Native', 'Flutter', 'Electron',
  '产品经理', 'PRD', 'Axure', 'Figma', 'Sketch', '用户研究', '数据分析', 'SQL', 'Tableau', 'Power BI',
  '机器学习', '深度学习', 'TensorFlow', 'PyTorch', 'NLP', '计算机视觉', 'LLM', 'Prompt'
]

// 从文件提取纯文本
export async function extractText(filePath, originalName) {
  const ext = path.extname(originalName || filePath).toLowerCase()
  if (ext === '.txt' || ext === '.md') {
    return await readFile(filePath, 'utf-8')
  }
  if (ext === '.pdf') {
    // pdf-parse 的入口在调试模式会读测试文件，直接引用 lib 下实现
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js')
    const buf = await readFile(filePath)
    const data = await pdfParse(buf)
    return data.text || ''
  }
  if (ext === '.docx') {
    const mammoth = (await import('mammoth')).default
    const buf = await readFile(filePath)
    const result = await mammoth.extractRawText({ buffer: buf })
    return result.value || ''
  }
  // .doc 等旧格式或其它类型：返回空文本，由上层兜底
  return ''
}

// 从纯文本启发式解析为结构化简历
export function parseResumeText(text) {
  const t = text || ''

  // ---- 技能：词典命中（按出现顺序去重）----
  let matched = []
  for (const kw of SKILL_DICT) {
    if (t.includes(kw) && !matched.includes(kw)) matched.push(kw)
  }
  // 去除被更长关键词包含的短词（如 "Java" 命中于 "JavaScript"、"Vue" 命中于 "Vue3"）
  const skills = matched.filter(s => !matched.some(o => o !== s && o.includes(s)))

  // ---- 工作年限：匹配 "X年经验" / "X年...开发经验" 等；(?<!\d)(?!\d) 排除 2020/2021 年份误匹配 ----
  let workYears = 0
  const yearMatch =
    t.match(/(?<!\d)(\d{1,2})(?!\d)\s*年(?:以上)?[^\d\n]{0,6}?(?:工作|研发|开发|从业|经验)/) ||
    t.match(/工作(?:经验|年限)[：: ]*(\d{1,2})/)
  if (yearMatch) workYears = parseInt(yearMatch[1], 10) || 0

  // ---- 学历：匹配 学校 + 学历 ----
  let education = ''
  const eduMatch = t.match(/([\u4e00-\u9fa5]{2,}(?:大学|学院)[\s\S]{0,30}?(?:博士|硕士|本科|学士|大专))/)
    || t.match(/((?:博士|硕士|本科|学士|大专)[\s\S]{0,20}?[\u4e00-\u9fa5]{2,}(?:大学|学院))/)
  if (eduMatch) education = eduMatch[1].replace(/\s+/g, ' ').trim()

  // ---- 项目：按行找含"项目/平台/系统"且较长的行 ----
  const projects = []
  const lines = t.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (projects.length >= 3) break
    if (/(项目|平台|系统|官网|APP|小程序)/.test(line) && line.length >= 6 && line.length <= 120) {
      const name = line.replace(/^[0-9.、\s\-—*]+/, '').slice(0, 30)
      if (!projects.some(p => p.name === name)) {
        projects.push({ name, role: '核心成员', summary: line.slice(0, 80) })
      }
    }
  }

  return {
    education,
    workYears,
    lastCompany: '', // 公司名解析歧义大，留空由用户补充
    skills,
    projects
  }
}
