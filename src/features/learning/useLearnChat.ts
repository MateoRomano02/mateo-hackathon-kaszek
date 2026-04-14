import { useState, useCallback } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useAppStore } from '@/app/providers/store'

export interface LearnMessage {
  id: string
  role: 'user' | 'assistant' | 'system-label'
  content: string
  phase?: 'context' | 'concepts' | 'connection' | 'actions'
}

const getClient = () =>
  new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  })

function buildLearnPrompt(
  resourceTitle: string,
  resourceContent: string,
  userProfile: { role: string; seniority: string; stack: string[]; goals?: string[] },
) {
  return `You are the Signal OS tutor. You teach in a CONCISE and PRACTICAL way.

RESOURCE: ${resourceTitle}
CONTENT: ${resourceContent.slice(0, 2500)}

STUDENT: ${userProfile.role} / ${userProfile.seniority} / Stack: ${userProfile.stack.join(', ')}

FORMAT (follow strictly):

## Why this matters to you
2-3 sentences MAX connecting with their stack. No filler.

---

## Key concepts
List of 2-3 concepts. Each one: **name** — 1 sentence explanation + 1 concrete example for their role. Include relevant links if available in the content.

---

## How this applies to your work
2-3 specific sentences. Mention tools from their stack by name.

---

## Action Items
1. **Title** — Concrete description. Difficulty: easy/medium/advanced. Time: X min.
2. **Title** — Concrete description. Difficulty: easy/medium/advanced. Time: X min.
3. **Title** — Concrete description. Difficulty: easy/medium/advanced. Time: X min.

RULES: English, direct, no filler phrases, use markdown (##, **, ---, lists). Include URLs/links from the original content when useful. MAXIMUM 400 words total.`
}

export function useLearnChat(resourceTitle: string, resourceContent: string) {
  const [messages, setMessages] = useState<LearnMessage[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [isTeaching, setIsTeaching] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const { userProfile, aiMode } = useAppStore()

  const startLesson = useCallback(async () => {
    if (!userProfile || isTeaching) return
    setHasStarted(true)
    setIsTeaching(true)
    setStreamingText('')

    try {
      if (aiMode === 'anthropic') {
        const client = getClient()
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: buildLearnPrompt(resourceTitle, resourceContent, userProfile),
          messages: [{ role: 'user', content: 'Teach me this resource. Start with Phase 1: Context.' }],
        })

        let accumulated = ''
        stream.on('text', (text) => {
          accumulated += text
          setStreamingText(accumulated)
        })

        const final = await stream.finalMessage()
        const blocks = final.content as Anthropic.ContentBlock[]
        const textBlock = blocks.find((b): b is Anthropic.TextBlock => b.type === 'text')
        const fullText = textBlock?.text || accumulated

        setMessages([{ id: crypto.randomUUID(), role: 'assistant', content: fullText }])
      } else {
        // Mock
        await new Promise((r) => setTimeout(r, 1500))
        setMessages([{
          id: crypto.randomUUID(), role: 'assistant',
          content: `**Why this matters to you**\n\nAs a ${userProfile.role} ${userProfile.seniority}, this resource directly touches how you'll work in the coming months. ${resourceTitle} is not just news — it's a shift in how the industry is structured.\n\n---\n\n**Key concepts**\n\n1. **Process automation**: The tools you use manually today are being replaced by automated pipelines. This doesn't eliminate your role, it transforms it.\n\n2. **Data-driven decisions**: Intuition alone is no longer enough. Platforms reward those who understand real-time metrics.\n\n3. **Cross-platform integration**: Tools that don't connect with each other will become obsolete.\n\n---\n\n**How this impacts your work**\n\nIf you currently use ${userProfile.stack[0] || 'manual tools'}, the next iteration of your workflow will likely include an AI component. You don't need to be a developer — you need to understand what to automate and what to keep human.\n\n---\n\n**Action Items**\n\n1. **Audit your current workflow** — Map the 5 tasks that take you the most time this week. Difficulty: easy. Time: 30 min.\n\n2. **Try a simple automation** — Take your most repetitive task and build it in Zapier/Make with a basic trigger. Difficulty: medium. Time: 1 hour.\n\n3. **Analyze a competitor** — Find how a company similar to yours has already implemented AI in their stack. Difficulty: easy. Time: 45 min.`,
        }])
      }
    } catch (err) {
      setMessages([{
        id: crypto.randomUUID(), role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Could not start the lesson.'}`,
      }])
    } finally {
      setStreamingText('')
      setIsTeaching(false)
    }
  }, [resourceTitle, resourceContent, userProfile, aiMode, isTeaching])

  const askQuestion = useCallback(async (question: string) => {
    if (!userProfile || isTeaching) return

    const userMsg: LearnMessage = { id: crypto.randomUUID(), role: 'user', content: question }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setIsTeaching(true)
    setStreamingText('')

    try {
      if (aiMode === 'anthropic') {
        const client = getClient()
        const apiMessages = updated.map((m) => ({
          role: (m.role === 'system-label' ? 'assistant' : m.role) as 'user' | 'assistant',
          content: m.content,
        }))
        if (apiMessages[0].role === 'assistant') {
          apiMessages.unshift({ role: 'user', content: 'Teach me this resource.' })
        }

        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: buildLearnPrompt(resourceTitle, resourceContent, userProfile),
          messages: apiMessages,
        })

        let accumulated = ''
        stream.on('text', (text) => {
          accumulated += text
          setStreamingText(accumulated)
        })

        const final = await stream.finalMessage()
        const blocks = final.content as Anthropic.ContentBlock[]
        const textBlock = blocks.find((b): b is Anthropic.TextBlock => b.type === 'text')

        setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: textBlock?.text || accumulated }])
      } else {
        await new Promise((r) => setTimeout(r, 800))
        setMessages([...updated, {
          id: crypto.randomUUID(), role: 'assistant',
          content: 'Great question. Think about it this way: this concept applies directly to your daily workflow. The key is that you don\'t need to implement everything at once — start with a small case and measure the impact before scaling.',
        }])
      }
    } catch {
      setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: 'Error responding. Please try again.' }])
    } finally {
      setStreamingText('')
      setIsTeaching(false)
    }
  }, [messages, resourceTitle, resourceContent, userProfile, aiMode, isTeaching])

  return { messages, streamingText, isTeaching, hasStarted, startLesson, askQuestion }
}
