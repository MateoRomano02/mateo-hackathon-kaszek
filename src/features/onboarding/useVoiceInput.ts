import { useState, useRef, useCallback, useEffect } from 'react'
import { pipeline, env } from '@xenova/transformers'

// Use CDN for ONNX Runtime Web — avoids bundling the heavy WASM files
env.allowLocalModels = false

export type VoiceError = 'not-allowed' | 'audio-capture' | 'transcription' | 'unknown' | null

type WhisperPipeline = Awaited<ReturnType<typeof pipeline>>

// Singleton: load the model once per session
let whisperPipeline: WhisperPipeline | null = null
let isLoadingPipeline = false

async function getWhisperPipeline(
  onProgress?: (pct: number) => void,
): Promise<WhisperPipeline> {
  if (whisperPipeline) return whisperPipeline

  if (isLoadingPipeline) {
    // Wait until the in-flight load finishes
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (whisperPipeline) {
          clearInterval(interval)
          resolve(whisperPipeline)
        }
        if (!isLoadingPipeline) {
          clearInterval(interval)
          reject(new Error('Pipeline load failed'))
        }
      }, 200)
    })
  }

  isLoadingPipeline = true
  try {
    whisperPipeline = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      {
        progress_callback: (info: { progress?: number }) => {
          if (typeof info.progress === 'number') onProgress?.(info.progress)
        },
      },
    )
    return whisperPipeline
  } finally {
    isLoadingPipeline = false
  }
}

// Pick the best supported MIME type for audio recording
function getBestMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

// Convert AudioBuffer → Float32Array (mono, 16 kHz) — what Whisper expects
async function toFloat32Mono16k(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer()
  const ctx = new AudioContext({ sampleRate: 16000 })
  const decoded = await ctx.decodeAudioData(arrayBuffer)
  await ctx.close()
  // Mix down to mono
  const mono = decoded.numberOfChannels === 1
    ? decoded.getChannelData(0)
    : (() => {
        const left = decoded.getChannelData(0)
        const right = decoded.getChannelData(1)
        const mixed = new Float32Array(left.length)
        for (let i = 0; i < left.length; i++) mixed[i] = (left[i] + right[i]) / 2
        return mixed
      })()
  return mono
}

export function useVoiceInput(onFinalTranscript?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [loadingPct, setLoadingPct] = useState<number | null>(null) // null = loaded/idle
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
    // Kick off model download in background so it's warm when user clicks
    getWhisperPipeline((pct) => setLoadingPct(Math.round(pct))).then(() => {
      setLoadingPct(null)
    }).catch(() => {/* silent — will retry on first use */})
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
      stream.getTracks().forEach((t) => t.stop())

      const chunks = chunksRef.current
      if (chunks.length === 0) return

      const effectiveMime = mimeType || 'audio/webm'
      const blob = new Blob(chunks, { type: effectiveMime })

      setIsTranscribing(true)
      try {
        const model = await getWhisperPipeline((pct) => setLoadingPct(Math.round(pct)))
        setLoadingPct(null)

        const audioData = await toFloat32Mono16k(blob)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await (model as any)(audioData, {
          language: 'spanish',
          task: 'transcribe',
        })

        const text: string = (Array.isArray(result) ? result[0]?.text : result?.text)?.trim() ?? ''
        if (text) {
          setTranscript(text)
          onFinalRef.current?.(text)
        }
      } catch {
        setVoiceError('transcription')
      } finally {
        setIsTranscribing(false)
        setLoadingPct(null)
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
    loadingPct,
    transcript,
    isSupported,
    voiceError,
    startListening,
    stopListening,
    clearTranscript,
    clearError,
  }
}
