import { useState, useEffect } from 'react'
import { useAppStore } from '@/app/providers/store'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'
import { fetchTechmemeTrends, type TechmemeTrend } from '@/services/scraper/TechmemeService'
import { scrapeUrl } from '@/services/scraper/JinaScraperService'
import { SKILL_STATUS_CONFIG } from '@/shared/constants'
import type { SkillStatus } from '@/shared/constants'
import { LearnChat } from '@/features/learning/LearnChat'

export function DashboardPage() {
  const { userProfile, skillStocks, setSkillStocks, isLoading, setIsLoading, error, setError, aiMode } = useAppStore()

  const [trends, setTrends] = useState<TechmemeTrend[]>([])
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [learnTarget, setLearnTarget] = useState<{ title: string; content: string } | null>(null)
  const [scrapingUrl, setScrapingUrl] = useState<string | null>(null)

  const service = aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService

  // Auto-fetch trends on mount
  useEffect(() => {
    fetchTechmemeTrends(5)
      .then(setTrends)
      .catch(() => {})
      .finally(() => setLoadingTrends(false))
  }, [])

  if (!userProfile) return null

  const risingSkills = skillStocks.filter((s) => s.status === 'rising')
  const degradingSkills = skillStocks.filter((s) => s.status === 'degrading')

  const runAnalysis = async () => {
    setIsLoading(true); setError(null)
    try { setSkillStocks(await service.analyzeSkillPortfolio(userProfile)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setIsLoading(false) }
  }

  const handleLearn = async (trend: TechmemeTrend) => {
    setScrapingUrl(trend.url)
    try {
      const scraped = await scrapeUrl(trend.url)
      setLearnTarget({ title: trend.title, content: scraped.markdown })
    } catch {
      setLearnTarget({ title: trend.title, content: trend.description })
    } finally {
      setScrapingUrl(null)
    }
  }

  const byStatus = (s: SkillStatus) => skillStocks.filter((sk) => sk.status === s).sort((a, b) => b.priorityScore - a.priorityScore)

  // Learning view
  if (learnTarget) {
    return <LearnChat resourceTitle={learnTarget.title} resourceContent={learnTarget.content} onClose={() => setLearnTarget(null)} />
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Hola, {userProfile.name}</h1>
            <p className="page-subtitle">{userProfile.summary ?? `${userProfile.role} / ${userProfile.seniority}`}</p>
          </div>
          {skillStocks.length === 0 && (
            <button className="btn btn-primary" onClick={runAnalysis} disabled={isLoading}>
              {isLoading ? 'Analizando...' : 'Analizar mis skills'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(185,28,28,.3)', background: 'rgba(185,28,28,.05)', marginBottom: 20 }}>
          <p style={{ color: 'var(--noise)', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="card stat-highlight">
          <div className="card-label">Skills</div>
          <div className="card-value">{skillStocks.length}</div>
          <div className="card-sub">{risingSkills.length} rising, {degradingSkills.length} degrading</div>
        </div>
        <div className="card">
          <div className="card-label">Stack</div>
          <div className="card-value">{userProfile.stack.length}</div>
          <div className="card-sub">herramientas</div>
        </div>
        <div className="card">
          <div className="card-label">Tendencias</div>
          <div className="card-value" style={{ color: 'var(--accent)' }}>{trends.length}</div>
          <div className="card-sub">para aprender</div>
        </div>
      </div>

      {/* Trends section */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="card-label" style={{ margin: 0 }}>Tendencias para ti</div>
          {!loadingTrends && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setLoadingTrends(true); fetchTechmemeTrends(5).then(setTrends).finally(() => setLoadingTrends(false)) }}>
              Actualizar
            </button>
          )}
        </div>

        {loadingTrends ? (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 }}>
            <span className="analyze-spinner" style={{ width: 20, height: 20, margin: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Cargando tendencias...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {trends.slice(0, 5).map((trend, i) => (
              <div key={i} className="card-sm fade-up" style={{ display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)',
                }}>
                  {trend.source.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{trend.title}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trend.description}</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleLearn(trend)}
                  disabled={scrapingUrl === trend.url} style={{ flexShrink: 0 }}>
                  {scrapingUrl === trend.url ? '...' : 'Aprender'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills portfolio */}
      {skillStocks.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-label" style={{ margin: 0 }}>Tu portafolio de skills</div>
            <button className="btn btn-ghost btn-sm" onClick={runAnalysis} disabled={isLoading}>
              {isLoading ? 'Analizando...' : 'Re-analizar'}
            </button>
          </div>
          <div className="grid-4">
            {(['rising', 'stable', 'degrading', 'gone'] as SkillStatus[]).map((status) => {
              const cfg = SKILL_STATUS_CONFIG[status]
              const skills = byStatus(status)
              return (
                <div key={status}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>{cfg.label}</span>
                    <span className="tag">{skills.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {skills.map((sk) => (
                      <div key={sk.id} className="card-sm" style={{ padding: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{sk.skill}</span>
                        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sk.suggestedAction}</p>
                      </div>
                    ))}
                    {skills.length === 0 && <p style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>—</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
