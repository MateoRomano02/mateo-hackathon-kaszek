import { ConfidenceLevel } from '@/entities/source/types'

const CONFIG: Record<ConfidenceLevel, { label: string; dots: number; cls: string }> = {
  high:      { label: 'Alta confianza',  dots: 4, cls: 'confidence-high'      },
  medium:    { label: 'Media confianza', dots: 3, cls: 'confidence-medium'    },
  low:       { label: 'Baja confianza',  dots: 2, cls: 'confidence-low'       },
  uncertain: { label: 'Incierto',        dots: 1, cls: 'confidence-uncertain' },
}

interface ConfidenceBadgeProps {
  level: ConfidenceLevel
  score?: number
  showScore?: boolean
}

export function ConfidenceBadge({ level, score, showScore = false }: ConfidenceBadgeProps) {
  const cfg = CONFIG[level]
  return (
    <span className={`confidence-badge ${cfg.cls}`}>
      <span className="confidence-dots">
        {[...Array(4)].map((_, i) => (
          <span key={i} className={`confidence-dot ${i < cfg.dots ? 'filled' : 'empty'}`} />
        ))}
      </span>
      {cfg.label}
      {showScore && score !== undefined && (
        <span style={{ opacity: 0.7, marginLeft: 2 }}>{score}</span>
      )}
    </span>
  )
}
