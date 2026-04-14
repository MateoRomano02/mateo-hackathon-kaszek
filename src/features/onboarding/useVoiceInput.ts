import { useState, useRef, useCallback, useEffect } from 'react'
<<<<<<< HEAD
import Anthropic from '@anthropic-ai/sdk'
=======
import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false
>>>>>>> ccfdd60 (feat)

export type VoiceError = 'not-allowed' | 'audio-capture' | 'transcription' | 'network-fallback' | null

// ─── Web Speech API types ─────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: SpeechRecognitionAlternative
}
interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  start(): void
  stop(): void
  abort(): void
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

// ─── Whisper fallback (MediaRecorder + @xenova/transformers) ──────────────────

<<<<<<< HEAD
const getClient = () =>
  new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  })

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

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
  const loadingPct = null
=======
type WhisperPipeline = Awaited<ReturnType<typeof pipeline>>
let whisperCache: WhisperPipeline | null = null
let whisperLoading = false

async function getWhisper(onProgress?: (pct: number) => void): Promise<WhisperPipeline> {
  if (whisperCache) return whisperCache
  if (whisperLoading) {
    return new Promise((resolve, reject) => {
      const t = setInterval(() => {
        if (whisperCache) { clearInterval(t); resolve(whisperCache) }
        if (!whisperLoading) { clearInterval(t); reject(new Error('load failed')) }
      }, 200)
    })
  }
  whisperLoading = true
  try {
    whisperCache = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      progress_callback: (i: { progress?: number }) => {
        if (typeof i.progress === 'number') onProgress?.(Math.round(i.progress))
      },
    })
    return whisperCache
  } finally {
    whisperLoading = false
  }
}

function getBestMime(): string {
  const c = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
  return c.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

async function toFloat32Mono16k(blob: Blob): Promise<Float32Array> {
  const ab = await blob.arrayBuffer()
  const ctx = new AudioContext({ sampleRate: 16000 })
  const decoded = await ctx.decodeAudioData(ab)
  await ctx.close()
  if (decoded.numberOfChannels === 1) return decoded.getChannelData(0)
  const l = decoded.getChannelData(0), r = decoded.getChannelData(1)
  const m = new Float32Array(l.length)
  for (let i = 0; i < l.length; i++) m[i] = (l[i] + r[i]) / 2
  return m
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceInput(onFinalTranscript?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [loadingPct, setLoadingPct] = useState<number | null>(null)
  const [interimText, setInterimText] = useState('')   // live text while speaking
  const [isSupported, setIsSupported] = useState(false)
  const [voiceError, setVoiceError] = useState<VoiceError>(null)
  const [useWhisperFallback, setUseWhisperFallback] = useState(false)
>>>>>>> ccfdd60 (feat)

  const speechRef = useRef<SpeechRecognitionInstance | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const onFinalRef = useRef(onFinalTranscript)
  const finalAccRef = useRef('')   // accumulated final text from continuous speech

  useEffect(() => { onFinalRef.current = onFinalTranscript }, [onFinalTranscript])

<<<<<<< HEAD
  useEffect(() => { onFinalRef.current = onFinalTranscript }, [onFinalTranscript])

  useEffect(() => {
    setIsSupported(!!navigator.mediaDevices?.getUserMedia && !!window.MediaRecorder)
=======
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!(SR || (navigator.mediaDevices && typeof MediaRecorder !== 'undefined')))
    // Pre-warm Whisper in background so it's ready if needed
    getWhisper((p) => setLoadingPct(p)).then(() => setLoadingPct(null)).catch(() => {})
>>>>>>> ccfdd60 (feat)
  }, [])

  // ── Web Speech API path (live transcription) ────────────────────────────────

  const startSpeechRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return false

    speechRef.current?.abort()
    const rec = new SR()
    rec.lang = 'es'
    rec.interimResults = true
    rec.continuous = true     // keep listening until user stops

    finalAccRef.current = ''
    setInterimText('')

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) {
          finalAccRef.current += r[0].transcript + ' '
        } else {
          interim += r[0].transcript
        }
      }
      // Show live text in the input field
      setInterimText((finalAccRef.current + interim).trim())
    }

    rec.onend = () => {
      setIsListening(false)
      setInterimText('')
      const text = finalAccRef.current.trim()
      if (text) onFinalRef.current?.(text)
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'aborted') return
      setIsListening(false)
      setInterimText('')

      if (e.error === 'network') {
        // Fall back to Whisper silently
        setUseWhisperFallback(true)
        setVoiceError('network-fallback')
      } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setVoiceError('not-allowed')
      } else if (e.error === 'audio-capture') {
        setVoiceError('audio-capture')
      }
    }

    speechRef.current = rec
    try {
      rec.start()
      setIsListening(true)
      return true
    } catch {
      return false
    }
  }, [])

  // ── Whisper fallback path (record → transcribe after stop) ──────────────────

  const startWhisperRecording = useCallback(async () => {
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setVoiceError('not-allowed')
      return
    }

    const mime = getBestMime()
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    chunksRef.current = []

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
<<<<<<< HEAD
      const chunks = chunksRef.current
      if (chunks.length === 0) return

      const effectiveMime = mimeType || 'audio/webm'
      const blob = new Blob(chunks, { type: effectiveMime })

      setIsTranscribing(true)
      try {
        const base64Audio = await blobToBase64(blob)
        const client = getClient()

        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 256,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Transcribi exactamente lo que se dice en este audio. Devolvé solo la transcripcion, sin explicaciones ni comillas.' },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { type: 'audio', source: { type: 'base64', media_type: effectiveMime as 'audio/webm', data: base64Audio } } as any,
            ],
          }],
        })

        const textBlock = response.content.find((b) => b.type === 'text') as Anthropic.TextBlock | undefined
        const text = textBlock?.text?.trim() ?? ''
        if (text) {
          setTranscript(text)
          onFinalRef.current?.(text)
        }
=======
      if (chunksRef.current.length === 0) return

      const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' })
      setIsTranscribing(true)
      try {
        const model = await getWhisper((p) => setLoadingPct(p))
        setLoadingPct(null)
        const audio = await toFloat32Mono16k(blob)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await (model as any)(audio, { language: 'spanish', task: 'transcribe' })
        const text: string = (Array.isArray(result) ? result[0]?.text : result?.text)?.trim() ?? ''
        if (text) onFinalRef.current?.(text)
>>>>>>> ccfdd60 (feat)
      } catch {
        setVoiceError('transcription')
      } finally {
        setIsTranscribing(false)
      }
    }

    recorderRef.current = recorder
    recorder.start()
    setIsListening(true)
  }, [])

  // ── Public API ───────────────────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    setVoiceError(null)
    setInterimText('')

    if (!useWhisperFallback) {
      const ok = startSpeechRecognition()
      if (ok === false) {
        // No Web Speech API available → go straight to Whisper
        setUseWhisperFallback(true)
        await startWhisperRecording()
      }
    } else {
      await startWhisperRecording()
    }
  }, [useWhisperFallback, startSpeechRecognition, startWhisperRecording])

  const stopListening = useCallback(() => {
    // Stop whichever path is active
    if (speechRef.current) {
      speechRef.current.stop()   // triggers onend → sends final text
    }
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop() // triggers onstop → transcribes
    }
    setIsListening(false)
  }, [])

  const clearError = useCallback(() => setVoiceError(null), [])

  return {
    isListening,
    isTranscribing,
    loadingPct,
    interimText,        // live text to show in input while speaking
    isSupported,
    voiceError,
    useWhisperFallback,
    startListening,
    stopListening,
    clearError,
  }
}
