import { TopicCluster } from '@/entities/analysis/types'
import { ContentItem } from '@/entities/content/types'
import { ScoreBar } from '@/shared/ui/ProgressBar/ProgressBar'
import { resolveSource } from '@/shared/utils/urls'

function getTopicSources(topic: TopicCluster, content: ContentItem[]): string[] {
  return topic.contentIds
    .flatMap((id) => {
      const item = content.find((c) => c.id === id)
      if (!item) return []
      const src = item.source ?? resolveSource(item.raw)
      return src ? [src] : []
    })
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 3)
}

interface TopicClustersProps {
  topics: TopicCluster[]
  content: ContentItem[]
}

export function TopicClusters({ topics, content }: TopicClustersProps) {
  return (
    <div className="card">
      <div className="card-label">Temas detectados</div>
      <div className="mt-12 flex flex-wrap">
        {topics.map((t) => {
          const sources = getTopicSources(t, content)
          return (
            <div key={t.id} className={`topic-chip ${t.isNoise ? 'noise' : ''}`} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <div className="flex items-center gap-8 w-full">
                <div style={{ flex: 1 }}>
                  <div className="topic-label">{t.label}</div>
                  <div className="topic-count">{t.count} {t.count === 1 ? 'señal' : 'señales'}</div>
                </div>
                {t.isNoise ? (
                  <span className="badge badge-noise">ruido</span>
                ) : (
                  <div style={{ width: 60 }}>
                    <ScoreBar value={t.relevanceScore} />
                    <div className="text-xs text-dim mt-4">{t.relevanceScore}%</div>
                  </div>
                )}
              </div>
              {!t.isNoise && sources.length > 0 && (
                <div className="flex gap-4 flex-wrap">
                  {sources.map((s) => (
                    <span
                      key={s}
                      className="tag"
                      style={{ fontSize: 10, color: 'var(--accent)', borderColor: 'rgba(109,40,217,.2)', background: 'rgba(109,40,217,.06)' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
