import { useState, useEffect } from 'react'
import { useAppStore } from '@/app/providers/store'
import { ContentIntakeForm } from '@/features/content-intake/ContentIntakeForm'
import { ContentCard } from '@/features/content-intake/ContentCard'
import { ScoutRadar } from '@/features/content-intake/ScoutRadar'
import { LearnChat } from '@/features/learning/LearnChat'
import { fetchTechmemeTrends, type TechmemeTrend } from '@/services/scraper/TechmemeService'
import { scrapeUrl } from '@/services/scraper/JinaScraperService'

type Tab = 'trends' | 'radar' | 'manual'

export function InboxPage() {
  const [tab, setTab] = useState<Tab>('trends')
  const [trends, setTrends] = useState<TechmemeTrend[]>([])
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [learnTarget, setLearnTarget] = useState<{ title: string; content: string } | null>(null)
  const [scrapingId, setScrapingId] = useState<string | null>(null)

  const contentItems = useAppStore((s) => s.contentItems)
  const doneCount = contentItems.filter((c) => c.status === 'done').length
  const totalInsights = contentItems.reduce((a, c) => a + (c.canonicalInsights?.length ?? 0), 0)

  // Load Techmeme trends on mount
  useEffect(() => {
    if (trends.length === 0 && !loadingTrends) {
      setLoadingTrends(true)
      fetchTechmemeTrends(8)
        .then(setTrends)
        .catch(() => {})
        .finally(() => setLoadingTrends(false))
    }
  }, [trends.length, loadingTrends])

  const handleLearn = async (trend: TechmemeTrend) => {
    setScrapingId(trend.url)
    try {
      const scraped = await scrapeUrl(trend.url)
      setLearnTarget({ title: trend.title, content: scraped.markdown })
    } catch {
      setLearnTarget({ title: trend.title, content: trend.description })
    } finally {
      setScrapingId(null)
    }
  }

  // If learning, show the learn chat full screen
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
        <h1 className="page-title">Signal Feed</h1>
        <p className="page-subtitle">
          Curated trends, autonomous radar, and manual analysis. Click "Learn" for Claude to teach you.
        </p>
        {doneCount > 0 && (
          <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8 }}>
            {doneCount} source{doneCount > 1 ? 's' : ''} processed &middot; {totalInsights} insights
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface2)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {[
          { id: 'trends' as Tab, label: 'Trends' },
          { id: 'radar' as Tab, label: 'Scout Radar' },
          { id: 'manual' as Tab, label: 'Manual' },
        ].map((t) => (
          <button key={t.id}
            className={tab === t.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setTab(t.id)} style={{ borderRadius: 8 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Trends tab */}
      {tab === 'trends' && (
        <>
          {loadingTrends ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 40, justifyContent: 'center' }}>
              <span className="analyze-spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} />
              <span style={{ color: 'var(--text2)' }}>Loading Techmeme trends...</span>
            </div>
          ) : trends.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📡</div>
              <div className="empty-title">Could not load trends</div>
              <div className="empty-desc">Try the autonomous Radar or enter content manually.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-label">Techmeme — Today</span>
                <button className="btn btn-ghost btn-sm" onClick={() => { setTrends([]); setLoadingTrends(false) }}>
                  Refresh
                </button>
              </div>
              {trends.map((trend, i) => (
                <div key={i} className="card-sm fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="tag">{trend.source}</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>
                      <a href={trend.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'none' }}>
                        {trend.title}
                      </a>
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.4 }}>{trend.description}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleLearn(trend)}
                    disabled={scrapingId === trend.url}
                    style={{ flexShrink: 0 }}
                  >
                    {scrapingId === trend.url ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="analyze-spinner" style={{ width: 12, height: 12, margin: 0, borderWidth: 2 }} />
                        Loading...
                      </span>
                    ) : 'Learn'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Radar tab */}
      {tab === 'radar' && <ScoutRadar />}

      {/* Manual tab */}
      {tab === 'manual' && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <ContentIntakeForm />
          </div>
          {contentItems.filter((c) => c.source === 'text').length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {contentItems.filter((c) => c.source === 'text').map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
