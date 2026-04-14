import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLearnChat } from './useLearnChat'

interface LearnChatProps {
  resourceTitle: string
  resourceContent: string
  onClose: () => void
}

// Shared markdown renderer — used for both finished messages and live streaming
function MarkdownContent({ text, dim }: { text: string; dim?: boolean }) {
  const baseColor = dim ? 'var(--text2)' : 'var(--text)'
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p style={{ color: baseColor, marginBottom: 8, lineHeight: 1.75 }}>{children}</p>
        ),
        strong: ({ children }) => (
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em style={{ color: baseColor }}>{children}</em>
        ),
        h1: ({ children }) => (
          <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 16, marginBottom: 6 }}>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 14, marginBottom: 6 }}>{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-serif)', marginTop: 12, marginBottom: 4 }}>{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginTop: 10, marginBottom: 4 }}>{children}</h4>
        ),
        hr: () => (
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />
        ),
        ul: ({ children }) => (
          <ul style={{ paddingLeft: 20, marginBottom: 8, color: baseColor }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol style={{ paddingLeft: 20, marginBottom: 8, color: baseColor }}>{children}</ol>
        ),
        li: ({ children }) => (
          <li style={{ marginBottom: 4, lineHeight: 1.7, color: baseColor }}>{children}</li>
        ),
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
        blockquote: ({ children }) => (
          <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 12, margin: '8px 0', color: 'var(--text3)', fontStyle: 'italic' }}>{children}</blockquote>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{children}</a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  )
}

export function LearnChat({ resourceTitle, resourceContent, onClose }: LearnChatProps) {
  const { messages, streamingText, isTeaching, hasStarted, startLesson, askQuestion } = useLearnChat(resourceTitle, resourceContent)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  useEffect(() => {
    if (!hasStarted) startLesson()
  }, [hasStarted, startLesson])

  const handleSend = () => {
    if (!input.trim() || isTeaching) return
    askQuestion(input.trim())
    setInput('')
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '70vh', maxHeight: 600 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <div>
          <div className="card-label">Aprendiendo</div>
          <h3 style={{ fontSize: 16, fontFamily: 'var(--font-serif)', fontWeight: 500 }}>{resourceTitle}</h3>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cerrar</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'user' ? (
              <div style={{
                alignSelf: 'flex-end', maxWidth: '80%', marginLeft: 'auto',
                padding: '10px 14px', borderRadius: 12, fontSize: 13,
                background: 'var(--accent)', color: '#fff',
              }}>
                {msg.content}
              </div>
            ) : (
              <div style={{ fontSize: 13 }}>
                <MarkdownContent text={msg.content} />
              </div>
            )}
          </div>
        ))}

        {/* Live streaming with markdown rendering */}
        {streamingText && (
          <div style={{ fontSize: 13 }}>
            <MarkdownContent text={streamingText} dim />
            {/* Blinking cursor appended after the last character */}
            <span style={{
              display: 'inline-block', width: 6, height: 14,
              background: 'var(--accent)', marginLeft: 2, borderRadius: 1,
              verticalAlign: 'text-bottom',
              animation: 'spin 1s ease-in-out infinite',
            }} />
          </div>
        )}

        {/* Loading */}
        {isTeaching && !streamingText && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
            <span className="analyze-spinner" style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Preparando leccion...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', gap: 8 }}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pregunta algo sobre este recurso..."
          disabled={isTeaching}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!input.trim() || isTeaching}>
          Preguntar
        </button>
      </div>
    </div>
  )
}
