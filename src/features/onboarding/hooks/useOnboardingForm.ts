import { useState } from 'react'
import { OnboardingFormData } from '@/entities/user/types'

const INITIAL_FORM: OnboardingFormData = {
  name: '',
  role: 'Growth Marketer',
  vertical: 'marketer',
  industry: 'SaaS B2B',
  level: 'senior',
  goal: '',
  mainChannel: 'Email + LinkedIn',
  currentFocus: '',
  businessContext: '',
  constraints: '',
  criteria: [],
}

export function useOnboardingForm(initialValues?: Partial<OnboardingFormData>) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<OnboardingFormData>({ ...INITIAL_FORM, ...initialValues })

  const setField = <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => s - 1)

  return { step, form, setField, nextStep, prevStep }
}
