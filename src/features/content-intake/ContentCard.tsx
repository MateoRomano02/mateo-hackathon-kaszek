import { cn } from '@/lib/utils'
import { SKILL_STATUS_CONFIG } from '@/shared/constants'
import type { ContentItem } from '@/entities/content/types'

const CATEGORY_LABELS: Record<string, string> = {
  tutorial: 'Tutorial',
  news: 'Noticia',
  tool: 'Herramienta',
  case_study: 'Caso de estudio',
  opinion: 'Opinion',
}

interface ContentCardProps {
  item: ContentItem
}

export function ContentCard({ item }: ContentCardProps) {
  if (item.status === 'pending' || item.status === 'analyzing') {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <span className="text-sm text-zinc-400">
            {item.status === 'pending' ? 'Extrayendo contenido...' : 'Analizando con Claude...'}
          </span>
        </div>
        {item.originalUrl && (
          <p className="text-xs text-zinc-600 mt-2 truncate">{item.originalUrl}</p>
        )}
      </div>
    )
  }

  if (item.status === 'error') {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5">
        <p className="text-sm text-red-400">{item.error ?? 'Error desconocido'}</p>
        {item.originalUrl && (
          <p className="text-xs text-zinc-600 mt-1 truncate">{item.originalUrl}</p>
        )}
      </div>
    )
  }

  const analysis = item.analysis!

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="font-semibold text-zinc-100 text-sm leading-tight">{analysis.title}</h3>
          {item.originalUrl && (
            <p className="text-xs text-zinc-600 truncate">{item.originalUrl}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
            {CATEGORY_LABELS[analysis.category] ?? analysis.category}
          </span>
          <span className="text-xs font-mono text-indigo-400">{analysis.relevanceScore.toFixed(1)}</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-zinc-400 leading-relaxed">{analysis.summary}</p>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5">
        {analysis.mainTopics.map((topic) => (
          <span
            key={topic}
            className="text-xs bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Related skills */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Skills impactados</h4>
        <div className="space-y-1.5">
          {analysis.relatedSkills.map((rs) => {
            const config = SKILL_STATUS_CONFIG[rs.statusImpact]
            return (
              <div key={rs.skill} className={cn('flex items-center gap-2 text-xs rounded px-2 py-1.5', config.bgColor)}>
                <span className={cn('font-medium', config.color)}>{rs.skill}</span>
                <span className="text-zinc-500">-</span>
                <span className="text-zinc-400 flex-1">{rs.reason}</span>
                <span className={cn('text-[10px] uppercase font-bold', config.color)}>{rs.statusImpact}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action items */}
      {analysis.actionItems.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Acciones sugeridas</h4>
          <ul className="space-y-1">
            {analysis.actionItems.map((action, i) => (
              <li key={i} className="text-xs text-zinc-300 flex gap-2">
                <span className="text-indigo-400 shrink-0">-</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
