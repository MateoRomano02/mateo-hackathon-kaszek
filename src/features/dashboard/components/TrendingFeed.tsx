import { Insight } from '@/entities/analysis/types'
import { ContentItem } from '@/entities/content/types'
import { ConfidenceBadge } from '@/shared/ui/ConfidenceBadge/ConfidenceBadge'
import { PriorityBadge } from '@/shared/ui/Badge/Badge'
import { SourceValidator } from '@/services/source-validation/SourceValidator'

interface TrendingFeedProps {
  insights: Insight[]
  content: ContentItem[]
}

export function TrendingFeed({ insights, content }: TrendingFeedProps) {
  return (
    <div className="trending-feed">
      {insights.map((ins) => {
        // Primary source = first 'primary' weight evidence, fallback to first
        const primaryEv  = ins.evidence.find((e) => e.weight === 'primary') ?? ins.evidence[0]
        const supportEv  = ins.evidence.filter((e) => e !== primaryEv)

        const primaryItem = primaryEv ? content.find((c) => c.id === primaryEv.contentId) : null
        const primarySq   = primaryItem?.analysis?.sourceQuality

        return (
          <div key={ins.id} className="trending-item">

            {/* ── Confidence + priority row ── */}
            <div className="trending-meta-row">
              <ConfidenceBadge level={ins.confidence} score={ins.confidenceScore} />
              <PriorityBadge priority={ins.priority} />
              {ins.isConsolidated && (
                <span className="tag" style={{ fontSize: 10 }}>
                  {ins.sourceCount} fuentes consolidadas
                </span>
              )}
            </div>

            {/* ── Headline ── */}
            <div className="trending-headline">{ins.title}</div>

            {/* ── Primary source attribution ── */}
            {primaryItem && (
              <div className="trending-source-line">
                {primaryItem.source && (
                  <span
                    className="trending-source-name"
                    style={{ color: primarySq ? SourceValidator.tierColor(primarySq.tier) : 'var(--text2)' }}
                  >
                    {primaryItem.source}
                  </span>
                )}
                {primarySq && (
                  <>
                    <span className="trending-source-sep">·</span>
                    <span className="tag" style={{
                      fontSize: 9,
                      color: SourceValidator.tierColor(primarySq.tier),
                      borderColor: `${SourceValidator.tierColor(primarySq.tier)}33`,
                      background: `${SourceValidator.tierColor(primarySq.tier)}0d`,
                    }}>
                      {SourceValidator.tierLabel(primarySq.tier)}
                    </span>
                    <span className="trending-source-sep">·</span>
                    <span className="text-dim font-mono" style={{ fontSize: 10 }}>
                      {primarySq.overall}/100
                    </span>
                  </>
                )}
                {primaryEv?.isExplicit && (
                  <>
                    <span className="trending-source-sep">·</span>
                    <span className="text-dim" style={{ fontSize: 10 }}>cita directa</span>
                  </>
                )}
              </div>
            )}

            {/* ── Excerpt ── */}
            <div className="trending-excerpt">{ins.summary}</div>

            {/* ── Why this matters ── */}
            <div className="trending-why">
              <span>💡</span>
              <span>{ins.why}</span>
            </div>

            {/* ── Supporting sources (Techmeme "Also:") ── */}
            {supportEv.length > 0 && (
              <div className="trending-also">
                <div className="trending-also-label">También citan</div>
                {supportEv.map((ev) => {
                  const item = content.find((c) => c.id === ev.contentId)
                  if (!item) return null
                  const sq = item.analysis?.sourceQuality
                  return (
                    <div key={ev.contentId} className="trending-also-item">
                      <span
                        className="trending-also-dot"
                        style={{ background: sq ? SourceValidator.tierColor(sq.tier) : 'var(--border2)' }}
                      />
                      <div className="trending-also-body">
                        <span className="trending-also-source">
                          {item.source ?? 'Fuente manual'}
                          {sq && (
                            <span className="text-dim" style={{ fontWeight: 400, marginLeft: 4 }}>
                              · {sq.overall}/100 · {ev.isExplicit ? 'directo' : 'indirecto'}
                            </span>
                          )}
                        </span>
                        {ev.quote && (
                          <div className="trending-also-quote">"{ev.quote}"</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Inference warning ── */}
            {ins.inferenceNote && (
              <div className="trending-inference">
                ⚠ {ins.inferenceNote}
              </div>
            )}

          </div>
        )
      })}
    </div>
  )
}
