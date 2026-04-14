import { cn } from '@/lib/utils'
import { SKILL_STATUS_CONFIG } from '@/shared/constants'
import type { SkillStock } from '@/entities/user/types'
import { useNavigate } from 'react-router-dom'
import { useActionPlan } from '@/features/action-plan/useActionPlan'

interface SkillStockCardProps {
  skill: SkillStock
}

export function SkillStockCard({ skill }: SkillStockCardProps) {
  const config = SKILL_STATUS_CONFIG[skill.status]
  const { isGenerating, activeSkill, generateProject } = useActionPlan()
  const navigate = useNavigate()

  const handleGenerateProject = async () => {
    await generateProject(skill.skill)
    navigate('/actions')
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-3 transition-all hover:scale-[1.02]',
        config.bgColor,
        config.borderColor,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-zinc-100">{skill.skill}</h3>
        <span className="text-xs font-mono text-zinc-500">
          {skill.priorityScore.toFixed(1)}
        </span>
      </div>

      {/* Rationale */}
      <p className="text-xs text-zinc-400 leading-relaxed">{skill.rationale}</p>

      {/* Action */}
      <div className={cn('text-xs font-medium', config.color)}>
        {skill.suggestedAction}
      </div>

      {/* Generate project button for Rising skills */}
      {skill.status === 'rising' && (
        <button
          type="button"
          onClick={handleGenerateProject}
          disabled={isGenerating && activeSkill === skill.skill}
          className="w-full mt-1 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {isGenerating && activeSkill === skill.skill
            ? 'Generando proyecto...'
            : 'Generar proyecto'}
        </button>
      )}
    </div>
  )
}
