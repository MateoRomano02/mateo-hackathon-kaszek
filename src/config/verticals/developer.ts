import { VerticalConfig } from './index'

// Stub — ready to be fleshed out when the developer vertical is activated
export const developerConfig: VerticalConfig = {
  vertical: 'developer',
  label: 'Developer',
  roles: ['Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'Tech Lead', 'Staff Engineer'],
  industries: ['SaaS', 'Fintech', 'DevTools', 'Platform', 'Open Source', 'Otro'],
  channels: ['GitHub', 'Twitter/X', 'Dev.to', 'Hacker News', 'Newsletters técnicas'],
  goalPlaceholder: 'Ej: Mejorar arquitectura del monorepo para escalar el equipo',
  focusPlaceholder: 'Ej: Migración a microservicios y observabilidad',
  contextPlaceholder: 'Ej: Scale-up, equipo de 15 ingenieros, stack Node + React',
  constraintsPlaceholder: 'Ej: Sin tiempo para refactors grandes, deuda técnica alta',
  defaultCriteria: [
    'Solo si aplica a mi stack (Node, React, TypeScript)',
    'Prefiero implementaciones reales o ejemplos de código',
    'Relevante para escalar equipo o arquitectura',
    'Sin vendor lock-in excesivo',
  ],
}
