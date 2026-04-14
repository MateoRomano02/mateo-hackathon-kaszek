import { cn } from '@/lib/utils'
import type { ContentItem } from '@/entities/content/types'
import { InsightCard } from './InsightCard'

const AUTHORITY_CONFIG: Record<string, { label: string; color: string }> = {
  official_docs: { label: 'Fuente oficial', color: 'text-emerald-400 bg-emerald-500/10' },
  major_publication: { label: 'Publicacion mayor', color: 'text-blue-400 bg-blue-500/10' },
  industry_blog: { label: 'Blog especializado', color: 'text-violet-400 bg-violet-500/10' },
  social_media: { label: 'Red social', color: 'text-amber-400 bg-amber-500/10' },
  unknown: { label: 'Desconocido', color: 'text-zinc-400 bg-zinc-500/10' },
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  primary: 'Fuente primaria',
  secondary: 'Fuente secundaria',
  opinion: 'Opinion',
  aggregator: 'Agregador',
}

const PIPELINE_STEPS: Record<string, string> = {
  pending: 'En cola...',
  scraping: 'Extrayendo contenido...',
  evaluating_source: 'Evaluando credibilidad...',
  extracting_insights: 'Extrayendo verdades canonicas...',
}

interface ContentCardProps {
  item: ContentItem
}

export function ContentCard({ item }: ContentCardProps) {
  // Loading states
  if (item.status !== 'done' && item.status !== 'error') {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <span className="text-sm text-zinc-400">{PIPELINE_STEPS[item.status] ?? 'Procesando...'}</span>
        </div>
        {item.originalUrl && <p className="text-xs text-zinc-600 truncate">{item.originalUrl}</p>}

        {/* Show source metadata if already evaluated */}
        {item.sourceMetadata && (
          <div className="flex items-center gap-2 text-xs">
            <span className={cn('px-2 py-0.5 rounded', AUTHORITY_CONFIG[item.sourceMetadata.domainAuthority]?.color)}>
              {AUTHORITY_CONFIG[item.sourceMetadata.domainAuthority]?.label}
            </span>
            <span className="text-zinc-500">
              Credibilidad: {item.sourceMetadata.credibilityScore.toFixed(1)}/10
            </span>
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (item.status === 'error') {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <p className="text-sm text-red-400">{item.error ?? 'Error desconocido'}</p>
        {item.originalUrl && <p className="text-xs text-zinc-600 mt-1 truncate">{item.originalUrl}</p>}
      </div>
    )
  }

  // Done state — full Truth UX
  const meta = item.sourceMetadata
  const authority = meta ? AUTHORITY_CONFIG[meta.domainAuthority] : null

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-5">
      {/* Source header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          {item.originalUrl && (
            <p className="text-xs text-zinc-600 truncate">{item.originalUrl}</p>
          )}
          {meta?.author && (
            <p className="text-xs text-zinc-500">Por {meta.author}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Source Authority Badge */}
          {authority && (
            <span className={cn('text-[10px] uppercase font-bold px-2 py-0.5 rounded', authority.color)}>
              {authority.label}
            </span>
          )}
          {/* Source type */}
          {meta && (
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
              {SOURCE_TYPE_LABELS[meta.sourceType] ?? meta.sourceType}
            </span>
          )}
          {/* Relevance */}
          <span className="text-xs font-mono text-indigo-400">{item.overallRelevance.toFixed(1)}</span>
        </div>
      </div>

      {/* Credibility bar */}
      {meta && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-500 uppercase tracking-wider">Credibilidad de fuente</span>
            <span className="text-zinc-400">{meta.credibilityScore.toFixed(1)}/10</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                meta.credibilityScore >= 7 ? 'bg-emerald-500' : meta.credibilityScore >= 4 ? 'bg-amber-500' : 'bg-red-500',
              )}
              style={{ width: `${meta.credibilityScore * 10}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-500">{meta.credibilityReason}</p>
        </div>
      )}

      {/* Canonical insights */}
      {item.canonicalInsights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Verdades canonicas ({item.canonicalInsights.length})
          </h4>
          {item.canonicalInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  )
}
