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
        <h1 className="page-title">Memory</h1>
        <p className="page-subtitle">Your learning progress and skill reinforcement.</p>
      </div>

      {/* Progress */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-highlight">
          <div className="card-label">Analyzed content</div>
          <div className="card-value">{doneContent}</div>
          <div className="card-sub">{totalInsights} insights extracted</div>
        </div>
        <div className="card">
          <div className="card-label">Completed projects</div>
          <div className="card-value">{projects.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Skills tracked</div>
          <div className="card-value">{skillStocks.length}</div>
        </div>
      </div>

      {/* Skills recap */}
      {skillStocks.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          {risingSkills.length > 0 && (
            <div className="memory-section">
              <div className="memory-section-title">Learning (Rising)</div>
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
              <div className="memory-section-title">Deprioritizing (Degrading)</div>
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
              <div className="memory-section-title">Archived (Gone)</div>
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
          <div className="empty-title">No memory data</div>
          <div className="empty-desc">Complete onboarding and analyze content to see your progress here.</div>
        </div>
      )}
    </>
  )
}
