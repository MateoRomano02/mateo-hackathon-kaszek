import { useEffect } from 'react'

export const useOnInit = (initialCallback: () => void) => {
  useEffect(() => {
    initialCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const useAlIniciar = useOnInit
