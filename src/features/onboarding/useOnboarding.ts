import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/providers/store'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import type { VerticalType, SeniorityLevel } from '@/shared/constants'

export function useOnboarding() {
  const [role, setRole] = useState<VerticalType>('marketer')
  const [seniority, setSeniority] = useState<SeniorityLevel>('mid')
  const [selectedStack, setSelectedStack] = useState<string[]>([])

  const { setUserProfile, setSkillStocks, isLoading, setIsLoading, setError } = useAppStore()
  const navigate = useNavigate()

  const toggleStack = (tool: string) => {
    setSelectedStack((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    )
  }

  const submit = async () => {
    if (selectedStack.length === 0) return
    setIsLoading(true)
    setError(null)

    try {
      const profile = await mockAnalysisService.analyzeOnboarding({
        role,
        seniority,
        stack: selectedStack,
      })
      setUserProfile(profile)

      const stocks = await mockAnalysisService.analyzeSkillPortfolio(profile)
      setSkillStocks(stocks)

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    role,
    setRole,
    seniority,
    setSeniority,
    selectedStack,
    toggleStack,
    isLoading,
    submit,
  }
}
