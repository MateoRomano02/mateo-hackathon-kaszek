import { useAppStore } from '@/app/providers/store'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'
import type { SkillStatus } from '@/shared/constants'
import type { SkillStock } from '@/entities/user/types'

export function useDashboard() {
  const {
    userProfile,
    skillStocks,
    setSkillStocks,
    isLoading,
    setIsLoading,
    error,
    setError,
    aiMode,
    setAiMode,
  } = useAppStore()

  const stocksByStatus = (status: SkillStatus): SkillStock[] =>
    skillStocks
      .filter((s) => s.status === status)
      .sort((a, b) => b.priorityScore - a.priorityScore)

  const runAiAnalysis = async () => {
    if (!userProfile) return
    setIsLoading(true)
    setError(null)

    try {
      const service =
        aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService
      const stocks = await service.analyzeSkillPortfolio(userProfile)
      setSkillStocks(stocks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar skills')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAiMode = () => {
    setAiMode(aiMode === 'mock' ? 'anthropic' : 'mock')
  }

  return {
    userProfile,
    skillStocks,
    stocksByStatus,
    isLoading,
    error,
    aiMode,
    toggleAiMode,
    runAiAnalysis,
  }
}
