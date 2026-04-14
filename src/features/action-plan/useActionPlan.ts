import { useState } from 'react'
import { useAppStore } from '@/app/providers/store'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'

export function useActionPlan() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeSkill, setActiveSkill] = useState<string | null>(null)

  const { userProfile, projects, addProject, aiMode } = useAppStore()

  const service = aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService

  const generateProject = async (skillName: string) => {
    if (!userProfile || isGenerating) return

    setIsGenerating(true)
    setActiveSkill(skillName)

    try {
      const project = await service.generateProject(skillName, userProfile)
      addProject(project)
    } catch (err) {
      console.error('Error generating project:', err)
    } finally {
      setIsGenerating(false)
      setActiveSkill(null)
    }
  }

  return {
    projects,
    isGenerating,
    activeSkill,
    generateProject,
  }
}
