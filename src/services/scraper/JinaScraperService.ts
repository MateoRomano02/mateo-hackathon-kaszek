const JINA_READER_BASE = 'https://r.jina.ai/'

export interface ScrapedContent {
  url: string
  markdown: string
  title: string
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  const targetUrl = JINA_READER_BASE + encodeURIComponent(url)

  const response = await fetch(targetUrl, {
    headers: {
      Accept: 'text/plain',
    },
  })

  if (!response.ok) {
    throw new Error(`No se pudo extraer el contenido de ${url} (status ${response.status})`)
  }

  const markdown = await response.text()

  // Extract title from first markdown heading or first line
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  const title = titleMatch?.[1] ?? url

  // Truncate to ~4000 chars to fit in Claude context without wasting tokens
  const truncated = markdown.length > 4000 ? markdown.slice(0, 4000) + '\n\n[...contenido truncado]' : markdown

  return {
    url,
    markdown: truncated,
    title,
  }
}
