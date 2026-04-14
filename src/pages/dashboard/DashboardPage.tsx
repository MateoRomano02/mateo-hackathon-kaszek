import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/app/context/AppContext'
import { DashboardFeature } from '@/features/dashboard/DashboardFeature'

export function DashboardPage() {
  const { user, content, analysis, isAnalyzing, startAnalysis } = useAppContext()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="page">
      <DashboardFeature
        user={user}
        content={content}
        analysis={analysis}
        isAnalyzing={isAnalyzing}
        onNavigate={navigate}
        onAnalyze={startAnalysis}
      />
    </div>
  )
}
