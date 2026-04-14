import type { ChatMessage as ChatMessageType } from '@/entities/user/types'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
      <div style={{
        maxWidth: '80%',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 13,
        lineHeight: 1.6,
        background: isUser ? 'var(--accent)' : 'var(--surface2)',
        color: isUser ? '#fff' : 'var(--text)',
        borderBottomRightRadius: isUser ? 4 : 12,
        borderBottomLeftRadius: isUser ? 12 : 4,
      }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
        {isStreaming && (
          <span style={{ display: 'inline-block', width: 6, height: 16, background: 'var(--text3)', marginLeft: 2, borderRadius: 2, animation: 'spin 1s ease-in-out infinite' }} />
        )}
      </div>
    </div>
  )
}
