import { AnalysisResult } from '@/entities/analysis/types'
import { ContentItem } from '@/entities/content/types'
import { formatDateTime } from '@/shared/utils/dates'
import { TopicClusters } from './components/TopicClusters'
import { InsightList } from './components/InsightList'
import { SignalNoiseBar } from './components/SignalNoiseBar'
import { SourceQualitySummary } from './components/SourceQualitySummary'

interface AnalysisFeatureProps {
  analysis: AnalysisResult
  content: ContentItem[]
}

export function AnalysisFeature({ analysis, content }: AnalysisFeatureProps) {
  return (
    <>
      <div className="page-header fade-up">
        <h1 className="page-title">Análisis de contenido</h1>
        <p className="page-subtitle">
          Procesado: {formatDateTime(analysis.processedAt)} · {analysis.signalCount} signal, {analysis.noiseCount} noise
        </p>
      </div>

      <div className="grid-2 gap-16 mb-20 fade-up">
        <TopicClusters topics={analysis.topics} content={content} />
        <SignalNoiseBar
          signalCount={analysis.signalCount}
          noiseCount={analysis.noiseCount}
          totalContent={analysis.totalContent}
        />
      </div>

      <SourceQualitySummary content={content} />

      <div className="card fade-up fade-up-2">
        <div className="card-label">Insights con trazabilidad</div>
        <InsightList insights={analysis.insights} content={content} />
      </div>
    </>
  )
}
