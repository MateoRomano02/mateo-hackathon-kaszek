import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppContext } from '@/app/context/AppContext'
import { AppShell } from '@/app/layouts/AppShell'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { InboxPage } from '@/pages/inbox/InboxPage'
import { AnalysisPage } from '@/pages/analysis/AnalysisPage'
import { ActionsPage } from '@/pages/actions/ActionsPage'
import { MemoryPage } from '@/pages/memory/MemoryPage'
import { ROUTES } from '@/shared/constants/routes'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppContext()
  if (!user) return <Navigate to={ROUTES.ONBOARDING} replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.INBOX}     element={<InboxPage />} />
        <Route path={ROUTES.ANALYSIS}  element={<AnalysisPage />} />
        <Route path={ROUTES.ACTIONS}   element={<ActionsPage />} />
        <Route path={ROUTES.MEMORY}    element={<MemoryPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  )
}
