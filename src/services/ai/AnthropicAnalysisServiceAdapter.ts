import Anthropic from '@anthropic-ai/sdk'
import type { AIAnalysisService } from './AIAnalysisService'
import type { OnboardingData, UserProfile, SkillStock, OnboardingChatResult } from '@/entities/user/types'
import type { AnalyzedContent, GeneratedProject } from '@/entities/content/types'
import {
  ANALYZE_PORTFOLIO_TOOL,
  AnalyzePortfolioOutputSchema,
  BUILD_USER_PROFILE_TOOL,
  BuildUserProfileSchema,
  ANALYZE_CONTENT_TOOL,
  AnalyzeContentOutputSchema,
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
        tools: [ANALYZE_PORTFOLIO_TOOL],
        tool_choice: { type: 'tool', name: 'analyze_skill_portfolio' },
        messages: [
          {
            role: 'user',
            content: `Eres un experto en analisis de skills para profesionales de marketing digital en Latinoamerica.

Analiza el portafolio de skills de este usuario y clasifica cada skill relevante.

Perfil del usuario:
- Rol: ${profile.role}
- Nivel: ${profile.seniority}
- Stack actual: ${profile.stack.join(', ')}
${profile.goals?.length ? `- Objetivos: ${profile.goals.join(', ')}` : ''}
${profile.painPoints?.length ? `- Frustraciones: ${profile.painPoints.join(', ')}` : ''}
${profile.summary ? `- Resumen: ${profile.summary}` : ''}

Reglas:
- Incluye entre 8 y 12 skills relevantes para su rol y nivel.
- Se especifico con rationale y suggested_action.
- Incluye skills que NO estan en su stack pero deberia conocer.
- priority_score de 0 a 10 (10 = maxima urgencia de accion).
- Todo en espanol.`,
          },
        ],
      })

      const toolBlock = extractToolBlock(response.content, 'analyze_skill_portfolio')
      if (!toolBlock) throw new Error('Claude no devolvio un tool_use block')

      const parsed = AnalyzePortfolioOutputSchema.parse(toolBlock.input)
      return parsed.skill_stocks.map((s) => ({
        id: crypto.randomUUID(),
        skill: s.skill,
        status: s.status,
        rationale: s.rationale,
        priorityScore: s.priority_score,
        suggestedAction: s.suggested_action,
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
        apiMessages.push({
          role: 'user',
          content: '[El usuario abre Signal OS por primera vez. Saluda y empieza la entrevista.]',
        })
      }
      for (const msg of messages) {
        apiMessages.push({ role: msg.role, content: msg.content })
      }

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: ONBOARDING_SYSTEM_PROMPT,
        tools: [BUILD_USER_PROFILE_TOOL],
        messages: apiMessages,
      })

      stream.on('text', (text) => onStream(text))
      const finalMessage = await stream.finalMessage()
      const blocks = finalMessage.content as Anthropic.ContentBlock[]

      const toolBlock = extractToolBlock(blocks, 'build_user_profile')
      if (toolBlock) {
        const parsed = BuildUserProfileSchema.parse(toolBlock.input)
        const profile: UserProfile = {
          id: crypto.randomUUID(),
          name: parsed.name,
          role: parsed.role,
          seniority: parsed.seniority,
          stack: parsed.stack,
          goals: parsed.goals,
          painPoints: parsed.pain_points,
          summary: parsed.summary,
          createdAt: new Date().toISOString(),
        }
        const textBlock = extractTextBlock(blocks)
        return {
          type: 'profile_complete',
          profile,
          content: textBlock?.text || 'Perfil creado! Generando tu diagnostico...',
        }
      }

      const textBlock = extractTextBlock(blocks)
      return { type: 'message', content: textBlock?.text || '' }
    } catch (error) {
      const { mensaje } = obtenerMensajeError(error)
      throw new Error(mensaje)
    }
  },

  async analyzeContent(content: string, profile: UserProfile): Promise<AnalyzedContent> {
    try {
      const client = getClient()
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        tools: [ANALYZE_CONTENT_TOOL],
        tool_choice: { type: 'tool', name: 'analyze_content' },
        messages: [
          {
            role: 'user',
            content: `Eres un analista de contenido para Signal OS. Analiza el siguiente contenido y clasificalo segun su relevancia para el portafolio de skills del usuario.

Perfil del usuario:
- Rol: ${profile.role}
- Nivel: ${profile.seniority}
- Stack: ${profile.stack.join(', ')}
${profile.goals?.length ? `- Objetivos: ${profile.goals.join(', ')}` : ''}

Contenido a analizar:
---
${content}
---

Reglas:
- Identifica entre 2 y 5 skills relacionados.
- Evalua si el contenido sugiere que algun skill esta rising, stable, degrading o gone.
- Propone 2-3 acciones concretas que el usuario puede tomar.
- relevance_score de 0 a 10 (10 = extremadamente relevante para su perfil).
- Todo en espanol.`,
          },
        ],
      })

      const toolBlock = extractToolBlock(response.content, 'analyze_content')
      if (!toolBlock) throw new Error('Claude no devolvio analisis de contenido')

      const parsed = AnalyzeContentOutputSchema.parse(toolBlock.input)
      return {
        title: parsed.title,
        summary: parsed.summary,
        mainTopics: parsed.main_topics,
        relatedSkills: parsed.related_skills.map((s) => ({
          skill: s.skill,
          relevance: s.relevance,
          statusImpact: s.status_impact,
          reason: s.reason,
        })),
        actionItems: parsed.action_items,
        relevanceScore: parsed.relevance_score,
        category: parsed.category,
      }
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
        tools: [GENERATE_PROJECT_TOOL],
        tool_choice: { type: 'tool', name: 'generate_project' },
        messages: [
          {
            role: 'user',
            content: `Eres un disenador instruccional de Signal OS. Genera un mini-proyecto practico y accionable.

Skill target: ${skillName}

Perfil del usuario:
- Rol: ${profile.role}
- Nivel: ${profile.seniority}
- Stack: ${profile.stack.join(', ')}
${profile.goals?.length ? `- Objetivos: ${profile.goals.join(', ')}` : ''}

Reglas:
- El proyecto debe ser completable en menos de 3 horas.
- Pasos concretos, no genericos. El usuario debe saber exactamente que hacer.
- Incluye recursos reales (URLs a documentacion, herramientas, tutoriales).
- El resultado esperado debe ser tangible (un dashboard, una campana, un reporte, un flujo automatizado).
- Adapta la dificultad al nivel del usuario.
- Todo en espanol.`,
          },
        ],
      })

      const toolBlock = extractToolBlock(response.content, 'generate_project')
      if (!toolBlock) throw new Error('Claude no genero el proyecto')

      const parsed = GenerateProjectOutputSchema.parse(toolBlock.input)
      return {
        id: crypto.randomUUID(),
        title: parsed.title,
        description: parsed.description,
        difficulty: parsed.difficulty,
        estimatedTime: parsed.estimated_time,
        steps: parsed.steps,
        resources: parsed.resources,
        expectedOutcome: parsed.expected_outcome,
        skillTarget: parsed.skill_target,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      const { mensaje } = obtenerMensajeError(error)
      throw new Error(mensaje)
    }
  },
}
