interface SignalNoiseBarProps {
  signalCount: number
  noiseCount: number
  totalContent: number
}

export function SignalNoiseBar({ signalCount, noiseCount, totalContent }: SignalNoiseBarProps) {
  const signalPct = totalContent > 0 ? Math.round((signalCount / totalContent) * 100) : 0
  const noisePct  = totalContent > 0 ? Math.round((noiseCount  / totalContent) * 100) : 0

  return (
    <div className="card">
      <div className="card-label">Distribución signal / noise</div>
      <div className="mt-16">
        <div style={{ marginBottom: 16 }}>
          <div className="flex justify-between text-sm mb-8">
            <span className="text-muted">Signal útil</span>
            <span className="fw-500" style={{ color: 'var(--accent)' }}>{signalCount} piezas</span>
          </div>
          <div className="score-bar" style={{ height: 8 }}>
            <div className="score-fill" style={{ width: `${signalPct}%`, background: 'var(--accent)' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-8">
            <span className="text-muted">Ruido filtrado</span>
            <span className="fw-500" style={{ color: 'var(--accent3)' }}>{noiseCount} piezas</span>
          </div>
          <div className="score-bar" style={{ height: 8 }}>
            <div className="score-fill" style={{ width: `${noisePct}%`, background: 'var(--accent3)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
