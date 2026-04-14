export const VERTICAL_TYPES = ['marketer', 'recruiter', 'developer', 'ops'] as const
export type VerticalType = (typeof VERTICAL_TYPES)[number]

export const SENIORITY_LEVELS = ['junior', 'mid', 'senior'] as const
export type SeniorityLevel = (typeof SENIORITY_LEVELS)[number]

export const SKILL_STATUSES = ['rising', 'stable', 'degrading', 'gone'] as const
export type SkillStatus = (typeof SKILL_STATUSES)[number]

export const SKILL_STATUS_CONFIG: Record<
  SkillStatus,
  { label: string; color: string; bgColor: string; borderColor: string; icon: string }
> = {
  rising: {
    label: 'Rising',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    icon: '\u{1F4C8}',
  },
  stable: {
    label: 'Stable',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: '\u2796',
  },
  degrading: {
    label: 'Degrading',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: '\u{1F4C9}',
  },
  gone: {
    label: 'Gone',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: '\u274C',
  },
}
