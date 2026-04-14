import { OnboardingFormData, ExperienceLevel } from '@/entities/user/types'
import { Select } from '@/shared/ui/Select/Select'
import { Button } from '@/shared/ui/Button/Button'
import { getVerticalConfig } from '@/config/verticals'

const LEVELS: ExperienceLevel[] = ['junior', 'mid', 'senior', 'lead']

interface Props {
  form: OnboardingFormData
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void
}

export function OnboardingProfileStep({ form, setField }: Props) {
  const config = getVerticalConfig(form.vertical)

  return (
    <div>
      <div className="form-group">
        <label className="form-label" htmlFor="name">Tu nombre</label>
        <input
          id="name"
          className="input"
          placeholder="Ej: Valentina Torres"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
        />
      </div>

      <div className="grid-2 gap-16">
        <Select
          label="Tu rol"
          options={config.roles}
          value={form.role}
          onChange={(e) => setField('role', e.target.value)}
        />
        <Select
          label="Industria"
          options={config.industries}
          value={form.industry}
          onChange={(e) => setField('industry', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Nivel</label>
        <div className="flex gap-8">
          {LEVELS.map((l) => (
            <Button
              key={l}
              variant={form.level === l ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setField('level', l)}
              type="button"
            >
              {l}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
