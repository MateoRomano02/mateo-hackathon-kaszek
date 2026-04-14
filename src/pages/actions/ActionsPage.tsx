import { useState } from 'react'
import { useAppStore } from '@/app/providers/store'
import { LearnChat } from '@/features/learning/LearnChat'

export function ActionsPage() {
  const { contentItems, projectProgress } = useAppStore()
  const [learnTarget, setLearnTarget] = useState<{ title: string; content: string } | null>(null)

  // Get all done content with their insights
  const learnedItems = contentItems.filter((c) => c.status === 'done' && (c.canonicalInsights?.length ?? 0) > 0)

  // Count action items across all insights
  const allInsights = learnedItems.flatMap((c) => c.canonicalInsights ?? [])
  const totalActionable = allInsights.length
  const completedCount = Object.values(projectProgress).flat().length

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
        <h1 className="page-title">Learning Hub</h1>
        <p className="page-subtitle">
          Your analyzed resources, ready to learn. Click any to have Claude teach you.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-highlight">
          <div className="card-label">Resources to learn</div>
          <div className="card-value">{learnedItems.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Available insights</div>
          <div className="card-value" style={{ color: 'var(--accent)' }}>{totalActionable}</div>
        </div>
        <div className="card">
          <div className="card-label">Completed actions</div>
          <div className="card-value" style={{ color: 'var(--high)' }}>{completedCount}</div>
        </div>
      </div>

      {/* Learning items */}
      {learnedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">No resources to learn</div>
          <div className="empty-desc">Analyze content in the Signal Feed or use the Scout Radar to fill your learning library.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {learnedItems.map((item) => {
            const insights = item.canonicalInsights ?? []
            const highConf = insights.filter((i) => i.confidenceLevel === 'high').length

            return (
              <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {item.sourceMetadata && (
                      <span className="tag">{item.sourceMetadata.domainAuthority.replace('_', ' ')}</span>
                    )}
                    <span className="badge badge-high">{insights.length} insights</span>
                    {highConf > 0 && (
                      <span className="confidence-badge confidence-high">
                        <span className="confidence-dots">
                          {[0, 1, 2, 3].map((i) => <span key={i} className={`confidence-dot ${i < 4 ? 'filled' : 'empty'}`} />)}
                        </span>
                        {highConf} high confidence
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    {insights[0]?.title ?? 'Analyzed resource'}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {insights[0]?.insight?.slice(0, 120) ?? item.rawContent.slice(0, 120)}...
                  </p>
                  {item.originalUrl && (
                    <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{item.originalUrl}</p>
                  )}
                </div>
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}
                  onClick={() => setLearnTarget({
                    title: insights[0]?.title ?? 'Resource',
                    content: item.rawContent,
                  })}>
                  Learn
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
