import { ContentItem } from '@/entities/content/types'
import { Button } from '@/shared/ui/Button/Button'
import { EmptyState } from '@/shared/ui/EmptyState/EmptyState'
import { formatDate } from '@/shared/utils/dates'
import { getSourceAuthority, AUTHORITY_LABELS } from '@/shared/utils/urls'

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
        const scores        = item.analysis?.criteriaScores ?? []
        const passedCount   = scores.filter((cs) => cs.passed).length
        const allPassed     = scores.length > 0 && passedCount === scores.length
        const nonePassed    = scores.length > 0 && passedCount === 0
        const authority     = item.source ? getSourceAuthority(item.source) : null

        const criteriaCountClass = allPassed
          ? 'criteria-count-full'
          : nonePassed
          ? 'criteria-count-none'
          : 'criteria-count-partial'

        return (
          <div key={item.id} className="content-item">
            <div className={`content-type-badge type-${item.type}`}>
              {TYPE_LABELS[item.type]}
            </div>

            <div className="flex-1" style={{ minWidth: 0 }}>

              {/* ── Row 1: title + source + authority ── */}
              <div className="flex items-center gap-8 mb-8" style={{ flexWrap: 'wrap' }}>
                <div className="content-title flex-1" style={{ margin: 0 }}>
                  {item.title || item.raw.slice(0, 70)}
                </div>
                {item.source && (
                  <span
                    className="tag"
                    style={{ color: 'var(--accent)', borderColor: 'rgba(109,40,217,.25)', background: 'rgba(109,40,217,.07)', flexShrink: 0 }}
                  >
                    {item.source}
                  </span>
                )}
                {authority && (
                  <span className={`badge authority-${authority}`} style={{ flexShrink: 0 }}>
                    {AUTHORITY_LABELS[authority]}
                  </span>
                )}
              </div>

              {/* ── Row 2: criteria match bar — HERO ── */}
              {scores.length > 0 && (
                <div className="criteria-bar">
                  <div className="flex gap-4 items-center">
                    {scores.map((cs, i) => (
                      <span
                        key={i}
                        className={`criteria-dot ${cs.passed ? 'criteria-dot-pass' : 'criteria-dot-fail'}`}
                        title={cs.reason}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-mono ${criteriaCountClass}`}>
                    {passedCount}/{scores.length} criterios
                  </span>
                  {item.analysis && (
                    <span className="text-xs text-dim" style={{ marginLeft: 'auto' }}>
                      {item.analysis.relevanceScore}% relevante
                    </span>
                  )}
                </div>
              )}

              {/* ── Row 3: takeaway o noise reason ── */}
              {item.analysis?.keyTakeaway && !item.analysis.isNoise && (
                <div className="content-takeaway">"{item.analysis.keyTakeaway}"</div>
              )}
              {item.analysis?.noiseReason && (
                <div className="content-takeaway" style={{ color: 'var(--noise)' }}>
                  🚫 {item.analysis.noiseReason}
                </div>
              )}

              {/* ── Row 4: detalle por criterio ── */}
              {scores.length > 0 && (
                <div className="flex gap-4 flex-wrap mt-6">
                  {scores.map((cs) => (
                    <span
                      key={cs.criterion}
                      className="tag"
                      title={cs.reason}
                      style={{
                        fontSize: 10,
                        background:  cs.passed ? 'rgba(21,128,61,.08)' : 'rgba(185,28,28,.07)',
                        color:       cs.passed ? 'var(--high)'         : 'var(--noise)',
                        borderColor: cs.passed ? 'rgba(21,128,61,.2)'  : 'rgba(185,28,28,.2)',
                        cursor: 'help',
                      }}
                    >
                      {cs.passed ? '✓' : '✗'}{' '}
                      {cs.criterion.length > 30 ? cs.criterion.slice(0, 30) + '…' : cs.criterion}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Row 5: meta + signal badge + topics ── */}
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
