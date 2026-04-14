import { useEffect, useRef, useState } from 'react'
import { OnboardingFormData } from '@/entities/user/types'
import { getVerticalConfig } from '@/config/verticals'
import { Button } from '@/shared/ui/Button/Button'

interface Props {
  form: OnboardingFormData
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void
}

export function OnboardingCriteriaStep({ form, setField }: Props) {
  const config = getVerticalConfig(form.vertical)
  const [criteria, setCriteria] = useState<string[]>(
    () => form.criteria.length > 0 ? form.criteria : config.defaultCriteria,
  )

  // Sync defaults to form on mount if form was empty
  const synced = useRef(false)
  useEffect(() => {
    if (!synced.current && form.criteria.length === 0) {
      synced.current = true
      setField('criteria', criteria)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function update(i: number, value: string) {
    const next = criteria.map((c, idx) => (idx === i ? value : c))
    setCriteria(next)
    setField('criteria', next)
  }

  function remove(i: number) {
    const next = criteria.filter((_, idx) => idx !== i)
    setCriteria(next)
    setField('criteria', next)
  }

  function add() {
    if (criteria.length >= 5) return
    const next = [...criteria, '']
    setCriteria(next)
    setField('criteria', next)
  }

  return (
    <div>
      <p className="text-sm text-muted mb-16" style={{ lineHeight: 1.5 }}>
        La IA evaluará cada trending contra estas reglas y te dirá si lo pasa o no, y por qué.
        <br />
        <span style={{ opacity: 0.6 }}>Personalizá los que ves abajo o escribí los tuyos.</span>
      </p>

      <div className="flex flex-col gap-8 mb-12">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-8">
            <span
              className="text-sm"
              style={{ minWidth: 22, color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}
            >
              {i + 1}.
            </span>
            <input
              className="input flex-1"
              value={c}
              placeholder="Ej: Solo si tiene datos o casos reales"
              onChange={(e) => update(i, e.target.value)}
            />
            {criteria.length > 1 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px 8px', color: 'var(--noise)', flexShrink: 0 }}
                onClick={() => remove(i)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {criteria.length < 5 && (
        <Button variant="secondary" size="sm" type="button" onClick={add}>
          + Agregar criterio
        </Button>
      )}
    </div>
  )
}
