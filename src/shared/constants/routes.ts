export const ROUTES = {
  ONBOARDING: '/onboarding',
  DASHBOARD:  '/dashboard',
  INBOX:      '/inbox',
  ANALYSIS:   '/analysis',
  ACTIONS:    '/actions',
  MEMORY:     '/memory',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
