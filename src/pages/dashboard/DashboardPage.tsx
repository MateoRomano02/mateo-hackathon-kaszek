import { useDashboard } from '@/features/dashboard/useDashboard'
import { SkillStocksGrid } from '@/features/dashboard/SkillStocksGrid'
import { Button } from '@/shared/ui'

export function DashboardPage() {
  const {
    userProfile,
    skillStocks,
    stocksByStatus,
    isLoading,
    error,
    runAiAnalysis,
  } = useDashboard()

  if (!userProfile) return null

  return (
    <div className="space-y-8">
      {/* Profile summary */}
      {userProfile.summary && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-zinc-300">{userProfile.summary}</p>
            <div className="flex flex-wrap gap-2">
              {userProfile.stack.map((tool) => (
                <span key={tool} className="text-[11px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                  {tool}
                </span>
              ))}
            </div>
            {userProfile.goals && userProfile.goals.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {userProfile.goals.map((goal) => (
                  <span key={goal} className="text-[11px] bg-indigo-600/10 text-indigo-400 px-2 py-0.5 rounded">
                    {goal}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Tu Portafolio de Skills</h2>
          <p className="text-sm text-zinc-500 mt-1">
            {skillStocks.length} skills analizados &middot;{' '}
            {userProfile.stack.length} herramientas en tu stack
          </p>
        </div>

        <Button
          onClick={runAiAnalysis}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analizando...
            </span>
          ) : (
            'Re-analizar skills'
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {skillStocks.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-zinc-400">Tu portafolio de skills esta vacio.</p>
          <Button onClick={runAiAnalysis} disabled={isLoading} className="cursor-pointer">
            Generar analisis con Claude
          </Button>
        </div>
      ) : (
        <SkillStocksGrid stocksByStatus={stocksByStatus} />
      )}
    </div>
  )
}
