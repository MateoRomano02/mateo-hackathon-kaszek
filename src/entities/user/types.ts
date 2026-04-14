export type VerticalType = 'marketer' | 'developer' | 'recruiter'

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead'

export interface UserProfile {
  id: string
  name: string
  role: string
  vertical: VerticalType
  industry: string
  level: ExperienceLevel
  goal: string
  mainChannel: string
  currentFocus: string
  businessContext: string
  constraints: string
  criteria: string[]
  createdAt: string
}

export type OnboardingFormData = Omit<UserProfile, 'id' | 'createdAt'>
