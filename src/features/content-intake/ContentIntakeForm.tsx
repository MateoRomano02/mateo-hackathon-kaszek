import { useContentIntake } from './useContentIntake'

export function ContentIntakeForm() {
  const { url, setUrl, rawText, setRawText, mode, setMode, isProcessing, pipelineStep, processContent } = useContentIntake()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className={`btn ${mode === 'url' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setMode('url')}>URL</button>
        <button className={`btn ${mode === 'text' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setMode('text')}>Paste text</button>
      </div>

      {mode === 'url' ? (
        <input className="input" type="url" value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="https://article-about-ai-marketing.com" disabled={isProcessing} />
      ) : (
        <textarea className="input" value={rawText} onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste the content you want to analyze here..." disabled={isProcessing} rows={5} />
      )}

      <button className="btn btn-primary" onClick={processContent}
        disabled={isProcessing || (mode === 'url' ? !url.trim() : !rawText.trim())} style={{ width: '100%' }}>
        {isProcessing ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="analyze-spinner" style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} />
            {pipelineStep ?? 'Processing...'}
          </span>
        ) : 'Analyze with Truth Pipeline'}
      </button>

      {!isProcessing && (
        <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
          3 steps: Extract content → Evaluate credibility → Distill canonical truths
        </p>
      )}
    </div>
  )
}
