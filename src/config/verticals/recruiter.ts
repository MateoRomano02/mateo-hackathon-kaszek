import { VerticalConfig } from './index'

// Stub — ready to be fleshed out when the recruiter vertical is activated
export const recruiterConfig: VerticalConfig = {
  vertical: 'recruiter',
  label: 'Recruiter',
  roles: ['Tech Recruiter', 'Talent Partner', 'HR Manager', 'People Ops Lead', 'TA Lead'],
  industries: ['SaaS', 'Fintech', 'Startup', 'Consultora', 'Corporativo', 'Otro'],
  channels: ['LinkedIn Recruiter', 'Job Boards', 'Referidos', 'Comunidades', 'Outbound email'],
  goalPlaceholder: 'Ej: Reducir time-to-hire para roles de ingeniería senior',
  focusPlaceholder: 'Ej: Mejorar el pipeline de candidatos pasivos en LinkedIn',
  contextPlaceholder: 'Ej: Scale-up de 80 personas, abriendo 20 posiciones de tech este trimestre',
  constraintsPlaceholder: 'Ej: Sin herramientas de ATS premium, proceso de hiring largo',
  defaultCriteria: [
    'Solo si aplica a tech recruiting o roles de ingeniería',
    'Preferible con métricas o datos de hiring',
    'Accionable sin herramientas premium',
    'Relevante para sourcing pasivo o employer branding',
  ],
}
