import { useState } from 'react'
import { useAppStore } from '@/app/providers/store'
import { LearnChat } from '@/features/learning/LearnChat'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export function CoursesPage() {
  const { contentItems } = useAppStore()
  const [learnTarget, setLearnTarget] = useState<{ title: string; content: string } | null>(null)
  const navigate = useNavigate()

  const learnedItems = contentItems.filter((c) => c.status === 'done' && (c.canonicalInsights?.length ?? 0) > 0)

  if (learnTarget) {
    return (
      <LearnChat
        resourceTitle={learnTarget.title}
        resourceContent={learnTarget.content}
        onClose={() => setLearnTarget(null)}
      />
    )
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Mis Cursos</h1>
        <p className="page-subtitle">Recursos analizados, listos para aprender con Claude.</p>
      </div>

      {learnedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">Todavia no tenes cursos</div>
          <div className="empty-desc">Anda al Feed, elegí una tendencia y clickea "Aprender".</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(ROUTES.DASHBOARD)}>
            Ir al Dashboard
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {learnedItems.map((item) => {
            const insights = item.canonicalInsights ?? []
            const title = insights[0]?.title ?? 'Recurso analizado'
            const preview = insights[0]?.insight?.slice(0, 140) ?? item.rawContent.slice(0, 140)

            return (
              <div key={item.id} className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(109,40,217,.08)', border: '1px solid rgba(109,40,217,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  📖
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {preview}...
                  </p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span className="badge badge-high">{insights.length} insights</span>
                    {item.sourceMetadata && (
                      <span className="tag">{item.sourceMetadata.credibilityScore.toFixed(1)}/10</span>
                    )}
                  </div>
                </div>

                {/* Learn */}
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}
                  onClick={() => setLearnTarget({ title, content: item.rawContent })}>
                  Aprender
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
