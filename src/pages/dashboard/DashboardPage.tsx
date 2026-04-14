import { useAppStore } from '@/app/providers/store'
import { useNavigate } from 'react-router-dom'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'
import { SKILL_STATUS_CONFIG } from '@/shared/constants'
import type { SkillStatus } from '@/shared/constants'
import { ROUTES } from '@/shared/constants/routes'

export function DashboardPage() {
  const { userProfile, skillStocks, setSkillStocks, contentItems, isLoading, setIsLoading, error, setError, aiMode } = useAppStore()
  const navigate = useNavigate()

  if (!userProfile) return null

  const service = aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService
  const doneContent = contentItems.filter((c) => c.status === 'done').length
  const totalInsights = contentItems.reduce((a, c) => a + (c.canonicalInsights?.length ?? 0), 0)
  const risingSkills = skillStocks.filter((s) => s.status === 'rising')
  const degradingSkills = skillStocks.filter((s) => s.status === 'degrading')

  const runAnalysis = async () => {
    setIsLoading(true); setError(null)
    try { setSkillStocks(await service.analyzeSkillPortfolio(userProfile)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setIsLoading(false) }
  }

  const byStatus = (s: SkillStatus) => skillStocks.filter((sk) => sk.status === s).sort((a, b) => b.priorityScore - a.priorityScore)

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Hola, {userProfile.name}</h1>
            <p className="page-subtitle">{userProfile.summary ?? `${userProfile.role} / ${userProfile.seniority}`}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={runAnalysis} disabled={isLoading}>
              {isLoading ? 'Analizando...' : 'Analizar skills'}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(ROUTES.FEED)}>
              Ver Feed
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(185,28,28,.3)', background: 'rgba(185,28,28,.05)', marginBottom: 20 }}>
          <p style={{ color: 'var(--noise)', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="card stat-highlight">
          <div className="card-label">Skills</div>
          <div className="card-value">{skillStocks.length}</div>
          <div className="card-sub">{userProfile.stack.length} en tu stack</div>
        </div>
        <div className="card">
          <div className="card-label">Contenidos</div>
          <div className="card-value">{doneContent}</div>
          <div className="card-sub">{totalInsights} insights</div>
        </div>
        <div className="card">
          <div className="card-label">Rising</div>
          <div className="card-value" style={{ color: 'var(--accent)' }}>{risingSkills.length}</div>
          <div className="card-sub">Invertir ahora</div>
        </div>
        <div className="card">
          <div className="card-label">Degrading</div>
          <div className="card-value" style={{ color: 'var(--mid)' }}>{degradingSkills.length}</div>
          <div className="card-sub">Dejar de invertir</div>
        </div>
      </div>

      {/* Skills */}
      {skillStocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">Sin skills analizados</div>
          <div className="empty-desc">Clickea "Analizar skills" para que Claude evalue tu portafolio.</div>
        </div>
      ) : (
        <>
          {/* Skill columns */}
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {(['rising', 'stable', 'degrading', 'gone'] as SkillStatus[]).map((status) => {
              const cfg = SKILL_STATUS_CONFIG[status]
              const skills = byStatus(status)
              return (
                <div key={status}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span>{cfg.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>{cfg.label}</span>
                    <span className="tag">{skills.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {skills.map((sk) => (
                      <div key={sk.id} className="card-sm">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{sk.skill}</span>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>{sk.priorityScore.toFixed(1)}</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text2)' }}>{sk.rationale}</p>
                      </div>
                    ))}
                    {skills.length === 0 && <p style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>—</p>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Learning progress */}
          {(risingSkills.length > 0 || degradingSkills.length > 0) && (
            <div className="card">
              <div className="card-label">Tu ruta de aprendizaje</div>
              {risingSkills.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', marginBottom: 8 }}>Enfocate en estos:</p>
                  {risingSkills.slice(0, 3).map((s) => (
                    <div key={s.id} className="memory-item">
                      <span className="memory-dot dot-learned" />
                      <div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{s.skill}</span>
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}> — {s.suggestedAction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {degradingSkills.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--mid)', marginBottom: 8 }}>Deja de invertir en:</p>
                  {degradingSkills.map((s) => (
                    <div key={s.id} className="memory-item">
                      <span className="memory-dot dot-pending" />
                      <div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{s.skill}</span>
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}> — {s.rationale}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
