import { UserProfile } from '@/entities/user/types'
import { ContentItem } from '@/entities/content/types'
import { AnalysisResult } from '@/entities/analysis/types'
import { Button } from '@/shared/ui/Button/Button'
import { EmptyState } from '@/shared/ui/EmptyState/EmptyState'
import { formatDateLong } from '@/shared/utils/dates'
import { StatsGrid } from './components/StatsGrid'
import { QuickInsights } from './components/QuickInsights'

interface DashboardFeatureProps {
  user: UserProfile
  content: ContentItem[]
  analysis: AnalysisResult | null
  isAnalyzing: boolean
  onNavigate: (route: string) => void
  onAnalyze: () => void
}

export function DashboardFeature({
  user,
  content,
  analysis,
  isAnalyzing,
  onNavigate,
  onAnalyze,
}: DashboardFeatureProps) {
  return (
    <>
      <div className="page-header fade-up">
        <div className="text-dim font-mono text-xs mb-8">{formatDateLong()}</div>
        <h1 className="page-title">Buenos días, {user.name.split(' ')[0]} 🔥</h1>
        <p className="page-subtitle">
          Lo que está en tendencia en tu vertical — {user.currentFocus || 'configurá tu foco'}
        </p>
        <div className="page-actions">
          <Button variant="primary" type="button" onClick={onAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? 'Actualizando...' : '🔥 Actualizar Trending'}
          </Button>
          <Button variant="secondary" type="button" onClick={() => onNavigate('/inbox')}>
            + Agregar señal
          </Button>
        </div>
      </div>

      <StatsGrid content={content} analysis={analysis} />

      {!analysis && (
        <div className="card empty-state fade-up fade-up-2">
          <EmptyState
            icon="🔥"
            title="Sin trending todavía"
            description="Actualizá el trending para ver qué está en tendencia en tu vertical esta semana y convertirlo en acciones concretas."
            action={
              <Button variant="primary" size="lg" type="button" onClick={onAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? 'Actualizando...' : '🔥 Actualizar Trending'}
              </Button>
            }
          />
        </div>
      )}

      {analysis && (
        <QuickInsights analysis={analysis} onNavigate={onNavigate} />
      )}
    </>
  )
}
