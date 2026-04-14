import { IAIAnalysisService } from './IAIAnalysisService'
import { MockAnalysisService } from './MockAnalysisService'
import { AnthropicAnalysisServiceAdapter } from './AnthropicAnalysisServiceAdapter'

export type { IAIAnalysisService }
export type { ProgressCallback } from './IAIAnalysisService'

function createAIService(): IAIAnalysisService {
  const provider = import.meta.env.VITE_AI_PROVIDER ?? 'mock'
  if (provider === 'anthropic') return new AnthropicAnalysisServiceAdapter()
  return new MockAnalysisService()
}

/** Singleton — the whole app consumes this instance. */
export const aiService: IAIAnalysisService = createAIService()
