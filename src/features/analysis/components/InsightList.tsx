import { Insight } from '@/entities/analysis/types'
import { ContentItem } from '@/entities/content/types'
import { CanonicalInsightCard } from './CanonicalInsightCard'

interface InsightListProps {
  insights: Insight[]
  content?: ContentItem[]
  compact?: boolean
}

export function InsightList({ insights, content = [], compact = false }: InsightListProps) {
  return (
    <div className="mt-16">
      {insights.map((ins) => (
        <CanonicalInsightCard
          key={ins.id}
          insight={ins}
          content={content}
          compact={compact}
        />
      ))}
    </div>
  )
}
