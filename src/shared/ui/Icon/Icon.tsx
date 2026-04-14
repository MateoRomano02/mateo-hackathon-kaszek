import { ICON_PATHS, IconName } from '@/shared/icons/paths'

interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
}

export function Icon({ name, size = 16, color = 'currentColor', className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}
