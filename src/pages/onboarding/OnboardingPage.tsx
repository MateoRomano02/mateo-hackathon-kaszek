import { useNavigate } from 'react-router-dom'
import { ChatInterface } from '@/features/onboarding/ChatInterface'
import { useAppStore } from '@/app/providers/store'
import { useOnInit } from '@/shared/hooks/useOnInit'

export function OnboardingPage() {
  const userProfile = useAppStore((s) => s.userProfile)
  const navigate = useNavigate()

  // If user already has a profile (from localStorage), skip to dashboard
  useOnInit(() => {
    if (userProfile) navigate('/dashboard')
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <header className="space-y-3 text-center">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Signal OS
          </h1>
          <p className="text-zinc-400 text-lg">
            Tu copiloto de aprendizaje tecnico.
          </p>
          <p className="text-zinc-600 text-sm max-w-md mx-auto">
            Transforma el ruido informativo en una ruta de aprendizaje personalizada y accionable.
          </p>
        </header>

        {/* Chat */}
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
