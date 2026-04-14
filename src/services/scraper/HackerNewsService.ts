const HN_API = 'https://hacker-news.firebaseio.com/v0'

interface HNStory {
  id: number
  title: string
  url?: string
  score: number
  by: string
  time: number
}

// Keywords that signal AI/marketing/tech relevance
const RELEVANCE_KEYWORDS = [
  'ai', 'artificial intelligence', 'llm', 'gpt', 'claude', 'anthropic',
  'machine learning', 'automation', 'marketing', 'ads', 'seo',
  'analytics', 'data', 'saas', 'startup', 'growth', 'prompt',
  'agent', 'copilot', 'workflow', 'no-code', 'low-code',
]

function isRelevant(title: string, userStack: string[]): boolean {
  const lower = title.toLowerCase()
  const stackLower = userStack.map((s) => s.toLowerCase())
  return (
    RELEVANCE_KEYWORDS.some((kw) => lower.includes(kw)) ||
    stackLower.some((tool) => lower.includes(tool.split(' ')[0].toLowerCase()))
  )
}

export async function fetchTrendingStories(userStack: string[], limit = 3): Promise<{ title: string; url: string }[]> {
  const res = await fetch(`${HN_API}/topstories.json`)
  if (!res.ok) throw new Error('No se pudo conectar a Hacker News')
  const ids: number[] = await res.json()

  // Fetch first 30 stories, filter by relevance, take top N
  const storyPromises = ids.slice(0, 30).map(async (id) => {
    const r = await fetch(`${HN_API}/item/${id}.json`)
    return r.json() as Promise<HNStory>
  })

  const stories = await Promise.all(storyPromises)

  const relevant = stories
    .filter((s) => s.url && isRelevant(s.title, userStack))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  // If not enough relevant stories, fill with top-scored ones that have URLs
  if (relevant.length < limit) {
    const remaining = stories
      .filter((s) => s.url && !relevant.includes(s))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit - relevant.length)
    relevant.push(...remaining)
  }

  return relevant.map((s) => ({ title: s.title, url: s.url! }))
}
