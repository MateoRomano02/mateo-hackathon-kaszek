// ─── Source quality model ─────────────────────────────────────────────────────
// Every piece of content ingested gets evaluated through this layer.
// The system never treats an input as automatic truth — it must earn credibility.

export type SourceTier = 'primary' | 'secondary' | 'community' | 'unknown'

export type SourceFlag =
  | 'data-backed'       // has concrete data / studies
  | 'primary-research'  // original research, not secondary reporting
  | 'opinion-only'      // no data, pure subjective view
  | 'hype'              // trending but lacks substance
  | 'outdated'          // content > 12 months old
  | 'unverified'        // source authority not established
  | 'duplicate'         // same claim seen in another source

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain'

/** Multidimensional quality assessment of a single source / content piece */
export interface SourceQualityScore {
  authority: number         // 0-100: domain reputation and expertise
  freshness: number         // 0-100: recency (100 = published today)
  specificity: number       // 0-100: concrete claims vs. vague assertions
  evidenceStrength: number  // 0-100: data / studies vs. pure opinion
  primaryProximity: number  // 0-100: closeness to original research
  overall: number           // weighted aggregate
  tier: SourceTier
  flags: SourceFlag[]
}

/** A single piece of evidence supporting or contradicting an insight */
export interface EvidenceReference {
  contentId: string
  quote?: string       // exact quote or close paraphrase from the source
  isExplicit: boolean  // true = directly stated; false = inferred by the system
  weight: 'primary' | 'supporting'
}

/** A detected contradiction between two sources on the same topic */
export interface ContradictionFlag {
  contentId: string
  description: string
  severity: 'minor' | 'major'
}
