import { ContentIntakeForm } from '@/features/content-intake/ContentIntakeForm'
import { ContentFeed } from '@/features/content-intake/ContentFeed'
import { useAppStore } from '@/app/providers/store'

export function InboxPage() {
  const contentItems = useAppStore((s) => s.contentItems)
  const doneCount = contentItems.filter((c) => c.status === 'done').length
  const insightCount = contentItems.reduce(
    (acc, c) => acc + (c.status === 'done' ? (c.canonicalInsights?.length ?? 0) : 0), 0,
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Truth Pipeline</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Ingresa contenido. Claude evalua la credibilidad de la fuente y destila verdades canonicas con evidencia trazable.
        </p>
        {doneCount > 0 && (
          <p className="text-xs text-indigo-400 mt-2">
            {doneCount} fuente{doneCount > 1 ? 's' : ''} analizada{doneCount > 1 ? 's' : ''} &middot;{' '}
            {insightCount} insight{insightCount > 1 ? 's' : ''} canonico{insightCount > 1 ? 's' : ''} extraido{insightCount > 1 ? 's' : ''} &middot;{' '}
            Skills actualizados en Dashboard
          </p>
        )}
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <ContentIntakeForm />
      </div>

      <ContentFeed />
    </div>
  )
}
