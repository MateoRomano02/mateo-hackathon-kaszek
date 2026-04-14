import { OnboardingFormData } from '@/entities/user/types'
import { getVerticalConfig } from '@/config/verticals'

interface Props {
  form: OnboardingFormData
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void
}

export function OnboardingContextStep({ form, setField }: Props) {
  const config = getVerticalConfig(form.vertical)

  return (
    <div>
      <div className="form-group">
        <label className="form-label" htmlFor="context">Contexto de tu negocio</label>
        <textarea
          id="context"
          className="input"
          placeholder={config.contextPlaceholder}
          value={form.businessContext}
          onChange={(e) => setField('businessContext', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="constraints">Restricciones o limitaciones</label>
        <input
          id="constraints"
          className="input"
          placeholder={config.constraintsPlaceholder}
          value={form.constraints}
          onChange={(e) => setField('constraints', e.target.value)}
        />
      </div>
    </div>
  )
}
