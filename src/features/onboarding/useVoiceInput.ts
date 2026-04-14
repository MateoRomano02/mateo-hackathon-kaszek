import { useState, useRef, useCallback, useEffect } from 'react'
import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false

export type VoiceError = 'not-allowed' | 'audio-capture' | 'transcription' | null

// ─── Web Speech API types ─────────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: { length: number; [i: number]: { isFinal: boolean; [i: number]: { transcript: string } } }
}
interface SpeechRecognitionErrorEvent extends Event { readonly error: string }
interface SpeechRec extends EventTarget {
  lang: string; interimResults: boolean; continuous: boolean
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  start(): void; stop(): void; abort(): void
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRec
    webkitSpeechRecognition?: new () => SpeechRec
  }
}

// ─── Whisper (singleton, loaded once) ────────────────────────────────────────
type Pipe = Awaited<ReturnType<typeof pipeline>>
let _whisper: Pipe | null = null
let _loading = false

async function loadWhisper(onPct?: (n: number) => void): Promise<Pipe> {
  if (_whisper) return _whisper
  if (_loading) return new Promise((res, rej) => {
    const t = setInterval(() => {
      if (_whisper) { clearInterval(t); res(_whisper) }
      if (!_loading) { clearInterval(t); rej(new Error('failed')) }
    }, 300)
  })
  _loading = true
  try {
    _whisper = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      progress_callback: (i: { progress?: number }) => {
        if (typeof i.progress === 'number') onPct?.(Math.round(i.progress))
      },
    })
    return _whisper
  } finally { _loading = false }
}

function bestMime() {
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find(
    t => MediaRecorder.isTypeSupported(t)
  ) ?? ''
}

async function blobToFloat32(blob: Blob): Promise<Float32Array> {
  const ctx = new AudioContext({ sampleRate: 16000 })
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer())
  await ctx.close()
  if (decoded.numberOfChannels === 1) return decoded.getChannelData(0)
  const L = decoded.getChannelData(0), R = decoded.getChannelData(1)
  const out = new Float32Array(L.length)
  for (let i = 0; i < L.length; i++) out[i] = (L[i] + R[i]) / 2
  return out
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useVoiceInput(onDone?: (text: string) => void) {
  const [isListening, setIsListening]     = useState(false)
  const [isTranscribing, setTranscribing] = useState(false)
  const [loadingPct, setLoadingPct]       = useState<number | null>(null)
  const [liveText, setLiveText]           = useState('')   // text shown while speaking
  const [isSupported, setIsSupported]     = useState(false)
  const [error, setError]                 = useState<VoiceError>(null)
  const [whisperMode, setWhisperMode]     = useState(false)

  const speechRef   = useRef<SpeechRec | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const finalRef    = useRef('')       // accumulated final text from speech API
  const onDoneRef   = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!(SR || navigator.mediaDevices))
    // Pre-warm Whisper quietly
    loadWhisper(p => setLoadingPct(p)).then(() => setLoadingPct(null)).catch(() => {})
  }, [])

  // ── Option A: Web Speech API (live text) ──────────────────────────────────
  const tryWebSpeech = useCallback((): boolean => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return false
    speechRef.current?.abort()
    const rec = new SR()
    rec.lang = 'es'; rec.interimResults = true; rec.continuous = true
    finalRef.current = ''
    setLiveText('')

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalRef.current += r[0].transcript + ' '
        else interim += r[0].transcript
      }
      setLiveText((finalRef.current + interim).trim())
    }
    rec.onend = () => {
      setIsListening(false)
      setLiveText('')
      const t = finalRef.current.trim()
      if (t) onDoneRef.current?.(t)
    }
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'aborted') return
      setIsListening(false); setLiveText('')
      if (e.error === 'network') { setWhisperMode(true); startWhisper() }
      else if (e.error === 'not-allowed') setError('not-allowed')
      else if (e.error === 'audio-capture') setError('audio-capture')
    }
    speechRef.current = rec
    try { rec.start(); setIsListening(true); return true }
    catch { return false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Option B: MediaRecorder + Whisper (record-then-transcribe) ────────────
  const startWhisper = useCallback(async () => {
    let stream: MediaStream
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) }
    catch { setError('not-allowed'); return }

    const mime = bestMime()
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    chunksRef.current = []
    rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      setLiveText('')
      if (!chunksRef.current.length) return
      setTranscribing(true)
      try {
        const model = await loadWhisper(p => setLoadingPct(p))
        setLoadingPct(null)
        const audio = await blobToFloat32(new Blob(chunksRef.current, { type: mime || 'audio/webm' }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await (model as any)(audio, { language: 'spanish', task: 'transcribe' })
        const text: string = (Array.isArray(result) ? result[0]?.text : result?.text)?.trim() ?? ''
        if (text) onDoneRef.current?.(text)
      } catch { setError('transcription') }
      finally { setTranscribing(false); setLoadingPct(null) }
    }
    recorderRef.current = rec
    rec.start()
    setIsListening(true)
  }, [])

  // ── Public ─────────────────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    setError(null); setLiveText('')
    if (whisperMode) { await startWhisper(); return }
    const ok = tryWebSpeech()
    if (!ok) { setWhisperMode(true); await startWhisper() }
  }, [whisperMode, tryWebSpeech, startWhisper])

  const stopListening = useCallback(() => {
    speechRef.current?.stop()
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    setIsListening(false)
  }, [])

  return {
    isListening, isTranscribing, loadingPct,
    liveText, isSupported, error, whisperMode,
    startListening, stopListening,
    clearError: () => setError(null),
  }
}
