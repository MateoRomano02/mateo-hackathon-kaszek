import { useAppStore } from '@/app/providers/store'
import { InsightCard } from '@/features/content-intake/InsightCard'
import type { CanonicalInsight } from '@/entities/content/types'

export function AnalysisPage() {
  const contentItems = useAppStore((s) => s.contentItems)

  // Aggregate all canonical insights from all content items
  const allInsights: CanonicalInsight[] = contentItems
    .filter((c) => c.status === 'done')
    .flatMap((c) => c.canonicalInsights ?? [])
    .sort((a, b) => b.confidenceScore - a.confidenceScore)

  const highConfidence = allInsights.filter((i) => i.confidenceLevel === 'high').length
  const withContradictions = allInsights.filter((i) => i.contradictions.length > 0).length

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Analysis</h1>
        <p className="page-subtitle">
          All canonical truths extracted from your sources, sorted by confidence.
        </p>
      </div>

      {allInsights.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">?</div>
          <div className="empty-title">No insights yet</div>
          <div className="empty-desc">Analyze content in the Truth Pipeline to see canonical insights here.</div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="card stat-highlight">
              <div className="card-label">Total insights</div>
              <div className="card-value">{allInsights.length}</div>
            </div>
            <div className="card">
              <div className="card-label">High confidence</div>
              <div className="card-value" style={{ color: 'var(--high)' }}>{highConfidence}</div>
            </div>
            <div className="card">
              <div className="card-label">With contradictions</div>
              <div className="card-value" style={{ color: 'var(--noise)' }}>{withContradictions}</div>
            </div>
          </div>

          {/* Insight list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {allInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
