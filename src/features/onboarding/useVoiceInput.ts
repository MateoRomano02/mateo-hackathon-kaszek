import { useState, useRef, useCallback, useEffect } from 'react'
import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false

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

// ─── Whisper fallback ─────────────────────────────────────────────────────────

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
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
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
  const [interimText, setInterimText] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [voiceError, setVoiceError] = useState<VoiceError>(null)
  const [useWhisperFallback, setUseWhisperFallback] = useState(false)

  const speechRef = useRef<SpeechRecognitionInstance | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const onFinalRef = useRef(onFinalTranscript)
  const finalAccRef = useRef('')

  useEffect(() => { onFinalRef.current = onFinalTranscript }, [onFinalTranscript])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!(SR || (navigator.mediaDevices && typeof MediaRecorder !== 'undefined')))
    // Pre-warm Whisper so it's ready if needed
    getWhisper((p) => setLoadingPct(p)).then(() => setLoadingPct(null)).catch(() => {})
  }, [])

  // ── Web Speech API (live transcription) ──────────────────────────────────────

  const startSpeechRecognition = useCallback((): boolean => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return false

    speechRef.current?.abort()
    const rec = new SR()
    rec.lang = 'es'
    rec.interimResults = true
    rec.continuous = true

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

  // ── Whisper fallback (record → transcribe after stop) ─────────────────────────

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
      } catch {
        setVoiceError('transcription')
      } finally {
        setIsTranscribing(false)
        setLoadingPct(null)
      }
    }

    recorderRef.current = recorder
    recorder.start()
    setIsListening(true)
  }, [])

  // ── Public API ────────────────────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    setVoiceError(null)
    setInterimText('')

    if (!useWhisperFallback) {
      const ok = startSpeechRecognition()
      if (ok === false) {
        setUseWhisperFallback(true)
        await startWhisperRecording()
      }
    } else {
      await startWhisperRecording()
    }
  }, [useWhisperFallback, startSpeechRecognition, startWhisperRecording])

  const stopListening = useCallback(() => {
    speechRef.current?.stop()
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    setIsListening(false)
  }, [])

  const clearError = useCallback(() => setVoiceError(null), [])

  return {
    isListening,
    isTranscribing,
    loadingPct,
    interimText,
    isSupported,
    voiceError,
    useWhisperFallback,
    startListening,
    stopListening,
    clearError,
  }
}
