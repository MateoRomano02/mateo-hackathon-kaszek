import { ContentItem } from '@/entities/content/types'
import { UserProfile } from '@/entities/user/types'
import { AnalysisResult } from '@/entities/analysis/types'

export type ProgressCallback = (step: string, progress: number) => void

/** Contract every AI provider must satisfy. The UI depends on this interface only. */
export interface IAIAnalysisService {
  runFullAnalysis(
    items: ContentItem[],
    profile: UserProfile,
    onProgress: ProgressCallback,
  ): Promise<AnalysisResult>
}
