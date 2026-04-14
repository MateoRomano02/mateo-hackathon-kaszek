import { OnboardingFormData } from '@/entities/user/types'
import { Select } from '@/shared/ui/Select/Select'
import { getVerticalConfig } from '@/config/verticals'

interface Props {
  form: OnboardingFormData
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void
}

export function OnboardingGoalStep({ form, setField }: Props) {
  const config = getVerticalConfig(form.vertical)

  return (
    <div>
      <div className="form-group">
        <label className="form-label" htmlFor="goal">¿Cuál es tu objetivo principal ahora?</label>
        <textarea
          id="goal"
          className="input"
          placeholder={config.goalPlaceholder}
          value={form.goal}
          onChange={(e) => setField('goal', e.target.value)}
        />
      </div>

      <Select
        label="¿En qué canal estás más activo?"
        options={config.channels}
        value={form.mainChannel}
        onChange={(e) => setField('mainChannel', e.target.value)}
      />

      <div className="form-group">
        <label className="form-label" htmlFor="focus">¿En qué estás enfocado esta semana?</label>
        <input
          id="focus"
          className="input"
          placeholder={config.focusPlaceholder}
          value={form.currentFocus}
          onChange={(e) => setField('currentFocus', e.target.value)}
        />
      </div>
    </div>
  )
}
