import { AnalysisResult } from '@/entities/analysis/types'
import { ActionCard } from './components/ActionCard'
import { WeekPlanView } from './components/WeekPlanView'

interface ActionPlanProps {
  analysis: AnalysisResult
  completedActions: string[]
  onToggleAction: (id: string) => void
}

export function ActionPlan({ analysis, completedActions, onToggleAction }: ActionPlanProps) {
  return (
    <>
      <div className="page-header fade-up">
        <h1 className="page-title">Plan de acción</h1>
        <p className="page-subtitle">{analysis.actions.length} acciones generadas a partir del análisis</p>
      </div>

      <div className="grid-2 gap-20">
        <div className="fade-up">
          <div className="card-label mb-12">Acciones concretas</div>
          {analysis.actions.map((a) => (
            <ActionCard
              key={a.id}
              action={a}
              isDone={completedActions.includes(a.id)}
              onToggle={() => onToggleAction(a.id)}
            />
          ))}
        </div>

        <div className="fade-up fade-up-1">
          <div className="card-label mb-12">Plan de 7 días</div>
          <WeekPlanView days={analysis.weekPlan} />
        </div>
      </div>
    </>
  )
}
