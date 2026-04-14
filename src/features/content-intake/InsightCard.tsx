import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SKILL_STATUS_CONFIG } from '@/shared/constants'
import type { CanonicalInsight } from '@/entities/content/types'

const CONFIDENCE_CONFIG = {
  high: { label: 'Alta confianza', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  medium: { label: 'Inferencia', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  low: { label: 'Baja confianza', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
}

interface InsightCardProps {
  insight: CanonicalInsight
}

export function InsightCard({ insight }: InsightCardProps) {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const conf = CONFIDENCE_CONFIG[insight.confidenceLevel]

  return (
    <div className={cn('rounded-lg border p-4 space-y-3', conf.bg, conf.border)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-sm text-zinc-100">{insight.title}</h4>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-[10px] uppercase font-bold px-1.5 py-0.5 rounded', conf.color, conf.bg)}>
            {conf.label}
          </span>
          <span className="text-xs font-mono text-zinc-500">{insight.confidenceScore.toFixed(1)}</span>
        </div>
      </div>

      {/* Canonical truth */}
      <p className="text-sm text-zinc-300 leading-relaxed">{insight.insight}</p>

      {/* Validation reason */}
      <p className="text-xs text-zinc-500 italic">{insight.validationReason}</p>

      {/* Related skills */}
      <div className="flex flex-wrap gap-1.5">
        {insight.relatedSkills.map((rs) => {
          const skillConf = SKILL_STATUS_CONFIG[rs.statusImpact]
          return (
            <span key={rs.skill} className={cn('text-[11px] px-2 py-0.5 rounded', skillConf.bgColor, skillConf.color)}>
              {rs.skill} ({rs.statusImpact})
            </span>
          )
        })}
      </div>

      {/* Contradictions */}
      {insight.contradictions.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded px-3 py-2 space-y-1">
          <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Contradiccion detectada</p>
          {insight.contradictions.map((c, i) => (
            <div key={i}>
              <p className="text-xs text-red-300">{c.description}</p>
              {c.resolution && <p className="text-xs text-zinc-500">Resolucion: {c.resolution}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Evidence panel toggle */}
      <button
        type="button"
        onClick={() => setEvidenceOpen(!evidenceOpen)}
        className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
      >
        {evidenceOpen ? 'Ocultar evidencia' : `Ver evidencia (${insight.evidence.length} citas)`}
      </button>

      {/* Evidence panel */}
      {evidenceOpen && (
        <div className="space-y-2 pl-3 border-l-2 border-zinc-700">
          {insight.evidence.map((ev, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-xs text-zinc-300 italic">"{ev.exactQuote}"</p>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded',
                ev.inferenceFlag
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-400',
              )}>
                {ev.inferenceFlag ? 'Inferencia de Claude' : 'Explicito en fuente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
