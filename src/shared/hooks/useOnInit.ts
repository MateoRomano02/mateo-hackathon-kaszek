import { useEffect } from 'react'

/** Runs callback once on component mount. Replaces raw `useEffect(() => {}, [])`. */
export const useOnInit = (callback: () => void): void => {
  useEffect(() => {
    callback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const useAlIniciar = useOnInit
