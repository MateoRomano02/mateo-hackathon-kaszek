import { z } from 'zod'

// ── Zod schemas for validation ─────────────────────────────────────

export const SkillStockResultSchema = z.object({
  skill: z.string(),
  status: z.enum(['rising', 'stable', 'degrading', 'gone']),
  rationale: z.string(),
  priority_score: z.number().min(0).max(10),
  suggested_action: z.string(),
})

export const AnalyzePortfolioOutputSchema = z.object({
  skill_stocks: z.array(SkillStockResultSchema).min(1),
  summary: z.string(),
  top_priority_skill: z.string(),
})

export type AnalyzePortfolioOutput = z.infer<typeof AnalyzePortfolioOutputSchema>
export type SkillStockResult = z.infer<typeof SkillStockResultSchema>

export const BuildUserProfileSchema = z.object({
  name: z.string(),
  role: z.enum(['marketer', 'recruiter', 'developer', 'ops']),
  seniority: z.enum(['junior', 'mid', 'senior']),
  stack: z.array(z.string()).min(1),
  goals: z.array(z.string()),
  pain_points: z.array(z.string()),
  summary: z.string(),
})

export type BuildUserProfileOutput = z.infer<typeof BuildUserProfileSchema>

// ── Anthropic tool definitions (JSON Schema for the API) ───────────

export const ANALYZE_PORTFOLIO_TOOL = {
  name: 'analyze_skill_portfolio' as const,
  description:
    'Analyzes a professional\'s skill portfolio and classifies each skill as rising, stable, degrading, or gone based on current market trends.',
  input_schema: {
    type: 'object' as const,
    properties: {
      skill_stocks: {
        type: 'array',
        description: 'List of analyzed skills',
        items: {
          type: 'object',
          properties: {
            skill: { type: 'string', description: 'Skill name' },
            status: {
              type: 'string',
              enum: ['rising', 'stable', 'degrading', 'gone'],
              description: 'Current market status of the skill',
            },
            rationale: {
              type: 'string',
              description: 'Why this skill has this status (max 200 chars)',
            },
            priority_score: {
              type: 'number',
              description: 'Priority score from 0 to 10',
            },
            suggested_action: {
              type: 'string',
              description: 'What the user should do with this skill (max 150 chars)',
            },
          },
          required: ['skill', 'status', 'rationale', 'priority_score', 'suggested_action'],
        },
      },
      summary: {
        type: 'string',
        description: 'Overall portfolio summary (max 300 chars)',
      },
      top_priority_skill: {
        type: 'string',
        description: 'The most important skill to focus on now',
      },
    },
    required: ['skill_stocks', 'summary', 'top_priority_skill'],
  },
} as const

export const BUILD_USER_PROFILE_TOOL = {
  name: 'build_user_profile' as const,
  description:
    'Builds the user profile when you have enough information from the interview. Invoke ONLY when you have role, level, at least 2 tools, and 1 clear goal.',
  input_schema: {
    type: 'object' as const,
    properties: {
      name: { type: 'string', description: 'User name (or "User" if not provided)' },
      role: {
        type: 'string',
        enum: ['marketer', 'recruiter', 'developer', 'ops'],
        description: 'User professional role',
      },
      seniority: {
        type: 'string',
        enum: ['junior', 'mid', 'senior'],
        description: 'Experience level',
      },
      stack: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tools currently in use',
      },
      goals: {
        type: 'array',
        items: { type: 'string' },
        description: 'What they want to achieve with AI',
      },
      pain_points: {
        type: 'array',
        items: { type: 'string' },
        description: 'What frustrates them or is difficult today',
      },
      summary: {
        type: 'string',
        description: 'Brief user profile summary (1-2 sentences)',
      },
    },
    required: ['name', 'role', 'seniority', 'stack', 'goals', 'pain_points', 'summary'],
  },
} as const

// ── TRUTH PIPELINE: EVALUATE SOURCE ────────────────────────────────

export const EvaluateSourceOutputSchema = z.object({
  author: z.string().nullable(),
  domain_authority: z.enum(['official_docs', 'major_publication', 'industry_blog', 'social_media', 'unknown']),
  freshness_date: z.string().nullable(),
  source_type: z.enum(['primary', 'secondary', 'opinion', 'aggregator']),
  credibility_score: z.number().min(0).max(10),
  credibility_reason: z.string(),
})

export type EvaluateSourceOutput = z.infer<typeof EvaluateSourceOutputSchema>

export const EVALUATE_SOURCE_TOOL = {
  name: 'evaluate_source' as const,
  description:
    'Evaluates the authority and credibility of a content source. Measures proximity to primary source, domain authority, and freshness.',
  input_schema: {
    type: 'object' as const,
    properties: {
      author: { type: 'string', nullable: true, description: 'Content author, null if not identifiable' },
      domain_authority: {
        type: 'string',
        enum: ['official_docs', 'major_publication', 'industry_blog', 'social_media', 'unknown'],
        description: 'Domain/source authority level',
      },
      freshness_date: { type: 'string', nullable: true, description: 'Estimated publication date (ISO), null if not detectable' },
      source_type: {
        type: 'string',
        enum: ['primary', 'secondary', 'opinion', 'aggregator'],
        description: 'Source type: primary=official docs/paper, secondary=coverage, opinion=personal blog, aggregator=compilation',
      },
      credibility_score: { type: 'number', description: 'Credibility from 0 to 10 (10 = official primary source)' },
      credibility_reason: { type: 'string', description: 'Why this source has this credibility level' },
    },
    required: ['author', 'domain_authority', 'freshness_date', 'source_type', 'credibility_score', 'credibility_reason'],
  },
} as const

// ── TRUTH PIPELINE: EXTRACT CANONICAL INSIGHTS ─────────────────────

export const EvidenceSchema = z.object({
  exact_quote: z.string(),
  inference_flag: z.boolean(),
})

export const InsightRelatedSkillSchema = z.object({
  skill: z.string(),
  status_impact: z.enum(['rising', 'stable', 'degrading', 'gone']),
  reason: z.string(),
})

export const ContradictionSchema = z.object({
  description: z.string(),
  resolution: z.string().nullable(),
})

export const CanonicalInsightSchema = z.object({
  title: z.string(),
  insight: z.string(),
  confidence_level: z.enum(['high', 'medium', 'low']),
  confidence_score: z.number().min(0).max(10),
  validation_reason: z.string(),
  evidence: z.array(EvidenceSchema).min(1),
  related_skills: z.array(InsightRelatedSkillSchema).min(1),
  contradictions: z.array(ContradictionSchema),
  category: z.enum(['tutorial', 'news', 'tool', 'case_study', 'opinion']),
})

export const ExtractInsightsOutputSchema = z.object({
  canonical_insights: z.array(CanonicalInsightSchema).min(1),
  overall_relevance: z.number().min(0).max(10),
})

export type ExtractInsightsOutput = z.infer<typeof ExtractInsightsOutputSchema>
export type CanonicalInsightRaw = z.infer<typeof CanonicalInsightSchema>

export const EXTRACT_CANONICAL_INSIGHTS_TOOL = {
  name: 'extract_canonical_insights' as const,
  description:
    'Extracts canonical insights (Verifiable Truths) from content. Each insight must be backed by exact textual evidence, with confidence level and detected contradictions.',
  input_schema: {
    type: 'object' as const,
    properties: {
      canonical_insights: {
        type: 'array',
        description: 'Canonical insights extracted from content',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Concise insight title' },
            insight: { type: 'string', description: 'The distilled canonical truth (1-2 sentences)' },
            confidence_level: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'high=direct evidence, medium=reasonable inference, low=opinion or unverifiable data',
            },
            confidence_score: { type: 'number', description: 'Confidence from 0 to 10' },
            validation_reason: { type: 'string', description: 'Why this confidence level' },
            evidence: {
              type: 'array',
              description: 'Exact textual quotes supporting the insight',
              items: {
                type: 'object',
                properties: {
                  exact_quote: { type: 'string', description: 'Exact textual quote from the source' },
                  inference_flag: { type: 'boolean', description: 'true if Claude inferred this, false if explicit in the text' },
                },
                required: ['exact_quote', 'inference_flag'],
              },
            },
            related_skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skill: { type: 'string' },
                  status_impact: { type: 'string', enum: ['rising', 'stable', 'degrading', 'gone'] },
                  reason: { type: 'string' },
                },
                required: ['skill', 'status_impact', 'reason'],
              },
            },
            contradictions: {
              type: 'array',
              description: 'Contradictions detected with prior knowledge',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  resolution: { type: 'string', nullable: true },
                },
                required: ['description', 'resolution'],
              },
            },
            category: { type: 'string', enum: ['tutorial', 'news', 'tool', 'case_study', 'opinion'] },
          },
          required: ['title', 'insight', 'confidence_level', 'confidence_score', 'validation_reason', 'evidence', 'related_skills', 'contradictions', 'category'],
        },
      },
      overall_relevance: { type: 'number', description: 'Overall content relevance for the user (0-10)' },
    },
    required: ['canonical_insights', 'overall_relevance'],
  },
} as const

// ── GENERATE PROJECT TOOL ──────────────────────────────────────────

export const ProjectStepSchema = z.object({
  step: z.number(),
  title: z.string(),
  description: z.string(),
})

export const ProjectResourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.string(),
})

export const GenerateProjectOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_time: z.string(),
  steps: z.array(ProjectStepSchema).min(1),
  resources: z.array(ProjectResourceSchema),
  expected_outcome: z.string(),
  skill_target: z.string(),
})

export type GenerateProjectOutput = z.infer<typeof GenerateProjectOutputSchema>

export const GENERATE_PROJECT_TOOL = {
  name: 'generate_project' as const,
  description:
    'Generates a practical, actionable mini-project for the user to practice a specific skill. Includes concrete steps, resources, and expected outcome.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Project title' },
      description: { type: 'string', description: 'Brief project description (2-3 sentences)' },
      difficulty: {
        type: 'string',
        enum: ['beginner', 'intermediate', 'advanced'],
        description: 'Difficulty level',
      },
      estimated_time: { type: 'string', description: 'Estimated time (e.g., "2 hours", "30 minutes")' },
      steps: {
        type: 'array',
        description: 'Concrete project steps',
        items: {
          type: 'object',
          properties: {
            step: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['step', 'title', 'description'],
        },
      },
      resources: {
        type: 'array',
        description: 'Useful resources',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            url: { type: 'string' },
            type: { type: 'string' },
          },
          required: ['title', 'url', 'type'],
        },
      },
      expected_outcome: { type: 'string', description: 'What the user will achieve upon completion' },
      skill_target: { type: 'string', description: 'Main skill being practiced' },
    },
    required: [
      'title',
      'description',
      'difficulty',
      'estimated_time',
      'steps',
      'resources',
      'expected_outcome',
      'skill_target',
    ],
  },
} as const

// ── SYSTEM PROMPTS ─────────────────────────────────────────────────

export const ONBOARDING_SYSTEM_PROMPT = `You are the onboarding assistant for Signal OS, a personalized technical learning platform for non-technical professionals who want to master AI and automation.

Your goal: get to know the user in 3-5 questions to build their learning profile.

Information you need to collect:
1. Professional role (marketer, recruiter, developer, ops)
2. Experience level (junior, mid, senior)
3. Tools they currently use (stack)
4. What they want to achieve with AI (goals)
5. What frustrates them or is difficult today (pain_points)

Strict rules:
- Be conversational, friendly, and brief.
- Ask ONE question per message. Don't bombard with multiple questions.
- Adapt your questions based on their answers. If they mention their role and tools in one message, don't ask again.
- When you have enough information (minimum: role, level, 2+ tools, 1+ goal), invoke the build_user_profile tool AND add a closing message saying you'll generate their diagnostic.
- Don't ask more than 5 questions. If by the 5th turn you don't have everything, infer what's missing and use the tool.
- Respond in English.
- Maximum 2-3 sentences per message. Be concise.
- Don't use emojis.`
