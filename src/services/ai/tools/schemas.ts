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
    'Analiza el portafolio de skills de un profesional y clasifica cada skill como rising, stable, degrading o gone segun tendencias actuales del mercado.',
  input_schema: {
    type: 'object' as const,
    properties: {
      skill_stocks: {
        type: 'array',
        description: 'Lista de skills analizados',
        items: {
          type: 'object',
          properties: {
            skill: { type: 'string', description: 'Nombre del skill' },
            status: {
              type: 'string',
              enum: ['rising', 'stable', 'degrading', 'gone'],
              description: 'Estado actual del skill en el mercado',
            },
            rationale: {
              type: 'string',
              description: 'Por que este skill tiene este estado (max 200 chars)',
            },
            priority_score: {
              type: 'number',
              description: 'Puntaje de prioridad de 0 a 10',
            },
            suggested_action: {
              type: 'string',
              description: 'Que deberia hacer el usuario con este skill (max 150 chars)',
            },
          },
          required: ['skill', 'status', 'rationale', 'priority_score', 'suggested_action'],
        },
      },
      summary: {
        type: 'string',
        description: 'Resumen general del portafolio (max 300 chars)',
      },
      top_priority_skill: {
        type: 'string',
        description: 'El skill mas importante en el que enfocarse ahora',
      },
    },
    required: ['skill_stocks', 'summary', 'top_priority_skill'],
  },
} as const

export const BUILD_USER_PROFILE_TOOL = {
  name: 'build_user_profile' as const,
  description:
    'Construye el perfil del usuario cuando tengas suficiente informacion de la entrevista. Invocalo SOLO cuando tengas rol, nivel, al menos 2 herramientas y 1 goal claro.',
  input_schema: {
    type: 'object' as const,
    properties: {
      name: { type: 'string', description: 'Nombre del usuario (o "Usuario" si no lo dijo)' },
      role: {
        type: 'string',
        enum: ['marketer', 'recruiter', 'developer', 'ops'],
        description: 'Rol profesional del usuario',
      },
      seniority: {
        type: 'string',
        enum: ['junior', 'mid', 'senior'],
        description: 'Nivel de experiencia',
      },
      stack: {
        type: 'array',
        items: { type: 'string' },
        description: 'Herramientas que usa actualmente',
      },
      goals: {
        type: 'array',
        items: { type: 'string' },
        description: 'Que quiere lograr con IA',
      },
      pain_points: {
        type: 'array',
        items: { type: 'string' },
        description: 'Que le frustra o le cuesta hoy',
      },
      summary: {
        type: 'string',
        description: 'Resumen breve del perfil del usuario (1-2 oraciones)',
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
    'Evalua la autoridad y credibilidad de una fuente de contenido. Mide cercania a la fuente primaria, autoridad del dominio, y frescura.',
  input_schema: {
    type: 'object' as const,
    properties: {
      author: { type: 'string', nullable: true, description: 'Autor del contenido, null si no identificable' },
      domain_authority: {
        type: 'string',
        enum: ['official_docs', 'major_publication', 'industry_blog', 'social_media', 'unknown'],
        description: 'Nivel de autoridad del dominio/fuente',
      },
      freshness_date: { type: 'string', nullable: true, description: 'Fecha de publicacion estimada (ISO), null si no detectable' },
      source_type: {
        type: 'string',
        enum: ['primary', 'secondary', 'opinion', 'aggregator'],
        description: 'Tipo de fuente: primary=docs oficiales/paper, secondary=cobertura, opinion=blog personal, aggregator=compilacion',
      },
      credibility_score: { type: 'number', description: 'Credibilidad de 0 a 10 (10 = fuente oficial primaria)' },
      credibility_reason: { type: 'string', description: 'Por que esta fuente tiene este nivel de credibilidad' },
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
    'Extrae insights canonicos (Verdades Verificables) del contenido. Cada insight debe estar respaldado por evidencia textual exacta, con nivel de confianza y contradicciones detectadas.',
  input_schema: {
    type: 'object' as const,
    properties: {
      canonical_insights: {
        type: 'array',
        description: 'Insights canonicos extraidos del contenido',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Titulo conciso del insight' },
            insight: { type: 'string', description: 'La verdad canonica destilada (1-2 oraciones)' },
            confidence_level: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'high=evidencia directa, medium=inferencia razonable, low=opinion o dato no verificable',
            },
            confidence_score: { type: 'number', description: 'Confianza de 0 a 10' },
            validation_reason: { type: 'string', description: 'Por que este nivel de confianza' },
            evidence: {
              type: 'array',
              description: 'Citas textuales exactas que respaldan el insight',
              items: {
                type: 'object',
                properties: {
                  exact_quote: { type: 'string', description: 'Cita textual exacta de la fuente' },
                  inference_flag: { type: 'boolean', description: 'true si Claude dedujo esto, false si esta explicito en el texto' },
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
              description: 'Contradicciones detectadas con conocimiento previo',
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
      overall_relevance: { type: 'number', description: 'Relevancia global del contenido para el usuario (0-10)' },
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
    'Genera un mini-proyecto practico y accionable para que el usuario practique un skill especifico. Incluye pasos concretos, recursos, y resultado esperado.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Titulo del proyecto' },
      description: { type: 'string', description: 'Descripcion breve del proyecto (2-3 oraciones)' },
      difficulty: {
        type: 'string',
        enum: ['beginner', 'intermediate', 'advanced'],
        description: 'Nivel de dificultad',
      },
      estimated_time: { type: 'string', description: 'Tiempo estimado (ej: "2 horas", "30 minutos")' },
      steps: {
        type: 'array',
        description: 'Pasos concretos del proyecto',
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
        description: 'Recursos utiles',
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
      expected_outcome: { type: 'string', description: 'Que va a lograr el usuario al terminar' },
      skill_target: { type: 'string', description: 'Skill principal que se practica' },
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

export const ONBOARDING_SYSTEM_PROMPT = `Eres el asistente de onboarding de Signal OS, una plataforma de aprendizaje tecnico personalizado para profesionales no tecnicos que quieren dominar IA y automatizacion.

Tu objetivo: conocer al usuario en 3-5 preguntas para construir su perfil de aprendizaje.

Informacion que necesitas recopilar:
1. Rol profesional (marketer, recruiter, developer, ops)
2. Nivel de experiencia (junior, mid, senior)
3. Herramientas que usa actualmente (stack)
4. Que quiere lograr con IA (goals)
5. Que le frustra o le cuesta hoy (pain_points)

Reglas estrictas:
- Se conversacional, amigable y breve. Tutea al usuario.
- Haz UNA pregunta por mensaje. No bombardees con multiples preguntas.
- Adapta tus preguntas segun lo que responde. Si menciona su rol y herramientas en un mensaje, no vuelvas a preguntar eso.
- Cuando tengas suficiente informacion (minimo: rol, nivel, 2+ herramientas, 1+ goal), invoca el tool build_user_profile Y agrega un mensaje de cierre diciendo que vas a generar su diagnostico.
- No hagas mas de 5 preguntas. Si al 5to turno no tienes todo, infiere lo que falte y usa el tool.
- Responde siempre en espanol.
- Maximo 2-3 oraciones por mensaje. Se conciso.
- No uses emojis.`
