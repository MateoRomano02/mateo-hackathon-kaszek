import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, SkillStock } from '@/entities/user/types'
import type { ContentItem, GeneratedProject } from '@/entities/content/types'

type AiMode = 'mock' | 'anthropic'

interface AppState {
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile) => void

  skillStocks: SkillStock[]
  setSkillStocks: (stocks: SkillStock[]) => void
  mergeSkillInsight: (skill: string, status: SkillStock['status'], reason: string) => void

  contentItems: ContentItem[]
  addContentItem: (item: ContentItem) => void
  updateContentItem: (id: string, updates: Partial<ContentItem>) => void

  projects: GeneratedProject[]
  addProject: (project: GeneratedProject) => void

  // Saved courses (resources the user started learning)
  savedCourses: { id: string; title: string; content: string; savedAt: string }[]
  saveCourse: (title: string, content: string) => void

  // Curator results (persisted)
  curatorResults: { url: string; verdict: 'signal' | 'noise'; reason: string; relevanceScore: number }[]
  setCuratorResults: (results: { url: string; verdict: 'signal' | 'noise'; reason: string; relevanceScore: number }[]) => void

  // LMS progress: key -> completed step numbers
  projectProgress: Record<string, number[]>
  toggleStepComplete: (projectId: string, stepNum: number) => void

  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  aiMode: AiMode
  setAiMode: (mode: AiMode) => void

  resetAll: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),

      skillStocks: [],
      setSkillStocks: (stocks) => set({ skillStocks: stocks }),
      mergeSkillInsight: (skill, status, reason) =>
        set((state) => {
          const existing = state.skillStocks.find(
            (s) => s.skill.toLowerCase() === skill.toLowerCase(),
          )
          if (existing) {
            return {
              skillStocks: state.skillStocks.map((s) =>
                s.id === existing.id ? { ...s, status, rationale: reason } : s,
              ),
            }
          }
          return {
            skillStocks: [
              ...state.skillStocks,
              {
                id: crypto.randomUUID(),
                skill,
                status,
                rationale: reason,
                priorityScore: status === 'rising' ? 8 : status === 'stable' ? 5 : status === 'degrading' ? 3 : 1,
                suggestedAction: reason,
              },
            ],
          }
        }),

      contentItems: [],
      addContentItem: (item) =>
        set((state) => ({ contentItems: [item, ...state.contentItems] })),
      updateContentItem: (id, updates) =>
        set((state) => ({
          contentItems: state.contentItems.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      projects: [],
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),

      curatorResults: [],
      setCuratorResults: (results) => set({ curatorResults: results }),

      savedCourses: [],
      saveCourse: (title, content) =>
        set((state) => {
          if (state.savedCourses.some((c) => c.title === title)) return state
          return { savedCourses: [{ id: crypto.randomUUID(), title, content, savedAt: new Date().toISOString() }, ...state.savedCourses] }
        }),

      projectProgress: {},
      toggleStepComplete: (projectId, stepNum) =>
        set((state) => {
          const current = state.projectProgress[projectId] ?? []
          const updated = current.includes(stepNum)
            ? current.filter((n) => n !== stepNum)
            : [...current, stepNum]
          return { projectProgress: { ...state.projectProgress, [projectId]: updated } }
        }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      error: null,
      setError: (error) => set({ error }),

      aiMode: 'anthropic',
      setAiMode: (mode) => set({ aiMode: mode }),

      resetAll: () =>
        set({
          userProfile: null,
          skillStocks: [],
          contentItems: [],
          projects: [],
          curatorResults: [],
          savedCourses: [],
          projectProgress: {},
          isLoading: false,
          error: null,
          aiMode: 'anthropic',
        }),
    }),
    {
      name: 'signal-os-store',
      partialize: (state) => ({
        userProfile: state.userProfile,
        skillStocks: state.skillStocks,
        contentItems: state.contentItems.filter((c) => c.status === 'done'),
        projects: state.projects,
        curatorResults: state.curatorResults,
        savedCourses: state.savedCourses,
        projectProgress: state.projectProgress,
        aiMode: state.aiMode,
      }),
    },
  ),
)
