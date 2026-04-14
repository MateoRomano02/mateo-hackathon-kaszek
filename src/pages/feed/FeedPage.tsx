import { useState, useEffect } from 'react'
import { fetchTechmemeTrends, type TechmemeTrend } from '@/services/scraper/TechmemeService'
import { scrapeUrl } from '@/services/scraper/JinaScraperService'
import { LearnChat } from '@/features/learning/LearnChat'
import { ScoutRadar } from '@/features/content-intake/ScoutRadar'
import { ContentIntakeForm } from '@/features/content-intake/ContentIntakeForm'

type View = 'radar' | 'trends' | 'manual'

export function FeedPage() {
  const [view, setView] = useState<View>('radar')
  const [trends, setTrends] = useState<TechmemeTrend[]>([])
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [learnTarget, setLearnTarget] = useState<{ title: string; content: string } | null>(null)
  const [scrapingUrl, setScrapingUrl] = useState<string | null>(null)

  // Load Techmeme trends when switching to trends view
  useEffect(() => {
    if (view === 'trends' && trends.length === 0 && !loadingTrends) {
      setLoadingTrends(true)
      fetchTechmemeTrends(10).then(setTrends).catch(() => {}).finally(() => setLoadingTrends(false))
    }
  }, [view, trends.length, loadingTrends])

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
    return <LearnChat resourceTitle={learnTarget.title} resourceContent={learnTarget.content} onClose={() => setLearnTarget(null)} />
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Feed</h1>
        <p className="page-subtitle">Your personalized trend radar.</p>
      </div>

      {/* View switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface2)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {([
          { id: 'radar' as View, label: 'Scout Radar' },
          { id: 'trends' as View, label: 'Techmeme' },
          { id: 'manual' as View, label: 'Manual URL' },
        ]).map((v) => (
          <button key={v.id}
            className={view === v.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setView(v.id)} style={{ borderRadius: 8 }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Radar view (primary) */}
      {view === 'radar' && <ScoutRadar />}

      {/* Techmeme trends */}
      {view === 'trends' && (
        <>
          {loadingTrends ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60 }}>
              <span className="analyze-spinner" style={{ width: 32, height: 32, margin: 0 }} />
              <span style={{ color: 'var(--text2)', fontSize: 13 }}>Loading Techmeme...</span>
            </div>
          ) : trends.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📰</div>
              <div className="empty-title">Could not load trends</div>
              <div className="empty-desc">Use the Scout Radar instead.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trends.map((trend, i) => (
                <div key={i} className="card-sm fade-up" style={{ display: 'flex', alignItems: 'center', gap: 16, animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)',
                  }}>
                    {trend.source.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{trend.title}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trend.description}</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleLearn(trend)}
                    disabled={scrapingUrl === trend.url} style={{ flexShrink: 0 }}>
                    {scrapingUrl === trend.url ? '...' : 'Learn'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Manual URL */}
      {view === 'manual' && (
        <div className="card">
          <ContentIntakeForm />
        </div>
      )}
    </>
  )
}
