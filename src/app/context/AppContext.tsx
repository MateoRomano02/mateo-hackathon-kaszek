import { createContext, useContext, useReducer, ReactNode } from 'react'
import { UserProfile } from '@/entities/user/types'
import { ContentItem } from '@/entities/content/types'
import { AnalysisResult } from '@/entities/analysis/types'
import { aiService } from '@/services/ai'
import { StorageService } from '@/services/storage/StorageService'
import { TechmemeIngestionService } from '@/services/ingestion/TechmemeIngestionService'
import { getErrorMessage } from '@/shared/utils/errors'

// ─── State ────────────────────────────────────────────────────────────────────

interface AppState {
  user: UserProfile | null
  content: ContentItem[]
  analysis: AnalysisResult | null
  isAnalyzing: boolean
  analyzeStep: string
  analyzeProgress: number
  analysisError: string | null
  completedActions: string[]
  isLoadingFeed: boolean
  feedError: string | null
}

const initialState: AppState = {
  user: null,
  content: [],
  analysis: null,
  isAnalyzing: false,
  analyzeStep: '',
  analyzeProgress: 0,
  analysisError: null,
  completedActions: [],
  isLoadingFeed: false,
  feedError: null,
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type AppAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'CLEAR_USER' }
  | { type: 'ADD_CONTENT'; payload: ContentItem }
  | { type: 'DELETE_CONTENT'; payload: string }
  | { type: 'SET_CONTENT'; payload: ContentItem[] }
  | { type: 'SET_ANALYSIS'; payload: AnalysisResult }
  | { type: 'SET_ANALYZING'; payload: { step: string; progress: number } }
  | { type: 'STOP_ANALYZING' }
  | { type: 'SET_ANALYSIS_ERROR'; payload: string | null }
  | { type: 'SET_COMPLETED_ACTIONS'; payload: string[] }
  | { type: 'SET_LOADING_FEED'; payload: boolean }
  | { type: 'SET_FEED_ERROR'; payload: string | null }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'CLEAR_USER':
      return { ...state, user: null, analysis: null }
    case 'ADD_CONTENT':
      return { ...state, content: [action.payload, ...state.content] }
    case 'DELETE_CONTENT':
      return { ...state, content: state.content.filter((c) => c.id !== action.payload) }
    case 'SET_CONTENT':
      return { ...state, content: action.payload }
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload, analysisError: null }
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: true, analyzeStep: action.payload.step, analyzeProgress: action.payload.progress }
    case 'STOP_ANALYZING':
      return { ...state, isAnalyzing: false, analyzeStep: '', analyzeProgress: 0 }
    case 'SET_ANALYSIS_ERROR':
      return { ...state, analysisError: action.payload }
    case 'SET_COMPLETED_ACTIONS':
      return { ...state, completedActions: action.payload }
    case 'SET_LOADING_FEED':
      return { ...state, isLoadingFeed: action.payload }
    case 'SET_FEED_ERROR':
      return { ...state, feedError: action.payload }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  completeOnboarding: (profile: UserProfile) => void
  addContent: (item: ContentItem) => void
  deleteContent: (id: string) => void
  startAnalysis: () => Promise<void>
  loadDemoData: (profile: UserProfile, content: ContentItem[], analysis: AnalysisResult) => void
  toggleActionDone: (id: string) => void
  dismissError: () => void
  loadFromFeed: () => Promise<void>
  dismissFeedError: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    const savedUser      = StorageService.loadUser()
    const savedCompleted = StorageService.loadCompletedActions()
    return {
      ...init,
      ...(savedUser ? { user: savedUser } : {}),
      completedActions: savedCompleted,
    }
  })

  const completeOnboarding = (profile: UserProfile) => {
    dispatch({ type: 'SET_USER', payload: profile })
    StorageService.saveUser(profile)
  }

  const addContent = (item: ContentItem) => {
    dispatch({ type: 'ADD_CONTENT', payload: item })
  }

  const deleteContent = (id: string) => {
    dispatch({ type: 'DELETE_CONTENT', payload: id })
  }

  const startAnalysis = async () => {
    if (!state.user || state.isAnalyzing) return

    try {
      const result = await aiService.runFullAnalysis(
        state.content,
        state.user,
        (step, progress) => dispatch({ type: 'SET_ANALYZING', payload: { step, progress } }),
      )
      dispatch({ type: 'SET_ANALYSIS', payload: result })
    } catch (error) {
      const { message } = getErrorMessage(error)
      dispatch({ type: 'SET_ANALYSIS_ERROR', payload: message })
    } finally {
      dispatch({ type: 'STOP_ANALYZING' })
    }
  }

  const loadDemoData = (profile: UserProfile, content: ContentItem[], analysis: AnalysisResult) => {
    dispatch({ type: 'SET_USER', payload: profile })
    dispatch({ type: 'SET_CONTENT', payload: content })
    dispatch({ type: 'SET_ANALYSIS', payload: analysis })
    StorageService.saveUser(profile)
  }

  const toggleActionDone = (id: string) => {
    const updated = state.completedActions.includes(id)
      ? state.completedActions.filter((aid) => aid !== id)
      : [...state.completedActions, id]
    dispatch({ type: 'SET_COMPLETED_ACTIONS', payload: updated })
    StorageService.saveCompletedActions(updated)
  }

  const dismissError = () => {
    dispatch({ type: 'SET_ANALYSIS_ERROR', payload: null })
  }

  const loadFromFeed = async () => {
    if (state.isLoadingFeed) return
    dispatch({ type: 'SET_LOADING_FEED', payload: true })
    dispatch({ type: 'SET_FEED_ERROR', payload: null })
    try {
      const items = await TechmemeIngestionService.fetchLatest(15)
      dispatch({ type: 'SET_CONTENT', payload: items })
    } catch (error) {
      const { message } = getErrorMessage(error)
      dispatch({ type: 'SET_FEED_ERROR', payload: message })
    } finally {
      dispatch({ type: 'SET_LOADING_FEED', payload: false })
    }
  }

  const dismissFeedError = () => {
    dispatch({ type: 'SET_FEED_ERROR', payload: null })
  }

  return (
    <AppContext.Provider
      value={{ ...state, completeOnboarding, addContent, deleteContent, startAnalysis, loadDemoData, toggleActionDone, dismissError, loadFromFeed, dismissFeedError }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>')
  return ctx
}
