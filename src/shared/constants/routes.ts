export const ROUTES = {
  ONBOARDING: '/onboarding',
  DASHBOARD:  '/dashboard',
  FEED:       '/feed',
  COURSES:    '/cursos',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
