import { useState } from 'react'
import { Insight } from '@/entities/analysis/types'
import { ContentItem } from '@/entities/content/types'
import { PriorityBadge } from '@/shared/ui/Badge/Badge'
import { ConfidenceBadge } from '@/shared/ui/ConfidenceBadge/ConfidenceBadge'
import { EvidencePanel } from './EvidencePanel'

interface CanonicalInsightCardProps {
  insight: Insight
  content?: ContentItem[]
  compact?: boolean
}

export function CanonicalInsightCard({ insight, content = [], compact = false }: CanonicalInsightCardProps) {
  const [showEvidence, setShowEvidence] = useState(false)
  const hasEvidence = !compact && insight.evidence.length > 0 && content.length > 0

  return (
    <div className={`insight-card ${insight.priority}`}>

      {/* Header: confidence + source count + priority */}
      <div className="flex items-center gap-8 mb-8" style={{ flexWrap: 'wrap' }}>
        <ConfidenceBadge level={insight.confidence} score={insight.confidenceScore} />
        {!compact && insight.sourceCount > 1 && (
          <span className="tag" style={{ fontSize: 10 }}>
            {insight.sourceCount} fuentes · {insight.isConsolidated ? 'consolidado' : 'independiente'}
          </span>
        )}
        <PriorityBadge priority={insight.priority} />
      </div>

      {/* Title */}
      <div className="insight-title">{insight.title}</div>

      {/* Summary */}
      <div className="insight-summary mt-4">{insight.summary}</div>

      {/* Why this matters */}
      {!compact && (
        <div className="insight-why mt-6">💡 {insight.why}</div>
      )}

      {/* Inference note — marks what's inferred vs. explicit */}
      {!compact && insight.inferenceNote && (
        <div className="inference-note mt-8">
          ⚠ {insight.inferenceNote}
        </div>
      )}

      {/* Contradictions */}
      {!compact && insight.contradictions && insight.contradictions.length > 0 && (
        <div className="inference-note mt-6" style={{ borderColor: 'rgba(185,28,28,.25)', color: 'var(--noise)' }}>
          ⚡ {insight.contradictions[0].description}
        </div>
      )}

      {/* Evidence toggle */}
      {hasEvidence && (
        <button
          className="evidence-toggle"
          type="button"
          onClick={() => setShowEvidence((p) => !p)}
        >
          {showEvidence ? '▲' : '▼'}{' '}
          {insight.evidence.length} {insight.evidence.length === 1 ? 'fuente' : 'fuentes'} que lo sustentan
          {!showEvidence && (
            <span className="text-dim" style={{ fontSize: 10, marginLeft: 4 }}>
              (ver trazabilidad)
            </span>
          )}
        </button>
      )}

      {/* Evidence panel */}
      {showEvidence && <EvidencePanel evidence={insight.evidence} content={content} />}
    </div>
  )
}
