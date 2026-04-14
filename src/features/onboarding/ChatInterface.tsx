import { useState, useRef, useEffect, useCallback } from 'react'
import { useOnboardingChat } from './useOnboardingChat'
import { useVoiceInput } from './useVoiceInput'
import { ChatMessage } from './ChatMessage'
import { useAppStore } from '@/app/providers/store'

const MIC_ERROR_LABELS: Record<string, string> = {
  'not-allowed': 'Permiso denegado — habilita el mic en el candado de la URL.',
  'audio-capture': 'No se detecto microfono.',
  'transcription': 'Error al transcribir. Intenta de nuevo.',
  'unknown': 'No se pudo iniciar el microfono.',
}

export function ChatInterface() {
  const { messages, streamingText, isThinking, isTransitioning, sendMessage } = useOnboardingChat()

  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { aiMode, setAiMode } = useAppStore()

  const handleVoiceEnd = useCallback(
    (text: string) => {
      if (!text.trim() || isThinking) return
      sendMessage(text.trim())
      setInputText('')
    },
    [isThinking, sendMessage],
  )

  const {
    isListening, isTranscribing, loadingPct, transcript, isSupported,
    voiceError, startListening, stopListening, clearTranscript, clearError,
  } = useVoiceInput(handleVoiceEnd)

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

  const handleMicClick = () => {
    clearError()
    if (isListening) {
      stopListening()
    } else {
      setInputText('')
      startListening()
    }
  }

  const isBusy = isThinking || isTranscribing || loadingPct !== null

  // Transition overlay
  if (isTransitioning) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '60px 0' }}>
        <span className="analyze-spinner" style={{ width: 36, height: 36, margin: 0 }} />
        <h3 style={{ fontSize: 16, fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>Preparando tu dashboard...</h3>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>Analizando tu portafolio de skills con Claude</p>
      </div>
    )
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setAiMode(aiMode === 'mock' ? 'anthropic' : 'mock')}>
            {aiMode === 'anthropic' ? 'Claude AI' : 'Demo'}
          </button>
<<<<<<< HEAD
          {voiceError && <span style={{ fontSize: 11, color: '#e53e3e', maxWidth: 280, textAlign: 'right', lineHeight: 1.3 }}>{MIC_ERROR_LABELS[voiceError] ?? MIC_ERROR_LABELS['unknown']}</span>}
          {isTranscribing && !voiceError && (
=======

          {voiceError && (
            <span style={{ fontSize: 11, color: '#e53e3e', maxWidth: 280, textAlign: 'right', lineHeight: 1.3 }}>
              {MIC_ERROR_LABELS[voiceError] ?? MIC_ERROR_LABELS['unknown']}
            </span>
          )}

          {loadingPct !== null && !voiceError && (
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="analyze-spinner" style={{ width: 10, height: 10, margin: 0, borderWidth: 1.5 }} />
              Cargando modelo de voz... {loadingPct}%
            </span>
          )}
          {isTranscribing && loadingPct === null && !voiceError && (
>>>>>>> 8937f6c (feat: update dependencies and enhance voice input functionality)
            <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="analyze-spinner" style={{ width: 10, height: 10, margin: 0, borderWidth: 1.5 }} />
              Transcribiendo...
            </span>
          )}
          {isListening && !voiceError && !isTranscribing && (
            <span style={{ fontSize: 11, color: '#e53e3e', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e53e3e', display: 'inline-block' }} />
              Grabando... (toca para enviar)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isSupported && (
            <button className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'} btn-sm`}
              onClick={handleMicClick} disabled={isBusy} title={isListening ? 'Detener y enviar' : 'Hablar'}>
              {isTranscribing ? (
                <span className="analyze-spinner" style={{ width: 14, height: 14, margin: 0, borderWidth: 2 }} />
              ) : isListening ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              )}
            </button>
          )}
          <input className="input" ref={inputRef} type="text" value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={isListening ? 'Grabando...' : isTranscribing ? 'Transcribiendo...' : 'Escribe tu respuesta...'}
            disabled={isBusy || isListening} style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!inputText.trim() || isBusy || isListening}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
