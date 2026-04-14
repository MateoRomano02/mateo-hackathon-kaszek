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
  return `You are the AI Tutor of Signal OS. You are guiding the user step by step through this hands-on project.

PROJECT: ${project.title}
DESCRIPTION: ${project.description}
SKILL TARGET: ${project.skillTarget}
DIFFICULTY: ${project.difficulty}
ESTIMATED TIME: ${project.estimatedTime}

PROJECT STEPS:
${project.steps.map((s) => `${s.step}. ${s.title}: ${s.description}`).join('\n')}

RESOURCES:
${project.resources.map((r) => `- ${r.title}: ${r.url}`).join('\n')}

EXPECTED OUTCOME: ${project.expectedOutcome}

USER PROFILE:
- Role: ${userProfile.role}
- Level: ${userProfile.seniority}
- Stack: ${userProfile.stack.join(', ')}

RULES:
- Respond in English, brief and concrete.
- If the user is stuck on a step, give specific instructions to unblock them.
- If they ask for general help, guide them to the next logical step.
- You can suggest alternatives if something isn't working.
- Maximum 3-4 sentences per response.`
}

interface TutorChatProps {
  project: GeneratedProject
}

export function TutorChat({ project }: TutorChatProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    { id: 'welcome', role: 'assistant', content: `I'm here to help you with "${project.title}". Ask me anything about the steps or if you get stuck.` },
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
          apiMessages.unshift({ role: 'user', content: '[Tutor session start]' })
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
          content: 'Great question! For that step, I recommend starting by reviewing the resource documentation we shared. If you need more detail, tell me exactly where you got stuck.',
        }])
      }
    } catch {
      setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, there was an error. Please try again.' }])
    } finally {
      setIsThinking(false)
      setStreamingText('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 300 }}>
      <div className="card-label">AI Tutor</div>

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
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="I'm stuck on step 2..." disabled={isThinking}
          style={{ flex: 1, fontSize: 12, padding: '8px 12px' }} />
        <button className="btn btn-primary btn-sm" onClick={sendMessage} disabled={!input.trim() || isThinking}>
          Send
        </button>
      </div>
    </div>
  )
}
