import type { OnboardingData, UserProfile, SkillStock, OnboardingChatResult } from '@/entities/user/types'
import type { SourceMetadata, CanonicalInsight, GeneratedProject } from '@/entities/content/types'

export interface AIAnalysisService {
  analyzeOnboarding(data: OnboardingData): Promise<UserProfile>
  analyzeSkillPortfolio(profile: UserProfile): Promise<SkillStock[]>
  conductOnboardingChat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    onStream: (text: string) => void,
  ): Promise<OnboardingChatResult>
  evaluateSource(content: string, url?: string): Promise<SourceMetadata>
  extractCanonicalInsights(content: string, sourceMetadata: SourceMetadata, profile: UserProfile): Promise<{ insights: CanonicalInsight[]; overallRelevance: number }>
  generateProject(skillName: string, profile: UserProfile): Promise<GeneratedProject>
}
