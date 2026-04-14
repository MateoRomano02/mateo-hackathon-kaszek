import { useState, useRef, useEffect } from 'react'
import { useLearnChat } from './useLearnChat'

interface LearnChatProps {
  resourceTitle: string
  resourceContent: string
  onClose: () => void
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
              <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text)' }}>
                {/* Render markdown-like content with phases */}
                {msg.content.split('\n').map((line, i) => {
                  if (line.trim() === '---') return <hr key={i} className="divider" />
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={i} style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginTop: 8, fontFamily: 'var(--font-serif)' }}>{line.replace(/\*\*/g, '')}</h4>
                  }
                  if (line.match(/^\d+\.\s\*\*/)) {
                    const parts = line.match(/^(\d+\.)\s\*\*(.+?)\*\*(.*)/)
                    if (parts) {
                      return (
                        <div key={i} style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 4 }}>
                          <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{parts[1]}</span>
                          <div><strong style={{ color: 'var(--text)' }}>{parts[2]}</strong><span style={{ color: 'var(--text2)' }}>{parts[3]}</span></div>
                        </div>
                      )
                    }
                  }
                  if (line.trim() === '') return <br key={i} />
                  return <p key={i} style={{ color: 'var(--text2)', marginBottom: 2 }}>{line}</p>
                })}
              </div>
            )}
          </div>
        ))}

        {/* Streaming */}
        {streamingText && (
          <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text2)' }}>
            {streamingText}
            <span style={{ display: 'inline-block', width: 6, height: 14, background: 'var(--accent)', marginLeft: 2, borderRadius: 1, animation: 'spin 1s ease-in-out infinite' }} />
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
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pregunta algo sobre este recurso..."
          disabled={isTeaching} style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!input.trim() || isTeaching}>
          Preguntar
        </button>
      </div>
    </div>
  )
}
