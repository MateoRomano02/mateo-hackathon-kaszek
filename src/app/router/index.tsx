import { createBrowserRouter } from 'react-router-dom'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { InboxPage } from '@/pages/inbox/InboxPage'
import { ActionsPage } from '@/pages/actions/ActionsPage'
import { AppLayout } from '@/app/layouts/AppLayout'

export const router = createBrowserRouter([
  { path: '/', element: <OnboardingPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/inbox', element: <InboxPage /> },
      { path: '/actions', element: <ActionsPage /> },
    ],
  },
])
