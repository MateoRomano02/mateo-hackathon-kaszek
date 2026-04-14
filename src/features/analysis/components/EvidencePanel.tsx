import { EvidenceReference } from '@/entities/source/types'
import { ContentItem } from '@/entities/content/types'
import { SourceValidator } from '@/services/source-validation/SourceValidator'

interface EvidencePanelProps {
  evidence: EvidenceReference[]
  content: ContentItem[]
}

export function EvidencePanel({ evidence, content }: EvidencePanelProps) {
  if (evidence.length === 0) return null

  return (
    <div className="evidence-panel">
      {evidence.map((ev) => {
        const item = content.find((c) => c.id === ev.contentId)
        if (!item) return null

        const sq = item.analysis?.sourceQuality
        const tierColor = sq ? SourceValidator.tierColor(sq.tier) : 'var(--text3)'
        const tierLabel = sq ? SourceValidator.tierLabel(sq.tier) : null

        return (
          <div key={ev.contentId} className="evidence-item">
            <span
              className="evidence-tier-dot"
              style={{ background: tierColor, marginTop: 5 }}
            />
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div className="flex items-center gap-8 flex-wrap">
                <span className="fw-500" style={{ fontSize: 12, color: 'var(--text)' }}>
                  {item.title || item.raw.slice(0, 55)}
                </span>
                {item.source && (
                  <span className="tag" style={{ fontSize: 10 }}>{item.source}</span>
                )}
                {tierLabel && (
                  <span
                    className="tag"
                    style={{
                      fontSize: 10,
                      color: tierColor,
                      borderColor: `${tierColor}44`,
                      background: `${tierColor}10`,
                    }}
                  >
                    {tierLabel}
                  </span>
                )}
                {sq && (
                  <span className="text-dim font-mono" style={{ fontSize: 10, marginLeft: 'auto' }}>
                    {sq.overall}/100
                  </span>
                )}
              </div>

              {ev.quote && (
                <div className="evidence-quote">"{ev.quote}"</div>
              )}

              <div className="evidence-meta">
                {ev.isExplicit ? 'Cita directa' : 'Soporte indirecto'}
                {' · '}
                {ev.weight === 'primary' ? 'Fuente principal' : 'Fuente de apoyo'}
                {sq?.flags.includes('data-backed')       && ' · dato verificable'}
                {sq?.flags.includes('primary-research')  && ' · investigación primaria'}
                {sq?.flags.includes('hype')              && ' · ⚑ señales de hype'}
                {sq?.flags.includes('unverified')        && ' · ⚑ sin verificar'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
