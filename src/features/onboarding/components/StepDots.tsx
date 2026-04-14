interface StepDotsProps {
  total: number
  current: number
}

export function StepDots({ total, current }: StepDotsProps) {
  return (
    <div className="step-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`step-dot ${i <= current ? 'active' : ''}`} />
      ))}
    </div>
  )
}
