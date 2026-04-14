import { useAppContext } from '@/app/context/AppContext'
import { ActionPlan } from '@/features/action-plan/ActionPlan'
import { EmptyState } from '@/shared/ui/EmptyState/EmptyState'

export function ActionsPage() {
  const { analysis, completedActions, toggleActionDone } = useAppContext()

  return (
    <div className="page">
      {analysis
        ? <ActionPlan analysis={analysis} completedActions={completedActions} onToggleAction={toggleActionDone} />
        : <EmptyState
            icon="⚡"
            title="Sin acciones todavía"
            description="Ejecutá el análisis desde el Dashboard para generar tu plan de acción."
          />
      }
    </div>
  )
}
