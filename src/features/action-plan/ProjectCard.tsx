import { cn } from '@/lib/utils'
import type { GeneratedProject } from '@/entities/content/types'

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Principiante', color: 'text-emerald-400 bg-emerald-500/10' },
  intermediate: { label: 'Intermedio', color: 'text-amber-400 bg-amber-500/10' },
  advanced: { label: 'Avanzado', color: 'text-red-400 bg-red-500/10' },
}

interface ProjectCardProps {
  project: GeneratedProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const diff = DIFFICULTY_CONFIG[project.difficulty]

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-zinc-100">{project.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn('text-xs px-2 py-0.5 rounded', diff.color)}>
              {diff.label}
            </span>
            <span className="text-xs text-zinc-500">{project.estimatedTime}</span>
          </div>
        </div>
        <p className="text-sm text-zinc-400">{project.description}</p>
        <p className="text-xs text-indigo-400">Skill: {project.skillTarget}</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Pasos</h4>
        <ol className="space-y-2.5">
          {project.steps.map((step) => (
            <li key={step.step} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                {step.step}
              </span>
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-medium text-zinc-200">{step.title}</p>
                <p className="text-xs text-zinc-400">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Resources */}
      {project.resources.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Recursos</h4>
          <div className="flex flex-wrap gap-2">
            {project.resources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded transition-colors"
              >
                {r.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Outcome */}
      <div className="bg-zinc-800/50 rounded-lg px-4 py-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Resultado esperado</p>
        <p className="text-sm text-zinc-300">{project.expectedOutcome}</p>
      </div>
    </div>
  )
}
