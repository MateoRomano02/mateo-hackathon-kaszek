import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    try {
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch {
      // Silently ignore storage errors (e.g. private mode quota)
    }
  }

  const removeValue = () => {
    setStoredValue(initialValue)
    try {
      localStorage.removeItem(key)
    } catch {
      // noop
    }
  }

  return [storedValue, setValue, removeValue] as const
}
