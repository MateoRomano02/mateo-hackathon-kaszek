import { useNavigate } from 'react-router-dom'
import { ChatInterface } from '@/features/onboarding/ChatInterface'
import { useAppStore } from '@/app/providers/store'
import { useOnInit } from '@/shared/hooks/useOnInit'
import { Logo } from '@/shared/ui/Logo/Logo'

export function OnboardingPage() {
  const userProfile = useAppStore((s) => s.userProfile)
  const navigate = useNavigate()

  useOnInit(() => {
    if (userProfile) navigate('/dashboard', { replace: true })
  })

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card" style={{ maxWidth: 640 }}>
        <div className="onboarding-logo">
          <Logo />
        </div>
        <p className="onboarding-desc">
          Turn information noise into a personalized and actionable learning path.
        </p>
        <ChatInterface />
      </div>
    </div>
  )
}
