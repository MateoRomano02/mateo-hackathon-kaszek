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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
// Analyzes each content item against user criteria
// Returns: Array<{ contentId, topics, isNoise, noiseReason, keyTakeaway, relevanceScore, criteriaScores }>

app.post('/ai/scout', async (req, res) => {
  try {
    const { items, profile, criteria = profile?.criteria ?? [] } = req.body

    const itemsText = items.map((item) =>
      `ID: ${item.id}\nTítulo: ${item.title}\nFuente: ${item.source ?? 'Desconocida'}\nURL: ${item.raw ?? ''}\nContexto: ${item.analysis?.keyTakeaway ?? ''}`
    ).join('\n\n---\n\n')

    const criteriaText = criteria.length
      ? criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : 'Sin criterios definidos — evaluar relevancia general para el vertical.'

    const prompt = `Analizá estas señales de noticias para un profesional de ${profile.vertical} (${profile.role}).

CRITERIOS DEL USUARIO — qué hace que una señal valga la pena:
${criteriaText}

Contexto del usuario: ${profile.currentFocus ?? ''} | ${profile.constraints ?? ''}

SEÑALES A ANALIZAR:
${itemsText}

Devolvé un JSON array donde cada objeto tiene exactamente esta forma:
[{
  "contentId": "<el id exacto del item>",
  "topics": ["tema1", "tema2"],
  "isNoise": false,
  "noiseReason": null,
  "keyTakeaway": "1-2 oraciones en español sobre el punto clave.",
  "relevanceScore": 75,
  "criteriaScores": [
    { "criterion": "<texto exacto del criterio>", "passed": true, "reason": "Breve explicación en español de por qué pasa o no pasa." }
  ]
}]

Reglas:
- isNoise: true solo si la señal no tiene ninguna relación con el vertical "${profile.vertical}"
- relevanceScore: 0-100
- criteriaScores: exactamente uno por cada criterio, en el mismo orden que se listaron
- Respondé SOLO el JSON array`

    const result = await claude(prompt)
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

    const prompt = `Sos un analista de tendencias para un profesional de ${profile.vertical}.

Señales de esta semana:
${signals}

Agrupá en 3-5 clusters temáticos. Cada cluster debe representar un tema emergente real que importa esta semana.

Devolvé JSON array:
[{
  "id": "topic-1",
  "label": "Nombre del tema (máx 5 palabras)",
  "relevanceScore": 85,
  "count": 3,
  "isNoise": false,
  "contentIds": ["id1", "id2"],
  "summary": "Una oración explicando por qué este tema es relevante esta semana."
}]

Reglas:
- Usá los IDs exactos de los contenidos
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
// Generates canonical insights from topic clusters (with full Judgment Engine fields)
// Returns: Insight[]

app.post('/ai/relevance', async (req, res) => {
  try {
    const { topics, analyses, profile } = req.body

    const topicsText = topics.map((t) =>
      `[${t.id}] "${t.label}" — relevancia ${t.relevanceScore} — ${t.contentIds.length} señales (${t.contentIds.join(', ')})\n  Resumen: ${t.summary ?? ''}`
    ).join('\n\n')

    const criteriaText = profile.criteria?.length
      ? profile.criteria.join(' | ')
      : ''

    const prompt = `Sos el motor de insights de SignalOS. Convertí estos clusters de señales en insights concretos y accionables.

PERFIL:
- Vertical: ${profile.vertical}
- Rol: ${profile.role}
- Foco actual: ${profile.currentFocus ?? ''}
- Criterios: ${criteriaText}

CLUSTERS DE ESTA SEMANA:
${topicsText}

Generá 3-5 insights de alta calidad. Cada insight debe ser específico (no genérico), respaldado por las señales concretas, y directamente accionable para este usuario.

Devolvé JSON array:
[{
  "id": "ins-1",
  "title": "Titular impactante, máx 12 palabras",
  "summary": "2-3 oraciones con el insight específico basado en las señales.",
  "why": "Por qué importa para este usuario específicamente esta semana.",
  "priority": "high",
  "topicIds": ["topic-1"],
  "confidence": "high",
  "confidenceScore": 82,
  "confidenceExplanation": "Confirmado por 2+ fuentes independientes sobre el mismo trend.",
  "evidence": [
    { "contentId": "<id exacto>", "quote": null, "isExplicit": true, "weight": "primary" }
  ],
  "sourceCount": 2,
  "isConsolidated": true,
  "inferenceNote": null
}]

Valores válidos:
- priority: "high" | "medium" | "low"
- confidence: "high" | "medium" | "low" | "uncertain"
- evidence[].weight: "primary" | "supporting"
- inferenceNote: string si algo es inferido, null si está explícito en las fuentes
- Respondé SOLO el JSON array`

    const result = await claude(prompt)
    res.json(result)
  } catch (err) {
    console.error('[/ai/relevance]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /ai/actions ─────────────────────────────────────────────────────────
// Generates action items and week plan from insights
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

    const prompt = `Sos un coach de productividad que convierte insights en acciones concretas.

PERFIL: ${profile.name} — ${profile.role} — ${profile.vertical}
Criterios de filtro: ${criteriaText}
Restricciones: ${profile.constraints ?? 'ninguna'}

INSIGHTS DE ESTA SEMANA:
${insightsText}

Generá 4-6 acciones concretas y un plan semanal de 5 días.

Devolvé JSON:
{
  "actions": [{
    "id": "act-1",
    "type": "task",
    "title": "Acción específica, máx 10 palabras",
    "description": "Contexto de por qué hacer esto ahora.",
    "content": "Descripción detallada de qué hacer exactamente, paso a paso.",
    "priority": "high",
    "estimatedTime": "30 min",
    "topicId": "<id del topic relacionado>"
  }],
  "weekPlan": [
    { "day": 1, "label": "Lunes", "focus": "Tema principal del día", "tasks": ["Tarea 1", "Tarea 2"] },
    { "day": 2, "label": "Martes", "focus": "...", "tasks": ["..."] },
    { "day": 3, "label": "Miércoles", "focus": "...", "tasks": ["..."] },
    { "day": 4, "label": "Jueves", "focus": "...", "tasks": ["..."] },
    { "day": 5, "label": "Viernes", "focus": "Revisión y síntesis", "tasks": ["..."] }
  ]
}

Tipos válidos para actions: "task" | "template" | "prompt" | "hypothesis" | "checklist"
Prioridades: "high" | "medium" | "low"
Las acciones deben ser MUY específicas, no genéricas — basadas en los insights reales de esta semana.
Respondé SOLO el JSON`

    const result = await claude(prompt)
    res.json(result)
  } catch (err) {
    console.error('[/ai/actions]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /ai/memory ──────────────────────────────────────────────────────────
// Generates a learning recap for the week
// Returns: Recap

app.post('/ai/memory', async (req, res) => {
  try {
    const { items, profile } = req.body

    const signalTitles = items
      .filter((i) => !i.analysis?.isNoise)
      .slice(0, 10)
      .map((i) => `- ${i.title}`)
      .join('\n')

    const prompt = `Generá un resumen de aprendizaje semanal.

Usuario: ${profile.name} (${profile.role}, ${profile.vertical})
Semana: ${new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Señales procesadas: ${items.length}

Principales señales de esta semana:
${signalTitles}

Devolvé JSON:
{
  "id": "recap-${Date.now()}",
  "week": "${new Date().toISOString().slice(0, 10)}",
  "learned": ["Aprendizaje clave 1", "Aprendizaje clave 2", "Aprendizaje clave 3"],
  "applied": ["Qué se puede aplicar esta semana 1", "Qué se puede aplicar 2"],
  "pending": ["Tema que merece más investigación 1"],
  "toReview": ["Señal a revisar la semana que viene"],
  "nextSkill": "Una habilidad o área a desarrollar basada en estos trends",
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

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok', model: MODEL }))

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\nSignalOS API server running on http://localhost:${PORT}`)
  console.log(`Model: ${MODEL}`)
  console.log(`API key: ${process.env.ANTHROPIC_API_KEY ? '✓ set' : '✗ missing — set ANTHROPIC_API_KEY in server/.env'}\n`)
})
