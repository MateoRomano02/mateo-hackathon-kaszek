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
        <h1 className="page-title">Analisis</h1>
        <p className="page-subtitle">
          Todas las verdades canonicas extraidas de tus fuentes, ordenadas por confianza.
        </p>
      </div>

      {allInsights.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">?</div>
          <div className="empty-title">Sin insights todavia</div>
          <div className="empty-desc">Analiza contenido en el Truth Pipeline para ver insights canonicos aqui.</div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="card stat-highlight">
              <div className="card-label">Insights totales</div>
              <div className="card-value">{allInsights.length}</div>
            </div>
            <div className="card">
              <div className="card-label">Alta confianza</div>
              <div className="card-value" style={{ color: 'var(--high)' }}>{highConfidence}</div>
            </div>
            <div className="card">
              <div className="card-label">Con contradicciones</div>
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
