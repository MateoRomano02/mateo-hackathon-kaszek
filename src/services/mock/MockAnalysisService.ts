import type { AIAnalysisService } from '@/services/ai/AIAnalysisService'
import type { OnboardingData, UserProfile, SkillStock, OnboardingChatResult } from '@/entities/user/types'
import type { AnalyzedContent, GeneratedProject } from '@/entities/content/types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const simulateStream = async (text: string, onStream: (t: string) => void) => {
  for (const char of text) {
    await delay(18)
    onStream(char)
  }
}

const SCRIPTED_RESPONSES = [
  'Que bueno que te sumas! Y que herramientas usas en tu dia a dia para trabajar? Pueden ser de publicidad, analytics, automatizacion, lo que sea.',
  'Muy buen stack. Ahora contame, que te gustaria poder hacer con IA que hoy no podes o te resulta dificil?',
  'Entiendo perfecto. Voy a armar tu diagnostico personalizado de skills. Dame un momento...',
]

const MOCK_SKILL_STOCKS: SkillStock[] = [
  { id: 'sk-1', skill: 'AI Prompt Engineering', status: 'rising', rationale: 'Demanda explosiva. Las empresas buscan marketers que dominen prompts para contenido y analisis.', priorityScore: 9.5, suggestedAction: 'Tomar proyectos reales de copywriting con IA esta semana.' },
  { id: 'sk-2', skill: 'Marketing Automation con IA', status: 'rising', rationale: 'Make + ChatGPT reemplazan flujos manuales. Skill clave.', priorityScore: 9.0, suggestedAction: 'Armar un flujo automatico de lead nurturing con Make.' },
  { id: 'sk-3', skill: 'Analisis Predictivo de Campanas', status: 'rising', rationale: 'GA4 + modelos de atribucion con IA. Marketers con datos ganan presupuesto.', priorityScore: 8.5, suggestedAction: 'Configurar un modelo de atribucion basico en GA4.' },
  { id: 'sk-4', skill: 'Google Ads (Performance)', status: 'stable', rationale: 'Base solida del marketing digital. Esencial pero no crece.', priorityScore: 7.0, suggestedAction: 'Mantener certificaciones actualizadas.' },
  { id: 'sk-5', skill: 'Email Marketing', status: 'stable', rationale: 'ROI alto y predecible. Funciona.', priorityScore: 6.5, suggestedAction: 'Optimizar secuencias existentes con A/B testing.' },
  { id: 'sk-6', skill: 'Content Strategy', status: 'stable', rationale: 'Pilar del inbound. IA cambia ejecucion, no estrategia.', priorityScore: 7.2, suggestedAction: 'Integrar IA como herramienta, no reemplazo.' },
  { id: 'sk-7', skill: 'SEO Tecnico Manual', status: 'degrading', rationale: 'Ahrefs y Screaming Frog automatizan el 80%.', priorityScore: 4.0, suggestedAction: 'Migrar a herramientas automatizadas.' },
  { id: 'sk-8', skill: 'A/B Testing Manual', status: 'degrading', rationale: 'Optimizely y VWO lo hacen automaticamente.', priorityScore: 3.5, suggestedAction: 'Aprender herramientas de testing automatizado.' },
  { id: 'sk-9', skill: 'Reportes Manuales en Excel', status: 'gone', rationale: 'Dashboards en tiempo real eliminaron esta tarea.', priorityScore: 1.0, suggestedAction: 'Archivar. Usar dashboards automaticos.' },
  { id: 'sk-10', skill: 'Keyword Stuffing', status: 'gone', rationale: 'Google lo penaliza. Obsoleto.', priorityScore: 0, suggestedAction: 'Eliminar de cualquier estrategia.' },
]

export const mockAnalysisService: AIAnalysisService = {
  async analyzeOnboarding(data: OnboardingData): Promise<UserProfile> {
    await delay(600)
    return { id: crypto.randomUUID(), name: 'Usuario', role: data.role, seniority: data.seniority, stack: data.stack, createdAt: new Date().toISOString() }
  },

  async analyzeSkillPortfolio(): Promise<SkillStock[]> {
    await delay(1200)
    return MOCK_SKILL_STOCKS
  },

  async conductOnboardingChat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    onStream: (text: string) => void,
  ): Promise<OnboardingChatResult> {
    await delay(400)
    const userMessages = messages.filter((m) => m.role === 'user')
    const turnIndex = userMessages.length - 1

    if (turnIndex >= 2) {
      const text = 'Excelente! Ya tengo una idea clara de tu perfil. Voy a generar tu diagnostico de skills...'
      await simulateStream(text, onStream)
      return {
        type: 'profile_complete',
        profile: { id: crypto.randomUUID(), name: 'Usuario', role: 'marketer', seniority: 'mid', stack: ['Google Ads', 'Meta Ads', 'ChatGPT / Claude', 'GA4 / Analytics'], goals: ['Automatizar campanas con IA'], painPoints: ['Demasiado tiempo en tareas repetitivas'], summary: 'Marketer mid-level buscando integrar IA.', createdAt: new Date().toISOString() },
        content: text,
      }
    }

    const text = SCRIPTED_RESPONSES[turnIndex] ?? SCRIPTED_RESPONSES[SCRIPTED_RESPONSES.length - 1]
    await simulateStream(text, onStream)
    return { type: 'message', content: text }
  },

  async analyzeContent(): Promise<AnalyzedContent> {
    await delay(1500)
    return {
      title: 'Como usar IA para optimizar campanas de Google Ads',
      summary: 'Articulo que explora el uso de modelos de lenguaje para generar copy de anuncios, optimizar pujas y analizar rendimiento de campanas.',
      mainTopics: ['IA en publicidad', 'Google Ads', 'Automatizacion de campanas'],
      relatedSkills: [
        { skill: 'AI Prompt Engineering', relevance: 'high', statusImpact: 'rising', reason: 'El articulo demuestra que prompting es clave para generar ads efectivos.' },
        { skill: 'Google Ads (Performance)', relevance: 'medium', statusImpact: 'stable', reason: 'Google Ads sigue siendo la plataforma, pero la forma de operar cambia con IA.' },
        { skill: 'A/B Testing Manual', relevance: 'medium', statusImpact: 'degrading', reason: 'El articulo muestra que IA puede reemplazar testing manual.' },
      ],
      actionItems: ['Probar generacion de copy con Claude para proxima campana', 'Experimentar con Smart Bidding avanzado', 'Configurar reportes automaticos con Looker'],
      relevanceScore: 8.5,
      category: 'tutorial',
    }
  },

  async generateProject(): Promise<GeneratedProject> {
    await delay(1500)
    return {
      id: crypto.randomUUID(),
      title: 'Crea tu primer flujo de generacion de ads con IA',
      description: 'Construi un flujo en Make que tome un brief de campana y genere 5 variantes de copy para Google Ads usando Claude.',
      difficulty: 'beginner',
      estimatedTime: '2 horas',
      steps: [
        { step: 1, title: 'Crear cuenta en Make', description: 'Registrate en make.com y crea un escenario nuevo.' },
        { step: 2, title: 'Configurar trigger', description: 'Usa un Google Sheet como input con columnas: producto, audiencia, tono.' },
        { step: 3, title: 'Conectar Claude', description: 'Agrega un modulo HTTP que llame a la API de Anthropic con un prompt de generacion de ads.' },
        { step: 4, title: 'Generar variantes', description: 'El prompt debe pedir 5 variantes de headlines + descriptions.' },
        { step: 5, title: 'Output a Sheet', description: 'Envia los resultados a otra hoja del mismo Google Sheet.' },
      ],
      resources: [
        { title: 'Make.com - Getting Started', url: 'https://www.make.com/en/help/tutorials', type: 'tutorial' },
        { title: 'Anthropic API Docs', url: 'https://docs.anthropic.com', type: 'documentation' },
      ],
      expectedOutcome: 'Un flujo funcional que genera copy de ads automaticamente a partir de un brief.',
      skillTarget: 'AI Prompt Engineering',
      createdAt: new Date().toISOString(),
    }
  },
}
