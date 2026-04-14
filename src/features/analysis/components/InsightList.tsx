import { Insight } from '@/entities/analysis/types'
import { PriorityBadge } from '@/shared/ui/Badge/Badge'

interface InsightListProps {
  insights: Insight[]
  compact?: boolean
}

export function InsightList({ insights, compact = false }: InsightListProps) {
  return (
    <div className="mt-16">
      {insights.map((ins) => (
        <div key={ins.id} className={`insight-card ${ins.priority}`}>
          <div className="flex items-center gap-8 mb-6">
            <PriorityBadge priority={ins.priority} />
            {!compact && <div className="insight-title">{ins.title}</div>}
          </div>
          {compact && <div className="insight-title">{ins.title}</div>}
          <div className="insight-summary">{ins.summary}</div>
          {!compact && <div className="insight-why">💡 {ins.why}</div>}
        </div>
      ))}
    </div>
  )
}
