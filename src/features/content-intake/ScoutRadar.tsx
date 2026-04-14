import { useScoutRadar } from './useScoutRadar'
import { useAppStore } from '@/app/providers/store'
import { ContentCard } from './ContentCard'

export function ScoutRadar() {
  const { isScanning, logs, scanProgress, scanTrends } = useScoutRadar()
  const contentItems = useAppStore((s) => s.contentItems)
  const radarItems = contentItems.filter((c) => c.source === 'url' && c.status === 'done')

  return (
    <div>
      {/* Radar control */}
      <div className="card" style={{ marginBottom: 24 }}>
        {!isScanning ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 16, background: 'rgba(109,40,217,.08)', border: '1px solid rgba(109,40,217,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              📡
            </div>
            <h3 style={{ fontSize: 16, fontFamily: 'var(--font-serif)', marginBottom: 4 }}>Scout Radar Autonomo</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, maxWidth: 400, margin: '0 auto 16px' }}>
              Escanea Hacker News y Reddit basado en tu stack. Filtra por relevancia. Procesa con el Truth Pipeline.
            </p>
            <button className="btn btn-primary btn-lg" onClick={scanTrends}>
              Escanear Tendencias de mi Stack
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="card-label" style={{ margin: 0 }}>Escaneando...</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{scanProgress}%</span>
              </div>
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>

            {/* Terminal-style log */}
            <div style={{
              background: '#0d0d11', borderRadius: 8, padding: 14, maxHeight: 240, overflowY: 'auto',
              fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.8,
            }}>
              {logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: 8, color: log.status === 'error' ? '#ef4444' : log.status === 'done' ? '#a3a3a3' : '#c4b5fd' }}>
                  <span style={{ color: '#6b7280', flexShrink: 0 }}>{log.timestamp}</span>
                  <span style={{ color: log.status === 'running' ? '#c4b5fd' : log.status === 'error' ? '#ef4444' : '#22c55e', flexShrink: 0 }}>
                    {log.status === 'running' ? '●' : log.status === 'done' ? '✓' : '✗'}
                  </span>
                  <span>{log.step}</span>
                </div>
              ))}
              {isScanning && (
                <div style={{ display: 'flex', gap: 8, color: '#c4b5fd' }}>
                  <span style={{ color: '#6b7280' }}>{new Date().toLocaleTimeString('es-AR')}</span>
                  <span className="analyze-spinner" style={{ width: 10, height: 10, margin: 0, borderWidth: 1, borderColor: '#4c1d95', borderTopColor: '#c4b5fd' }} />
                  <span>procesando...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {radarItems.length > 0 && (
        <div>
          <div className="card-label" style={{ marginBottom: 12 }}>
            Hallazgos del Radar ({radarItems.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {radarItems.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
