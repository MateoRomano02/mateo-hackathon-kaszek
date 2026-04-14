import Anthropic from '@anthropic-ai/sdk'
import type { AIAnalysisService } from './AIAnalysisService'
import type { OnboardingData, UserProfile, SkillStock, OnboardingChatResult } from '@/entities/user/types'
import type { SourceMetadata, CanonicalInsight, GeneratedProject } from '@/entities/content/types'
// Tool definitions use `as const` → readonly arrays. New SDK requires mutable string[].
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asTool = (t: unknown): Anthropic.Tool => t as any

import {
  ANALYZE_PORTFOLIO_TOOL,
  AnalyzePortfolioOutputSchema,
  BUILD_USER_PROFILE_TOOL,
  BuildUserProfileSchema,
  EVALUATE_SOURCE_TOOL,
  EvaluateSourceOutputSchema,
  EXTRACT_CANONICAL_INSIGHTS_TOOL,
  ExtractInsightsOutputSchema,
  GENERATE_PROJECT_TOOL,
  GenerateProjectOutputSchema,
  ONBOARDING_SYSTEM_PROMPT,
} from './tools/schemas'
import { obtenerMensajeError } from '@/shared/utils/errors'

const getClient = () =>
  new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  })

function extractToolBlock(content: Anthropic.ContentBlock[], toolName: string) {
  return content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === 'tool_use' && block.name === toolName,
  )
}

function extractTextBlock(content: Anthropic.ContentBlock[]) {
  return content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text',
  )
}

export const anthropicAnalysisService: AIAnalysisService = {
  async analyzeOnboarding(data: OnboardingData): Promise<UserProfile> {
    return {
      id: crypto.randomUUID(),
      name: 'Usuario',
      role: data.role,
      seniority: data.seniority,
      stack: data.stack,
      createdAt: new Date().toISOString(),
    }
  },

  async analyzeSkillPortfolio(profile: UserProfile): Promise<SkillStock[]> {
    try {
      const client = getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        tools: [asTool(ANALYZE_PORTFOLIO_TOOL)],
        tool_choice: { type: 'tool', name: 'analyze_skill_portfolio' },
        messages: [{
          role: 'user',
          content: `Analiza el portafolio de skills de este profesional.

Perfil: ${profile.role} / ${profile.seniority}
Stack: ${profile.stack.join(', ')}
${profile.goals?.length ? `Objetivos: ${profile.goals.join(', ')}` : ''}
${profile.painPoints?.length ? `Frustraciones: ${profile.painPoints.join(', ')}` : ''}

Incluye 8-12 skills. priority_score 0-10. Todo en espanol.`,
        }],
      })

      const toolBlock = extractToolBlock(response.content, 'analyze_skill_portfolio')
      if (!toolBlock) throw new Error('Claude no devolvio tool_use')
      const parsed = AnalyzePortfolioOutputSchema.parse(toolBlock.input)
      return parsed.skill_stocks.map((s) => ({
        id: crypto.randomUUID(), skill: s.skill, status: s.status,
        rationale: s.rationale, priorityScore: s.priority_score, suggestedAction: s.suggested_action,
      }))
    } catch (error) {
      const { mensaje } = obtenerMensajeError(error)
      throw new Error(mensaje)
    }
  },

  async conductOnboardingChat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    onStream: (text: string) => void,
  ): Promise<OnboardingChatResult> {
    try {
      const client = getClient()
      const apiMessages: Anthropic.MessageParam[] = []
      if (messages.length > 0 && messages[0].role === 'assistant') {
        apiMessages.push({ role: 'user', content: '[El usuario abre Signal OS por primera vez.]' })
      }
      for (const msg of messages) apiMessages.push({ role: msg.role, content: msg.content })

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: ONBOARDING_SYSTEM_PROMPT,
        tools: [asTool(BUILD_USER_PROFILE_TOOL)],
        messages: apiMessages,
      })
      stream.on('text', (text) => onStream(text))
      const finalMessage = await stream.finalMessage()
      const blocks = finalMessage.content as Anthropic.ContentBlock[]

      const toolBlock = extractToolBlock(blocks, 'build_user_profile')
      if (toolBlock) {
        const parsed = BuildUserProfileSchema.parse(toolBlock.input)
        return {
          type: 'profile_complete',
          profile: {
            id: crypto.randomUUID(), name: parsed.name, role: parsed.role,
            seniority: parsed.seniority, stack: parsed.stack, goals: parsed.goals,
            painPoints: parsed.pain_points, summary: parsed.summary, createdAt: new Date().toISOString(),
          },
          content: extractTextBlock(blocks)?.text || 'Perfil creado!',
        }
      }
      return { type: 'message', content: extractTextBlock(blocks)?.text || '' }
    } catch (error) {
      const { mensaje } = obtenerMensajeError(error)
      throw new Error(mensaje)
    }
  },

  // ── TRUTH PIPELINE: Step 1 — Evaluate Source Authority ───────────

  async evaluateSource(content: string, url?: string): Promise<SourceMetadata> {
    try {
      const client = getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        tools: [asTool(EVALUATE_SOURCE_TOOL)],
        tool_choice: { type: 'tool', name: 'evaluate_source' },
        messages: [{
          role: 'user',
          content: `Eres un analista de credibilidad de fuentes para Signal OS (Truth Layer).

Evalua la autoridad y credibilidad de esta fuente.
${url ? `URL: ${url}` : '(Texto pegado directamente, sin URL)'}

Criterios:
- official_docs = documentacion oficial, papers, anuncios de empresa
- major_publication = TechCrunch, Wired, HBR, MIT Tech Review
- industry_blog = blogs de profesionales reconocidos
- social_media = tweets, posts de LinkedIn, hilos
- primary = la fuente origina la informacion
- secondary = reporta/comenta sobre informacion primaria
- opinion = analisis subjetivo
- aggregator = compila de multiples fuentes

Contenido:
---
${content.slice(0, 3000)}
---

Responde en espanol.`,
        }],
      })

      const toolBlock = extractToolBlock(response.content, 'evaluate_source')
      if (!toolBlock) throw new Error('Claude no evaluo la fuente')
      const parsed = EvaluateSourceOutputSchema.parse(toolBlock.input)

      return {
        author: parsed.author,
        domainAuthority: parsed.domain_authority,
        freshnessDate: parsed.freshness_date,
        sourceType: parsed.source_type,
        credibilityScore: parsed.credibility_score,
        credibilityReason: parsed.credibility_reason,
      }
    } catch (error) {
      const { mensaje } = obtenerMensajeError(error)
      throw new Error(mensaje)
    }
  },

  // ── TRUTH PIPELINE: Step 2 — Extract Canonical Insights ──────────

  async extractCanonicalInsights(
    content: string,
    sourceMetadata: SourceMetadata,
    profile: UserProfile,
  ): Promise<{ insights: CanonicalInsight[]; overallRelevance: number }> {
    try {
      const client = getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        tools: [asTool(EXTRACT_CANONICAL_INSIGHTS_TOOL)],
        tool_choice: { type: 'tool', name: 'extract_canonical_insights' },
        messages: [{
          role: 'user',
          content: `Eres el Judgment Engine de Signal OS. Tu trabajo es extraer VERDADES CANONICAS de este contenido.

NO resumas. DESTILA. Cada insight debe ser una verdad verificable, no una opinion.

Evaluacion de fuente previa:
- Autoridad: ${sourceMetadata.domainAuthority}
- Tipo: ${sourceMetadata.sourceType}
- Credibilidad: ${sourceMetadata.credibilityScore}/10
- Razon: ${sourceMetadata.credibilityReason}

Perfil del usuario:
- Rol: ${profile.role} / ${profile.seniority}
- Stack: ${profile.stack.join(', ')}
${profile.goals?.length ? `- Objetivos: ${profile.goals.join(', ')}` : ''}

Reglas:
- Cada insight DEBE tener al menos 1 cita textual exacta del contenido original (evidence).
- inference_flag = true SOLO si Claude dedujo algo no explicito en el texto.
- confidence: high = dato verificable con fuente primaria, medium = inferencia razonable, low = opinion o dato sin respaldo.
- Detecta contradicciones con conocimiento previo comun del area.
- Extrae 2-5 insights. Calidad > cantidad.
- related_skills: conecta cada insight con skills del portafolio del usuario.
- Todo en espanol.

Contenido:
---
${content.slice(0, 3500)}
---`,
        }],
      })

      const toolBlock = extractToolBlock(response.content, 'extract_canonical_insights')
      if (!toolBlock) throw new Error('Claude no extrajo insights')
      const parsed = ExtractInsightsOutputSchema.parse(toolBlock.input)

      const insights: CanonicalInsight[] = parsed.canonical_insights.map((ci) => ({
        id: crypto.randomUUID(),
        title: ci.title,
        insight: ci.insight,
        confidenceLevel: ci.confidence_level,
        confidenceScore: ci.confidence_score,
        validationReason: ci.validation_reason,
        evidence: ci.evidence.map((e) => ({ exactQuote: e.exact_quote, inferenceFlag: e.inference_flag })),
        relatedSkills: ci.related_skills.map((s) => ({ skill: s.skill, statusImpact: s.status_impact, reason: s.reason })),
        contradictions: ci.contradictions.map((c) => ({ description: c.description, resolution: c.resolution })),
        category: ci.category,
      }))

      return { insights, overallRelevance: parsed.overall_relevance }
    } catch (error) {
      const { mensaje } = obtenerMensajeError(error)
      throw new Error(mensaje)
    }
  },

  async generateProject(skillName: string, profile: UserProfile): Promise<GeneratedProject> {
    try {
      const client = getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        tools: [asTool(GENERATE_PROJECT_TOOL)],
        tool_choice: { type: 'tool', name: 'generate_project' },
        messages: [{
          role: 'user',
          content: `Genera un mini-proyecto practico para el skill: ${skillName}
Perfil: ${profile.role} / ${profile.seniority} / Stack: ${profile.stack.join(', ')}
${profile.goals?.length ? `Objetivos: ${profile.goals.join(', ')}` : ''}
Completable en <3 horas. Pasos concretos. Recursos reales. Todo en espanol.`,
        }],
      })

      const toolBlock = extractToolBlock(response.content, 'generate_project')
      if (!toolBlock) throw new Error('Claude no genero el proyecto')
      const parsed = GenerateProjectOutputSchema.parse(toolBlock.input)
      return {
        id: crypto.randomUUID(), title: parsed.title, description: parsed.description,
        difficulty: parsed.difficulty, estimatedTime: parsed.estimated_time, steps: parsed.steps,
        resources: parsed.resources, expectedOutcome: parsed.expected_outcome,
        skillTarget: parsed.skill_target, createdAt: new Date().toISOString(),
      }
    } catch (error) {
      const { mensaje } = obtenerMensajeError(error)
      throw new Error(mensaje)
    }
  },
}
