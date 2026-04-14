import { UserProfile } from '@/entities/user/types'
import { ContentItem } from '@/entities/content/types'
import { AnalysisResult } from '@/entities/analysis/types'

export const MOCK_USER: UserProfile = {
  id: 'u1',
  name: 'Valentina Torres',
  role: 'Growth Marketer',
  vertical: 'marketer',
  industry: 'SaaS B2B',
  level: 'senior',
  goal: 'Aumentar conversión del funnel de adquisición',
  mainChannel: 'Email + LinkedIn',
  currentFocus: 'Lead nurturing y automatización',
  businessContext: 'Startup serie A, equipo de 3 personas',
  constraints: 'Presupuesto limitado, foco en canales orgánicos',
  criteria: [
    'Solo me sirve si aplica a B2B o SaaS',
    'Prefiero datos o casos reales, no solo opiniones',
    'Accionable con equipo pequeño (menos de 5 personas)',
    'Canales orgánicos o bajo presupuesto',
  ],
  createdAt: new Date().toISOString(),
}

export const MOCK_CONTENT: ContentItem[] = [
  {
    id: 'c1', type: 'link', status: 'analyzed',
    raw: 'https://ariyh.com/price-anchoring',
    title: 'Price Anchoring: How reference prices increase sales',
    source: 'ARIYH Newsletter',
    addedAt: new Date(Date.now() - 172800000).toISOString(),
    analysis: {
      topics: ['CRO', 'Pricing'], isNoise: false, noiseReason: null,
      keyTakeaway: 'Price anchoring puede incrementar conversión hasta 30% en landing pages',
      relevanceScore: 88,
      criteriaScores: [
        { criterion: 'Solo me sirve si aplica a B2B o SaaS', passed: true,  reason: 'Aplica directamente a pricing en SaaS B2B' },
        { criterion: 'Prefiero datos o casos reales',        passed: true,  reason: 'Cita incremento del 30% con datos de estudio' },
        { criterion: 'Accionable con equipo pequeño',        passed: true,  reason: 'Solo requiere editar la página de precios' },
        { criterion: 'Canales orgánicos o bajo presupuesto', passed: true,  reason: 'No requiere presupuesto adicional' },
      ],
    },
  },
  {
    id: 'c2', type: 'text', status: 'analyzed',
    raw: 'Thread sobre cómo HubSpot creció newsletter de 0 a 400k suscriptores en 18 meses usando content upgrades y segmentación por intención de compra.',
    title: 'HubSpot Newsletter Growth Breakdown',
    source: 'LinkedIn',
    addedAt: new Date(Date.now() - 86400000).toISOString(),
    analysis: {
      topics: ['Email Marketing', 'Growth Hacking'], isNoise: false, noiseReason: null,
      keyTakeaway: 'Content upgrades + segmentación por intención = crecimiento acelerado de lista',
      relevanceScore: 92,
      criteriaScores: [
        { criterion: 'Solo me sirve si aplica a B2B o SaaS', passed: true,  reason: 'HubSpot es referente B2B SaaS, caso 100% aplicable' },
        { criterion: 'Prefiero datos o casos reales',        passed: true,  reason: 'Caso real documentado: 0 a 400k suscriptores en 18 meses' },
        { criterion: 'Accionable con equipo pequeño',        passed: true,  reason: 'Segmentación por intención es ejecutable con equipo chico' },
        { criterion: 'Canales orgánicos o bajo presupuesto', passed: true,  reason: 'Estrategia de email orgánico sin paid' },
      ],
    },
  },
  {
    id: 'c3', type: 'link', status: 'analyzed',
    raw: 'https://linkedin.com/posts/ai-tools-marketers',
    title: 'Top 10 AI tools for marketers 2024',
    source: 'LinkedIn',
    addedAt: new Date(Date.now() - 18000000).toISOString(),
    analysis: {
      topics: ['AI en Marketing'], isNoise: false, noiseReason: null,
      keyTakeaway: 'Claude, Jasper y Perplexity lideran adopción en marketing teams',
      relevanceScore: 74,
      criteriaScores: [
        { criterion: 'Solo me sirve si aplica a B2B o SaaS', passed: true,  reason: 'Tools para marketing teams, aplica a SaaS B2B' },
        { criterion: 'Prefiero datos o casos reales',        passed: false, reason: 'Lista de herramientas sin casos de uso validados con métricas' },
        { criterion: 'Accionable con equipo pequeño',        passed: true,  reason: 'Herramientas SaaS accesibles con plan gratuito o bajo costo' },
        { criterion: 'Canales orgánicos o bajo presupuesto', passed: true,  reason: 'Varias tienen tier gratuito o muy económico' },
      ],
    },
  },
  {
    id: 'c4', type: 'text', status: 'analyzed',
    raw: 'Crypto market analysis Q1 2024. Bitcoin reached 70k. ETH staking yields...',
    title: 'Crypto Market Q1 Report',
    source: 'Medium',
    addedAt: new Date(Date.now() - 7200000).toISOString(),
    analysis: {
      topics: ['Crypto'], isNoise: true,
      noiseReason: 'No relevante para tu objetivo de SaaS B2B marketing',
      keyTakeaway: '', relevanceScore: 5,
      criteriaScores: [
        { criterion: 'Solo me sirve si aplica a B2B o SaaS', passed: false, reason: 'Análisis de mercado crypto, irrelevante para SaaS B2B' },
        { criterion: 'Prefiero datos o casos reales',        passed: true,  reason: 'Tiene datos de mercado financiero' },
        { criterion: 'Accionable con equipo pequeño',        passed: false, reason: 'No hay acción aplicable a tu contexto' },
        { criterion: 'Canales orgánicos o bajo presupuesto', passed: false, reason: 'No aplica al contexto de marketing SaaS' },
      ],
    },
  },
  {
    id: 'c5', type: 'summary', status: 'analyzed',
    raw: 'Estudio Gartner: 67% compradores B2B prefieren investigar solos antes de hablar con ventas.',
    title: 'Gartner B2B Buyer Behavior Report',
    source: 'Gartner',
    addedAt: new Date(Date.now() - 3600000).toISOString(),
    analysis: {
      topics: ['Email Marketing', 'CRO'], isNoise: false, noiseReason: null,
      keyTakeaway: 'Self-serve content es clave en mid-funnel B2B: ROI calculators, casos de uso, comparativas',
      relevanceScore: 95,
      criteriaScores: [
        { criterion: 'Solo me sirve si aplica a B2B o SaaS', passed: true,  reason: 'Reporte Gartner sobre buyer behavior B2B, directamente aplicable' },
        { criterion: 'Prefiero datos o casos reales',        passed: true,  reason: 'Dato primario: 67% de compradores B2B investigan solos' },
        { criterion: 'Accionable con equipo pequeño',        passed: true,  reason: 'Crear self-serve content no requiere equipo grande' },
        { criterion: 'Canales orgánicos o bajo presupuesto', passed: true,  reason: 'Contenido orgánico como palanca principal' },
      ],
    },
  },
]

// ─── Análisis semana 1 (CRO + Email) ─────────────────────────────────────────

export const MOCK_ANALYSIS: AnalysisResult = {
  processedAt: new Date().toISOString(),
  totalContent: 5, noiseCount: 1, signalCount: 4,
  topics: [
    { id: 't1', label: 'Email Marketing & Nurturing', relevanceScore: 95, count: 2, isNoise: false, contentIds: ['c2', 'c5'] },
    { id: 't2', label: 'Conversión & CRO',            relevanceScore: 88, count: 2, isNoise: false, contentIds: ['c1', 'c5'] },
    { id: 't3', label: 'AI en Marketing',             relevanceScore: 74, count: 1, isNoise: false, contentIds: ['c3'] },
    { id: 't4', label: 'Crypto (ruido)',               relevanceScore: 5,  count: 1, isNoise: true,  contentIds: ['c4'] },
  ],
  insights: [
    {
      id: 'i1', priority: 'high', topicIds: ['t1', 't2'],
      title: 'El self-serve content es tu mayor palanca de conversión B2B',
      summary: 'El 67% de tus compradores investigan solos antes de hablar con ventas. Tu contenido mid-funnel necesita ser más denso en valor.',
      why: 'Con equipo chico, el contenido que convierte sin intervención humana es tu mayor multiplicador.',
    },
    {
      id: 'i2', priority: 'high', topicIds: ['t2'],
      title: 'Price anchoring en tus landing pages puede mover la aguja rápido',
      summary: 'Técnica validada: mostrar un precio de referencia incrementa conversión hasta 30%.',
      why: 'Táctica de alto impacto y bajo costo de implementación.',
    },
    {
      id: 'i3', priority: 'medium', topicIds: ['t1'],
      title: 'Segmentá tu lista por intención de compra antes de nurturar',
      summary: 'HubSpot creció 400k suscriptores segmentando por señales de intención.',
      why: 'Relevante directo para tu foco en lead nurturing y automatización.',
    },
  ],
  actions: [
    {
      id: 'a1', type: 'task', priority: 'high', topicId: 't2', estimatedTime: '2 horas',
      title: 'Auditar landing page con price anchoring',
      description: 'Revisar si tu pricing page usa ancla de referencia. Agregar plan "Enterprise" como ancla.',
      content: '1. Abrí tu pricing page\n2. ¿Hay un plan más caro que haga ver al mediano como razonable?\n3. Si no: creá un tier "Enterprise custom" visible\n4. Medí conversión 2 semanas antes vs después\n5. Si convierte +5%: iterá el copy del tier ancla',
    },
    {
      id: 'a2', type: 'template', priority: 'high', topicId: 't1', estimatedTime: '30 min',
      title: 'Email de nurturing para leads en research phase',
      description: 'Template para leads que leyeron tu contenido pero no convirtieron.',
      content: 'Subject: [Nombre], notamos que viste [contenido] — ¿te ayudo?\n\nHola [Nombre],\n\nVi que exploraste [recurso] y quería conectar porque muchos [rol] en [industria] están enfrentando [problema].\n\nNosotros ayudamos a [tipo cliente] a [resultado concreto].\n\n¿Tiene sentido que hablemos 15 min esta semana?\n\n[Tu nombre]',
    },
    {
      id: 'a3', type: 'prompt', priority: 'medium', topicId: 't1', estimatedTime: '15 min',
      title: 'Prompt: generar content upgrades por artículo',
      description: 'Prompt para crear un lead magnet específico para cada artículo de blog.',
      content: 'Actúa como experto en content marketing B2B.\nPara un artículo sobre [TEMA], generá 3 ideas de content upgrade:\n- Descargable en <5 minutos\n- Accionable inmediatamente\n- Específico para [ROL] en [INDUSTRIA]\n- En formato: checklist, template o calculadora\n\nPara cada idea incluí:\n→ Título\n→ Formato\n→ Problema que resuelve\n→ Por qué convertirá',
    },
    {
      id: 'a4', type: 'hypothesis', priority: 'medium', topicId: 't2', estimatedTime: '4 horas',
      title: 'Test: ROI Calculator en mid-funnel',
      description: 'Hipótesis para testear calculadora de ROI como herramienta de conversión.',
      content: 'HIPÓTESIS: Agregar ROI calculator en /features incrementará demo requests en +20%\n\nCÓMO MEDIR:\n• Crear calculadora (Google Sheets embebida ok)\n• Agregar al final de /features\n• Medir clicks en CTA: 2 semanas antes vs después\n\nSI FUNCIONA → invertir en calculadora más sofisticada\nSI NO → probar video testimonial en el mismo lugar',
    },
  ],
  weekPlan: [
    { day: 1, label: 'Lun', focus: 'Auditoría CRO',      tasks: ['Revisar landing con price anchoring', 'Documentar baseline de conversión'] },
    { day: 2, label: 'Mar', focus: 'Email nurturing',     tasks: ['Segmentar lista por intención', 'Draft template de nurturing'] },
    { day: 3, label: 'Mié', focus: 'Content upgrades',    tasks: ['Generar ideas con el prompt', 'Elegir 1 y armarlo'] },
    { day: 4, label: 'Jue', focus: 'Implementación',      tasks: ['Lanzar price anchoring', 'Configurar secuencia de nurturing'] },
    { day: 5, label: 'Vie', focus: 'Hipótesis + review',  tasks: ['Armar ROI calculator', 'Review semanal'] },
    { day: 6, label: 'Sáb', focus: 'Lectura estratégica', tasks: ['2-3 piezas de contenido nuevas'] },
    { day: 7, label: 'Dom', focus: 'Planificación',       tasks: ['Revisar métricas', 'Definir prioridad próxima semana'] },
  ],
  recap: {
    id: 'r1', week: 'Esta semana',
    learned: [
      'Price anchoring puede incrementar conversión hasta 30% sin cambiar el precio real',
      '67% de compradores B2B investigan solos: el contenido que convierte solo es clave',
      'Segmentar por intención es más efectivo que por demográficos',
    ],
    applied: ['Template de email de nurturing creado', 'Hipótesis de ROI calculator documentada'],
    pending: ['Implementar price anchoring en landing', 'Lanzar secuencia de nurturing'],
    toReview: ['Gartner B2B Buyer Behavior (releerlo antes de crear mid-funnel content)'],
    nextSkill: 'Automatización de email con segmentación comportamental',
    contentCount: 5, actionsCompleted: 2,
  },
}

// ─── Análisis semana 2 (Retención + PLG) — variante para demo ────────────────

export const MOCK_ANALYSIS_V2: AnalysisResult = {
  processedAt: new Date().toISOString(),
  totalContent: 5, noiseCount: 1, signalCount: 4,
  topics: [
    { id: 't1', label: 'Retención & LTV',        relevanceScore: 93, count: 2, isNoise: false, contentIds: ['c2', 'c5'] },
    { id: 't2', label: 'Product-Led Growth',      relevanceScore: 86, count: 1, isNoise: false, contentIds: ['c1'] },
    { id: 't3', label: 'SEO Semántico & Intent',  relevanceScore: 71, count: 1, isNoise: false, contentIds: ['c3'] },
    { id: 't4', label: 'Crypto (ruido)',           relevanceScore: 5,  count: 1, isNoise: true,  contentIds: ['c4'] },
  ],
  insights: [
    {
      id: 'i1', priority: 'high', topicIds: ['t1'],
      title: 'Retener un cliente cuesta 5x menos que adquirir uno nuevo',
      summary: 'El churn silencioso en SaaS B2B suele ocurrir en los primeros 90 días. El onboarding es tu mayor oportunidad de retención.',
      why: 'Con presupuesto limitado, mejorar retención tiene mayor ROI que invertir más en adquisición.',
    },
    {
      id: 'i2', priority: 'high', topicIds: ['t2'],
      title: 'El self-serve onboarding puede reducir churn hasta un 40%',
      summary: 'Usuarios que llegan al "aha moment" solos tienen 3x más probabilidad de convertirse en clientes de largo plazo.',
      why: 'Directo a tu foco actual: si reducís churn temprano, el funnel de adquisición rinde más.',
    },
    {
      id: 'i3', priority: 'medium', topicIds: ['t3'],
      title: 'El SEO semántico supera al keyword stuffing en B2B',
      summary: 'Google prioriza responder intenciones, no densidad de palabras clave. Clusters temáticos tienen más impacto que artículos sueltos.',
      why: 'Canal orgánico con alto retorno para equipos pequeños sin presupuesto de ads.',
    },
  ],
  actions: [
    {
      id: 'a1', type: 'task', priority: 'high', topicId: 't1', estimatedTime: '3 horas',
      title: 'Mapear el journey de onboarding actual',
      description: 'Documentar cada paso desde signup hasta primer valor obtenido. Identificar dónde se pierde el 60% de los usuarios.',
      content: '1. Abrí tu analytics (Mixpanel, Amplitude o GA4)\n2. Buscá el funnel: signup → activación → retención 7 días\n3. ¿En qué paso hay mayor drop-off?\n4. Grabá 3 sesiones de usuarios nuevos (Hotjar, FullStory)\n5. Documentá los obstáculos y priorizá el mayor\n6. Define tu "aha moment" si no lo tenés claro',
    },
    {
      id: 'a2', type: 'template', priority: 'high', topicId: 't1', estimatedTime: '45 min',
      title: 'Secuencia de emails de activación (días 1-7)',
      description: 'Serie de 4 emails para guiar al usuario desde signup hasta su primera acción de valor.',
      content: 'DÍA 1 — Bienvenida\nSubject: Bienvenido a [Producto] — tu primer paso\nCuerpo: Hola [Nombre], en los próximos 7 días te voy a mandar 3 tips para que saques el máximo provecho...\n\nDÍA 3 — Primer valor\nSubject: ¿Ya probaste [feature clave]?\nCuerpo: El 80% de nuestros clientes más exitosos comenzaron por...\n\nDÍA 5 — Social proof\nSubject: Cómo [Cliente similar] logró [resultado] en 30 días\n\nDÍA 7 — Check-in\nSubject: ¿Cómo va todo, [Nombre]?\nCuerpo: Notamos que todavía no [acción clave]. ¿Hay algo que te frenó?',
    },
    {
      id: 'a3', type: 'prompt', priority: 'medium', topicId: 't3', estimatedTime: '20 min',
      title: 'Prompt: armar un content cluster semántico',
      description: 'Generá una estrategia de clusters para posicionarte en una categoría B2B.',
      content: 'Actuá como consultor de SEO B2B.\n\nPara una empresa de [CATEGORÍA] que vende a [ICP], creá un content cluster para posicionar la keyword principal "[KEYWORD PRINCIPAL]".\n\nIncluí:\n1. Pillar page: tema y estructura (H1, H2s principales)\n2. 5 cluster pages: temas de soporte con intención específica\n3. Internal linking strategy\n4. CTA recomendado para cada página\n\nPrioridad: páginas con intención de compra (bottom-funnel) primero.',
    },
    {
      id: 'a4', type: 'hypothesis', priority: 'medium', topicId: 't2', estimatedTime: '2 horas',
      title: 'Test: tooltip de ayuda en el primer feature',
      description: 'Hipótesis: agregar un tooltip interactivo en el primer feature reduce churn en día 3.',
      content: 'HIPÓTESIS: Usuarios que ven el tooltip en [feature X] tienen menor churn a 7 días\n\nCÓMO MEDIR:\n• Implementar tooltip con Intercom o Appcues (gratis 14 días)\n• Segmentar: con tooltip vs sin tooltip\n• Medir: % usuarios que completan primera acción\n• Tiempo: 2 semanas\n\nSI FUNCIONA → expandir tooltips a otros features críticos\nSI NO → investigar si el problema es el feature mismo (UX) o la comunicación',
    },
  ],
  weekPlan: [
    { day: 1, label: 'Lun', focus: 'Mapeo de onboarding',    tasks: ['Analizar funnel en analytics', 'Identificar mayor drop-off'] },
    { day: 2, label: 'Mar', focus: 'Email de activación',     tasks: ['Draft secuencia 4 emails', 'Definir "aha moment"'] },
    { day: 3, label: 'Mié', focus: 'SEO cluster',             tasks: ['Generar content cluster con el prompt', 'Priorizar 2 páginas clave'] },
    { day: 4, label: 'Jue', focus: 'Implementación',          tasks: ['Lanzar secuencia de activación', 'Setup tooltip test'] },
    { day: 5, label: 'Vie', focus: 'Review retención',        tasks: ['Revisar métricas día 3', 'Iterar email de bienvenida'] },
    { day: 6, label: 'Sáb', focus: 'Lectura estratégica',     tasks: ['Leer 2 casos de PLG'] },
    { day: 7, label: 'Dom', focus: 'Planificación',           tasks: ['Revisar resultados del test', 'Definir semana siguiente'] },
  ],
  recap: {
    id: 'r2', week: 'Esta semana',
    learned: [
      'Retención en los primeros 90 días determina el LTV del cliente',
      'El "aha moment" temprano es el mejor predictor de activación',
      'Los content clusters semánticos superan a los artículos sueltos en SEO B2B',
    ],
    applied: ['Secuencia de activación de 4 emails redactada', 'Funnel de onboarding mapeado'],
    pending: ['Implementar tooltip en onboarding', 'Publicar primera pillar page del cluster'],
    toReview: ['Casos de PLG de Figma, Slack y Notion para inspiración de onboarding'],
    nextSkill: 'Segmentación comportamental para emails de retención',
    contentCount: 5, actionsCompleted: 2,
  },
}

/** Retorna una variante aleatoria del análisis mock para hacer el demo más dinámico. */
export function getRandomMockAnalysis(): AnalysisResult {
  return Math.random() > 0.5 ? MOCK_ANALYSIS : MOCK_ANALYSIS_V2
}
