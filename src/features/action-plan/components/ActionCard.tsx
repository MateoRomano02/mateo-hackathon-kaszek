import { useState } from 'react'
import { ActionItem } from '@/entities/analysis/types'
import { PriorityBadge } from '@/shared/ui/Badge/Badge'
import { Button } from '@/shared/ui/Button/Button'

const ACTION_ICONS: Record<string, string> = {
  task: '⚡', template: '📄', prompt: '💬', hypothesis: '🧪', checklist: '✓',
}

interface ActionCardProps {
  action: ActionItem
  isDone: boolean
  onToggle: () => void
}

export function ActionCard({ action, isDone, onToggle }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="action-card" style={isDone ? { opacity: 0.5 } : {}}>
      <div className="flex items-start gap-12">
        <div className={`action-type-icon type-${action.type}`}>
          {ACTION_ICONS[action.type] ?? '•'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-8 mb-4">
            <span className="fw-500" style={{ fontSize: 14 }}>{action.title}</span>
            <PriorityBadge priority={action.priority} />
          </div>
          <div className="text-sm text-muted mb-6">{action.description}</div>
          <div className="flex items-center gap-8">
            <span className="tag">⏱ {action.estimatedTime}</span>
            <span className="tag">{action.type}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-8 mt-12">
        <Button variant="secondary" size="sm" type="button" onClick={() => setExpanded((p) => !p)}>
          {expanded ? 'Ocultar detalle' : 'Ver detalle'}
        </Button>
        <Button
          variant={isDone ? 'secondary' : 'primary'}
          size="sm"
          type="button"
          onClick={onToggle}
        >
          {isDone ? '✓ Hecho' : 'Marcar hecho'}
        </Button>
      </div>

      {expanded && <div className="action-content-box">{action.content}</div>}
    </div>
  )
}
