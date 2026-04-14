import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') })

const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'] }))
app.use(express.json({ limit: '4mb' }))

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL     = 'claude-sonnet-4-6'

// ─── URL Scraper ──────────────────────────────────────────────────────────────
// Fetches the real article text from a URL so Claude can analyze actual content,
// not just the RSS title. Falls back to null on any error (paywall, timeout, etc.)

const SCRAPE_TIMEOUT_MS = 6000

// Sites known to block bots or be paywalled — skip scraping, use description only
const SKIP_SCRAPE_DOMAINS = [
  'bloomberg.com', 'wsj.com', 'ft.com', 'economist.com',
  'nytimes.com', 'washingtonpost.com', 'businessinsider.com',
]

function shouldSkipScrape(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return SKIP_SCRAPE_DOMAINS.some((d) => hostname.endsWith(d))
  } catch {
    return true
  }
}

async function scrapeArticle(url) {
  if (!url || shouldSkipScrape(url)) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timer)
    if (!res.ok) return null

    const html = await res.text()

    // Remove noise: scripts, styles, nav, ads, comments
    const cleaned = html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<figure[\s\S]*?<\/figure>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()

    // Keep first 2000 chars — enough context for Claude, not too many tokens
    return cleaned.slice(0, 2000) || null
  } catch {
    return null
  }
}

// ─── Claude helper ────────────────────────────────────────────────────────────

function extractJson(text) {
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (block) return JSON.parse(block[1])
  const raw = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
  if (raw) return JSON.parse(raw[0])
  throw new Error('No JSON in response: ' + text.slice(0, 300))
}

async function claude(userPrompt) {
  const msg = await anthropic.messages.create({
    model:      MODEL,
    max_tokens: 4096,
    system:     'You are a JSON API. Respond with valid JSON only — no markdown, no explanation, just the raw JSON.',
    messages:   [{ role: 'user', content: userPrompt }],
  })
  return extractJson(msg.content[0].text)
}

// ─── POST /ai/scout ───────────────────────────────────────────────────────────
// 1. Scrapes the real article content from each URL
// 2. Sends full text to Claude to analyze against user criteria
// Returns: Array<{ contentId, topics, isNoise, noiseReason, keyTakeaway, relevanceScore, criteriaScores }>

app.post('/ai/scout', async (req, res) => {
  try {
    const { items, profile, criteria = profile?.criteria ?? [] } = req.body

    console.log(`[scout] Scraping ${items.length} articles...`)

    // Scrape all URLs in parallel (with individual timeouts already baked in)
    const scraped = await Promise.all(
      items.map(async (item) => {
        const text = await scrapeArticle(item.raw)
        console.log(`  ${text ? '✓' : '✗'} ${item.title.slice(0, 60)}`)
        return { id: item.id, text }
      })
    )

    const scrapeMap = Object.fromEntries(scraped.map((s) => [s.id, s.text]))

    const itemsText = items.map((item) => {
      const articleText = scrapeMap[item.id]
      const fallback    = item.analysis?.keyTakeaway ?? ''
      return [
        `ID: ${item.id}`,
        `Título: ${item.title}`,
        `Fuente: ${item.source ?? 'Desconocida'} | URL: ${item.raw ?? ''}`,
        articleText
          ? `Contenido real del artículo:\n${articleText}`
          : fallback
            ? `Descripción RSS: ${fallback}`
            : '(Sin contenido disponible — solo título)',
      ].join('\n')
    }).join('\n\n---\n\n')

    const criteriaText = criteria.length
      ? criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : 'Sin criterios definidos — evaluar relevancia general para el vertical.'

    const prompt = `Analizá estas señales de noticias para un profesional de ${profile.vertical} (${profile.role}).

CRITERIOS DEL USUARIO — qué hace que una señal valga la pena:
${criteriaText}

Contexto: ${profile.currentFocus ?? ''} | Restricciones: ${profile.constraints ?? ''}

SEÑALES CON CONTENIDO REAL:
${itemsText}

Devolvé un JSON array donde cada objeto tiene exactamente esta forma:
[{
  "contentId": "<id exacto>",
  "topics": ["tema1", "tema2"],
  "isNoise": false,
  "noiseReason": null,
  "keyTakeaway": "1-2 oraciones en español con el punto clave REAL del artículo.",
  "relevanceScore": 75,
  "criteriaScores": [
    { "criterion": "<texto exacto del criterio>", "passed": true, "reason": "Explicación breve en español." }
  ]
}]

Reglas:
- Usá el contenido REAL del artículo para el keyTakeaway (no el título solo)
- isNoise: true solo si no tiene ninguna relación con "${profile.vertical}"
- relevanceScore: 0-100 basado en el contenido real
- criteriaScores: exactamente uno por criterio, en el mismo orden
- Respondé SOLO el JSON array`

    const result = await claude(prompt)
    console.log(`[scout] Done — ${result.length} items analyzed`)
    res.json(result)
  } catch (err) {
    console.error('[/ai/scout]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /ai/dedupe ──────────────────────────────────────────────────────────
// Groups analyzed content into topic clusters
// Returns: TopicCluster[]

app.post('/ai/dedupe', async (req, res) => {
  try {
    const { analyses, profile } = req.body

    const signals = analyses
      .filter((a) => !a.isNoise)
      .map((a) => `ID: ${a.contentId} | Temas: ${a.topics?.join(', ')} | Takeaway: ${a.keyTakeaway} | Relevancia: ${a.relevanceScore}`)
      .join('\n')

    if (!signals.trim()) {
      return res.json([])
    }

    const prompt = `Sos un analista de tendencias para un profesional de ${profile.vertical}.

Señales de esta semana:
${signals}

Agrupá en 3-5 clusters temáticos. Cada cluster debe representar un tema emergente REAL que importa esta semana (no genérico).

Devolvé JSON array:
[{
  "id": "topic-1",
  "label": "Nombre del tema (máx 5 palabras)",
  "relevanceScore": 85,
  "count": 3,
  "isNoise": false,
  "contentIds": ["id1", "id2"],
  "summary": "Una oración explicando por qué este tema es relevante ahora."
}]

- Usá los IDs exactos
- Ordená por relevanceScore descendente
- Respondé SOLO el JSON array`

    const result = await claude(prompt)
    res.json(result)
  } catch (err) {
    console.error('[/ai/dedupe]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /ai/relevance ───────────────────────────────────────────────────────
// Generates canonical insights with full Judgment Engine fields
// Returns: Insight[]

app.post('/ai/relevance', async (req, res) => {
  try {
    const { topics, profile } = req.body

    if (!topics?.length) {
      return res.json([])
    }

    const topicsText = topics.map((t) =>
      `[${t.id}] "${t.label}" — relevancia ${t.relevanceScore} — ${t.contentIds?.length ?? 0} señales (${(t.contentIds ?? []).join(', ')})\n  Resumen: ${t.summary ?? ''}`
    ).join('\n\n')

    const criteriaText = profile.criteria?.length
      ? profile.criteria.join(' | ')
      : ''

    const prompt = `Sos el motor de insights de SignalOS. Convertí estos clusters en insights concretos y accionables.

PERFIL:
- Vertical: ${profile.vertical} | Rol: ${profile.role}
- Foco: ${profile.currentFocus ?? ''} | Criterios: ${criteriaText}

CLUSTERS DE ESTA SEMANA (basados en artículos reales):
${topicsText}

Generá 3-5 insights de alta calidad. Cada uno debe ser específico (no genérico), respaldado en las señales reales, y directamente accionable.

Devolvé JSON array:
[{
  "id": "ins-1",
  "title": "Titular impactante, máx 12 palabras",
  "summary": "2-3 oraciones con el insight específico basado en las señales reales.",
  "why": "Por qué importa ESTA semana para este usuario específicamente.",
  "priority": "high",
  "topicIds": ["topic-1"],
  "confidence": "high",
  "confidenceScore": 82,
  "confidenceExplanation": "Confirmado por X fuentes que cubren el mismo tema desde ángulos distintos.",
  "evidence": [
    { "contentId": "<id exacto>", "quote": null, "isExplicit": true, "weight": "primary" }
  ],
  "sourceCount": 2,
  "isConsolidated": true,
  "inferenceNote": null
}]

- priority: "high" | "medium" | "low"
- confidence: "high" | "medium" | "low" | "uncertain"
- isConsolidated: true si hay 2+ fuentes sobre lo mismo
- inferenceNote: string si algo es inferido (no está explícito en las fuentes)
- Respondé SOLO el JSON array`

    const result = await claude(prompt)
    res.json(result)
  } catch (err) {
    console.error('[/ai/relevance]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /ai/actions ─────────────────────────────────────────────────────────
// Returns: { actions: ActionItem[], weekPlan: WeekPlanDay[] }

app.post('/ai/actions', async (req, res) => {
  try {
    const { insights, profile } = req.body

    const insightsText = insights.map((i) =>
      `[${i.id}] ${i.title}\n  ${i.summary}\n  Por qué importa: ${i.why}`
    ).join('\n\n')

    const criteriaText = profile.criteria?.length
      ? profile.criteria.join(' | ')
      : ''

    const prompt = `Convertí estos insights en acciones concretas para ${profile.name} (${profile.role}, ${profile.vertical}).

Criterios de filtro: ${criteriaText}
Restricciones: ${profile.constraints ?? 'ninguna'}

INSIGHTS:
${insightsText}

Generá 4-6 acciones concretas y un plan de 5 días. Las acciones deben ser MUY específicas basadas en estos insights reales — nada genérico.

Devolvé JSON:
{
  "actions": [{
    "id": "act-1",
    "type": "task",
    "title": "Acción específica, máx 10 palabras",
    "description": "Contexto: por qué hacer esto ahora.",
    "content": "Pasos concretos de qué hacer exactamente.",
    "priority": "high",
    "estimatedTime": "30 min",
    "topicId": "<id del topic relacionado>"
  }],
  "weekPlan": [
    { "day": 1, "label": "Lunes", "focus": "Tema del día", "tasks": ["Tarea 1", "Tarea 2"] },
    { "day": 2, "label": "Martes", "focus": "...", "tasks": ["..."] },
    { "day": 3, "label": "Miércoles", "focus": "...", "tasks": ["..."] },
    { "day": 4, "label": "Jueves", "focus": "...", "tasks": ["..."] },
    { "day": 5, "label": "Viernes", "focus": "Revisión", "tasks": ["..."] }
  ]
}

Tipos: "task" | "template" | "prompt" | "hypothesis" | "checklist"
Respondé SOLO el JSON`

    const result = await claude(prompt)
    res.json(result)
  } catch (err) {
    console.error('[/ai/actions]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /ai/memory ──────────────────────────────────────────────────────────
// Returns: Recap

app.post('/ai/memory', async (req, res) => {
  try {
    const { items, profile } = req.body

    const signalTitles = items
      .filter((i) => !i.analysis?.isNoise)
      .slice(0, 10)
      .map((i) => `- ${i.title}`)
      .join('\n')

    const prompt = `Generá un resumen de aprendizaje semanal para ${profile.name} (${profile.role}, ${profile.vertical}).

Señales procesadas esta semana:
${signalTitles}

Devolvé JSON:
{
  "id": "recap-${Date.now()}",
  "week": "${new Date().toISOString().slice(0, 10)}",
  "learned": ["Aprendizaje concreto 1", "Aprendizaje concreto 2", "Aprendizaje concreto 3"],
  "applied": ["Qué aplicar esta semana 1", "Qué aplicar 2"],
  "pending": ["Tema que merece más investigación"],
  "toReview": ["Señal a revisar la próxima semana"],
  "nextSkill": "Una habilidad/área a desarrollar basada en estos trends",
  "contentCount": ${items.length},
  "actionsCompleted": 0
}

Respondé SOLO el JSON`

    const result = await claude(prompt)
    res.json(result)
  } catch (err) {
    console.error('[/ai/memory]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok', model: MODEL }))

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\nSignalOS API  →  http://localhost:${PORT}`)
  console.log(`Model         →  ${MODEL}`)
  console.log(`API key       →  ${process.env.ANTHROPIC_API_KEY ? '✓ set' : '✗ MISSING — add to server/.env'}`)
  console.log(`Scraping      →  enabled (skip: ${SKIP_SCRAPE_DOMAINS.join(', ')})\n`)
})
