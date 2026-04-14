import { useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { useAppStore } from '@/app/providers/store'

const CuratedLinkSchema = z.object({
  links: z.array(z.object({
    url: z.string(),
    verdict: z.enum(['signal', 'noise']),
    reason: z.string(),
    relevance_score: z.number(),
  })),
})

const CURATE_TOOL = {
  name: 'curate_links' as const,
  description: 'Evalua una lista de links y clasifica cada uno como signal o noise segun el perfil del usuario.',
  input_schema: {
    type: 'object' as const,
    properties: {
      links: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            verdict: { type: 'string', enum: ['signal', 'noise'] },
            reason: { type: 'string', description: '1 oracion en espanol explicando por que' },
            relevance_score: { type: 'number', description: '0-10' },
          },
          required: ['url', 'verdict', 'reason', 'relevance_score'],
        },
      },
    },
    required: ['links'],
  },
} as const

const getClient = () => new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true })

export function CuratorPage() {
  const [linksInput, setLinksInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { userProfile, aiMode, curatorResults, setCuratorResults } = useAppStore()
  const results = curatorResults

  const curate = async () => {
    if (!linksInput.trim() || !userProfile) return
    const links = linksInput.split('\n').map((l) => l.trim()).filter((l) => l.length > 5)
    if (links.length === 0) return

    setIsProcessing(true)
    setCuratorResults([])
    setError(null)

    try {
      if (aiMode === 'anthropic') {
        const client = getClient()
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: [CURATE_TOOL as any],
          tool_choice: { type: 'tool', name: 'curate_links' },
          messages: [{
            role: 'user',
            content: `Perfil: ${userProfile.role} / ${userProfile.seniority} / Stack: ${userProfile.stack.join(', ')}
${userProfile.goals?.length ? `Objetivos: ${userProfile.goals.join(', ')}` : ''}

Evalua estos links. "signal" = relevante para su stack. "noise" = no aporta valor.

${links.map((l, i) => `${i + 1}. ${l}`).join('\n')}`,
          }],
        })

        const toolBlock = response.content.find(
          (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
        )
        if (!toolBlock) throw new Error('Claude no devolvio resultados')

        const parsed = CuratedLinkSchema.parse(toolBlock.input)
        setCuratorResults(parsed.links.map((l) => ({
          url: l.url, verdict: l.verdict, reason: l.reason, relevanceScore: l.relevance_score,
        })))
      } else {
        await new Promise((r) => setTimeout(r, 1200))
        setCuratorResults(links.map((url, i) => ({
          url,
          verdict: i < Math.ceil(links.length * 0.4) ? 'signal' as const : 'noise' as const,
          reason: i < Math.ceil(links.length * 0.4) ? 'Relevante para tu stack de desarrollo con IA.' : 'No aporta valor directo a tus objetivos actuales.',
          relevanceScore: i < Math.ceil(links.length * 0.4) ? 7 + Math.random() * 2 : 2 + Math.random() * 3,
        })))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al curar links')
    } finally {
      setIsProcessing(false)
    }
  }

  const signals = results.filter((r) => r.verdict === 'signal').sort((a, b) => b.relevanceScore - a.relevanceScore)
  const noise = results.filter((r) => r.verdict === 'noise')

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Curador</h1>
        <p className="page-subtitle">Pega todos tus links. Claude filtra el ruido y te dice cuales importan.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-label">Links (uno por linea)</div>
        <textarea className="input" value={linksInput} onChange={(e) => setLinksInput(e.target.value)}
          placeholder={'https://articulo-1.com\nhttps://articulo-2.com\nhttps://newsletter.com/edicion'}
          rows={5} disabled={isProcessing} style={{ marginBottom: 12 }} />
        <button className="btn btn-primary" onClick={curate} disabled={isProcessing || !linksInput.trim()} style={{ width: '100%' }}>
          {isProcessing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span className="analyze-spinner" style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} />
              Filtrando {linksInput.split('\n').filter((l) => l.trim().length > 5).length} links...
            </span>
          ) : `Curar ${linksInput.split('\n').filter((l) => l.trim().length > 5).length || 0} links`}
        </button>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(185,28,28,.3)', background: 'rgba(185,28,28,.05)', marginBottom: 16 }}>
          <p style={{ color: 'var(--noise)', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid-2" style={{ gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--high)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Signal ({signals.length})</span>
            </div>
            {signals.map((r, i) => (
              <div key={i} className="card-sm fade-up" style={{ marginBottom: 6, borderLeft: '3px solid var(--high)', animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>{r.url}</a>
                <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{r.reason}</p>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--high)' }}>{r.relevanceScore.toFixed(1)}/10</span>
              </div>
            ))}
            {signals.length === 0 && <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>Ningun link relevante</p>}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--noise)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Noise ({noise.length})</span>
            </div>
            {noise.map((r, i) => (
              <div key={i} className="card-sm fade-up" style={{ marginBottom: 6, opacity: 0, animationDelay: `${(signals.length + i) * 0.05}s`, borderLeft: '3px solid var(--noise)' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', wordBreak: 'break-all' }}>{r.url}</span>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
