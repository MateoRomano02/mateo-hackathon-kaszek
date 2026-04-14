import type { VerticalType, SeniorityLevel, SkillStatus } from '@/shared/constants'

export interface OnboardingData {
  role: VerticalType
  seniority: SeniorityLevel
  stack: string[]
}

export interface UserProfile {
  id: string
  name: string
  role: VerticalType
  seniority: SeniorityLevel
  stack: string[]
  goals?: string[]
  painPoints?: string[]
  summary?: string
  createdAt: string
}

export interface SkillStock {
  id: string
  skill: string
  status: SkillStatus
  rationale: string
  priorityScore: number
  suggestedAction: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export type OnboardingChatResult =
  | { type: 'message'; content: string }
  | { type: 'profile_complete'; profile: UserProfile; content: string }
