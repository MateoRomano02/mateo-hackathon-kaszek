import { Recap } from '@/entities/analysis/types'
import { Card } from '@/shared/ui/Card/Card'

interface ProgressSummaryProps {
  recap: Recap
  totalActions: number
}

export function ProgressSummary({ recap, totalActions }: ProgressSummaryProps) {
  const actionPct = totalActions > 0
    ? Math.round((recap.actionsCompleted / totalActions) * 100)
    : 0

  return (
    <Card>
      <div className="card-label">Progreso de la semana</div>
      <div className="mt-12">
        <div className="flex justify-between text-sm mb-6">
          <span className="text-muted">Contenido analizado</span>
          <span>{recap.contentCount} piezas</span>
        </div>
        <div className="score-bar mb-16" style={{ height: 6 }}>
          <div className="score-fill" style={{ width: '100%' }} />
        </div>
        <div className="flex justify-between text-sm mb-6">
          <span className="text-muted">Acciones completadas</span>
          <span>{recap.actionsCompleted} / {totalActions}</span>
        </div>
        <div className="score-bar" style={{ height: 6 }}>
          <div className="score-fill" style={{ width: `${actionPct}%` }} />
        </div>
      </div>
    </Card>
  )
}
