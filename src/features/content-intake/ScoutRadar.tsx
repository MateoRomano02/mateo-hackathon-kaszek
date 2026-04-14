import { useScoutRadar } from './useScoutRadar'
import { useAppStore } from '@/app/providers/store'
import { ContentCard } from './ContentCard'

export function ScoutRadar() {
  const { isScanning, scanStep, scanProgress, scanTrends } = useScoutRadar()
  const contentItems = useAppStore((s) => s.contentItems)
  const radarItems = contentItems.filter((c) => c.source === 'url')

  return (
    <div>
      {/* Scan button + progress */}
      <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
        {!isScanning ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <div className="card-label" style={{ textAlign: 'center' }}>Scout Radar</div>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>
                Escanea Hacker News, filtra por tu stack y procesa las tendencias con el Truth Pipeline.
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={scanTrends}>
              Escanear Tendencias
            </button>
          </>
        ) : (
          <>
            {/* Radar animation */}
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 20px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '2px solid var(--border)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 40, height: 2, background: 'var(--accent)',
                  transformOrigin: 'left center',
                  animation: 'spin 2s linear infinite',
                }} />
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: `conic-gradient(from 0deg, transparent 0%, rgba(109,40,217,0.15) 10%, transparent 20%)`,
                  animation: 'spin 2s linear infinite',
                }} />
              </div>
            </div>

            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{scanStep}</p>

            {/* Progress bar */}
            <div className="progress-container" style={{ maxWidth: 300, margin: '0 auto' }}>
              <div className="progress-fill" style={{ width: `${scanProgress}%` }} />
            </div>
            <p className="progress-label" style={{ marginTop: 8 }}>{scanProgress}%</p>
          </>
        )}
      </div>

      {/* Results feed */}
      {radarItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {radarItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {radarItems.length === 0 && !isScanning && (
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: 24 }}>📡</div>
          <div className="empty-title">Radar inactivo</div>
          <div className="empty-desc">Presiona "Escanear Tendencias" para que el Scout busque contenido relevante para tu perfil.</div>
        </div>
      )}
    </div>
  )
}
