import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLearnChat } from './useLearnChat'

interface LearnChatProps {
  resourceTitle: string
  resourceContent: string
  onClose: () => void
}

function MarkdownContent({ text, dim }: { text: string; dim?: boolean }) {
  const baseColor = dim ? 'var(--text2)' : 'var(--text)'
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p style={{ color: baseColor, marginBottom: 8, lineHeight: 1.75 }}>{children}</p>,
        strong: ({ children }) => <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{children}</strong>,
        em: ({ children }) => <em style={{ color: baseColor }}>{children}</em>,
        h1: ({ children }) => <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 16, marginBottom: 6 }}>{children}</h1>,
        h2: ({ children }) => <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 14, marginBottom: 6 }}>{children}</h2>,
        h3: ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 12, marginBottom: 4 }}>{children}</h3>,
        hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />,
        ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 8, color: baseColor }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 8, color: baseColor }}>{children}</ol>,
        li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.7, color: baseColor }}>{children}</li>,
        code: ({ children, className }) => {
          const isBlock = !!className
          return isBlock ? (
            <pre style={{ background: 'var(--surface2)', borderRadius: 6, padding: '10px 14px', overflowX: 'auto', marginBottom: 8 }}>
              <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{children}</code>
            </pre>
          ) : (
            <code style={{ background: 'var(--surface2)', borderRadius: 3, padding: '1px 5px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{children}</code>
          )
        },
        blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 12, margin: '8px 0', color: 'var(--text3)', fontStyle: 'italic' }}>{children}</blockquote>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{children}</a>,
      }}
    >
      {text}
    </ReactMarkdown>
  )
}

export function LearnChat({ resourceTitle, resourceContent, onClose }: LearnChatProps) {
  const { messages, streamingText, isTeaching, hasStarted, startLesson, askQuestion } = useLearnChat(resourceTitle, resourceContent)
  const [input, setInput] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!hasStarted) startLesson()
  }, [hasStarted, startLesson])

  const handleSend = () => {
    if (!input.trim() || isTeaching) return
    setChatOpen(true)
    askQuestion(input.trim())
    setInput('')
  }

  const curriculum = messages.find((m) => m.role === 'assistant')
  const chatMessages = messages.slice(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div className="card-label">Recurso</div>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--font-serif)', fontWeight: 500, letterSpacing: '-0.3px' }}>{resourceTitle}</h2>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Volver</button>
      </div>

      {/* Curriculum section */}
      <div className="card" style={{ marginBottom: 20 }}>
        {isTeaching && !curriculum && !streamingText && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40 }}>
            <span className="analyze-spinner" style={{ width: 28, height: 28, margin: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Claude esta preparando tu leccion...</span>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>Analizando recurso y adaptando a tu perfil</span>
          </div>
        )}

        {streamingText && !curriculum && (
          <div>
            <MarkdownContent text={streamingText} dim />
            <span style={{ display: 'inline-block', width: 6, height: 16, background: 'var(--accent)', marginLeft: 2, borderRadius: 2, animation: 'spin 1s ease-in-out infinite' }} />
          </div>
        )}

        {curriculum && <MarkdownContent text={curriculum.content} />}

        <div ref={bottomRef} />
      </div>

      {/* Tutor Agent section */}
      {curriculum && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: chatOpen ? 12 : 0 }}>
            <div className="card-label" style={{ margin: 0 }}>Tutor IA</div>
            {!chatOpen && <span style={{ fontSize: 11, color: 'var(--text3)' }}>Pregunta lo que quieras sobre este recurso</span>}
          </div>

          {chatOpen && chatMessages.length > 0 && (
            <div style={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              {chatMessages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === 'user' ? (
                    <div style={{ maxWidth: '75%', marginLeft: 'auto', padding: '8px 12px', borderRadius: 10, fontSize: 13, background: 'var(--accent)', color: '#fff' }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div style={{ padding: '8px 0' }}><MarkdownContent text={msg.content} /></div>
                  )}
                </div>
              ))}
              {streamingText && curriculum && (
                <div style={{ padding: '8px 0' }}>
                  <MarkdownContent text={streamingText} dim />
                </div>
              )}
              {isTeaching && !streamingText && curriculum && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8 }}>
                  <span className="analyze-spinner" style={{ width: 14, height: 14, margin: 0, borderWidth: 2 }} />
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>Pensando...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="No entendi el punto 2... / Como aplico esto a mi caso?"
              disabled={isTeaching} style={{ flex: 1 }} />
            <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!input.trim() || isTeaching}>
              Preguntar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
