import type { SkillStatus } from '@/shared/constants'

// ── Source Authority ───────────────────────────────────────────────

export type DomainAuthority = 'official_docs' | 'major_publication' | 'industry_blog' | 'social_media' | 'unknown'
export type SourceType = 'primary' | 'secondary' | 'opinion' | 'aggregator'

export interface SourceMetadata {
  author: string | null
  domainAuthority: DomainAuthority
  freshnessDate: string | null
  sourceType: SourceType
  credibilityScore: number
  credibilityReason: string
}

// ── Evidence & Confidence ─────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface EvidenceReference {
  exactQuote: string
  inferenceFlag: boolean // true = Claude deduced it, false = explicitly stated in source
}

export interface ContradictionFlag {
  description: string
  resolution: string | null
}

// ── Canonical Insight (Truth Unit) ─────────────────────────────────

export type ContentCategory = 'tutorial' | 'news' | 'tool' | 'case_study' | 'opinion'

export interface RelatedSkill {
  skill: string
  statusImpact: SkillStatus
  reason: string
}

export interface CanonicalInsight {
  id: string
  title: string
  insight: string
  confidenceLevel: ConfidenceLevel
  confidenceScore: number
  validationReason: string
  evidence: EvidenceReference[]
  relatedSkills: RelatedSkill[]
  contradictions: ContradictionFlag[]
  category: ContentCategory
}

// ── Content Item (Pipeline Unit) ───────────────────────────────────

export type ContentStatus = 'pending' | 'scraping' | 'evaluating_source' | 'extracting_insights' | 'done' | 'error'

export interface ContentItem {
  id: string
  source: 'url' | 'text'
  originalUrl?: string
  rawContent: string
  sourceMetadata: SourceMetadata | null
  canonicalInsights: CanonicalInsight[]
  overallRelevance: number
  status: ContentStatus
  error?: string
  createdAt: string
}

// ── Projects (unchanged) ───────────────────────────────────────────

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
