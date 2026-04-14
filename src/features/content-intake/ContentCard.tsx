import type { ContentItem } from '@/entities/content/types'
import { InsightCard } from './InsightCard'

const AUTHORITY_LABELS: Record<string, string> = {
  official_docs: 'Fuente oficial',
  major_publication: 'Publicacion mayor',
  industry_blog: 'Blog especializado',
  social_media: 'Red social',
  unknown: 'Desconocido',
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  primary: 'Fuente primaria',
  secondary: 'Fuente secundaria',
  opinion: 'Opinion',
  aggregator: 'Agregador',
}

const PIPELINE_STEPS: Record<string, string> = {
  pending: 'En cola...',
  scraping: 'Extrayendo contenido...',
  evaluating_source: 'Evaluando credibilidad...',
  extracting_insights: 'Extrayendo verdades canonicas...',
}

interface ContentCardProps {
  item: ContentItem
}

export function ContentCard({ item }: ContentCardProps) {
  if (item.status !== 'done' && item.status !== 'error') {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="analyze-spinner" style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} />
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{PIPELINE_STEPS[item.status] ?? 'Procesando...'}</span>
        {item.sourceMetadata && (
          <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>
            {AUTHORITY_LABELS[item.sourceMetadata.domainAuthority]} — {item.sourceMetadata.credibilityScore.toFixed(1)}/10
          </span>
        )}
      </div>
    )
  }

  if (item.status === 'error') {
    return (
      <div className="card" style={{ borderColor: 'rgba(185,28,28,.3)' }}>
        <p style={{ color: 'var(--noise)', fontSize: 13 }}>{item.error ?? 'Error desconocido'}</p>
      </div>
    )
  }

  const meta = item.sourceMetadata

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Source header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          {item.originalUrl && <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{item.originalUrl}</p>}
          {meta?.author && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Por {meta.author}</p>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {meta && <span className="badge badge-neutral">{AUTHORITY_LABELS[meta.domainAuthority]}</span>}
          {meta && <span className="tag">{SOURCE_TYPE_LABELS[meta.sourceType]}</span>}
          <span className="badge badge-high" style={{ fontFamily: 'var(--font-mono)' }}>{item.overallRelevance.toFixed(1)}</span>
        </div>
      </div>

      {/* Credibility bar */}
      {meta && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="card-label" style={{ marginBottom: 0 }}>Credibilidad de fuente</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>{meta.credibilityScore.toFixed(1)}/10</span>
          </div>
          <div className="score-bar">
            <div className="score-fill" style={{
              width: `${meta.credibilityScore * 10}%`,
              background: meta.credibilityScore >= 7 ? 'var(--high)' : meta.credibilityScore >= 4 ? 'var(--mid)' : 'var(--noise)',
            }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{meta.credibilityReason}</p>
        </div>
      )}

      {/* Canonical insights */}
      {(item.canonicalInsights?.length ?? 0) > 0 && (
        <div>
          <div className="card-label">Verdades canonicas ({item.canonicalInsights.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {item.canonicalInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
