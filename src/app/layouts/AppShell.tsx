import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '@/app/context/AppContext'
import { Logo } from '@/shared/ui/Logo/Logo'
import { Icon } from '@/shared/ui/Icon/Icon'
import { ROUTES } from '@/shared/constants/routes'
import { IconName } from '@/shared/icons/paths'

interface NavItem {
  route: string
  label: string
  icon: IconName
  requiresAnalysis?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { route: ROUTES.DASHBOARD, label: 'Dashboard',     icon: 'dash' },
  { route: ROUTES.INBOX,     label: 'Mi contenido',  icon: 'inbox' },
  { route: ROUTES.ANALYSIS,  label: 'Análisis',      icon: 'brain',  requiresAnalysis: true },
  { route: ROUTES.ACTIONS,   label: 'Plan de acción', icon: 'zap',   requiresAnalysis: true },
  { route: ROUTES.MEMORY,    label: 'Mi memoria',    icon: 'memory', requiresAnalysis: true },
]

function Sidebar() {
  const { user, content, analysis } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Logo />
      </div>

      {user && (
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar">{user.name[0] ?? '?'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              title="Editar perfil"
              type="button"
              onClick={() => navigate(ROUTES.ONBOARDING)}
              style={{ padding: '4px', flexShrink: 0 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <div className="nav-label">Navegación</div>
        {NAV_ITEMS.map((item) => {
          const disabled = item.requiresAnalysis && !analysis
          const isActive = location.pathname === item.route

          return (
            <div
              key={item.route}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={disabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              onClick={() => !disabled && navigate(item.route)}
            >
              <Icon name={item.icon} className="nav-icon" />
              {item.label}
              {item.route === ROUTES.INBOX && content.length > 0 && (
                <span className="nav-badge">{content.length}</span>
              )}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="vertical-badge">
          <div className="vertical-dot" />
          {user?.vertical ?? 'marketer'}
        </div>
      </div>
    </div>
  )
}

function AnalyzeOverlay() {
  const { analyzeStep, analyzeProgress, analysisError, dismissError } = useAppContext()

  if (analysisError) {
    return (
      <div className="overlay">
        <div className="analyze-card fade-up">
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
          <div className="analyze-title">Algo salió mal</div>
          <p className="text-sm text-muted mt-8 mb-24" style={{ maxWidth: 280, margin: '8px auto 24px' }}>
            {analysisError}
          </p>
          <button className="btn btn-secondary" type="button" onClick={dismissError}>
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="overlay">
      <div className="analyze-card fade-up">
        <div className="analyze-spinner" />
        <div className="analyze-title">Actualizando Trending</div>
        <div className="analyze-step">{analyzeStep}</div>
        <div className="progress-label">{analyzeProgress}%</div>
        <div className="progress-container w-full">
          <div className="progress-fill" style={{ width: `${analyzeProgress}%` }} />
        </div>
        <p className="text-sm text-muted mt-16">
          Detectando señales de tu vertical…
          <br />
          Esto puede tomar unos segundos.
        </p>
      </div>
    </div>
  )
}

export function AppShell() {
  const { isAnalyzing, analysisError } = useAppContext()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
      {(isAnalyzing || !!analysisError) && <AnalyzeOverlay />}
    </div>
  )
}
