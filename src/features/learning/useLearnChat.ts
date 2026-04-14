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
  return `Eres el tutor de Signal OS. Ensenas de forma CONCISA y PRACTICA.

RECURSO: ${resourceTitle}
CONTENIDO: ${resourceContent.slice(0, 2500)}

ALUMNO: ${userProfile.role} / ${userProfile.seniority} / Stack: ${userProfile.stack.join(', ')}

FORMATO (respeta estrictamente):

## Por que te importa
2-3 oraciones MAX conectando con su stack. Sin relleno.

---

## Conceptos clave
Lista de 2-3 conceptos. Cada uno: **nombre** — 1 oracion de explicacion + 1 ejemplo concreto para su rol. Incluye links relevantes si los hay en el contenido.

---

## Como aplica a tu trabajo
2-3 oraciones especificas. Menciona herramientas de su stack por nombre.

---

## Accionables
1. **Titulo** — Descripcion concreta. Dificultad: facil/medio/avanzado. Tiempo: X min.
2. **Titulo** — Descripcion concreta. Dificultad: facil/medio/avanzado. Tiempo: X min.
3. **Titulo** — Descripcion concreta. Dificultad: facil/medio/avanzado. Tiempo: X min.

REGLAS: espanol, directo, sin frases de relleno, usa markdown (##, **, ---, listas). Incluye URLs/links del contenido original cuando sean utiles. MAXIMO 400 palabras en total.`
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
