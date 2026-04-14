import { ContentItem, CriterionScore } from '@/entities/content/types'
import { UserProfile } from '@/entities/user/types'
import { AnalysisResult, TopicCluster, Insight, ActionItem, WeekPlanDay, Recap } from '@/entities/analysis/types'
import { IAIAnalysisService, ProgressCallback } from './IAIAnalysisService'
import { ApiError } from '@/shared/utils/errors'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string }
    throw new ApiError(res.status, `Request failed: ${res.status}`, data.message)
  }

  return res.json() as Promise<T>
}

// ─── Type guards — evitan crashes silenciosos si el backend cambia su contrato ──

function isTopicArray(v: unknown): v is TopicCluster[] {
  return Array.isArray(v) && v.every(
    (t) => typeof t === 'object' && t !== null && 'id' in t && 'label' in t && 'relevanceScore' in t,
  )
}

function isInsightArray(v: unknown): v is Insight[] {
  return Array.isArray(v) && v.every(
    (i) => typeof i === 'object' && i !== null && 'id' in i && 'title' in i && 'priority' in i,
  )
}

function isActionArray(v: unknown): v is ActionItem[] {
  return Array.isArray(v) && v.every(
    (a) => typeof a === 'object' && a !== null && 'id' in a && 'type' in a && 'content' in a,
  )
}

function isWeekPlanArray(v: unknown): v is WeekPlanDay[] {
  return Array.isArray(v) && v.every(
    (d) => typeof d === 'object' && d !== null && 'day' in d && 'tasks' in d,
  )
}

function isRecap(v: unknown): v is Recap {
  return typeof v === 'object' && v !== null && 'learned' in v && 'applied' in v
}

function isCriterionScoreArray(v: unknown): v is CriterionScore[] {
  return Array.isArray(v) && v.every(
    (c) => typeof c === 'object' && c !== null && 'criterion' in c && 'passed' in c && 'reason' in c,
  )
}

function assertShape<T>(value: unknown, guard: (v: unknown) => v is T, endpoint: string): T {
  if (!guard(value)) throw new ApiError(500, `Unexpected response shape from ${endpoint}`)
  return value
}

/**
 * Real AI adapter — routes calls through a backend proxy.
 * The backend holds the Anthropic API key; this adapter never exposes it in the browser.
 *
 * Replace the MOCK provider by setting VITE_AI_PROVIDER=anthropic in your .env.
 *
 * Expected backend endpoints:
 *   POST /ai/scout      → ContentAnalysis[]
 *   POST /ai/dedupe     → TopicCluster[]
 *   POST /ai/relevance  → Insight[]
 *   POST /ai/actions    → { actions, weekPlan }
 *   POST /ai/memory     → Recap
 */
export class AnthropicAnalysisServiceAdapter implements IAIAnalysisService {
  async runFullAnalysis(
    items: ContentItem[],
    profile: UserProfile,
    onProgress: ProgressCallback,
  ): Promise<AnalysisResult> {
    onProgress('Scout Agent: analizando contenido...', 10)
    const scoutResults = await post<Array<{
      contentId: string
      topics: string[]
      isNoise: boolean
      noiseReason: string | null
      keyTakeaway: string
      relevanceScore: number
      criteriaScores: CriterionScore[]
    }>>(
      '/ai/scout',
      { items, profile, criteria: profile.criteria },
    )

    const analyzed = items.map((item) => {
      const r = scoutResults.find((x) => x.contentId === item.id)
      const rawScores = r?.criteriaScores
      return {
        ...item,
        status: 'analyzed' as const,
        analysis: {
          topics: r?.topics ?? ['General'],
          isNoise: r?.isNoise ?? false,
          noiseReason: r?.noiseReason ?? null,
          keyTakeaway: r?.keyTakeaway ?? item.raw.slice(0, 80),
          relevanceScore: r?.relevanceScore ?? 50,
          criteriaScores: isCriterionScoreArray(rawScores) ? rawScores : [],
        },
      }
    })

    onProgress('Identificando temas que están en tendencia...', 35)
    const rawTopics = await post('/ai/dedupe', { analyses: analyzed.map((i) => ({ contentId: i.id, ...i.analysis })), profile })
    const topics = assertShape(rawTopics, isTopicArray, '/ai/dedupe')

    onProgress('Filtrando lo más relevante para vos esta semana...', 55)
    const rawInsights = await post('/ai/relevance', { topics, profile })
    const insights = assertShape(rawInsights, isInsightArray, '/ai/relevance')

    onProgress('Generando acciones desde las tendencias...', 75)
    const rawActions = await post<{ actions: unknown; weekPlan: unknown }>('/ai/actions', { insights, profile })
    const actions  = assertShape(rawActions.actions,  isActionArray,   '/ai/actions.actions')
    const weekPlan = assertShape(rawActions.weekPlan, isWeekPlanArray, '/ai/actions.weekPlan')

    onProgress('Actualizando tu memoria de aprendizaje...', 90)
    const rawRecap = await post('/ai/memory', { items: analyzed, profile })
    const recap = assertShape(rawRecap, isRecap, '/ai/memory')

    onProgress('¡Trending actualizado!', 100)

    return {
      processedAt: new Date().toISOString(),
      totalContent: items.length,
      noiseCount: analyzed.filter((i) => i.analysis.isNoise).length,
      signalCount: analyzed.filter((i) => !i.analysis.isNoise).length,
      topics,
      insights,
      actions,
      weekPlan,
      recap,
    }
  }
}
