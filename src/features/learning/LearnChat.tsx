import { useState, useRef, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLearnChat } from './useLearnChat'
import { useAppStore } from '@/app/providers/store'

interface LearnChatProps {
  resourceTitle: string
  resourceContent: string
  onClose: () => void
}

function Md({ text, dim }: { text: string; dim?: boolean }) {
  const c = dim ? 'var(--text2)' : 'var(--text)'
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      p: ({ children }) => <p style={{ color: c, marginBottom: 8, lineHeight: 1.75 }}>{children}</p>,
      strong: ({ children }) => <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{children}</strong>,
      h1: ({ children }) => <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 16, marginBottom: 6 }}>{children}</h1>,
      h2: ({ children }) => <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 14, marginBottom: 6 }}>{children}</h2>,
      h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 12, marginBottom: 4 }}>{children}</h3>,
      hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />,
      ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 8, color: c }}>{children}</ul>,
      ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 8, color: c }}>{children}</ol>,
      li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.7, color: c }}>{children}</li>,
      code: ({ children, className }) => className
        ? <pre style={{ background: 'var(--surface2)', borderRadius: 6, padding: '10px 14px', overflowX: 'auto', marginBottom: 8 }}><code style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{children}</code></pre>
        : <code style={{ background: 'var(--surface2)', borderRadius: 3, padding: '1px 5px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{children}</code>,
      blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 12, margin: '8px 0', color: 'var(--text3)', fontStyle: 'italic' }}>{children}</blockquote>,
      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{children}</a>,
    }}>{text}</ReactMarkdown>
  )
}

interface ActionItem { id: number; title: string; description: string; difficulty: string; time: string }

function parseActions(content: string): { curriculumText: string; actions: ActionItem[] } {
  const sections = content.split(/\n---\n/)
  if (sections.length < 2) return { curriculumText: content, actions: [] }
  const last = sections[sections.length - 1]
  if (!/action|accion|accionable/i.test(last.slice(0, 100))) return { curriculumText: content, actions: [] }

  const actions: ActionItem[] = []
  for (const line of last.split('\n')) {
    const m = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)/)
    if (m) {
      const diff = m[3].match(/[Dd](?:ificultad|ifficulty):\s*([\wáéíóú ]+)/i)?.[1]?.trim() ?? ''
      const time = m[3].match(/[Tt](?:iempo|ime):\s*([\w\d áéíóú.]+)/i)?.[1]?.trim() ?? ''
      const desc = m[3].replace(/[Dd](?:ificultad|ifficulty):\s*[\wáéíóú ]+\.?/i, '').replace(/[Tt](?:iempo|ime):\s*[\w\d áéíóú.]+\.?/i, '').trim()
      actions.push({ id: parseInt(m[1]), title: m[2].trim(), description: desc, difficulty: diff, time })
    }
  }
  return { curriculumText: sections.slice(0, -1).join('\n---\n'), actions }
}

const DIFF: Record<string, { bg: string; color: string; label: string }> = {
  easy: { bg: 'rgba(21,128,61,.08)', color: 'var(--high)', label: 'Easy' },
  medium: { bg: 'rgba(180,83,9,.08)', color: 'var(--mid)', label: 'Medium' },
  advanced: { bg: 'rgba(185,28,28,.08)', color: 'var(--noise)', label: 'Advanced' },
  facil: { bg: 'rgba(21,128,61,.08)', color: 'var(--high)', label: 'Easy' },
  medio: { bg: 'rgba(180,83,9,.08)', color: 'var(--mid)', label: 'Medium' },
  avanzado: { bg: 'rgba(185,28,28,.08)', color: 'var(--noise)', label: 'Advanced' },
}

export function LearnChat({ resourceTitle, resourceContent, onClose }: LearnChatProps) {
  const { messages, streamingText, isTeaching, hasStarted, startLesson, askQuestion } = useLearnChat(resourceTitle, resourceContent)
  const [input, setInput] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const { projectProgress, toggleStepComplete, saveCourse } = useAppStore()
  const progressKey = `learn:${resourceTitle.slice(0, 40)}`
  const completedSteps = projectProgress[progressKey] ?? []

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingText])
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (!hasStarted) { startLesson(); saveCourse(resourceTitle, resourceContent) } }, [hasStarted, startLesson, saveCourse, resourceTitle, resourceContent])

  const handleSend = () => { if (!input.trim() || isTeaching) return; setChatOpen(true); askQuestion(input.trim()); setInput('') }
  const curriculum = messages.find((m) => m.role === 'assistant')
  const chatMessages = messages.slice(1)
  const { curriculumText, actions } = useMemo(() => curriculum ? parseActions(curriculum.content) : { curriculumText: '', actions: [] }, [curriculum])
  const pct = actions.length > 0 ? Math.round((completedSteps.length / actions.length) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div className="card-label">Resource</div>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--font-serif)', fontWeight: 500 }}>{resourceTitle}</h2>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Back</button>
      </div>

      {/* Curriculum */}
      <div className="card" style={{ marginBottom: 16 }}>
        {isTeaching && !curriculum && !streamingText && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40 }}>
            <span className="analyze-spinner" style={{ width: 28, height: 28, margin: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Claude is preparing your lesson...</span>
          </div>
        )}
        {streamingText && !curriculum && (
          <div><Md text={streamingText} dim /><span style={{ display: 'inline-block', width: 6, height: 16, background: 'var(--accent)', marginLeft: 2, borderRadius: 2, animation: 'spin 1s ease-in-out infinite' }} /></div>
        )}
        {curriculum && <Md text={curriculumText || curriculum.content} />}
        <div ref={bottomRef} />
      </div>

      {/* Action steps */}
      {actions.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-label" style={{ margin: 0 }}>Action Items</div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: pct === 100 ? 'var(--high)' : 'var(--text3)' }}>
              {completedSteps.length}/{actions.length}{pct === 100 ? ' — Completed!' : ''}
            </span>
          </div>
          <div className="progress-container" style={{ marginBottom: 14 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--high)' : undefined }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.map((a) => {
              const done = completedSteps.includes(a.id)
              const d = DIFF[a.difficulty.toLowerCase()] ?? DIFF.medio
              return (
                <div key={a.id} onClick={() => toggleStepComplete(progressKey, a.id)} style={{
                  display: 'flex', gap: 12, padding: '12px 14px', cursor: 'pointer',
                  background: done ? 'rgba(21,128,61,.04)' : 'var(--surface2)',
                  border: `1px solid ${done ? 'rgba(21,128,61,.2)' : 'var(--border)'}`, borderRadius: 10, transition: 'all 0.15s',
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, border: `2px solid ${done ? 'var(--high)' : 'var(--border2)'}`, background: done ? 'var(--high)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                    {done && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: done ? 'var(--high)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none' }}>{a.title}</span>
                      {a.difficulty && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: d.bg, color: d.color, fontFamily: 'var(--font-mono)' }}>{d.label}</span>}
                      {a.time && <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{a.time}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{a.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tutor */}
      {curriculum && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: chatOpen ? 12 : 0 }}>
            <div className="card-label" style={{ margin: 0 }}>AI Tutor</div>
            {!chatOpen && <span style={{ fontSize: 11, color: 'var(--text3)' }}>Ask anything about this resource</span>}
          </div>
          {chatOpen && chatMessages.length > 0 && (
            <div style={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              {chatMessages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === 'user'
                    ? <div style={{ maxWidth: '75%', marginLeft: 'auto', padding: '8px 12px', borderRadius: 10, fontSize: 13, background: 'var(--accent)', color: '#fff' }}>{msg.content}</div>
                    : <div style={{ padding: '8px 0' }}><Md text={msg.content} /></div>}
                </div>
              ))}
              {streamingText && curriculum && <div style={{ padding: '8px 0' }}><Md text={streamingText} dim /></div>}
              {isTeaching && !streamingText && curriculum && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8 }}>
                  <span className="analyze-spinner" style={{ width: 14, height: 14, margin: 0, borderWidth: 2 }} />
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>Thinking...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="I didn't understand point 2... / How do I apply this?" disabled={isTeaching} style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!input.trim() || isTeaching}>Ask</button>
          </div>
        </div>
      )}
    </div>
  )
}
