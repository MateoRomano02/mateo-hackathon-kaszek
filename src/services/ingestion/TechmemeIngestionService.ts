import { ContentItem } from '@/entities/content/types'
import { SourceValidator } from '@/services/source-validation/SourceValidator'

const RSS2JSON_URL = 'https://api.rss2json.com/v1/api.json'
const TECHMEME_FEED = 'https://www.techmeme.com/feed.xml'

// Map common domains to readable source names
const DOMAIN_NAMES: Record<string, string> = {
  'techcrunch.com': 'TechCrunch',
  'venturebeat.com': 'VentureBeat',
  'bloomberg.com': 'Bloomberg',
  'reuters.com': 'Reuters',
  'wsj.com': 'Wall Street Journal',
  'nytimes.com': 'New York Times',
  'theverge.com': 'The Verge',
  'wired.com': 'Wired',
  'arstechnica.com': 'Ars Technica',
  'fortune.com': 'Fortune',
  '9to5google.com': '9to5Google',
  '9to5mac.com': '9to5Mac',
  'engadget.com': 'Engadget',
  'zdnet.com': 'ZDNet',
  'cnet.com': 'CNET',
  'coindesk.com': 'CoinDesk',
  'siliconangle.com': 'SiliconANGLE',
  'axios.com': 'Axios',
  'protocol.com': 'Protocol',
  'cnbc.com': 'CNBC',
  'businessinsider.com': 'Business Insider',
  'ft.com': 'Financial Times',
  'economist.com': 'The Economist',
  'thenextweb.com': 'The Next Web',
  'techradar.com': 'TechRadar',
  'gizmodo.com': 'Gizmodo',
  'mashable.com': 'Mashable',
  'medium.com': 'Medium',
  'substack.com': 'Substack',
  'github.com': 'GitHub',
  'openai.com': 'OpenAI',
  'anthropic.com': 'Anthropic',
  'google.com': 'Google',
  'microsoft.com': 'Microsoft',
  'amazon.com': 'Amazon',
  'meta.com': 'Meta',
  'apple.com': 'Apple',
}

function resolveSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    // Check exact match
    if (DOMAIN_NAMES[hostname]) return DOMAIN_NAMES[hostname]
    // Check partial match (e.g. sub.techcrunch.com)
    for (const [domain, name] of Object.entries(DOMAIN_NAMES)) {
      if (hostname.endsWith(domain)) return name
    }
    // Fallback: capitalize the domain root
    const parts = hostname.split('.')
    const root = parts.length >= 2 ? parts[parts.length - 2] : parts[0]
    return root.charAt(0).toUpperCase() + root.slice(1)
  } catch {
    return 'Fuente desconocida'
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}

interface RssItem {
  title: string
  link: string
  pubDate: string
  description: string
  author?: string
  thumbnail?: string
}

interface Rss2JsonResponse {
  status: string
  items: RssItem[]
}

export class TechmemeIngestionService {
  static async fetchLatest(limit = 15): Promise<ContentItem[]> {
    const url = `${RSS2JSON_URL}?rss_url=${encodeURIComponent(TECHMEME_FEED)}&count=${limit}`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`)
    }

    const data: Rss2JsonResponse = await res.json()

    if (data.status !== 'ok') {
      throw new Error('rss2json returned non-ok status')
    }

    const now = Date.now()

    return data.items.map((item, i): ContentItem => {
      const source = resolveSource(item.link)
      const sourceQuality = SourceValidator.evaluate(source)
      const description = item.description ? stripHtml(item.description) : ''

      return {
        id: `tm-${now}-${i}`,
        type: 'link',
        status: 'pending',
        raw: item.link,
        title: stripHtml(item.title),
        source,
        addedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        analysis: description
          ? {
              topics: [],
              isNoise: false,
              noiseReason: null,
              keyTakeaway: description.slice(0, 200),
              relevanceScore: sourceQuality.overall,
              sourceQuality,
            }
          : null,
      }
    })
  }
}
