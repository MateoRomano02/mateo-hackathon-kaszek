import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/providers/store'
import { useOnInit } from '@/shared/hooks/useOnInit'
import { Logo } from '@/shared/ui/Logo/Logo'
import { Icon } from '@/shared/ui/Icon/Icon'
import { ROUTES } from '@/shared/constants/routes'

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, icon: 'dash' as const, label: 'Dashboard' },
  { to: ROUTES.FEED, icon: 'signal' as const, label: 'Feed' },
  { to: ROUTES.COURSES, icon: 'zap' as const, label: 'Mis Cursos' },
]

export function AppShell() {
  const { userProfile, contentItems, aiMode, setAiMode, resetAll } = useAppStore()
  const navigate = useNavigate()

  useOnInit(() => {
    if (!userProfile) navigate(ROUTES.ONBOARDING)
  })

  if (!userProfile) return null

  const learnedCount = contentItems.filter((c) => c.status === 'done').length

  const getBadge = (to: string): number | null => {
    if (to === ROUTES.COURSES && learnedCount > 0) return learnedCount
    return null
  }

  const handleReset = () => {
    resetAll()
    localStorage.removeItem('signal-os-store')
    navigate(ROUTES.ONBOARDING)
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo />
        </div>

        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="user-name">{userProfile.name}</div>
              <div className="user-role">
                {userProfile.role} &middot; {userProfile.seniority}
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Navegacion</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
            >
              <Icon name={item.icon} size={16} className="nav-icon" />
              {item.label}
              {getBadge(item.to) && (
                <span className="nav-badge">{getBadge(item.to)}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setAiMode(aiMode === 'mock' ? 'anthropic' : 'mock')}
              className="vertical-badge"
              style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}
            >
              <span className="vertical-dot" style={{ background: aiMode === 'anthropic' ? 'var(--accent)' : 'var(--text3)' }} />
              {aiMode === 'anthropic' ? 'Claude AI' : 'Demo Mode'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', justifyContent: 'center', fontSize: '11px' }}
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
