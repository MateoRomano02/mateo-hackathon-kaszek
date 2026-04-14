import { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '@/app/context/AppContext'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <AppProvider>{children}</AppProvider>
    </BrowserRouter>
  )
}
