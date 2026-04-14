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
      name: 'User',
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
          content: `Analyze this professional's skill portfolio.

Profile: ${profile.role} / ${profile.seniority}
Stack: ${profile.stack.join(', ')}
${profile.goals?.length ? `Goals: ${profile.goals.join(', ')}` : ''}
${profile.painPoints?.length ? `Frustrations: ${profile.painPoints.join(', ')}` : ''}

Include 8-12 skills. priority_score 0-10. All in English.`,
        }],
      })

      const toolBlock = extractToolBlock(response.content, 'analyze_skill_portfolio')
      if (!toolBlock) throw new Error('Claude did not return tool_use')
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
        apiMessages.push({ role: 'user', content: '[The user opens Signal OS for the first time.]' })
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
          content: extractTextBlock(blocks)?.text || 'Profile created!',
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
          content: `You are a source credibility analyst for Signal OS (Truth Layer).

Evaluate the authority and credibility of this source.
${url ? `URL: ${url}` : '(Text pasted directly, no URL)'}

Criteria:
- official_docs = official documentation, papers, company announcements
- major_publication = TechCrunch, Wired, HBR, MIT Tech Review
- industry_blog = blogs from recognized professionals
- social_media = tweets, LinkedIn posts, threads
- primary = the source originates the information
- secondary = reports/comments on primary information
- opinion = subjective analysis
- aggregator = compiles from multiple sources

Content:
---
${content.slice(0, 3000)}
---

Respond in English.`,
        }],
      })

      const toolBlock = extractToolBlock(response.content, 'evaluate_source')
      if (!toolBlock) throw new Error('Claude did not evaluate the source')
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
          content: `You are the Judgment Engine of Signal OS. Your job is to extract CANONICAL TRUTHS from this content.

DO NOT summarize. DISTILL. Each insight must be a verifiable truth, not an opinion.

Prior source evaluation:
- Authority: ${sourceMetadata.domainAuthority}
- Type: ${sourceMetadata.sourceType}
- Credibility: ${sourceMetadata.credibilityScore}/10
- Reason: ${sourceMetadata.credibilityReason}

User profile:
- Role: ${profile.role} / ${profile.seniority}
- Stack: ${profile.stack.join(', ')}
${profile.goals?.length ? `- Goals: ${profile.goals.join(', ')}` : ''}

Rules:
- Each insight MUST have at least 1 exact textual quote from the original content (evidence).
- inference_flag = true ONLY if Claude inferred something not explicit in the text.
- confidence: high = verifiable data with primary source, medium = reasonable inference, low = opinion or unsupported data.
- Detect contradictions with common prior knowledge in the field.
- Extract 2-5 insights. Quality > quantity.
- related_skills: connect each insight with skills from the user's portfolio.
- All in English.

Content:
---
${content.slice(0, 3500)}
---`,
        }],
      })

      const toolBlock = extractToolBlock(response.content, 'extract_canonical_insights')
      if (!toolBlock) throw new Error('Claude did not extract insights')
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
          content: `Generate a practical mini-project for the skill: ${skillName}
Profile: ${profile.role} / ${profile.seniority} / Stack: ${profile.stack.join(', ')}
${profile.goals?.length ? `Goals: ${profile.goals.join(', ')}` : ''}
Completable in <3 hours. Concrete steps. Real resources. All in English.`,
        }],
      })

      const toolBlock = extractToolBlock(response.content, 'generate_project')
      if (!toolBlock) throw new Error('Claude did not generate the project')
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
