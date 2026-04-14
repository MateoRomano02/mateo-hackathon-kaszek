import { useAppStore } from '@/app/providers/store'

export function MemoryPage() {
  const { skillStocks, contentItems, projects } = useAppStore()

  const doneContent = contentItems.filter((c) => c.status === 'done').length
  const totalInsights = contentItems.reduce((a, c) => a + (c.canonicalInsights?.length ?? 0), 0)
  const risingSkills = skillStocks.filter((s) => s.status === 'rising')
  const degradingSkills = skillStocks.filter((s) => s.status === 'degrading')
  const goneSkills = skillStocks.filter((s) => s.status === 'gone')

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Memoria</h1>
        <p className="page-subtitle">Tu progreso de aprendizaje y refuerzo de skills.</p>
      </div>

      {/* Progress */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-highlight">
          <div className="card-label">Contenido analizado</div>
          <div className="card-value">{doneContent}</div>
          <div className="card-sub">{totalInsights} insights extraidos</div>
        </div>
        <div className="card">
          <div className="card-label">Proyectos completados</div>
          <div className="card-value">{projects.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Skills trackeados</div>
          <div className="card-value">{skillStocks.length}</div>
        </div>
      </div>

      {/* Skills recap */}
      {skillStocks.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          {risingSkills.length > 0 && (
            <div className="memory-section">
              <div className="memory-section-title">Aprendiendo (Rising)</div>
              {risingSkills.map((s) => (
                <div key={s.id} className="memory-item">
                  <span className="memory-dot dot-learned" />
                  <div>
                    <span style={{ fontWeight: 500 }}>{s.skill}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 12 }}> - {s.suggestedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {degradingSkills.length > 0 && (
            <div className="memory-section">
              <div className="memory-section-title">Depriorizando (Degrading)</div>
              {degradingSkills.map((s) => (
                <div key={s.id} className="memory-item">
                  <span className="memory-dot dot-pending" />
                  <div>
                    <span style={{ fontWeight: 500 }}>{s.skill}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 12 }}> - {s.rationale}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {goneSkills.length > 0 && (
            <div className="memory-section">
              <div className="memory-section-title">Archivado (Gone)</div>
              {goneSkills.map((s) => (
                <div key={s.id} className="memory-item">
                  <span className="memory-dot dot-review" />
                  <div>
                    <span style={{ fontWeight: 500, textDecoration: 'line-through', opacity: 0.6 }}>{s.skill}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 12 }}> - {s.rationale}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {skillStocks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">?</div>
          <div className="empty-title">Sin datos de memoria</div>
          <div className="empty-desc">Completa el onboarding y analiza contenido para ver tu progreso aqui.</div>
        </div>
      )}
    </>
  )
}
