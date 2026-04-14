import { useState } from 'react'
import { useAppStore } from '@/app/providers/store'
import { TutorChat } from './TutorChat'
import type { GeneratedProject } from '@/entities/content/types'

const DIFF_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

interface ProjectCardProps {
  project: GeneratedProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [tutorOpen, setTutorOpen] = useState(false)
  const { projectProgress, toggleStepComplete } = useAppStore()
  const completedSteps = projectProgress[project.id] ?? []
  const progressPct = project.steps.length > 0
    ? Math.round((completedSteps.length / project.steps.length) * 100)
    : 0

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-serif)', marginBottom: 4 }}>{project.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>{project.description}</p>
          <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>Skill: {project.skillTarget}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span className="badge badge-neutral">{DIFF_LABELS[project.difficulty]}</span>
          <span className="tag">{project.estimatedTime}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="card-label" style={{ margin: 0 }}>Course progress</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: progressPct === 100 ? 'var(--high)' : 'var(--text2)' }}>
            {progressPct}% — {completedSteps.length}/{project.steps.length} steps
          </span>
        </div>
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progressPct}%`, background: progressPct === 100 ? 'var(--high)' : undefined }} />
        </div>
      </div>

      {/* 2-column layout: Curriculum + Tutor */}
      <div style={{ display: 'grid', gridTemplateColumns: tutorOpen ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* Left: Curriculum */}
        <div>
          <div className="card-label">Curriculum</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {project.steps.map((step) => {
              const done = completedSteps.includes(step.step)
              return (
                <div key={step.step}
                  style={{
                    display: 'flex', gap: 10, padding: '10px 12px',
                    background: done ? 'rgba(21,128,61,.06)' : 'var(--surface2)',
                    border: `1px solid ${done ? 'rgba(21,128,61,.2)' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onClick={() => toggleStepComplete(project.id, step.step)}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${done ? 'var(--high)' : 'var(--border2)'}`,
                    background: done ? 'var(--high)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                  }}>
                    {done && '✓'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--high)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1 }}>
                      {step.step}. {step.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Resources */}
          {project.resources.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="card-label">Resources</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="tag" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                    {r.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Tutor Chat */}
        {tutorOpen && (
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
            <TutorChat project={project} />
          </div>
        )}
      </div>

      {/* Tutor toggle + outcome */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className={`btn ${tutorOpen ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          onClick={() => setTutorOpen(!tutorOpen)}>
          {tutorOpen ? 'Close Tutor' : '🤖 Open AI Tutor'}
        </button>
        {progressPct === 100 && (
          <span className="badge badge-high">Course completed!</span>
        )}
      </div>

      {/* Expected outcome */}
      <div className="action-content-box" style={{ marginTop: 12 }}>
        <strong>Expected outcome:</strong> {project.expectedOutcome}
      </div>
    </div>
  )
}
