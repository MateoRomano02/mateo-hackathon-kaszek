type Priority = 'high' | 'medium' | 'low'
type BadgeVariant = Priority | 'noise' | 'neutral'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={priority}>{priority}</Badge>
}
