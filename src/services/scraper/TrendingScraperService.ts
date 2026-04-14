import type { UserProfile } from '@/entities/user/types'

export interface TrendingArticle {
  title: string
  url: string
  source: 'hackernews' | 'reddit'
  snippet: string
  publishedAt: string
}

// ── Hacker News via Algolia (CORS-friendly, query-based) ───────────

const HN_ALGOLIA = 'https://hn.algolia.com/api/v1/search_by_date'

interface HNAlgoliaHit {
  title: string
  url: string | null
  story_url?: string | null
  created_at: string
  points: number
  objectID: string
  _highlightResult?: { title?: { value?: string } }
}

async function fetchHackerNews(query: string): Promise<TrendingArticle[]> {
  const res = await fetch(
    `${HN_ALGOLIA}?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`,
  )
  if (!res.ok) throw new Error('HN Algolia request failed')
  const data: { hits: HNAlgoliaHit[] } = await res.json()

  return data.hits
    .filter((h) => h.url || h.story_url)
    .map((h) => ({
      title: h.title,
      url: (h.url || h.story_url)!,
      source: 'hackernews' as const,
      snippet: h.title,
      publishedAt: h.created_at,
    }))
}

// ── Reddit via RSS2JSON (CORS-friendly proxy) ──────────────────────

const RSS2JSON = 'https://api.rss2json.com/v1/api.json'

interface RSS2JSONItem {
  title: string
  link: string
  description: string
  pubDate: string
}

async function fetchReddit(subreddit: string): Promise<TrendingArticle[]> {
  const rssUrl = `https://www.reddit.com/r/${subreddit}/top/.rss`
  const res = await fetch(`${RSS2JSON}?rss_url=${encodeURIComponent(rssUrl)}`)
  if (!res.ok) throw new Error(`Reddit RSS failed for r/${subreddit}`)
  const data: { items: RSS2JSONItem[] } = await res.json()

  return data.items.slice(0, 3).map((item) => ({
    title: item.title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
    url: item.link,
    source: 'reddit' as const,
    snippet: item.description.replace(/<[^>]+>/g, '').slice(0, 200),
    publishedAt: item.pubDate,
  }))
}

// ── Profile-aware trending aggregator ──────────────────────────────

function buildQueries(profile: UserProfile): string[] {
  const queries: string[] = []

  // Query from stack tools
  const stackKeywords = profile.stack
    .map((tool) => tool.split('/')[0].trim().split(' ')[0].toLowerCase())
    .filter((k) => k.length > 2)
  if (stackKeywords.length > 0) {
    queries.push(stackKeywords.slice(0, 3).join(' OR '))
  }

  // Query from role
  const roleQueries: Record<string, string> = {
    marketer: 'AI marketing automation',
    developer: 'AI developer tools coding',
    recruiter: 'AI recruiting HR tech',
    ops: 'AI operations automation workflow',
  }
  queries.push(roleQueries[profile.role] ?? 'AI technology trends')

  // Goals if available
  if (profile.goals?.length) {
    queries.push(profile.goals[0])
  }

  return queries
}

function buildSubreddits(profile: UserProfile): string[] {
  const subs: Record<string, string[]> = {
    marketer: ['marketing', 'digital_marketing'],
    developer: ['programming', 'webdev'],
    recruiter: ['recruiting', 'humanresources'],
    ops: ['devops', 'sysadmin'],
  }
  return subs[profile.role] ?? ['technology']
}

export async function getTrendingForProfile(
  profile: UserProfile,
  onStep?: (step: string) => void,
): Promise<TrendingArticle[]> {
  const articles: TrendingArticle[] = []

  // HN: run 2 queries in parallel
  const queries = buildQueries(profile)
  onStep?.('Buscando en Hacker News...')
  try {
    const hnResults = await Promise.all(queries.slice(0, 2).map(fetchHackerNews))
    articles.push(...hnResults.flat())
  } catch {
    // Silently continue if HN fails
  }

  // Reddit: fetch from 1 relevant subreddit
  const subs = buildSubreddits(profile)
  onStep?.(`Escaneando r/${subs[0]}...`)
  try {
    const redditResults = await fetchReddit(subs[0])
    articles.push(...redditResults)
  } catch {
    // Silently continue if Reddit fails
  }

  // Dedupe by URL
  const seen = new Set<string>()
  const deduped = articles.filter((a) => {
    if (seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })

  // Return top 5, HN first (higher signal)
  return deduped
    .sort((a, b) => {
      if (a.source !== b.source) return a.source === 'hackernews' ? -1 : 1
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
    .slice(0, 5)
}
