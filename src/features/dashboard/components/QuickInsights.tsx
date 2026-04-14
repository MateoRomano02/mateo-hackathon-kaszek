import { AnalysisResult } from '@/entities/analysis/types'
import { ContentItem } from '@/entities/content/types'
import { Card } from '@/shared/ui/Card/Card'
import { Button } from '@/shared/ui/Button/Button'
import { PriorityBadge } from '@/shared/ui/Badge/Badge'
import { TrendingFeed } from './TrendingFeed'

const ACTION_ICONS: Record<string, string> = {
  task: '⚡', template: '📄', prompt: '💬', hypothesis: '🧪', checklist: '✓',
}

interface QuickInsightsProps {
  analysis: AnalysisResult
  content: ContentItem[]
  onNavigate: (route: string) => void
}

export function QuickInsights({ analysis, content, onNavigate }: QuickInsightsProps) {
  return (
    <div className="grid-2 gap-16 fade-up fade-up-2">

      {/* ── Trending feed — Techmeme style ── */}
      <div className="card">
        <div className="card-label">Señales de esta semana</div>
        <TrendingFeed
          insights={analysis.insights.slice(0, 3)}
          content={content}
        />
        <Button
          variant="ghost" size="sm" type="button"
          style={{ marginTop: 12 }}
          onClick={() => onNavigate('/analysis')}
        >
          Ver análisis completo →
        </Button>
      </div>

      {/* ── Next actions ── */}
      <Card>
        <div className="card-label">Próximas acciones</div>
        <div className="mt-12">
          {analysis.actions.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-start gap-12" style={{ marginBottom: 14 }}>
              <div className={`action-type-icon type-${a.type}`}>
                {ACTION_ICONS[a.type] ?? '•'}
              </div>
              <div className="flex-1">
                <div className="fw-500" style={{ fontSize: 13 }}>{a.title}</div>
                <div className="text-sm text-muted">{a.estimatedTime}</div>
              </div>
              <PriorityBadge priority={a.priority} />
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" type="button" onClick={() => onNavigate('/actions')}>
          Ver plan completo →
        </Button>
      </Card>

    </div>
  )
}
