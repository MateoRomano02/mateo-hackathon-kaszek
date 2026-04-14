import { ConfidenceLevel, EvidenceReference, ContradictionFlag } from '@/entities/source/types'

export type Priority = 'high' | 'medium' | 'low'

export type ActionType = 'task' | 'template' | 'prompt' | 'hypothesis' | 'checklist'

export interface TopicCluster {
  id: string
  label: string
  relevanceScore: number
  count: number
  isNoise: boolean
  contentIds: string[]
}

/**
 * A canonical insight — always traceable, always confidence-scored.
 * This is the core data type of the Judgment Engine.
 * No insight is surfaced without explaining WHY and with HOW MUCH confidence.
 */
export interface Insight {
  id: string
  title: string
  summary: string
  why: string
  priority: Priority
  topicIds: string[]

  // ─── Judgment Engine fields ─────────────────────────────────────────────────
  confidence: ConfidenceLevel   // high / medium / low / uncertain
  confidenceScore: number       // 0-100 (for visual bars)
  confidenceExplanation: string // why this confidence level was assigned
  evidence: EvidenceReference[] // sources that back this insight
  sourceCount: number           // how many distinct sources support it
  isConsolidated: boolean       // true if merged from multiple saying the same thing
  inferenceNote?: string        // what part is inferred vs. explicitly stated
  contradictions?: ContradictionFlag[]
}

export interface ActionItem {
  id: string
  type: ActionType
  title: string
  description: string
  content: string
  priority: Priority
  estimatedTime: string
  topicId: string
}

export interface WeekPlanDay {
  day: number
  label: string
  focus: string
  tasks: string[]
}

export interface Recap {
  id: string
  week: string
  learned: string[]
  applied: string[]
  pending: string[]
  toReview: string[]
  nextSkill: string
  contentCount: number
  actionsCompleted: number
}

export interface AnalysisResult {
  processedAt: string
  totalContent: number
  noiseCount: number
  signalCount: number
  topics: TopicCluster[]
  insights: Insight[]
  actions: ActionItem[]
  weekPlan: WeekPlanDay[]
  recap: Recap
}
