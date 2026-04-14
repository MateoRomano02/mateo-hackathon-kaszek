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

// ── ANALYZE CONTENT TOOL ───────────────────────────────────────────

export const RelatedSkillSchema = z.object({
  skill: z.string(),
  relevance: z.enum(['high', 'medium', 'low']),
  status_impact: z.enum(['rising', 'stable', 'degrading', 'gone']),
  reason: z.string(),
})

export const AnalyzeContentOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  main_topics: z.array(z.string()).min(1),
  related_skills: z.array(RelatedSkillSchema).min(1),
  action_items: z.array(z.string()),
  relevance_score: z.number().min(0).max(10),
  category: z.enum(['tutorial', 'news', 'tool', 'case_study', 'opinion']),
})

export type AnalyzeContentOutput = z.infer<typeof AnalyzeContentOutputSchema>

export const ANALYZE_CONTENT_TOOL = {
  name: 'analyze_content' as const,
  description:
    'Analiza un contenido (articulo, tutorial, noticia, herramienta) y lo clasifica segun relevancia para el portafolio de skills del usuario. Devuelve skills relacionados, relevancia, y acciones sugeridas.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Titulo del contenido analizado' },
      summary: { type: 'string', description: 'Resumen del contenido en 2-3 oraciones' },
      main_topics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Temas principales del contenido',
      },
      related_skills: {
        type: 'array',
        description: 'Skills del portafolio que este contenido impacta',
        items: {
          type: 'object',
          properties: {
            skill: { type: 'string', description: 'Nombre del skill' },
            relevance: { type: 'string', enum: ['high', 'medium', 'low'] },
            status_impact: {
              type: 'string',
              enum: ['rising', 'stable', 'degrading', 'gone'],
              description: 'Si este contenido sugiere que el skill esta subiendo, estable, bajando o muerto',
            },
            reason: { type: 'string', description: 'Por que este contenido impacta este skill' },
          },
          required: ['skill', 'relevance', 'status_impact', 'reason'],
        },
      },
      action_items: {
        type: 'array',
        items: { type: 'string' },
        description: 'Acciones concretas que el usuario puede tomar basado en este contenido',
      },
      relevance_score: {
        type: 'number',
        description: 'Relevancia del contenido para el usuario de 0 a 10',
      },
      category: {
        type: 'string',
        enum: ['tutorial', 'news', 'tool', 'case_study', 'opinion'],
        description: 'Tipo de contenido',
      },
    },
    required: [
      'title',
      'summary',
      'main_topics',
      'related_skills',
      'action_items',
      'relevance_score',
      'category',
    ],
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
