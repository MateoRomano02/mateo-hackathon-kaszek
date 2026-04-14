import { useState, useRef, useEffect } from 'react'
import { useOnboardingChat } from './useOnboardingChat'
import { useVoiceInput } from './useVoiceInput'
import { ChatMessage } from './ChatMessage'
import { useAppStore } from '@/app/providers/store'

export function ChatInterface() {
  const { messages, streamingText, isThinking, sendMessage } = useOnboardingChat()
  const { isListening, transcript, isSupported, startListening, stopListening, clearTranscript } = useVoiceInput()

  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { aiMode, setAiMode } = useAppStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  useEffect(() => {
    if (transcript) setInputText(transcript)
  }, [transcript])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || isThinking) return
    sendMessage(text)
    setInputText('')
    clearTranscript()
    inputRef.current?.focus()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 12 }}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {streamingText && (
          <ChatMessage message={{ id: 'streaming', role: 'assistant', content: streamingText, timestamp: '' }} isStreaming />
        )}
        {isThinking && !streamingText && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--surface2)', borderRadius: 12, width: 'fit-content' }}>
            <span className="analyze-spinner" style={{ width: 14, height: 14, margin: 0, borderWidth: 2 }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Pensando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setAiMode(aiMode === 'mock' ? 'anthropic' : 'mock')}>
            {aiMode === 'anthropic' ? 'Claude AI activo' : 'Modo demo'}
          </button>
          {isListening && <span style={{ fontSize: 11, color: 'var(--noise)', fontFamily: 'var(--font-mono)' }}>Escuchando...</span>}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isSupported && (
            <button className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'} btn-sm`}
              onClick={isListening ? stopListening : startListening} title={isListening ? 'Detener' : 'Hablar'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          )}
          <input className="input" ref={inputRef} type="text" value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={isListening ? 'Escuchando...' : 'Escribe tu respuesta...'}
            disabled={isThinking} style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!inputText.trim() || isThinking}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
