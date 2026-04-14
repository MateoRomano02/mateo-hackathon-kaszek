import { ContentItem } from '@/entities/content/types'
import { UserProfile } from '@/entities/user/types'
import { AnalysisResult } from '@/entities/analysis/types'
import { IAIAnalysisService, ProgressCallback } from './IAIAnalysisService'
import { getRandomMockAnalysis } from '@/services/mock/mockData'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const PIPELINE_STEPS: Array<{ label: string; progress: number; wait: number }> = [
  { label: 'Escaneando señales recientes de tu vertical...',     progress: 10, wait: 700 },
  { label: 'Identificando temas que están en tendencia...',      progress: 35, wait: 600 },
  { label: 'Filtrando lo más relevante para vos esta semana...', progress: 55, wait: 700 },
  { label: 'Generando acciones desde las tendencias...',         progress: 75, wait: 700 },
  { label: 'Actualizando tu memoria de aprendizaje...',          progress: 90, wait: 500 },
  { label: '¡Trending actualizado!',                             progress: 100, wait: 300 },
]

/**
 * Mock implementation — devuelve una variante aleatoria del análisis con delays simulados.
 * Cada vez que el usuario actualiza el trending ve datos distintos, haciendo el demo más vivo.
 */
export class MockAnalysisService implements IAIAnalysisService {
  async runFullAnalysis(
    _items: ContentItem[],
    _profile: UserProfile,
    onProgress: ProgressCallback,
  ): Promise<AnalysisResult> {
    for (const step of PIPELINE_STEPS) {
      onProgress(step.label, step.progress)
      await delay(step.wait)
    }
    return getRandomMockAnalysis()
  }
}
