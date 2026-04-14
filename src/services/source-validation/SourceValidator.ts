import { SourceQualityScore, SourceTier, SourceFlag } from '@/entities/source/types'

// ─── Source registry ──────────────────────────────────────────────────────────
// Known sources with pre-assessed authority and proximity baselines.
// In a real backend these would be managed and updated continuously.

interface SourceProfile {
  tier: SourceTier
  authorityBase: number
  primaryProximityBase: number
  baseFlags: SourceFlag[]
}

const SOURCE_PROFILES: Record<string, SourceProfile> = {
  'Gartner':                 { tier: 'primary',    authorityBase: 96, primaryProximityBase: 95, baseFlags: ['data-backed', 'primary-research'] },
  'ARIYH Newsletter':        { tier: 'primary',    authorityBase: 90, primaryProximityBase: 85, baseFlags: ['data-backed', 'primary-research'] },
  'Harvard Business Review': { tier: 'primary',    authorityBase: 92, primaryProximityBase: 80, baseFlags: ['data-backed'] },
  'McKinsey':                { tier: 'primary',    authorityBase: 94, primaryProximityBase: 90, baseFlags: ['data-backed', 'primary-research'] },
  'Forrester':               { tier: 'primary',    authorityBase: 88, primaryProximityBase: 85, baseFlags: ['data-backed', 'primary-research'] },
  'Nielsen':                 { tier: 'primary',    authorityBase: 86, primaryProximityBase: 80, baseFlags: ['data-backed', 'primary-research'] },
  'HubSpot':                 { tier: 'secondary',  authorityBase: 72, primaryProximityBase: 60, baseFlags: [] },
  'LinkedIn':                { tier: 'secondary',  authorityBase: 60, primaryProximityBase: 45, baseFlags: [] },
  'Marketing Week':          { tier: 'secondary',  authorityBase: 75, primaryProximityBase: 65, baseFlags: [] },
  "Lenny's Newsletter":      { tier: 'secondary',  authorityBase: 78, primaryProximityBase: 70, baseFlags: ['data-backed'] },
  'TechCrunch':              { tier: 'secondary',  authorityBase: 70, primaryProximityBase: 55, baseFlags: [] },
  'Hacker News':             { tier: 'community',  authorityBase: 52, primaryProximityBase: 38, baseFlags: [] },
  'Medium':                  { tier: 'community',  authorityBase: 42, primaryProximityBase: 28, baseFlags: ['unverified'] },
  'Twitter/X':               { tier: 'community',  authorityBase: 38, primaryProximityBase: 22, baseFlags: ['opinion-only', 'hype'] },
  'Product Hunt':            { tier: 'community',  authorityBase: 45, primaryProximityBase: 28, baseFlags: ['hype'] },
  'YouTube':                 { tier: 'community',  authorityBase: 42, primaryProximityBase: 25, baseFlags: [] },
  'Substack':                { tier: 'secondary',  authorityBase: 60, primaryProximityBase: 50, baseFlags: [] },
  'GrowthHackers':           { tier: 'secondary',  authorityBase: 62, primaryProximityBase: 50, baseFlags: [] },
}

// Content signals that boost specificity and evidence strength
const HAS_DATA_RE     = /\d+%|\d+x|\$[\d,]+|\d[\d,]+ (?:suscriptores|usuarios|clientes|empresas|conversiones)/i
const HAS_STUDY_RE    = /estudio|gartner|investigación|research|report|survey|dato|evidencia|según/i
const IS_OPINION_RE   = /creo que|me parece|en mi opinión|yo diría|pienso que|mi experiencia/i

export class SourceValidator {
  /**
   * Evaluate source quality for a content item.
   * `rawContent` is used to detect data signals beyond what the source name tells us.
   */
  static evaluate(source: string, rawContent?: string): SourceQualityScore {
    const profile = SOURCE_PROFILES[source]

    const hasData    = rawContent ? HAS_DATA_RE.test(rawContent)    : false
    const hasStudy   = rawContent ? HAS_STUDY_RE.test(rawContent)   : false
    const isOpinion  = rawContent ? IS_OPINION_RE.test(rawContent)  : false

    // Freshness defaults to 78 — real impl would parse publishedAt from metadata
    const freshness = 78

    if (!profile) {
      const specificity      = hasData  ? 60 : 40
      const evidenceStrength = hasStudy ? 55 : 30
      const overall = Math.round(45 * .35 + freshness * .15 + specificity * .20 + evidenceStrength * .20 + 30 * .10)
      return {
        authority: 45, freshness, specificity, evidenceStrength, primaryProximity: 30,
        overall, tier: 'unknown', flags: ['unverified'],
      }
    }

    const specificity      = hasData   ? Math.min(97, profile.authorityBase + 8)  : Math.max(38, profile.authorityBase - 22)
    const evidenceStrength = hasStudy  ? Math.min(99, profile.primaryProximityBase + 12) : Math.max(32, profile.primaryProximityBase - 18)

    // Weighted overall score (authority carries the most weight)
    const overall = Math.round(
      profile.authorityBase        * 0.35 +
      freshness                    * 0.15 +
      specificity                  * 0.20 +
      evidenceStrength             * 0.20 +
      profile.primaryProximityBase * 0.10,
    )

    const flags: SourceFlag[] = [...profile.baseFlags]
    if (hasData   && !flags.includes('data-backed'))     flags.push('data-backed')
    if (isOpinion && !flags.includes('opinion-only'))    flags.push('opinion-only')

    return {
      authority:        profile.authorityBase,
      freshness,
      specificity,
      evidenceStrength,
      primaryProximity: profile.primaryProximityBase,
      overall,
      tier:             profile.tier,
      flags,
    }
  }

  /** Human-readable label for a source tier */
  static tierLabel(tier: SourceTier): string {
    const labels: Record<SourceTier, string> = {
      primary:   'Fuente primaria',
      secondary: 'Experto',
      community: 'Comunidad',
      unknown:   'Sin verificar',
    }
    return labels[tier]
  }

  /** Color token for a tier */
  static tierColor(tier: SourceTier): string {
    const colors: Record<SourceTier, string> = {
      primary:   'var(--accent)',
      secondary: 'var(--low)',
      community: 'var(--text3)',
      unknown:   'var(--border2)',
    }
    return colors[tier]
  }
}
