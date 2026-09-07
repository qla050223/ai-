// ==================== Interview 模块 · Service 层 ====================
import { interviewRepository } from './interview.repository.js'
import { mapInterview } from '../../shared/mappers.js'

export const interviewService = {
  // 求职者的面试记录列表
  async listInterviews(candidateId) {
    const rows = await interviewRepository.findByCandidateId(candidateId)
    return rows.map(mapInterview)
  },

  // 新增一条模拟面试记录
  async createInterview(candidateId, body) {
    const b = body || {}
    const id = 'mi_' + Date.now()
    const date = b.date || new Date().toISOString().replace('T', ' ').slice(0, 16)
    await interviewRepository.insert({
      id,
      candidateId,
      type: b.type || 'mock',
      typeId: b.typeId || null,
      positionTitle: b.positionTitle || '模拟面试',
      date,
      duration: b.duration || 30,
      overallScore: b.overallScore || 0,
      recommendLevel: b.recommendLevel || 'pending',
      radar: b.radar || {},
      dimensionsCovered: b.dimensionsCovered || [],
      questionCount: b.questionCount || 0,
      summary: b.summary || '',
      shortboards: b.shortboards || []
    })
    const row = await interviewRepository.findById(id)
    return mapInterview(row)
  }
}
