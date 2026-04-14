import { ContentItem } from '@/entities/content/types'
import { AnalysisResult } from '@/entities/analysis/types'
import { Card } from '@/shared/ui/Card/Card'

interface StatsGridProps {
  content: ContentItem[]
  analysis: AnalysisResult | null
}

export function StatsGrid({ content, analysis }: StatsGridProps) {
  // % de señales que pasan TODOS los criterios
  const analyzedSignals = content.filter((c) => c.analysis && !c.analysis.isNoise)
  const fullMatch = analyzedSignals.filter(
    (c) => c.analysis?.criteriaScores?.length && c.analysis.criteriaScores.every((cs) => cs.passed),
  ).length
  const matchRate = analyzedSignals.length > 0
    ? Math.round((fullMatch / analyzedSignals.length) * 100)
    : null

  // Criterios activos del perfil — lo inferimos del primer item con scores
  const activeCriteria = content
    .find((c) => c.analysis?.criteriaScores?.length)
    ?.analysis?.criteriaScores?.length ?? 0

  return (
    <div className="grid-4 gap-16 mb-24 fade-up fade-up-1">

      {/* HÉROE: match de criterios */}
      <Card highlight>
        <div className="card-label">Match de criterios</div>
        <div className="card-value" style={{ color: matchRate === 100 ? 'var(--high)' : matchRate !== null && matchRate >= 50 ? 'var(--accent)' : 'var(--mid)' }}>
          {matchRate !== null ? `${matchRate}%` : '—'}
        </div>
        <div className="card-sub">
          {matchRate !== null
            ? `${fullMatch} de ${analyzedSignals.length} señales cumplen todo`
            : 'actualizá el trending'}
        </div>
      </Card>

      <Card>
        <div className="card-label">Criterios activos</div>
        <div className="card-value" style={{ color: 'var(--accent)' }}>
          {activeCriteria || '—'}
        </div>
        <div className="card-sub">
          {activeCriteria ? 'reglas de filtrado personalizadas' : 'configurá tu criterio'}
        </div>
      </Card>

      <Card>
        <div className="card-label">Señales válidas</div>
        <div className="card-value" style={{ color: 'var(--high)' }}>
          {analysis?.signalCount ?? '—'}
        </div>
        <div className="card-sub">
          {analysis ? `${analysis.noiseCount} descartadas como ruido` : ''}
        </div>
      </Card>

      <Card>
        <div className="card-label">Acciones listas</div>
        <div className="card-value" style={{ color: 'var(--accent2)' }}>
          {analysis?.actions.length ?? '—'}
        </div>
        <div className="card-sub">{analysis ? 'para ejecutar esta semana' : ''}</div>
      </Card>

    </div>
  )
}
