import type { OnboardingData, UserProfile, SkillStock, OnboardingChatResult } from '@/entities/user/types'
import type { AnalyzedContent, GeneratedProject } from '@/entities/content/types'

export interface AIAnalysisService {
  analyzeOnboarding(data: OnboardingData): Promise<UserProfile>
  analyzeSkillPortfolio(profile: UserProfile): Promise<SkillStock[]>
  conductOnboardingChat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    onStream: (text: string) => void,
  ): Promise<OnboardingChatResult>
  analyzeContent(content: string, profile: UserProfile): Promise<AnalyzedContent>
  generateProject(skillName: string, profile: UserProfile): Promise<GeneratedProject>
}
