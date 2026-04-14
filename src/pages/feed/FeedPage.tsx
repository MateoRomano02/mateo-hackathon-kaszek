import { useState, useEffect } from 'react'
import { fetchTechmemeTrends, type TechmemeTrend } from '@/services/scraper/TechmemeService'
import { scrapeUrl } from '@/services/scraper/JinaScraperService'
import { LearnChat } from '@/features/learning/LearnChat'

export function FeedPage() {
  const [trends, setTrends] = useState<TechmemeTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [learnTarget, setLearnTarget] = useState<{ title: string; content: string } | null>(null)
  const [scrapingUrl, setScrapingUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchTechmemeTrends(10)
      .then(setTrends)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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

  if (learnTarget) {
    return (
      <LearnChat
        resourceTitle={learnTarget.title}
        resourceContent={learnTarget.content}
        onClose={() => setLearnTarget(null)}
      />
    )
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Feed</h1>
            <p className="page-subtitle">Tendencias tech curadas. Clickea "Aprender" y Claude te ensena.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setTrends([]); setLoading(true); fetchTechmemeTrends(10).then(setTrends).finally(() => setLoading(false)) }}>
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60 }}>
          <span className="analyze-spinner" style={{ width: 32, height: 32, margin: 0 }} />
          <span style={{ color: 'var(--text2)', fontSize: 13 }}>Cargando tendencias de Techmeme...</span>
        </div>
      ) : trends.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <div className="empty-title">No se pudieron cargar tendencias</div>
          <div className="empty-desc">Revisa tu conexion e intenta de nuevo.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trends.map((trend, i) => (
            <div key={i} className="card-sm fade-up" style={{ display: 'flex', alignItems: 'center', gap: 16, animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              {/* Source icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)',
              }}>
                {trend.source.slice(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>
                  {trend.title}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {trend.description}
                </p>
              </div>

              {/* Learn button */}
              <button className="btn btn-primary btn-sm" onClick={() => handleLearn(trend)}
                disabled={scrapingUrl === trend.url} style={{ flexShrink: 0 }}>
                {scrapingUrl === trend.url ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="analyze-spinner" style={{ width: 12, height: 12, margin: 0, borderWidth: 2 }} />
                  </span>
                ) : 'Aprender'}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
