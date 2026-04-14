import { createBrowserRouter, Navigate } from 'react-router-dom'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { FeedPage } from '@/pages/feed/FeedPage'
import { CoursesPage } from '@/pages/courses/CoursesPage'
import { AppShell } from '@/app/layouts/AppShell'
import { ROUTES } from '@/shared/constants/routes'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ROUTES.ONBOARDING} replace /> },
  { path: ROUTES.ONBOARDING, element: <OnboardingPage /> },
  {
    element: <AppShell />,
    children: [
      { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: ROUTES.FEED, element: <FeedPage /> },
      { path: ROUTES.COURSES, element: <CoursesPage /> },
    ],
  },
])
