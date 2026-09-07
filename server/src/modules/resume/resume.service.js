// ==================== Resume 模块 · Service 层 ====================
import path from 'node:path'
import { resumeRepository } from './resume.repository.js'
import { mapResume } from '../../shared/mappers.js'
import { assessResume } from '../../services/assess.js'
import { optimizeResume } from '../../services/resumeOptimize.js'
import { extractText, parseResumeText } from '../../services/resumeParser.js'

function parseJsonField(raw, fallback) {
  if (raw == null) return fallback
  if (typeof raw === 'object') return raw
  try { return JSON.parse(raw) } catch { return fallback }
}

export const resumeService = {
  // 简历列表
  async listResumes(candidateId) {
    const rows = await resumeRepository.findByCandidateId(candidateId)
    return rows.map(mapResume)
  },

  // 上传并解析简历
  async uploadResume(candidateId, file) {
    if (!file) {
      return { error: { status: 400, msg: '未收到文件：字段名应为 resume，且必须为 multipart/form-data 上传' } }
    }
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf-8')
    let text = ''
    let parseWarning = ''
    try {
      text = await extractText(file.path, originalName)
    } catch {
      parseWarning = '文件已上传，但文本解析失败（可能是扫描版 PDF），已按文件名建档'
    }
    const parsed = parseResumeText(text)
    const relPath = path.relative(
      path.join(file.destination, '..', '..'),
      file.path
    ).replace(/\\/g, '/')

    const id = 'rs_' + Date.now()
    const baseName = path.basename(originalName, path.extname(originalName)) || '上传的简历'

    // 新简历默认置为默认
    await resumeRepository.clearDefault(candidateId)
    await resumeRepository.insert({
      id,
      candidateId,
      name: baseName,
      uploadedAt: new Date().toISOString().slice(0, 10),
      isDefault: 1,
      education: parsed.education || null,
      workYears: parsed.workYears || 0,
      lastCompany: parsed.lastCompany || null,
      skills: parsed.skills,
      projects: parsed.projects,
      fileName: originalName,
      filePath: relPath,
      rawText: text.slice(0, 60000) || null
    })

    const row = await resumeRepository.findById(id)
    const resume = mapResume(row)
    return {
      resume,
      extracted: {
        textLength: text.length,
        skills: parsed.skills,
        workYears: parsed.workYears,
        education: parsed.education,
        warning: parseWarning
      }
    }
  },

  // 简历测评
  async assessResume(candidateId, resumeId, position) {
    const row = await resumeRepository.findByIdAndCandidate(resumeId, candidateId)
    if (!row) {
      return { error: { status: 404, msg: '简历不存在' } }
    }
    const resume = mapResume(row)
    await new Promise(r => setTimeout(r, 1200))
    const result = assessResume(resume, position)
    return { result }
  },

  // AI 改简历
  async optimizeResume(candidateId, resumeId) {
    const row = await resumeRepository.findByIdAndCandidate(resumeId, candidateId)
    if (!row) {
      return { error: { status: 404, msg: '简历不存在' } }
    }
    const resume = mapResume(row)

    const canInfo = await resumeRepository.findCandidateInfo(candidateId)
    const intention = canInfo ? parseJsonField(canInfo.intention, {}) : {}
    const ctx = {
      name: canInfo?.name,
      phone: canInfo?.phone,
      email: canInfo?.email,
      position: intention.position,
      workYears: intention.workYears
    }

    await new Promise(r => setTimeout(r, 1200))
    const { sections, fullResume } = optimizeResume(resume, ctx)
    return { sections, fullResume }
  }
}
