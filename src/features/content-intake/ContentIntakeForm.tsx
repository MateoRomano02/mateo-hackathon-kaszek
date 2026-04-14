import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui'
import { useContentIntake } from './useContentIntake'

export function ContentIntakeForm() {
  const {
    url, setUrl, rawText, setRawText,
    mode, setMode,
    isProcessing, pipelineStep, processContent,
  } = useContentIntake()

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('url')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer', mode === 'url' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
          URL
        </button>
        <button type="button" onClick={() => setMode('text')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer', mode === 'text' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}>
          Pegar texto
        </button>
      </div>

      {/* Input */}
      {mode === 'url' ? (
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="https://articulo-sobre-ia-marketing.com" disabled={isProcessing}
          className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50" />
      ) : (
        <textarea value={rawText} onChange={(e) => setRawText(e.target.value)}
          placeholder="Pega aca el contenido que quieras analizar..." disabled={isProcessing} rows={6}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 resize-none" />
      )}

      {/* Submit + pipeline status */}
      <Button onClick={processContent} disabled={isProcessing || (mode === 'url' ? !url.trim() : !rawText.trim())} className="w-full cursor-pointer">
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {pipelineStep ?? 'Procesando...'}
          </span>
        ) : (
          'Analizar con Truth Pipeline'
        )}
      </Button>

      {/* Pipeline info */}
      {!isProcessing && (
        <p className="text-[11px] text-zinc-600 text-center">
          3 pasos: Extraer contenido &rarr; Evaluar credibilidad &rarr; Destilar verdades canonicas
        </p>
      )}
    </div>
  )
}
