import { useState, useEffect } from 'react'
import { useAppStore } from '@/app/providers/store'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'
import { getTrendingForProfile, type TrendingArticle } from '@/services/scraper/TrendingScraperService'
import { scrapeUrl } from '@/services/scraper/JinaScraperService'
import { SKILL_STATUS_CONFIG } from '@/shared/constants'
import { LearnChat } from '@/features/learning/LearnChat'

const MAX_TRENDS = 3
const MAX_SKILLS_PER_STATUS = 3

export function DashboardPage() {
  const { userProfile, skillStocks, setSkillStocks, isLoading, setIsLoading, error, setError, aiMode } = useAppStore()

  const [trends, setTrends] = useState<TrendingArticle[]>([])
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [learnTarget, setLearnTarget] = useState<{ title: string; content: string } | null>(null)
  const [scrapingUrl, setScrapingUrl] = useState<string | null>(null)

  const service = aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService

  // Auto-fetch profile-relevant trends on mount
  useEffect(() => {
    if (!userProfile) return
    getTrendingForProfile(userProfile)
      .then((articles) => setTrends(articles.slice(0, MAX_TRENDS)))
      .catch(() => {})
      .finally(() => setLoadingTrends(false))
  }, [userProfile])

  if (!userProfile) return null

  const risingSkills = skillStocks.filter((s) => s.status === 'rising').sort((a, b) => b.priorityScore - a.priorityScore)
  const degradingSkills = skillStocks.filter((s) => s.status === 'degrading')
  const stableSkills = skillStocks.filter((s) => s.status === 'stable')

  const runAnalysis = async () => {
    setIsLoading(true); setError(null)
    try { setSkillStocks(await service.analyzeSkillPortfolio(userProfile)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setIsLoading(false) }
  }

  const handleLearn = async (trend: TrendingArticle) => {
    setScrapingUrl(trend.url)
    try {
      const scraped = await scrapeUrl(trend.url)
      setLearnTarget({ title: trend.title, content: scraped.markdown })
    } catch {
      setLearnTarget({ title: trend.title, content: trend.snippet })
    } finally {
      setScrapingUrl(null)
    }
  }

  // Learning view (replaces dashboard when active)
  if (learnTarget) {
    return <LearnChat resourceTitle={learnTarget.title} resourceContent={learnTarget.content} onClose={() => setLearnTarget(null)} />
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Hello, {userProfile.name}</h1>
            <p className="page-subtitle">{userProfile.summary ?? `${userProfile.role} / ${userProfile.seniority}`}</p>
          </div>
          {skillStocks.length === 0 && (
            <button className="btn btn-primary" onClick={runAnalysis} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze my skills'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(185,28,28,.3)', background: 'rgba(185,28,28,.05)', marginBottom: 20 }}>
          <p style={{ color: 'var(--noise)', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Trends section — the star of the demo */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="card-label" style={{ margin: 0 }}>Trending for your stack</div>
          {!loadingTrends && (
            <button className="btn btn-ghost btn-sm" onClick={() => {
              setLoadingTrends(true)
              getTrendingForProfile(userProfile!).then((a) => setTrends(a.slice(0, MAX_TRENDS))).finally(() => setLoadingTrends(false))
            }}>
              Refresh
            </button>
          )}
        </div>

        {loadingTrends ? (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 }}>
            <span className="analyze-spinner" style={{ width: 20, height: 20, margin: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Scanning HN and Reddit for your stack...</span>
          </div>
        ) : trends.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>No trends found. Try refreshing.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trends.map((trend, i) => (
              <div key={i} className="card fade-up" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                {/* Source badge */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: trend.source === 'hackernews' ? 'rgba(255,102,0,.08)' : 'rgba(255,69,0,.08)',
                  border: `1px solid ${trend.source === 'hackernews' ? 'rgba(255,102,0,.2)' : 'rgba(255,69,0,.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
                  color: trend.source === 'hackernews' ? '#ff6600' : '#ff4500',
                }}>
                  {trend.source === 'hackernews' ? 'HN' : 'R/'}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{trend.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {trend.snippet}
                  </p>
                </div>

                {/* Learn button */}
                <button className="btn btn-primary" onClick={() => handleLearn(trend)}
                  disabled={scrapingUrl === trend.url} style={{ flexShrink: 0 }}>
                  {scrapingUrl === trend.url ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="analyze-spinner" style={{ width: 14, height: 14, margin: 0, borderWidth: 2 }} />
                      Loading...
                    </span>
                  ) : 'Learn'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills portfolio (compact) */}
      {skillStocks.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-label" style={{ margin: 0 }}>Your skill portfolio</div>
            <button className="btn btn-ghost btn-sm" onClick={runAnalysis} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Re-analyze'}
            </button>
          </div>

          <div className="grid-3">
            {/* Rising */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span>{SKILL_STATUS_CONFIG.rising.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Rising</span>
                <span className="tag">{risingSkills.length}</span>
              </div>
              {risingSkills.slice(0, MAX_SKILLS_PER_STATUS).map((sk) => (
                <div key={sk.id} className="card-sm" style={{ padding: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{sk.skill}</span>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sk.suggestedAction}</p>
                </div>
              ))}
              {risingSkills.length > MAX_SKILLS_PER_STATUS && (
                <p style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>+{risingSkills.length - MAX_SKILLS_PER_STATUS} more</p>
              )}
            </div>

            {/* Stable */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span>{SKILL_STATUS_CONFIG.stable.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Stable</span>
                <span className="tag">{stableSkills.length}</span>
              </div>
              {stableSkills.slice(0, MAX_SKILLS_PER_STATUS).map((sk) => (
                <div key={sk.id} className="card-sm" style={{ padding: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{sk.skill}</span>
                </div>
              ))}
              {stableSkills.length === 0 && <p style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>-</p>}
            </div>

            {/* Degrading */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span>{SKILL_STATUS_CONFIG.degrading.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Degrading</span>
                <span className="tag">{degradingSkills.length}</span>
              </div>
              {degradingSkills.slice(0, MAX_SKILLS_PER_STATUS).map((sk) => (
                <div key={sk.id} className="card-sm" style={{ padding: 12, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{sk.skill}</span>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sk.rationale}</p>
                </div>
              ))}
              {degradingSkills.length === 0 && <p style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>-</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
