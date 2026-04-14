import { UserProfile } from '@/entities/user/types'

const KEYS = {
  USER:              'signalos_user',
  COMPLETED_ACTIONS: 'signalos_completed_actions',
} as const

/** Thin wrapper around localStorage — never call storage APIs directly in components. */
export const StorageService = {
  saveUser(profile: UserProfile): void {
    try { localStorage.setItem(KEYS.USER, JSON.stringify(profile)) } catch { /* quota/private */ }
  },

  loadUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(KEYS.USER)
      return raw ? (JSON.parse(raw) as UserProfile) : null
    } catch { return null }
  },

  clearUser(): void {
    try { localStorage.removeItem(KEYS.USER) } catch { /* noop */ }
  },

  saveCompletedActions(ids: string[]): void {
    try { localStorage.setItem(KEYS.COMPLETED_ACTIONS, JSON.stringify(ids)) } catch { /* quota */ }
  },

  loadCompletedActions(): string[] {
    try {
      const raw = localStorage.getItem(KEYS.COMPLETED_ACTIONS)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch { return [] }
  },
}
