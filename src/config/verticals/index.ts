import { VerticalType } from '@/entities/user/types'
import { marketerConfig } from './marketer'
import { developerConfig } from './developer'
import { recruiterConfig } from './recruiter'

export interface VerticalConfig {
  vertical: VerticalType
  label: string
  roles: string[]
  industries: string[]
  channels: string[]
  goalPlaceholder: string
  focusPlaceholder: string
  contextPlaceholder: string
  constraintsPlaceholder: string
  defaultCriteria: string[]
}

export const VERTICAL_CONFIGS: Record<VerticalType, VerticalConfig> = {
  marketer:  marketerConfig,
  developer: developerConfig,
  recruiter: recruiterConfig,
}

export function getVerticalConfig(vertical: VerticalType): VerticalConfig {
  return VERTICAL_CONFIGS[vertical]
}
