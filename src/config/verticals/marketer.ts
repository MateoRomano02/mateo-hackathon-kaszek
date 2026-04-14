import { VerticalConfig } from './index'

export const marketerConfig: VerticalConfig = {
  vertical: 'marketer',
  label: 'Marketer',
  roles: [
    'Growth Marketer',
    'Content Marketer',
    'Performance Marketer',
    'Brand Manager',
    'CMO',
  ],
  industries: ['SaaS B2B', 'E-commerce', 'Fintech', 'Edtech', 'Agencia', 'Otro'],
  channels: [
    'Email + LinkedIn',
    'Paid Ads (Meta/Google)',
    'SEO + Contenido',
    'Social Media Orgánico',
    'Product-led Growth',
  ],
  goalPlaceholder: 'Ej: Aumentar la conversión del funnel de adquisición en un 20% este trimestre',
  focusPlaceholder: 'Ej: Lead nurturing y automatización de email',
  contextPlaceholder: 'Ej: Startup serie A, equipo de marketing de 3 personas',
  constraintsPlaceholder: 'Ej: Presupuesto limitado, sin developer disponible',
  defaultCriteria: [
    'Solo me sirve si aplica a B2B o SaaS',
    'Prefiero datos o casos reales, no solo opiniones',
    'Accionable con equipo pequeño (menos de 5 personas)',
    'Canales orgánicos o bajo presupuesto',
  ],
}
