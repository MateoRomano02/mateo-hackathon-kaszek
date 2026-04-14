import { WeekPlanDay } from '@/entities/analysis/types'

interface WeekPlanViewProps {
  days: WeekPlanDay[]
}

export function WeekPlanView({ days }: WeekPlanViewProps) {
  const todayIndex = 0 // Day 1 is always "today" for demo purposes

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {days.map((day, i) => (
        <div
          key={day.day}
          className={`card-sm ${i === todayIndex ? 'day-card today' : 'day-card'}`}
          style={{ borderRadius: 10 }}
        >
          <div className="flex items-center gap-12">
            <div style={{ textAlign: 'center', minWidth: 40 }}>
              <div className="font-mono text-xs text-dim">DÍA</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{day.day}</div>
              <div className="text-xs text-muted">{day.label}</div>
            </div>
            <div className="flex-1">
              <div className="text-accent fw-500 text-sm mb-4">{day.focus}</div>
              {day.tasks.map((task, ti) => (
                <div key={ti} className="day-task">
                  · <span>{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
