import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'md' | 'sm'
  highlight?: boolean
}

export function Card({ size = 'md', highlight = false, className = '', children, ...props }: CardProps) {
  const classes = [
    size === 'sm' ? 'card-sm' : 'card',
    highlight ? 'stat-highlight' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
