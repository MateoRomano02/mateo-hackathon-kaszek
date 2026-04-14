import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/providers/store'
import { mockAnalysisService } from '@/services/mock/MockAnalysisService'
import { anthropicAnalysisService } from '@/services/ai/AnthropicAnalysisServiceAdapter'
import type { ChatMessage } from '@/entities/user/types'
import { useOnInit } from '@/shared/hooks/useOnInit'

const INITIAL_GREETING =
  'Hi! I\'m your copilot in Signal OS. I\'m going to ask you a few questions to personalize your learning path. Tell me, what area do you work in and what is your experience level?'

function getService(mode: 'mock' | 'anthropic') {
  return mode === 'anthropic' ? anthropicAnalysisService : mockAnalysisService
}

export function useOnboardingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const [isTransitioning, setIsTransitioning] = useState(false)
  const { setUserProfile, setSkillStocks, aiMode } = useAppStore()
  const navigate = useNavigate()
  const isTransitioningRef = useRef(false)

  // Set initial greeting on mount
  useOnInit(() => {
    const greeting: ChatMessage = {
      id: 'initial-greeting',
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: new Date().toISOString(),
    }
    setMessages([greeting])
  })

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isThinking || isTransitioningRef.current) return

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      setIsThinking(true)
      setStreamingText('')

      try {
        const service = getService(aiMode)

        // Build API messages from conversation (including initial greeting)
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

        let accumulated = ''
        const result = await service.conductOnboardingChat(apiMessages, (delta) => {
          accumulated += delta
          setStreamingText(accumulated)
        })

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.content,
          timestamp: new Date().toISOString(),
        }

        setMessages([...updatedMessages, assistantMsg])
        setStreamingText('')
        setIsThinking(false)

        // Profile extracted -- transition to dashboard
        if (result.type === 'profile_complete') {
          isTransitioningRef.current = true
          setIsTransitioning(true)
          setUserProfile(result.profile)

          // Generate skill stocks while showing transition
          try {
            const stocks = await service.analyzeSkillPortfolio(result.profile)
            setSkillStocks(stocks)
          } catch {
            // Non-blocking: dashboard can still re-analyze
          }

          setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
        }
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Something went wrong. Please try again.'}`,
          timestamp: new Date().toISOString(),
        }
        setMessages([...updatedMessages, errorMsg])
        setStreamingText('')
        setIsThinking(false)
      }
    },
    [messages, isThinking, aiMode, setUserProfile, setSkillStocks, navigate],
  )

  return {
    messages,
    streamingText,
    isThinking,
    isTransitioning,
    sendMessage,
  }
}
