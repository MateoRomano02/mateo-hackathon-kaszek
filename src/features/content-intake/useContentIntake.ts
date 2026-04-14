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

  const { userProfile, addContentItem, updateContentItem, mergeSkillInsight, aiMode } = useAppStore()

  const service = aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService

  const processContent = async () => {
    if (!userProfile) return
    if (mode === 'url' && !url.trim()) return
    if (mode === 'text' && !rawText.trim()) return

    setIsProcessing(true)

    // Create pending content item
    const contentItem: ContentItem = {
      id: crypto.randomUUID(),
      source: mode,
      originalUrl: mode === 'url' ? url.trim() : undefined,
      rawContent: '',
      analysis: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    addContentItem(contentItem)

    try {
      // Step 1: Get raw content
      let content: string
      if (mode === 'url') {
        updateContentItem(contentItem.id, { status: 'analyzing' })
        const scraped = await scrapeUrl(url.trim())
        content = scraped.markdown
        updateContentItem(contentItem.id, { rawContent: content })
      } else {
        content = rawText.trim()
        updateContentItem(contentItem.id, { rawContent: content, status: 'analyzing' })
      }

      // Step 2: Analyze with Claude
      const analysis = await service.analyzeContent(content, userProfile)

      updateContentItem(contentItem.id, { analysis, status: 'done' })

      // Step 3: Merge skill insights into the portfolio
      for (const rs of analysis.relatedSkills) {
        if (rs.relevance === 'high' || rs.relevance === 'medium') {
          mergeSkillInsight(rs.skill, rs.statusImpact, rs.reason)
        }
      }

      // Clear inputs
      setUrl('')
      setRawText('')
    } catch (err) {
      updateContentItem(contentItem.id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Error al procesar contenido',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    url,
    setUrl,
    rawText,
    setRawText,
    mode,
    setMode,
    isProcessing,
    processContent,
  }
}
