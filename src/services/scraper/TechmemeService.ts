const JINA_BASE = 'https://r.jina.ai/'

export interface TechmemeTrend {
  title: string
  url: string
  source: string
  description: string
}

export async function fetchTechmemeTrends(limit = 8): Promise<TechmemeTrend[]> {
  const response = await fetch(JINA_BASE + encodeURIComponent('https://www.techmeme.com/'), {
    headers: { Accept: 'text/plain' },
  })

  if (!response.ok) throw new Error('No se pudo acceder a Techmeme')

  const markdown = await response.text()

  // Extract headlines: pattern is **[Title](URL)** — Description
  const trends: TechmemeTrend[] = []
  const headlineRegex = /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*[—–-]\s*(.+?)(?=\n|More:|$)/g

  let match
  while ((match = headlineRegex.exec(markdown)) !== null && trends.length < limit) {
    const [, title, url, description] = match

    // Extract source from URL domain
    let source = 'Unknown'
    try {
      source = new URL(url).hostname.replace('www.', '').split('.')[0]
      source = source.charAt(0).toUpperCase() + source.slice(1)
    } catch { /* ignore */ }

    trends.push({
      title: title.trim(),
      url: url.trim(),
      source,
      description: description.trim().slice(0, 200),
    })
  }

  return trends
}
