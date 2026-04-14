import { AnalysisResult } from '@/entities/analysis/types'
import { RecapView } from './components/RecapView'
import { ProgressSummary } from './components/ProgressSummary'

interface MemoryFeatureProps {
  analysis: AnalysisResult
}

export function MemoryFeature({ analysis }: MemoryFeatureProps) {
  const { recap } = analysis

  return (
    <>
      <div className="page-header fade-up">
        <h1 className="page-title">Mi memoria</h1>
        <p className="page-subtitle">
          {recap.week} · {recap.contentCount} piezas procesadas · {recap.actionsCompleted} acciones completadas
        </p>
      </div>

      <div className="grid-2 gap-20">
        <div className="fade-up">
          <RecapView recap={recap} />
        </div>

        <div className="fade-up fade-up-1">
          <div className="card mb-16">
            <div className="memory-section">
              <div className="memory-section-title">🔁 Para repasar</div>
              {recap.toReview.map((rv, i) => (
                <div key={i} className="memory-item">
                  <div className="memory-dot dot-review" />
                  {rv}
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div>
              <div className="memory-section-title">🎯 Próximo skill</div>
              <div
                className="card-sm"
                style={{ background: 'rgba(109,40,217,.05)', border: '1px solid rgba(109,40,217,.2)' }}
              >
                <div className="text-accent fw-500" style={{ fontSize: 15 }}>{recap.nextSkill}</div>
                <div className="text-sm text-muted mt-4">Tu siguiente área de desarrollo recomendada</div>
              </div>
            </div>
          </div>

          <ProgressSummary recap={recap} totalActions={analysis.actions.length} />
        </div>
      </div>
    </>
  )
}
