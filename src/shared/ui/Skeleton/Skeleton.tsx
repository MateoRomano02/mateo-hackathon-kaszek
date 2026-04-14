interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: boolean
}

export function Skeleton({ width = '100%', height = 16, className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded ? '50%' : 4,
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width={80} height={10} />
      <Skeleton height={24} width="60%" />
      <Skeleton height={12} />
      <Skeleton height={12} width="80%" />
    </div>
  )
}
