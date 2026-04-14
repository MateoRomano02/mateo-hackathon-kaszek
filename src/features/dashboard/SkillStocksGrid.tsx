import { SKILL_STATUSES, SKILL_STATUS_CONFIG } from '@/shared/constants'
import type { SkillStatus } from '@/shared/constants'
import type { SkillStock } from '@/entities/user/types'
import { SkillStockCard } from './SkillStockCard'
import { cn } from '@/lib/utils'

interface SkillStocksGridProps {
  stocksByStatus: (status: SkillStatus) => SkillStock[]
}

export function SkillStocksGrid({ stocksByStatus }: SkillStocksGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {SKILL_STATUSES.map((status) => {
        const config = SKILL_STATUS_CONFIG[status]
        const skills = stocksByStatus(status)

        return (
          <div key={status} className="space-y-4">
            {/* Column Header */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <h2 className={cn('text-sm font-bold uppercase tracking-wider', config.color)}>
                {config.label}
              </h2>
              <span className="text-xs text-zinc-600 font-mono">({skills.length})</span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {skills.length === 0 ? (
                <p className="text-xs text-zinc-600 italic py-4">Sin skills en esta categoria</p>
              ) : (
                skills.map((skill) => (
                  <SkillStockCard key={skill.id} skill={skill} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
