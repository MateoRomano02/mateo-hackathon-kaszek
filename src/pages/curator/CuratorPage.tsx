import { useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useAppStore } from '@/app/providers/store'

interface CuratedLink {
  url: string
  verdict: 'signal' | 'noise'
  reason: string
  relevanceScore: number
}

const getClient = () => new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true })

export function CuratorPage() {
  const [linksInput, setLinksInput] = useState('')
  const [results, setResults] = useState<CuratedLink[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { userProfile, aiMode } = useAppStore()

  const curate = async () => {
    if (!linksInput.trim() || !userProfile) return
    const links = linksInput.split('\n').map((l) => l.trim()).filter((l) => l.length > 5)
    if (links.length === 0) return

    setIsProcessing(true)
    setResults([])

    try {
      if (aiMode === 'anthropic') {
        const client = getClient()
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: `Eres el curador de Signal OS. Tu trabajo: filtrar ruido de senales utiles.

Perfil del usuario:
- Rol: ${userProfile.role} / ${userProfile.seniority}
- Stack: ${userProfile.stack.join(', ')}
${userProfile.goals?.length ? `- Objetivos: ${userProfile.goals.join(', ')}` : ''}

Links a evaluar:
${links.map((l, i) => `${i + 1}. ${l}`).join('\n')}

Para CADA link, responde en formato JSON array:
[
  { "url": "...", "verdict": "signal" o "noise", "reason": "1 oracion en espanol", "relevanceScore": 0-10 }
]

Criterio:
- "signal" = el contenido es relevante para el stack y objetivos del usuario
- "noise" = no aporta valor, es hype, es irrelevante para su perfil
- Se honesto. Si un link no tiene relacion con su stack, es noise.
- Solo devuelve el JSON array, nada mas.`,
          }],
        })

        const text = (response.content.find((b) => b.type === 'text') as Anthropic.TextBlock | undefined)?.text ?? '[]'
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed: CuratedLink[] = JSON.parse(jsonMatch[0])
          setResults(parsed)
        }
      } else {
        // Mock
        await new Promise((r) => setTimeout(r, 1200))
        setResults(links.map((url, i) => ({
          url,
          verdict: i < Math.ceil(links.length * 0.4) ? 'signal' : 'noise',
          reason: i < Math.ceil(links.length * 0.4) ? 'Relevante para tu stack de desarrollo con IA.' : 'No aporta valor directo a tus objetivos actuales.',
          relevanceScore: i < Math.ceil(links.length * 0.4) ? 7 + Math.random() * 2 : 2 + Math.random() * 3,
        })))
      }
    } catch {
      setResults([])
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
        <p className="page-subtitle">Pega todos tus links guardados. Claude filtra el ruido y te dice cuales importan para tu stack.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-label">Pega tus links (uno por linea)</div>
        <textarea className="input" value={linksInput} onChange={(e) => setLinksInput(e.target.value)}
          placeholder={'https://articulo-1.com\nhttps://articulo-2.com\nhttps://hilo-de-x.com\nhttps://newsletter.com/edicion-42'}
          rows={6} disabled={isProcessing} style={{ marginBottom: 12 }} />
        <button className="btn btn-primary" onClick={curate} disabled={isProcessing || !linksInput.trim()} style={{ width: '100%' }}>
          {isProcessing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="analyze-spinner" style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} />
              Filtrando ruido...
            </span>
          ) : `Curar ${linksInput.split('\n').filter((l) => l.trim().length > 5).length || 0} links`}
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid-2" style={{ gap: 16 }}>
          {/* Signals */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--high)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Signal ({signals.length})</span>
            </div>
            {signals.map((r, i) => (
              <div key={i} className="card-sm" style={{ marginBottom: 6, borderLeft: '3px solid var(--high)' }}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>{r.url}</a>
                <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{r.reason}</p>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--high)' }}>{r.relevanceScore.toFixed(1)}/10</span>
              </div>
            ))}
            {signals.length === 0 && <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>Ningun link relevante encontrado</p>}
          </div>

          {/* Noise */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--noise)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>Noise ({noise.length})</span>
            </div>
            {noise.map((r, i) => (
              <div key={i} className="card-sm" style={{ marginBottom: 6, opacity: 0.6, borderLeft: '3px solid var(--noise)' }}>
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
