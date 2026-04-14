import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/app/providers/store'
import { useOnInit } from '@/shared/hooks/useOnInit'

export function AppLayout() {
  const { userProfile, contentItems, projects, aiMode, setAiMode, resetAll } = useAppStore()
  const navigate = useNavigate()

  useOnInit(() => {
    if (!userProfile) navigate('/')
  })

  if (!userProfile) return null

  const inboxCount = contentItems.filter((c) => c.status === 'done').length
  const projectCount = projects.length

  const handleReset = () => {
    resetAll()
    localStorage.removeItem('signal-os-store')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Top bar */}
      <header className="border-b border-zinc-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Signal OS
            </h1>

            <nav className="flex items-center gap-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    isActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50',
                  )
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/inbox"
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
                    isActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50',
                  )
                }
              >
                Truth Pipeline
                {inboxCount > 0 && (
                  <span className="bg-indigo-600/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {inboxCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/actions"
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
                    isActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50',
                  )
                }
              >
                Proyectos
                {projectCount > 0 && (
                  <span className="bg-indigo-600/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {projectCount}
                  </span>
                )}
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* AI mode */}
            <button
              type="button"
              onClick={() => setAiMode(aiMode === 'mock' ? 'anthropic' : 'mock')}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer',
                aiMode === 'anthropic'
                  ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/50'
                  : 'bg-zinc-800 text-zinc-500',
              )}
            >
              {aiMode === 'anthropic' ? 'Claude AI' : 'Demo'}
            </button>

            {/* User info */}
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} &middot;{' '}
              {userProfile.seniority.charAt(0).toUpperCase() + userProfile.seniority.slice(1)}
            </span>

            {/* Avatar */}
            <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
              {userProfile.name.charAt(0)}
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
              title="Reiniciar perfil"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
