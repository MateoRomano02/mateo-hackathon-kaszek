import { useAppContext } from '@/app/context/AppContext'
import { ContentIntake } from '@/features/content-intake/ContentIntake'

export function InboxPage() {
  const { content, addContent, deleteContent } = useAppContext()

  return (
    <div className="page">
      <div className="page-header fade-up">
        <h1 className="page-title">Mis señales</h1>
        <p className="page-subtitle">
          Agregá links, threads o resúmenes — los agentes los van a procesar en el próximo trending
        </p>
      </div>
      <ContentIntake items={content} onAdd={addContent} onDelete={deleteContent} />
    </div>
  )
}
