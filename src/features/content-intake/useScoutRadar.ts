import { useState } from 'react'
import { useAppStore } from '@/app/providers/store'
import { getTrendingForProfile, type TrendingArticle } from '@/services/scraper/TrendingScraperService'
import { scrapeUrl } from '@/services/scraper/JinaScraperService'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'
import type { ContentItem } from '@/entities/content/types'

export interface RadarLog {
  id: string
  step: string
  status: 'running' | 'done' | 'error'
  timestamp: string
}

export function useScoutRadar() {
  const [isScanning, setIsScanning] = useState(false)
  const [logs, setLogs] = useState<RadarLog[]>([])
  const [scanProgress, setScanProgress] = useState(0)

  const { userProfile, addContentItem, mergeSkillInsight, aiMode } = useAppStore()

  const service = aiMode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService

  const addLog = (step: string, status: RadarLog['status'] = 'running') => {
    const log: RadarLog = { id: crypto.randomUUID(), step, status, timestamp: new Date().toLocaleTimeString('es-AR') }
    setLogs((prev) => [...prev, log])
    return log.id
  }

  const updateLog = (id: string, status: RadarLog['status']) => {
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  const scanTrends = async () => {
    if (!userProfile || isScanning) return

    setIsScanning(true)
    setLogs([])
    setScanProgress(0)

    try {
      // Step 1: Fetch trending articles from HN + Reddit
      const fetchId = addLog(`Buscando tendencias para ${userProfile.role} / ${userProfile.stack.slice(0, 3).join(', ')}...`)
      setScanProgress(5)

      const articles: TrendingArticle[] = await getTrendingForProfile(userProfile, (step) => {
        addLog(step)
      })
      updateLog(fetchId, 'done')
      addLog(`${articles.length} articulos encontrados`, 'done')
      setScanProgress(15)

      // Step 2: Pick top 3 and process through Truth Pipeline
      const toProcess = articles.slice(0, 3)

      for (let i = 0; i < toProcess.length; i++) {
        const article = toProcess[i]
        const baseProgress = 15 + i * 28

        const contentItem: ContentItem = {
          id: crypto.randomUUID(),
          source: 'url',
          originalUrl: article.url,
          rawContent: '',
          sourceMetadata: null,
          canonicalInsights: [],
          overallRelevance: 0,
          status: 'scraping',
          createdAt: new Date().toISOString(),
        }

        try {
          // Scrape
          const scrapeId = addLog(`Jina Scraper procesando: ${article.title.slice(0, 50)}...`)
          setScanProgress(baseProgress + 5)
          const scraped = await scrapeUrl(article.url)
          updateLog(scrapeId, 'done')
          contentItem.rawContent = scraped.markdown

          // Evaluate source
          const evalId = addLog(`Evaluando credibilidad de fuente: ${article.source}...`)
          setScanProgress(baseProgress + 12)
          contentItem.status = 'evaluating_source'
          const sourceMeta = await service.evaluateSource(scraped.markdown, article.url)
          updateLog(evalId, 'done')
          contentItem.sourceMetadata = sourceMeta

          // Extract insights
          const insightId = addLog(`Extrayendo verdades canonicas...`)
          setScanProgress(baseProgress + 20)
          contentItem.status = 'extracting_insights'
          const { insights, overallRelevance } = await service.extractCanonicalInsights(scraped.markdown, sourceMeta, userProfile)
          updateLog(insightId, 'done')
          contentItem.canonicalInsights = insights
          contentItem.overallRelevance = overallRelevance
          contentItem.status = 'done'

          // Only add to store if relevance > 6
          if (overallRelevance > 6) {
            addContentItem(contentItem)
            addLog(`Relevancia ${overallRelevance.toFixed(1)}/10 — agregado al feed`, 'done')

            // Merge skills
            for (const insight of insights) {
              for (const rs of insight.relatedSkills) {
                mergeSkillInsight(rs.skill, rs.statusImpact, rs.reason)
              }
            }
          } else {
            addLog(`Relevancia ${overallRelevance.toFixed(1)}/10 — descartado (umbral: 6.0)`, 'done')
          }
        } catch {
          addLog(`Error procesando: ${article.title.slice(0, 40)}`, 'error')
        }

        setScanProgress(baseProgress + 28)
      }

      setScanProgress(100)
      addLog('Escaneo autónomo completo.', 'done')
    } catch (err) {
      addLog(`Error fatal: ${err instanceof Error ? err.message : 'desconocido'}`, 'error')
    } finally {
      setTimeout(() => setIsScanning(false), 2000)
    }
  }

  return { isScanning, logs, scanProgress, scanTrends }
}
