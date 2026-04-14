import { ContentItem } from '@/entities/content/types'
import { Button } from '@/shared/ui/Button/Button'
import { EmptyState } from '@/shared/ui/EmptyState/EmptyState'
import { formatDate } from '@/shared/utils/dates'
import { SourceValidator } from '@/services/source-validation/SourceValidator'

const TYPE_LABELS: Record<string, string> = {
  link: 'URL', text: 'TXT', pdf: 'PDF', summary: 'SUM',
}

interface ContentListProps {
  items: ContentItem[]
  onDelete: (id: string) => void
}

export function ContentList({ items, onDelete }: ContentListProps) {
  const signalCount = items.filter((c) => c.analysis && !c.analysis.isNoise).length
  const noiseCount  = items.filter((c) => c.analysis?.isNoise).length

  return (
    <div className="card fade-up fade-up-1">
      <div className="flex justify-between items-center mb-16">
        <div className="card-label" style={{ margin: 0 }}>
          {items.length} piezas cargadas
        </div>
        <div className="flex gap-8">
          <span className="badge badge-neutral">{signalCount} signal</span>
          <span className="badge badge-noise">{noiseCount} noise</span>
        </div>
      </div>

      {items.length === 0 && (
        <EmptyState
          icon="📥"
          title="Inbox vacío"
          description="Cargá links, textos o resúmenes que querés convertir en aprendizaje."
        />
      )}

      {items.map((item) => {
        const scores      = item.analysis?.criteriaScores ?? []
        const sq          = item.analysis?.sourceQuality
        const passedCount = scores.filter((cs) => cs.passed).length
        const allPassed   = scores.length > 0 && passedCount === scores.length
        const nonePassed  = scores.length > 0 && passedCount === 0

        const criteriaCountColor = allPassed
          ? 'var(--high)'
          : nonePassed
          ? 'var(--noise)'
          : 'var(--mid)'

        const hasValidationBar = scores.length > 0 || !!sq

        return (
          <div key={item.id} className="content-item">
            <div className={`content-type-badge type-${item.type}`}>
              {TYPE_LABELS[item.type]}
            </div>

            <div className="flex-1" style={{ minWidth: 0 }}>

              {/* ── Row 1: title + source + tier badge ── */}
              <div className="flex items-center gap-8 mb-8" style={{ flexWrap: 'wrap' }}>
                <div className="content-title flex-1" style={{ margin: 0 }}>
                  {item.title || item.raw.slice(0, 70)}
                </div>
                {item.source && (
                  <span
                    className="tag"
                    style={{ color: 'var(--accent)', borderColor: 'rgba(109,40,217,.25)', background: 'rgba(109,40,217,.07)', flexShrink: 0, fontSize: 10 }}
                  >
                    {item.source}
                  </span>
                )}
                {sq && (
                  <span
                    className="tag"
                    style={{
                      fontSize: 10, flexShrink: 0,
                      color:       SourceValidator.tierColor(sq.tier),
                      borderColor: `${SourceValidator.tierColor(sq.tier)}44`,
                      background:  `${SourceValidator.tierColor(sq.tier)}0f`,
                    }}
                  >
                    {SourceValidator.tierLabel(sq.tier)}
                  </span>
                )}
              </div>

              {/* ── Row 2: validation bar (source quality + criteria match) ── */}
              {hasValidationBar && (
                <div className="criteria-bar">

                  {/* Source quality mini-bar */}
                  {sq && (
                    <>
                      <div className="flex gap-2">
                        {[20, 40, 60, 80, 100].map((threshold) => (
                          <span
                            key={threshold}
                            style={{
                              display: 'inline-block', width: 12, height: 3, borderRadius: 2,
                              background: sq.overall >= threshold
                                ? SourceValidator.tierColor(sq.tier)
                                : 'var(--border)',
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono text-dim">{sq.overall}/100</span>
                      {sq.flags.includes('hype')       && <span style={{ fontSize: 10, color: 'var(--mid)' }}>⚑ hype</span>}
                      {sq.flags.includes('unverified') && <span style={{ fontSize: 10, color: 'var(--noise)' }}>⚑ sin verificar</span>}
                      {sq.flags.includes('opinion-only') && <span style={{ fontSize: 10, color: 'var(--text3)' }}>⚑ solo opinión</span>}

                      {scores.length > 0 && (
                        <span style={{ display: 'inline-block', width: 1, height: 10, background: 'var(--border)', margin: '0 4px' }} />
                      )}
                    </>
                  )}

                  {/* Criteria match */}
                  {scores.length > 0 && (
                    <>
                      <div className="flex gap-3">
                        {scores.map((cs, i) => (
                          <span
                            key={i}
                            className={`criteria-dot ${cs.passed ? 'criteria-dot-pass' : 'criteria-dot-fail'}`}
                            title={cs.reason}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono" style={{ color: criteriaCountColor }}>
                        {passedCount}/{scores.length} criterios
                      </span>
                    </>
                  )}

                  {item.analysis && (
                    <span className="text-xs text-dim" style={{ marginLeft: 'auto' }}>
                      {item.analysis.relevanceScore}% relevante
                    </span>
                  )}
                </div>
              )}

              {/* ── Row 3: takeaway or noise reason ── */}
              {item.analysis?.keyTakeaway && !item.analysis.isNoise && (
                <div className="content-takeaway">"{item.analysis.keyTakeaway}"</div>
              )}
              {item.analysis?.noiseReason && (
                <div className="content-takeaway" style={{ color: 'var(--noise)' }}>
                  🚫 {item.analysis.noiseReason}
                </div>
              )}

              {/* ── Row 4: detailed criteria tags ── */}
              {scores.length > 0 && (
                <div className="flex gap-4 flex-wrap mt-6">
                  {scores.map((cs) => (
                    <span
                      key={cs.criterion}
                      className="tag"
                      title={cs.reason}
                      style={{
                        fontSize: 10, cursor: 'help',
                        background:  cs.passed ? 'rgba(21,128,61,.08)' : 'rgba(185,28,28,.07)',
                        color:       cs.passed ? 'var(--high)'         : 'var(--noise)',
                        borderColor: cs.passed ? 'rgba(21,128,61,.2)'  : 'rgba(185,28,28,.2)',
                      }}
                    >
                      {cs.passed ? '✓' : '✗'}{' '}
                      {cs.criterion.length > 30 ? cs.criterion.slice(0, 30) + '…' : cs.criterion}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Row 5: meta ── */}
              <div className="flex items-center gap-8 mt-8 flex-wrap">
                <span className="content-meta">{formatDate(item.addedAt)}</span>
                {item.analysis?.isNoise   && <span className="badge badge-noise">🚫 ruido</span>}
                {item.analysis && !item.analysis.isNoise && <span className="badge badge-high">✓ signal</span>}
                {!item.analysis           && <span className="badge badge-neutral">pendiente</span>}
                {item.analysis?.topics && !item.analysis.isNoise && item.analysis.topics.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>

            </div>

            <Button variant="ghost" size="sm" type="button" onClick={() => onDelete(item.id)}>
              ✕
            </Button>
          </div>
        )
      })}
    </div>
  )
}
