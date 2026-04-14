import { useActionPlan } from '@/features/action-plan/useActionPlan'
import { ProjectCard } from '@/features/action-plan/ProjectCard'
import { useAppStore } from '@/app/providers/store'
import { Button } from '@/shared/ui'
import { cn } from '@/lib/utils'

export function ActionsPage() {
  const { projects, isGenerating, activeSkill, generateProject } = useActionPlan()
  const skillStocks = useAppStore((s) => s.skillStocks)

  const risingSkills = skillStocks.filter((s) => s.status === 'rising')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Proyectos Pre-Armados</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Claude genera mini-proyectos practicos para tus skills Rising. Accionables y con deadline.
        </p>
      </div>

      {/* Quick generate from Rising skills */}
      {risingSkills.length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Generar proyecto para un skill Rising</h3>
          <div className="flex flex-wrap gap-2">
            {risingSkills.map((skill) => (
              <Button
                key={skill.id}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                onClick={() => generateProject(skill.skill)}
                className={cn(
                  'cursor-pointer',
                  activeSkill === skill.skill && 'animate-pulse',
                )}
              >
                {activeSkill === skill.skill ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    Generando...
                  </span>
                ) : (
                  skill.skill
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">Todavia no generaste ningun proyecto.</p>
          <p className="text-zinc-600 text-xs mt-1">
            Selecciona un skill Rising arriba para que Claude te arme un proyecto practico.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
