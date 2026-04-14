export const ROUTES = {
  ONBOARDING: '/onboarding',
  DASHBOARD:  '/dashboard',
  COURSES:    '/cursos',
  CURATOR:    '/curador',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
