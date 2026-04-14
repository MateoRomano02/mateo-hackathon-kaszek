export const ROUTES = {
  ONBOARDING: '/onboarding',
  DASHBOARD:  '/dashboard',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
