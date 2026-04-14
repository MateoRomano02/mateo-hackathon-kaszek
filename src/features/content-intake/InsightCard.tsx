import { useState } from 'react'
import type { CanonicalInsight } from '@/entities/content/types'

const CONFIDENCE_MAP: Record<string, { cls: string; label: string; dots: number }> = {
  high: { cls: 'confidence-high', label: 'Alta confianza', dots: 4 },
  medium: { cls: 'confidence-medium', label: 'Inferencia', dots: 3 },
  low: { cls: 'confidence-low', label: 'Baja confianza', dots: 2 },
}

interface InsightCardProps {
  insight: CanonicalInsight
}

export function InsightCard({ insight }: InsightCardProps) {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const conf = CONFIDENCE_MAP[insight.confidenceLevel] ?? CONFIDENCE_MAP.low

  return (
    <div className="insight-card" style={{ borderLeftColor: insight.confidenceLevel === 'high' ? 'var(--high)' : insight.confidenceLevel === 'medium' ? 'var(--mid)' : 'var(--noise)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span className="insight-title">{insight.title}</span>
        <span className={`confidence-badge ${conf.cls}`}>
          <span className="confidence-dots">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className={`confidence-dot ${i < conf.dots ? 'filled' : 'empty'}`} />
            ))}
          </span>
          {conf.label}
        </span>
      </div>

      {/* Canonical truth */}
      <p className="insight-summary">{insight.insight}</p>
      <p className="insight-why">{insight.validationReason}</p>

      {/* Related skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
        {insight.relatedSkills.map((rs) => (
          <span key={rs.skill} className={`badge badge-${rs.statusImpact === 'rising' ? 'high' : rs.statusImpact === 'degrading' ? 'medium' : rs.statusImpact === 'gone' ? 'noise' : 'neutral'}`}>
            {rs.skill} ({rs.statusImpact})
          </span>
        ))}
      </div>

      {/* Contradictions */}
      {insight.contradictions.length > 0 && (
        <div className="inference-note" style={{ marginTop: 8 }}>
          <strong>Contradiccion:</strong> {insight.contradictions[0].description}
          {insight.contradictions[0].resolution && (
            <span> — Resolucion: {insight.contradictions[0].resolution}</span>
          )}
        </div>
      )}

      {/* Evidence toggle */}
      <button className="evidence-toggle" onClick={() => setEvidenceOpen(!evidenceOpen)}>
        {evidenceOpen ? '▾ Ocultar evidencia' : `▸ Ver evidencia (${insight.evidence.length} citas)`}
      </button>

      {/* Evidence panel */}
      {evidenceOpen && (
        <div className="evidence-panel">
          {insight.evidence.map((ev, i) => (
            <div key={i} className="evidence-item" style={{ flexDirection: 'column', gap: 4 }}>
              <p className="evidence-quote">"{ev.exactQuote}"</p>
              <span className={`badge ${ev.inferenceFlag ? 'badge-medium' : 'badge-high'}`} style={{ alignSelf: 'flex-start' }}>
                {ev.inferenceFlag ? 'Inferencia de Claude' : 'Explicito en fuente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
