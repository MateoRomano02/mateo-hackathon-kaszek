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

export interface Insight {
  id: string
  title: string
  summary: string
  why: string
  priority: Priority
  topicIds: string[]
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
