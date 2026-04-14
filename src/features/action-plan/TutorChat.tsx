import { useState, useRef, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useAppStore } from '@/app/providers/store'
import type { GeneratedProject } from '@/entities/content/types'

interface TutorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const getClient = () =>
  new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  })

function buildSystemPrompt(project: GeneratedProject, userProfile: { role: string; seniority: string; stack: string[] }) {
  return `Eres el Tutor IA de Signal OS. Estas guiando al usuario paso a paso en este proyecto practico.

PROYECTO: ${project.title}
DESCRIPCION: ${project.description}
SKILL TARGET: ${project.skillTarget}
DIFICULTAD: ${project.difficulty}
TIEMPO ESTIMADO: ${project.estimatedTime}

PASOS DEL PROYECTO:
${project.steps.map((s) => `${s.step}. ${s.title}: ${s.description}`).join('\n')}

RECURSOS:
${project.resources.map((r) => `- ${r.title}: ${r.url}`).join('\n')}

RESULTADO ESPERADO: ${project.expectedOutcome}

PERFIL DEL USUARIO:
- Rol: ${userProfile.role}
- Nivel: ${userProfile.seniority}
- Stack: ${userProfile.stack.join(', ')}

REGLAS:
- Responde en espanol, breve y concreto.
- Si el usuario se trabo en un paso, dale instrucciones especificas para desbloquearse.
- Si pide ayuda general, guialo al siguiente paso logico.
- Podes sugerir alternativas si algo no funciona.
- Maximo 3-4 oraciones por respuesta.`
}

interface TutorChatProps {
  project: GeneratedProject
}

export function TutorChat({ project }: TutorChatProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    { id: 'welcome', role: 'assistant', content: `Estoy aca para ayudarte con "${project.title}". Preguntame cualquier cosa sobre los pasos o si te trabas en algo.` },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { userProfile, aiMode } = useAppStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const sendMessage = async () => {
    if (!input.trim() || isThinking || !userProfile) return

    const userMsg: TutorMessage = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setIsThinking(true)
    setStreamingText('')

    try {
      if (aiMode === 'anthropic') {
        const client = getClient()
        const apiMessages = updated.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

        // Ensure starts with user
        if (apiMessages[0].role === 'assistant') {
          apiMessages.unshift({ role: 'user', content: '[Inicio del tutor]' })
        }

        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: buildSystemPrompt(project, userProfile),
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
        const response = textBlock?.text || accumulated

        setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: response }])
      } else {
        // Mock
        await new Promise((r) => setTimeout(r, 800))
        setMessages([...updated, {
          id: crypto.randomUUID(), role: 'assistant',
          content: 'Buena pregunta! Para ese paso, te recomiendo empezar revisando la documentacion del recurso que te compartimos. Si necesitas mas detalle, contame exactamente donde te trabaste.',
        }])
      }
    } catch {
      setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: 'Perdon, hubo un error. Intenta de nuevo.' }])
    } finally {
      setIsThinking(false)
      setStreamingText('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 300 }}>
      <div className="card-label">Tutor IA</div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, maxHeight: 280 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%', padding: '8px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
            background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
            color: msg.role === 'user' ? '#fff' : 'var(--text)',
          }}>
            {msg.content}
          </div>
        ))}
        {streamingText && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '8px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5, background: 'var(--surface2)', color: 'var(--text)' }}>
            {streamingText}
          </div>
        )}
        {isThinking && !streamingText && (
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px' }}>
            <span className="analyze-spinner" style={{ width: 12, height: 12, margin: 0, borderWidth: 2 }} />
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Pensando...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Me trabe en el paso 2..." disabled={isThinking}
          style={{ flex: 1, fontSize: 12, padding: '8px 12px' }} />
        <button className="btn btn-primary btn-sm" onClick={sendMessage} disabled={!input.trim() || isThinking}>
          Enviar
        </button>
      </div>
    </div>
  )
}
