const DOMAIN_LABELS: Record<string, string> = {
  'linkedin.com':           'LinkedIn',
  'twitter.com':            'Twitter/X',
  'x.com':                  'Twitter/X',
  'ariyh.com':              'ARIYH Newsletter',
  'medium.com':             'Medium',
  'substack.com':           'Substack',
  'hbr.org':                'Harvard Business Review',
  'producthunt.com':        'Product Hunt',
  'news.ycombinator.com':   'Hacker News',
  'github.com':             'GitHub',
  'hubspot.com':            'HubSpot',
  'marketingweek.com':      'Marketing Week',
  'gartner.com':            'Gartner',
  'techcrunch.com':         'TechCrunch',
  'youtube.com':            'YouTube',
  'youtu.be':               'YouTube',
  'notion.so':              'Notion',
  'lenny.substack.com':     'Lenny\'s Newsletter',
  'growthhackers.com':      'GrowthHackers',
  'mckinsey.com':           'McKinsey',
  'forrester.com':          'Forrester',
  'Nielsen.com':            'Nielsen',
}

// ─── Source authority tiers ───────────────────────────────────────────────────

export type SourceAuthority = 'research' | 'expert' | 'community'

/** Fuentes con datos primarios o estudios verificados */
const RESEARCH_SOURCES = new Set([
  'Gartner', 'McKinsey', 'Harvard Business Review', 'ARIYH Newsletter',
  'Forrester', 'Nielsen', 'Marketing Week',
])

/** Líderes de industria, newsletters curadas, plataformas profesionales */
const EXPERT_SOURCES = new Set([
  'LinkedIn', 'HubSpot', 'Lenny\'s Newsletter', 'GrowthHackers', 'TechCrunch',
  'Hacker News', 'Product Hunt', 'Substack',
])

export const AUTHORITY_LABELS: Record<SourceAuthority, string> = {
  research:  'Fuente primaria',
  expert:    'Experto',
  community: 'Comunidad',
}

export function getSourceAuthority(source: string): SourceAuthority | null {
  if (RESEARCH_SOURCES.has(source)) return 'research'
  if (EXPERT_SOURCES.has(source))   return 'expert'
  // Solo fuentes conocidas reciben badge; fuentes manuales sin clasificar no muestran nada
  const knownCommunity = new Set(['Medium', 'Twitter/X', 'YouTube', 'GitHub'])
  if (knownCommunity.has(source)) return 'community'
  return null
}

// ─── URL utils ────────────────────────────────────────────────────────────────

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

/** Devuelve un nombre legible para la fuente de un contenido. */
export function resolveSource(raw: string, manualSource?: string): string {
  if (manualSource?.trim()) return manualSource.trim()
  if (!raw.startsWith('http')) return ''
  const domain = extractDomain(raw)
  return DOMAIN_LABELS[domain] ?? domain
}
