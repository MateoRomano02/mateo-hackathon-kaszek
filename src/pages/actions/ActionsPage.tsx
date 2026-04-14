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
          Tus recursos analizados, listos para aprender. Clickea cualquiera para que Claude te ensene.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-highlight">
          <div className="card-label">Recursos para aprender</div>
          <div className="card-value">{learnedItems.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Insights disponibles</div>
          <div className="card-value" style={{ color: 'var(--accent)' }}>{totalActionable}</div>
        </div>
        <div className="card">
          <div className="card-label">Acciones completadas</div>
          <div className="card-value" style={{ color: 'var(--high)' }}>{completedCount}</div>
        </div>
      </div>

      {/* Learning items */}
      {learnedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">Sin recursos para aprender</div>
          <div className="empty-desc">Analiza contenido en el Signal Feed o usa el Scout Radar para llenar tu biblioteca de aprendizaje.</div>
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
                        {highConf} alta confianza
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    {insights[0]?.title ?? 'Recurso analizado'}
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
                    title: insights[0]?.title ?? 'Recurso',
                    content: item.rawContent,
                  })}>
                  Aprender
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
