import { SourceQualityScore } from '@/entities/source/types'

export type ContentType = 'link' | 'text' | 'pdf' | 'summary'

export type ContentStatus = 'pending' | 'analyzed'

export interface CriterionScore {
  criterion: string
  passed: boolean
  reason: string
}

export interface ContentAnalysis {
  topics: string[]
  isNoise: boolean
  noiseReason: string | null
  keyTakeaway: string
  relevanceScore: number
  criteriaScores?: CriterionScore[]
  /** Source quality — the foundation of the truth layer */
  sourceQuality?: SourceQualityScore
}

export interface ContentItem {
  id: string
  type: ContentType
  status: ContentStatus
  raw: string
  title: string
  source?: string
  addedAt: string
  analysis: ContentAnalysis | null
}
