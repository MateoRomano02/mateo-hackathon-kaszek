import { useState } from 'react'
import { useAppStore } from '@/app/providers/store'
import { fetchTrendingStories } from '@/services/scraper/HackerNewsService'
import { scrapeUrl } from '@/services/scraper/JinaScraperService'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'
import type { ContentItem } from '@/entities/content/types'

export function useScoutRadar() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)

  const { userProfile, addContentItem, updateContentItem, mergeSkillInsight, aiMode } = useAppStore()

  const service = aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService

  const scanTrends = async () => {
    if (!userProfile || isScanning) return

    setIsScanning(true)
    setScanProgress(0)

    try {
      // Step 1: Fetch trending stories from HN
      setScanStep('Escaneando Hacker News...')
      setScanProgress(10)
      const stories = await fetchTrendingStories(userProfile.stack, 3)

      // Step 2: Process each story through Truth Pipeline
      for (let i = 0; i < stories.length; i++) {
        const story = stories[i]
        const baseProgress = 10 + (i * 30)

        const contentItem: ContentItem = {
          id: crypto.randomUUID(),
          source: 'url',
          originalUrl: story.url,
          rawContent: '',
          sourceMetadata: null,
          canonicalInsights: [],
          overallRelevance: 0,
          status: 'scraping',
          createdAt: new Date().toISOString(),
        }
        addContentItem(contentItem)

        try {
          // Scrape
          setScanStep(`Extrayendo: ${story.title.slice(0, 40)}...`)
          setScanProgress(baseProgress + 5)
          const scraped = await scrapeUrl(story.url)
          updateContentItem(contentItem.id, { rawContent: scraped.markdown })

          // Evaluate source
          setScanStep(`Evaluando credibilidad: ${story.title.slice(0, 30)}...`)
          setScanProgress(baseProgress + 15)
          updateContentItem(contentItem.id, { status: 'evaluating_source' })
          const sourceMeta = await service.evaluateSource(scraped.markdown, story.url)
          updateContentItem(contentItem.id, { sourceMetadata: sourceMeta })

          // Extract insights
          setScanStep(`Extrayendo verdades: ${story.title.slice(0, 30)}...`)
          setScanProgress(baseProgress + 25)
          updateContentItem(contentItem.id, { status: 'extracting_insights' })
          const { insights, overallRelevance } = await service.extractCanonicalInsights(scraped.markdown, sourceMeta, userProfile)
          updateContentItem(contentItem.id, { canonicalInsights: insights, overallRelevance, status: 'done' })

          // Merge skills
          for (const insight of insights) {
            for (const rs of insight.relatedSkills) {
              mergeSkillInsight(rs.skill, rs.statusImpact, rs.reason)
            }
          }
        } catch {
          updateContentItem(contentItem.id, { status: 'error', error: 'No se pudo procesar este articulo' })
        }
      }

      setScanProgress(100)
      setScanStep('Escaneo completo!')
    } catch (err) {
      setScanStep(`Error: ${err instanceof Error ? err.message : 'Fallo el escaneo'}`)
    } finally {
      setTimeout(() => {
        setIsScanning(false)
        setScanStep(null)
        setScanProgress(0)
      }, 1500)
    }
  }

  return { isScanning, scanStep, scanProgress, scanTrends }
}
