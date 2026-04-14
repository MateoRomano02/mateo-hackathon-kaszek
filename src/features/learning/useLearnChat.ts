import { useState, useCallback } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useAppStore } from '@/app/providers/store'

export interface LearnMessage {
  id: string
  role: 'user' | 'assistant' | 'system-label'
  content: string
  phase?: 'context' | 'concepts' | 'connection' | 'actions'
}

const getClient = () =>
  new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  })

function buildLearnPrompt(
  resourceTitle: string,
  resourceContent: string,
  userProfile: { role: string; seniority: string; stack: string[]; goals?: string[] },
) {
  return `Eres el tutor de Signal OS. Tu mision es ENSENAR, no resumir.

RECURSO QUE ESTAS ENSENANDO:
Titulo: ${resourceTitle}
Contenido: ${resourceContent.slice(0, 3000)}

PERFIL DEL ALUMNO:
- Rol: ${userProfile.role} / ${userProfile.seniority}
- Stack: ${userProfile.stack.join(', ')}
${userProfile.goals?.length ? `- Objetivos: ${userProfile.goals.join(', ')}` : ''}

METODOLOGIA (sigue este orden estricto):

FASE 1 - CONTEXTO: Explica POR QUE este recurso importa para alguien con su perfil. No repitas el titulo. Conecta con tendencias reales. Usa analogias. 2-3 parrafos max.

FASE 2 - CONCEPTOS CLAVE: Desglosa los 3-4 conceptos mas importantes del recurso. Cada uno con: nombre del concepto en bold, explicacion simple, y un ejemplo concreto aplicado a su rol. No seas generico.

FASE 3 - CONEXION CON TU TRABAJO: Explicale EXACTAMENTE como esto impacta su trabajo diario. Se especifico: "Si hoy usas Google Ads, esto significa que..." No uses frases vacias.

FASE 4 - ACCION: Propone 3 action items concretos y diferentes. Cada uno con: titulo, descripcion de 1 linea, dificultad (facil/medio/avanzado), y tiempo estimado. Deben ser cosas que pueda hacer HOY, no "investigar mas".

REGLAS:
- Responde en espanol.
- Se directo. Nada de "es importante destacar que..." ni "cabe mencionar que...".
- Usa bold (**texto**) para conceptos clave.
- Separa cada fase con una linea --- .
- Si el usuario interrumpe con una pregunta, respondela y luego retoma donde estabas.
- Maximo 4-5 oraciones por parrafo.`
}

export function useLearnChat(resourceTitle: string, resourceContent: string) {
  const [messages, setMessages] = useState<LearnMessage[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [isTeaching, setIsTeaching] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const { userProfile, aiMode } = useAppStore()

  const startLesson = useCallback(async () => {
    if (!userProfile || isTeaching) return
    setHasStarted(true)
    setIsTeaching(true)
    setStreamingText('')

    try {
      if (aiMode === 'anthropic') {
        const client = getClient()
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: buildLearnPrompt(resourceTitle, resourceContent, userProfile),
          messages: [{ role: 'user', content: 'Ensenname este recurso. Empieza con la Fase 1: Contexto.' }],
        })

        let accumulated = ''
        stream.on('text', (text) => {
          accumulated += text
          setStreamingText(accumulated)
        })

        const final = await stream.finalMessage()
        const blocks = final.content as Anthropic.ContentBlock[]
        const textBlock = blocks.find((b): b is Anthropic.TextBlock => b.type === 'text')
        const fullText = textBlock?.text || accumulated

        setMessages([{ id: crypto.randomUUID(), role: 'assistant', content: fullText }])
      } else {
        // Mock
        await new Promise((r) => setTimeout(r, 1500))
        setMessages([{
          id: crypto.randomUUID(), role: 'assistant',
          content: `**Por que te importa esto**\n\nComo ${userProfile.role} ${userProfile.seniority}, este recurso toca directamente como vas a trabajar en los proximos meses. ${resourceTitle} no es solo una noticia — es un cambio en como se estructura la industria.\n\n---\n\n**Conceptos clave**\n\n1. **Automatizacion de procesos**: Las herramientas que hoy usas manualmente estan siendo reemplazadas por pipelines automaticos. Esto no elimina tu rol, lo transforma.\n\n2. **Decision basada en datos**: Ya no alcanza con intuicion. Las plataformas premian a quienes entienden metricas en tiempo real.\n\n3. **Integracion cross-plataforma**: Las herramientas que no se conectan entre si van a quedar obsoletas.\n\n---\n\n**Como impacta tu trabajo**\n\nSi hoy usas ${userProfile.stack[0] || 'herramientas manuales'}, esto significa que la proxima iteracion de tu workflow probablemente incluya un componente de IA. No necesitas ser developer — necesitas entender que automatizar y que mantener humano.\n\n---\n\n**Action Items**\n\n1. **Audita tu flujo actual** — Mapea las 5 tareas que mas tiempo te toman esta semana. Dificultad: facil. Tiempo: 30 min.\n\n2. **Prueba una automatizacion simple** — Toma la tarea mas repetitiva y armala en Zapier/Make con un trigger basico. Dificultad: medio. Tiempo: 1 hora.\n\n3. **Analiza un competidor** — Busca como una empresa similar a la tuya ya implemento IA en su stack. Dificultad: facil. Tiempo: 45 min.`,
        }])
      }
    } catch (err) {
      setMessages([{
        id: crypto.randomUUID(), role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'No se pudo iniciar la leccion.'}`,
      }])
    } finally {
      setStreamingText('')
      setIsTeaching(false)
    }
  }, [resourceTitle, resourceContent, userProfile, aiMode, isTeaching])

  const askQuestion = useCallback(async (question: string) => {
    if (!userProfile || isTeaching) return

    const userMsg: LearnMessage = { id: crypto.randomUUID(), role: 'user', content: question }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setIsTeaching(true)
    setStreamingText('')

    try {
      if (aiMode === 'anthropic') {
        const client = getClient()
        const apiMessages = updated.map((m) => ({
          role: (m.role === 'system-label' ? 'assistant' : m.role) as 'user' | 'assistant',
          content: m.content,
        }))
        if (apiMessages[0].role === 'assistant') {
          apiMessages.unshift({ role: 'user', content: 'Ensenname este recurso.' })
        }

        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: buildLearnPrompt(resourceTitle, resourceContent, userProfile),
          messages: apiMessages,
        })

        let accumulated = ''
        stream.on('text', (text) => {
          accumulated += text
          setStreamingText(accumulated)
        })

        const final = await stream.finalMessage()
        const blocks = final.content as Anthropic.ContentBlock[]
        const textBlock = blocks.find((b): b is Anthropic.TextBlock => b.type === 'text')

        setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: textBlock?.text || accumulated }])
      } else {
        await new Promise((r) => setTimeout(r, 800))
        setMessages([...updated, {
          id: crypto.randomUUID(), role: 'assistant',
          content: 'Buena pregunta. Pensalo asi: este concepto aplica directamente a tu flujo diario. La clave es que no necesitas implementar todo de golpe — empeza con un caso pequeño y medí el impacto antes de escalar.',
        }])
      }
    } catch {
      setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: 'Error al responder. Intenta de nuevo.' }])
    } finally {
      setStreamingText('')
      setIsTeaching(false)
    }
  }, [messages, resourceTitle, resourceContent, userProfile, aiMode, isTeaching])

  return { messages, streamingText, isTeaching, hasStarted, startLesson, askQuestion }
}
