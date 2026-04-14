import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/app/context/AppContext'
import { Onboarding } from '@/features/onboarding/Onboarding'
import { UserProfile } from '@/entities/user/types'
import { ROUTES } from '@/shared/constants/routes'
import { MOCK_USER, MOCK_CONTENT, MOCK_ANALYSIS } from '@/services/mock/mockData'

export function OnboardingPage() {
  const { user, completeOnboarding, loadDemoData } = useAppContext()
  const navigate = useNavigate()

  const handleComplete = (profile: UserProfile) => {
    completeOnboarding(profile)
    navigate(ROUTES.DASHBOARD)
  }

  const handleDemo = () => {
    loadDemoData(MOCK_USER, MOCK_CONTENT, MOCK_ANALYSIS)
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <>
      <Onboarding
        onComplete={handleComplete}
        initialValues={user ?? undefined}
        existingId={user?.id}
      />
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={handleDemo} type="button">
          🎭 Demo rápido
        </button>
      </div>
    </>
  )
}
