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
  isLoadingFeed: boolean
  feedError: string | null
  onLoadFeed: () => void
  onDismissFeedError: () => void
}

export function DashboardFeature({
  user,
  content,
  analysis,
  isAnalyzing,
  onNavigate,
  onAnalyze,
  isLoadingFeed,
  feedError,
  onLoadFeed,
  onDismissFeedError,
}: DashboardFeatureProps) {
  const hasContent = content.length > 0

  return (
    <>
      <div className="page-header fade-up">
        <div className="text-dim font-mono text-xs mb-8">{formatDateLong()}</div>
        <h1 className="page-title">Buenos días, {user.name.split(' ')[0]} 🔥</h1>
        <p className="page-subtitle">
          Lo que está en tendencia en tu vertical — {user.currentFocus || 'configurá tu foco'}
        </p>
        <div className="page-actions">
          {hasContent && (
            <Button variant="primary" type="button" onClick={onAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? 'Actualizando...' : '🔥 Actualizar Trending'}
            </Button>
          )}
          <Button
            variant={hasContent ? 'secondary' : 'primary'}
            type="button"
            onClick={onLoadFeed}
            disabled={isLoadingFeed}
          >
            {isLoadingFeed ? 'Cargando señales...' : '📡 Cargar señales de Techmeme'}
          </Button>
          <Button variant="secondary" type="button" onClick={() => onNavigate('/inbox')}>
            + Agregar señal
          </Button>
        </div>
      </div>

      {feedError && (
        <div className="feed-error-banner fade-up" role="alert">
          <span>No se pudo cargar el feed: {feedError}</span>
          <button className="feed-error-dismiss" onClick={onDismissFeedError}>✕</button>
        </div>
      )}

      <StatsGrid content={content} analysis={analysis} />

      {!hasContent && !isLoadingFeed && (
        <div className="card empty-state fade-up fade-up-2">
          <EmptyState
            icon="📡"
            title="Sin señales todavía"
            description="Cargá las últimas noticias de Techmeme para ver qué está en tendencia en tu vertical y convertirlo en acciones concretas."
            action={
              <Button variant="primary" size="lg" type="button" onClick={onLoadFeed} disabled={isLoadingFeed}>
                {isLoadingFeed ? 'Cargando...' : '📡 Cargar señales de Techmeme'}
              </Button>
            }
          />
        </div>
      )}

      {isLoadingFeed && (
        <div className="card fade-up fade-up-2" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="text-muted font-mono text-sm">Obteniendo señales de Techmeme...</div>
        </div>
      )}

      {hasContent && !analysis && (
        <div className="card empty-state fade-up fade-up-2">
          <EmptyState
            icon="🔥"
            title="Señales cargadas"
            description={`${content.length} señales listas. Analizá el trending para ver qué importa en tu vertical esta semana.`}
            action={
              <Button variant="primary" size="lg" type="button" onClick={onAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? 'Actualizando...' : '🔥 Actualizar Trending'}
              </Button>
            }
          />
        </div>
      )}

      {analysis && (
        <QuickInsights analysis={analysis} content={content} onNavigate={onNavigate} />
      )}
    </>
  )
}
