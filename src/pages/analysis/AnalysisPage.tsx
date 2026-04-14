import { useAppContext } from '@/app/context/AppContext'
import { AnalysisFeature } from '@/features/analysis/AnalysisFeature'
import { EmptyState } from '@/shared/ui/EmptyState/EmptyState'

export function AnalysisPage() {
  const { analysis, content } = useAppContext()

  return (
    <div className="page">
      {analysis
        ? <AnalysisFeature analysis={analysis} content={content} />
        : <EmptyState
            icon="🧠"
            title="Sin análisis todavía"
            description="Cargá contenido y ejecutá el análisis desde el Dashboard."
          />
      }
    </div>
  )
}
