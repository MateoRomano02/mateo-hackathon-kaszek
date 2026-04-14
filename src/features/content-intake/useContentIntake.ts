import { useState } from 'react'
import { useAppStore } from '@/app/providers/store'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'
import { scrapeUrl } from '@/services/scraper/JinaScraperService'
import type { ContentItem } from '@/entities/content/types'

export function useContentIntake() {
  const [url, setUrl] = useState('')
  const [rawText, setRawText] = useState('')
  const [mode, setMode] = useState<'url' | 'text'>('url')
  const [isProcessing, setIsProcessing] = useState(false)
  const [pipelineStep, setPipelineStep] = useState<string | null>(null)

  const { userProfile, addContentItem, updateContentItem, mergeSkillInsight, aiMode } = useAppStore()

  const service = aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService

  const processContent = async () => {
    if (!userProfile) return
    if (mode === 'url' && !url.trim()) return
    if (mode === 'text' && !rawText.trim()) return

    setIsProcessing(true)

    const contentItem: ContentItem = {
      id: crypto.randomUUID(),
      source: mode,
      originalUrl: mode === 'url' ? url.trim() : undefined,
      rawContent: '',
      sourceMetadata: null,
      canonicalInsights: [],
      overallRelevance: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    addContentItem(contentItem)

    try {
      // Step 1: Scrape / get raw content
      let content: string
      if (mode === 'url') {
        setPipelineStep('Extracting content...')
        updateContentItem(contentItem.id, { status: 'scraping' })
        const scraped = await scrapeUrl(url.trim())
        content = scraped.markdown
        updateContentItem(contentItem.id, { rawContent: content })
      } else {
        content = rawText.trim()
        updateContentItem(contentItem.id, { rawContent: content })
      }

      // Step 2: Evaluate source authority
      setPipelineStep('Evaluating source credibility...')
      updateContentItem(contentItem.id, { status: 'evaluating_source' })
      const sourceMetadata = await service.evaluateSource(content, mode === 'url' ? url.trim() : undefined)
      updateContentItem(contentItem.id, { sourceMetadata })

      // Step 3: Extract canonical insights
      setPipelineStep('Extracting canonical truths...')
      updateContentItem(contentItem.id, { status: 'extracting_insights' })
      const { insights, overallRelevance } = await service.extractCanonicalInsights(content, sourceMetadata, userProfile)
      updateContentItem(contentItem.id, {
        canonicalInsights: insights,
        overallRelevance,
        status: 'done',
      })

      // Step 4: Merge skill insights into portfolio
      for (const insight of insights) {
        for (const rs of insight.relatedSkills) {
          mergeSkillInsight(rs.skill, rs.statusImpact, rs.reason)
        }
      }

      setUrl('')
      setRawText('')
    } catch (err) {
      updateContentItem(contentItem.id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Error processing content',
      })
    } finally {
      setIsProcessing(false)
      setPipelineStep(null)
    }
  }

  return { url, setUrl, rawText, setRawText, mode, setMode, isProcessing, pipelineStep, processContent }
}
