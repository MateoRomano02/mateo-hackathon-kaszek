import { useAppContext } from '@/app/context/AppContext'
import { MemoryFeature } from '@/features/memory/MemoryFeature'
import { EmptyState } from '@/shared/ui/EmptyState/EmptyState'

export function MemoryPage() {
  const { analysis } = useAppContext()

  return (
    <div className="page">
      {analysis
        ? <MemoryFeature analysis={analysis} />
        : <EmptyState
            icon="🧠"
            title="Sin memoria todavía"
            description="Ejecutá el análisis para empezar a construir tu memoria de aprendizaje."
          />
      }
    </div>
  )
}
