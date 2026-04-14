interface ProgressBarProps {
  value: number // 0-100
  label?: string
  color?: string
  height?: number
}

export function ProgressBar({ value, label, color, height = 8 }: ProgressBarProps) {
  return (
    <div>
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-container w-full">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            height,
            ...(color ? { background: color } : {}),
          }}
        />
      </div>
    </div>
  )
}

export function ScoreBar({ value }: { value: number }) {
  return (
    <div className="score-bar">
      <div className="score-fill" style={{ width: `${value}%` }} />
    </div>
  )
}
