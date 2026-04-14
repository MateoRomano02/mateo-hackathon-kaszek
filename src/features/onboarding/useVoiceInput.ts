import { useState, useRef, useCallback, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'

export type VoiceError = 'not-allowed' | 'audio-capture' | 'transcription' | 'unknown' | null

const getClient = () =>
  new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  })

// Converts an audio Blob to base64 string
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Strip the data:...;base64, prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Pick the best supported MIME type for audio recording
function getBestMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4']
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

export function useVoiceInput(onFinalTranscript?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [voiceError, setVoiceError] = useState<VoiceError>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const onFinalRef = useRef(onFinalTranscript)

  useEffect(() => {
    onFinalRef.current = onFinalTranscript
  }, [onFinalTranscript])

  useEffect(() => {
    setIsSupported(!!navigator.mediaDevices?.getUserMedia && !!window.MediaRecorder)
  }, [])

  const startListening = useCallback(async () => {
    setVoiceError(null)
    setTranscript('')

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setVoiceError('not-allowed')
      return
    }

    const mimeType = getBestMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = async () => {
      // Release mic immediately
      stream.getTracks().forEach((t) => t.stop())

      const chunks = chunksRef.current
      if (chunks.length === 0) return

      const effectiveMime = mimeType || 'audio/webm'
      const blob = new Blob(chunks, { type: effectiveMime })

      // Transcribe via Claude
      setIsTranscribing(true)
      try {
        const base64Audio = await blobToBase64(blob)
        const client = getClient()

        // Claude can process audio via the content block API
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 256,
          messages: [
            {
              role: 'user',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content: [
                {
                  type: 'text',
                  text: 'Transcribí exactamente lo que se dice en este audio. Devolvé solo la transcripción, sin explicaciones ni comillas.',
                },
                {
                  type: 'audio',
                  source: {
                    type: 'base64',
                    media_type: effectiveMime as 'audio/webm',
                    data: base64Audio,
                  },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any,
              ],
            },
          ],
        })

        const textBlock = response.content.find((b) => b.type === 'text') as Anthropic.TextBlock | undefined
        const text = textBlock?.text?.trim() ?? ''
        if (text) {
          setTranscript(text)
          onFinalRef.current?.(text)
        }
      } catch {
        setVoiceError('transcription')
      } finally {
        setIsTranscribing(false)
      }
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsListening(false)
  }, [])

  const clearTranscript = useCallback(() => setTranscript(''), [])
  const clearError = useCallback(() => setVoiceError(null), [])

  return {
    isListening,
    isTranscribing,
    transcript,
    isSupported,
    voiceError,
    startListening,
    stopListening,
    clearTranscript,
    clearError,
  }
}
