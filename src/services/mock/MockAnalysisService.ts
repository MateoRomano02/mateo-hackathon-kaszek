import type { AIAnalysisService } from '@/services/ai/AIAnalysisService'
import type { OnboardingData, UserProfile, SkillStock, OnboardingChatResult } from '@/entities/user/types'
import type { SourceMetadata, CanonicalInsight, GeneratedProject } from '@/entities/content/types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const simulateStream = async (text: string, onStream: (t: string) => void) => {
  for (const char of text) { await delay(18); onStream(char) }
}

const SCRIPTED_RESPONSES = [
  'Que bueno que te sumas! Y que herramientas usas en tu dia a dia para trabajar?',
  'Muy buen stack. Ahora contame, que te gustaria poder hacer con IA que hoy no podes?',
  'Entiendo perfecto. Voy a armar tu diagnostico personalizado de skills. Dame un momento...',
]

const MOCK_SKILL_STOCKS: SkillStock[] = [
  { id: 'sk-1', skill: 'AI Prompt Engineering', status: 'rising', rationale: 'Demanda explosiva para contenido y analisis.', priorityScore: 9.5, suggestedAction: 'Tomar proyectos reales de copywriting con IA.' },
  { id: 'sk-2', skill: 'Marketing Automation con IA', status: 'rising', rationale: 'Make + ChatGPT reemplazan flujos manuales.', priorityScore: 9.0, suggestedAction: 'Armar un flujo automatico de lead nurturing.' },
  { id: 'sk-3', skill: 'Analisis Predictivo', status: 'rising', rationale: 'GA4 + modelos de atribucion con IA.', priorityScore: 8.5, suggestedAction: 'Configurar un modelo de atribucion en GA4.' },
  { id: 'sk-4', skill: 'Google Ads (Performance)', status: 'stable', rationale: 'Base solida. Esencial pero no crece.', priorityScore: 7.0, suggestedAction: 'Mantener certificaciones actualizadas.' },
  { id: 'sk-5', skill: 'Email Marketing', status: 'stable', rationale: 'ROI alto y predecible.', priorityScore: 6.5, suggestedAction: 'Optimizar secuencias con A/B testing.' },
  { id: 'sk-6', skill: 'Content Strategy', status: 'stable', rationale: 'Pilar del inbound. IA cambia ejecucion, no estrategia.', priorityScore: 7.2, suggestedAction: 'Integrar IA como herramienta.' },
  { id: 'sk-7', skill: 'SEO Tecnico Manual', status: 'degrading', rationale: 'Ahrefs y Screaming Frog automatizan el 80%.', priorityScore: 4.0, suggestedAction: 'Migrar a herramientas automatizadas.' },
  { id: 'sk-8', skill: 'A/B Testing Manual', status: 'degrading', rationale: 'Optimizely y VWO lo automatizan.', priorityScore: 3.5, suggestedAction: 'Aprender testing automatizado.' },
  { id: 'sk-9', skill: 'Reportes Manuales en Excel', status: 'gone', rationale: 'Dashboards en tiempo real los reemplazaron.', priorityScore: 1.0, suggestedAction: 'Archivar. Usar dashboards.' },
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
    const userMsgs = messages.filter((m) => m.role === 'user')
    const turn = userMsgs.length - 1
    if (turn >= 2) {
      const text = 'Excelente! Ya tengo tu perfil. Generando diagnostico...'
      await simulateStream(text, onStream)
      return { type: 'profile_complete', profile: { id: crypto.randomUUID(), name: 'Usuario', role: 'marketer', seniority: 'mid', stack: ['Google Ads', 'Meta Ads', 'ChatGPT', 'GA4'], goals: ['Automatizar campanas'], painPoints: ['Tareas repetitivas'], summary: 'Marketer mid-level buscando integrar IA.', createdAt: new Date().toISOString() }, content: text }
    }
    const text = SCRIPTED_RESPONSES[turn] ?? SCRIPTED_RESPONSES[SCRIPTED_RESPONSES.length - 1]
    await simulateStream(text, onStream)
    return { type: 'message', content: text }
  },

  async evaluateSource(): Promise<SourceMetadata> {
    await delay(800)
    return {
      author: 'Marketing AI Institute',
      domainAuthority: 'industry_blog',
      freshnessDate: '2026-03-15',
      sourceType: 'secondary',
      credibilityScore: 7.5,
      credibilityReason: 'Blog especializado con track record en cobertura de IA para marketing. Fuente secundaria que referencia datos de plataformas oficiales.',
    }
  },

  async extractCanonicalInsights(): Promise<{ insights: CanonicalInsight[]; overallRelevance: number }> {
    await delay(1200)
    return {
      overallRelevance: 8.5,
      insights: [
        {
          id: crypto.randomUUID(),
          title: 'Advantage+ de Meta reemplaza la segmentacion manual',
          insight: 'Meta ha migrado la mayoria de sus campanas a Advantage+, un sistema de IA que automatiza audiencias, creativos y pujas. La segmentacion manual pierde efectividad frente al algoritmo.',
          confidenceLevel: 'high',
          confidenceScore: 9.0,
          validationReason: 'Respaldado por anuncios oficiales de Meta y datos de rendimiento publicados.',
          evidence: [
            { exactQuote: 'Advantage+ campaigns now account for over 60% of ad spend on Meta platforms', inferenceFlag: false },
            { exactQuote: 'Manual audience targeting showed 23% lower ROAS compared to AI-optimized campaigns in Q4 2025', inferenceFlag: false },
          ],
          relatedSkills: [
            { skill: 'Marketing Automation con IA', statusImpact: 'rising', reason: 'Advantage+ es un caso de uso directo de automatizacion con IA en ads.' },
            { skill: 'Meta Ads Manual Targeting', statusImpact: 'degrading', reason: 'La segmentacion manual pierde efectividad vs. el algoritmo de Meta.' },
          ],
          contradictions: [],
          category: 'news',
        },
        {
          id: crypto.randomUUID(),
          title: 'El prompt engineering para ads genera ROI medible',
          insight: 'Equipos que usan prompts estructurados para generar variantes de copy publicitario reducen el tiempo de produccion creativa en un 70% y mejoran CTR un 15% en promedio.',
          confidenceLevel: 'medium',
          confidenceScore: 7.0,
          validationReason: 'Datos de case studies, no de estudios controlados. Muestra de empresas limitada.',
          evidence: [
            { exactQuote: 'Teams using structured prompts for ad copy generation reduced creative production time by 70%', inferenceFlag: false },
            { exactQuote: 'The resulting AI-generated variants showed an average 15% improvement in CTR', inferenceFlag: false },
          ],
          relatedSkills: [
            { skill: 'AI Prompt Engineering', statusImpact: 'rising', reason: 'Evidencia directa de que prompting genera resultados medibles en marketing.' },
          ],
          contradictions: [
            { description: 'Algunos creativos argumentan que el copy generado por IA carece de "voz de marca" autentica.', resolution: 'El articulo sugiere usar IA para variantes, no para reemplazar la estrategia creativa.' },
          ],
          category: 'case_study',
        },
      ],
    }
  },

  async generateProject(): Promise<GeneratedProject> {
    await delay(1500)
    return {
      id: crypto.randomUUID(), title: 'Crea tu primer flujo de ads con IA', description: 'Construi un flujo en Make que genere variantes de copy con Claude.', difficulty: 'beginner', estimatedTime: '2 horas',
      steps: [
        { step: 1, title: 'Crear cuenta en Make', description: 'Registrate en make.com y crea un escenario nuevo.' },
        { step: 2, title: 'Configurar trigger', description: 'Usa Google Sheet como input: producto, audiencia, tono.' },
        { step: 3, title: 'Conectar Claude', description: 'Modulo HTTP que llama a la API de Anthropic.' },
        { step: 4, title: 'Generar variantes', description: 'Prompt para 5 variantes de headlines + descriptions.' },
        { step: 5, title: 'Output a Sheet', description: 'Resultados a otra hoja del Google Sheet.' },
      ],
      resources: [
        { title: 'Make.com Tutorials', url: 'https://www.make.com/en/help/tutorials', type: 'tutorial' },
        { title: 'Anthropic API Docs', url: 'https://docs.anthropic.com', type: 'documentation' },
      ],
      expectedOutcome: 'Flujo funcional que genera copy de ads automaticamente.', skillTarget: 'AI Prompt Engineering', createdAt: new Date().toISOString(),
    }
  },
}
