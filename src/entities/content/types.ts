import type { SkillStatus } from '@/shared/constants'

export type ContentCategory = 'tutorial' | 'news' | 'tool' | 'case_study' | 'opinion'
export type RelevanceLevel = 'high' | 'medium' | 'low'

export interface RelatedSkill {
  skill: string
  relevance: RelevanceLevel
  statusImpact: SkillStatus
  reason: string
}

export interface ContentItem {
  id: string
  source: 'url' | 'text'
  originalUrl?: string
  rawContent: string
  analysis: AnalyzedContent | null
  status: 'pending' | 'analyzing' | 'done' | 'error'
  error?: string
  createdAt: string
}

export interface AnalyzedContent {
  title: string
  summary: string
  mainTopics: string[]
  relatedSkills: RelatedSkill[]
  actionItems: string[]
  relevanceScore: number
  category: ContentCategory
}

export interface ProjectStep {
  step: number
  title: string
  description: string
}

export interface ProjectResource {
  title: string
  url: string
  type: string
}

export interface GeneratedProject {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps: ProjectStep[]
  resources: ProjectResource[]
  expectedOutcome: string
  skillTarget: string
  createdAt: string
}
