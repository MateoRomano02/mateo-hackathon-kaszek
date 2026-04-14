import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/entities/user/types'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-zinc-800 text-zinc-200 rounded-bl-sm',
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-zinc-400 ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  )
}
