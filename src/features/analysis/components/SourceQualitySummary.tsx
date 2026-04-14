import { ContentItem } from '@/entities/content/types'
import { SourceTier } from '@/entities/source/types'
import { SourceValidator } from '@/services/source-validation/SourceValidator'

interface SourceQualitySummaryProps {
  content: ContentItem[]
}

const TIER_ORDER: SourceTier[] = ['primary', 'secondary', 'community', 'unknown']

export function SourceQualitySummary({ content }: SourceQualitySummaryProps) {
  const analyzed = content.filter((c) => c.analysis?.sourceQuality)
  if (analyzed.length === 0) return null

  const byTier = TIER_ORDER.reduce<Record<SourceTier, ContentItem[]>>((acc, t) => {
    acc[t] = analyzed.filter((c) => c.analysis?.sourceQuality?.tier === t)
    return acc
  }, { primary: [], secondary: [], community: [], unknown: [] })

  const avgQuality = Math.round(
    analyzed.reduce((sum, c) => sum + (c.analysis?.sourceQuality?.overall ?? 0), 0) / analyzed.length,
  )

  const hypeCount       = analyzed.filter((c) => c.analysis?.sourceQuality?.flags.includes('hype')).length
  const unverifiedCount = analyzed.filter((c) => c.analysis?.sourceQuality?.flags.includes('unverified')).length
  const opinionCount    = analyzed.filter((c) => c.analysis?.sourceQuality?.flags.includes('opinion-only')).length

  const qualityColor = avgQuality >= 75 ? 'var(--high)' : avgQuality >= 50 ? 'var(--mid)' : 'var(--noise)'

  return (
    <div className="card mb-20 fade-up fade-up-1">
      <div className="flex justify-between items-center mb-16">
        <div className="card-label" style={{ margin: 0 }}>Calidad de fuentes</div>
        <div className="flex items-center gap-8">
          <span className="font-mono fw-600" style={{ fontSize: 22, color: qualityColor }}>{avgQuality}</span>
          <span className="text-dim text-xs">/100 promedio</span>
        </div>
      </div>

      {/* Tier distribution */}
      <div className="flex gap-12 mb-16" style={{ flexWrap: 'wrap' }}>
        {TIER_ORDER.map((tier) => {
          const items = byTier[tier]
          if (items.length === 0) return null
          return (
            <div key={tier} className="flex items-center gap-6">
              <span
                className="evidence-tier-dot"
                style={{ background: SourceValidator.tierColor(tier), flexShrink: 0 }}
              />
              <span className="text-sm text-muted">
                {items.length} {SourceValidator.tierLabel(tier)}
              </span>
              <div className="flex gap-4" style={{ marginLeft: 4 }}>
                {items.slice(0, 3).map((c) => (
                  <span key={c.id} className="tag" style={{ fontSize: 10 }}>
                    {c.source ?? 'Fuente manual'}
                  </span>
                ))}
                {items.length > 3 && (
                  <span className="text-dim" style={{ fontSize: 10 }}>+{items.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quality bar by tier */}
      <div className="flex gap-2 mb-14" style={{ height: 6 }}>
        {analyzed.map((c) => {
          const tier = c.analysis?.sourceQuality?.tier ?? 'unknown'
          return (
            <div
              key={c.id}
              title={`${c.source ?? 'Manual'}: ${c.analysis?.sourceQuality?.overall}/100`}
              style={{
                flex: 1, height: 6, borderRadius: 3,
                background: SourceValidator.tierColor(tier),
                opacity: c.analysis?.isNoise ? 0.25 : 1,
              }}
            />
          )
        })}
      </div>

      {/* Warnings */}
      {(hypeCount > 0 || unverifiedCount > 0 || opinionCount > 0) && (
        <div className="flex gap-8 flex-wrap">
          {hypeCount > 0 && (
            <span className="tag" style={{ fontSize: 10, color: 'var(--mid)', borderColor: 'rgba(180,83,9,.25)', background: 'rgba(180,83,9,.07)' }}>
              ⚑ {hypeCount} con señales de hype
            </span>
          )}
          {unverifiedCount > 0 && (
            <span className="tag" style={{ fontSize: 10, color: 'var(--noise)', borderColor: 'rgba(185,28,28,.25)', background: 'rgba(185,28,28,.07)' }}>
              ⚑ {unverifiedCount} sin verificar
            </span>
          )}
          {opinionCount > 0 && (
            <span className="tag" style={{ fontSize: 10, color: 'var(--text3)' }}>
              ⚑ {opinionCount} solo opinión
            </span>
          )}
        </div>
      )}
    </div>
  )
}
