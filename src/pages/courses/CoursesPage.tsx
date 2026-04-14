import { useState } from 'react'
import { useAppStore } from '@/app/providers/store'
import { LearnChat } from '@/features/learning/LearnChat'

export function CoursesPage() {
  const { savedCourses, projectProgress } = useAppStore()
  const [learnTarget, setLearnTarget] = useState<{ title: string; content: string } | null>(null)

  if (learnTarget) {
    return <LearnChat resourceTitle={learnTarget.title} resourceContent={learnTarget.content} onClose={() => setLearnTarget(null)} />
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Courses</h1>
        <p className="page-subtitle">Resources you started learning. Your progress is saved automatically.</p>
      </div>

      {savedCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">No saved courses</div>
          <div className="empty-desc">When you click "Learn" on a trend, the resource is saved here automatically.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {savedCourses.map((course) => {
            const key = `learn:${course.title.slice(0, 40)}`
            const steps = projectProgress[key] ?? []
            return (
              <div key={course.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, cursor: 'pointer' }}
                onClick={() => setLearnTarget({ title: course.title, content: course.content })}>
                <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'rgba(109,40,217,.08)', border: '1px solid rgba(109,40,217,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  📖
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{course.title}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                    {steps.length > 0 ? `${steps.length} action${steps.length > 1 ? 's' : ''} completed` : 'No progress yet'}
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Continue</button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
