import { Logo } from '@/shared/ui/Logo/Logo'
import { Button } from '@/shared/ui/Button/Button'
import { UserProfile } from '@/entities/user/types'
import { nowISO } from '@/shared/utils/dates'
import { useOnboardingForm } from './hooks/useOnboardingForm'
import { StepDots } from './components/StepDots'
import { OnboardingProfileStep } from './components/OnboardingProfileStep'
import { OnboardingGoalStep } from './components/OnboardingGoalStep'
import { OnboardingContextStep } from './components/OnboardingContextStep'
import { OnboardingCriteriaStep } from './components/OnboardingCriteriaStep'

const STEPS = [
  { label: '01 / TU PERFIL',    title: 'Hola, ¿cómo te llamás?',       desc: 'Vamos a personalizar SignalOS para vos.' },
  { label: '02 / TU OBJETIVO',  title: '¿Qué querés lograr?',           desc: 'Esto define qué contenido vale y qué no.' },
  { label: '03 / TU CONTEXTO',  title: 'Contanos tu contexto',          desc: 'Así el análisis será más preciso.' },
  { label: '04 / TU CRITERIO',  title: '¿Qué hace que algo valga?',     desc: 'La IA usará estas reglas para filtrar el trending.' },
]

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
  initialValues?: Partial<UserProfile>
  existingId?: string
}

export function Onboarding({ onComplete, initialValues, existingId }: OnboardingProps) {
  const { step, form, setField, nextStep, prevStep } = useOnboardingForm(initialValues)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isEditing = !!existingId

  const handleNext = () => {
    if (isLast) {
      onComplete({
        ...form,
        id: existingId ?? `u${Date.now()}`,
        createdAt: nowISO(),
      })
    } else {
      nextStep()
    }
  }

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card fade-up">
        <div className="onboarding-logo">
          <Logo />
        </div>

        <StepDots total={STEPS.length} current={step} />

        {isEditing && (
          <div className="badge badge-neutral mb-16" style={{ display: 'inline-flex' }}>
            ✏ Editando perfil
          </div>
        )}
        <div className="onboarding-step">{current.label}</div>
        <h1 className="onboarding-title">{current.title}</h1>
        <p className="onboarding-desc">{current.desc}</p>

        {step === 0 && <OnboardingProfileStep  form={form} setField={setField} />}
        {step === 1 && <OnboardingGoalStep     form={form} setField={setField} />}
        {step === 2 && <OnboardingContextStep  form={form} setField={setField} />}
        {step === 3 && <OnboardingCriteriaStep form={form} setField={setField} />}

        <div className="flex justify-between items-center mt-24">
          {step > 0
            ? <Button variant="secondary" onClick={prevStep} type="button">← Atrás</Button>
            : <div />
          }
          <Button variant="primary" size="lg" onClick={handleNext} type="button">
            {isLast ? (isEditing ? 'Guardar cambios' : 'Crear mi perfil') : 'Siguiente →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
