// ==================== Position 模块 · Service 层 ====================
import { positionRepository } from './position.repository.js'
import { mapPosition } from '../../shared/mappers.js'

export const positionService = {
  async listPositions() {
    const rows = await positionRepository.findAllOrdered()
    return rows.map(mapPosition)
  }
}
