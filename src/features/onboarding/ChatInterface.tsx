import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useOnboardingChat } from './useOnboardingChat'
import { useVoiceInput } from './useVoiceInput'
import { ChatMessage } from './ChatMessage'
import { Button } from '@/shared/ui'
import { useAppStore } from '@/app/providers/store'

export function ChatInterface() {
  const { messages, streamingText, isThinking, sendMessage } = useOnboardingChat()
  const { isListening, transcript, isSupported, startListening, stopListening, clearTranscript } =
    useVoiceInput()

  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { aiMode, setAiMode } = useAppStore()

  // Auto-scroll on new messages or streaming text
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Pipe voice transcript into input field
  useEffect(() => {
    if (transcript) {
      setInputText(transcript)
    }
  }, [transcript])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || isThinking) return
    sendMessage(text)
    setInputText('')
    clearTranscript()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMicToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="flex flex-col h-[520px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-4 scrollbar-thin">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Streaming response */}
        {streamingText && (
          <ChatMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingText,
              timestamp: '',
            }}
            isStreaming
          />
        )}

        {/* Thinking indicator */}
        {isThinking && !streamingText && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-800 pt-4 space-y-3">
        {/* AI mode toggle */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setAiMode(aiMode === 'mock' ? 'anthropic' : 'mock')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer',
              aiMode === 'anthropic'
                ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/50'
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-400',
            )}
          >
            {aiMode === 'anthropic' ? 'Claude AI activo' : 'Modo demo'}
          </button>
          {isListening && (
            <span className="text-xs text-red-400 animate-pulse">Escuchando...</span>
          )}
        </div>

        {/* Input + buttons */}
        <div className="flex items-center gap-2">
          {/* Mic button */}
          {isSupported && (
            <button
              type="button"
              onClick={handleMicToggle}
              className={cn(
                'shrink-0 h-10 w-10 rounded-lg flex items-center justify-center transition-all cursor-pointer',
                isListening
                  ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50 animate-pulse'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300',
              )}
              title={isListening ? 'Detener' : 'Hablar'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          )}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Escuchando...' : 'Escribe tu respuesta...'}
            disabled={isThinking}
            className={cn(
              'flex-1 h-10 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 text-sm text-zinc-100',
              'placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          />

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            size="sm"
            className="shrink-0 cursor-pointer h-10 px-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m22 2-7 20-4-9-9-4 20-7Z" />
              <path d="M22 2 11 13" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
