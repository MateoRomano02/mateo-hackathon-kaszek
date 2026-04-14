import { cn } from '@/lib/utils'
import { useOnboarding } from './useOnboarding'
import { Button } from '@/shared/ui'
import { MARKETER_STACK_OPTIONS, MARKETER_ONBOARDING } from '@/config/verticals/marketer'
import { SENIORITY_LEVELS, VERTICAL_TYPES } from '@/shared/constants'

export function OnboardingForm() {
  const {
    role,
    setRole,
    seniority,
    setSeniority,
    selectedStack,
    toggleStack,
    isLoading,
    submit,
  } = useOnboarding()

  return (
    <div className="space-y-10">
      {/* Role */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-300">
          {MARKETER_ONBOARDING.roleQuestion}
        </h2>
        <div className="flex flex-wrap gap-3">
          {VERTICAL_TYPES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setRole(v)}
              disabled={v !== 'marketer'}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
                role === v
                  ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                  : v === 'marketer'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-zinc-900 text-zinc-600 cursor-not-allowed',
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500">
          MVP: Solo Marketer disponible. Proximamente: Recruiter, Developer, Ops.
        </p>
      </section>

      {/* Seniority */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-300">
          {MARKETER_ONBOARDING.seniorityQuestion}
        </h2>
        <div className="flex gap-3">
          {SENIORITY_LEVELS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeniority(s)}
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
                seniority === s
                  ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-300">
          {MARKETER_ONBOARDING.stackQuestion}
        </h2>
        <div className="flex flex-wrap gap-2">
          {MARKETER_STACK_OPTIONS.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => toggleStack(tool)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-all cursor-pointer',
                selectedStack.includes(tool)
                  ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/50'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300',
              )}
            >
              {tool}
            </button>
          ))}
        </div>
        {selectedStack.length > 0 && (
          <p className="text-xs text-zinc-500">
            {selectedStack.length} herramienta{selectedStack.length > 1 ? 's' : ''} seleccionada
            {selectedStack.length > 1 ? 's' : ''}
          </p>
        )}
      </section>

      {/* Submit */}
      <Button
        onClick={submit}
        disabled={selectedStack.length === 0 || isLoading}
        className="w-full cursor-pointer"
        size="lg"
      >
        {isLoading ? 'Generando diagnostico...' : 'Generar mi diagnostico'}
      </Button>
    </div>
  )
}
