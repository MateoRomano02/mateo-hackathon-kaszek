import { ContentIntakeForm } from '@/features/content-intake/ContentIntakeForm'
import { ContentFeed } from '@/features/content-intake/ContentFeed'
import { useAppStore } from '@/app/providers/store'

export function InboxPage() {
  const contentItems = useAppStore((s) => s.contentItems)
  const doneCount = contentItems.filter((c) => c.status === 'done').length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Inbox</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Ingresa articulos, newsletters o hilos. Claude los analiza y conecta con tu portafolio de skills.
        </p>
        {doneCount > 0 && (
          <p className="text-xs text-indigo-400 mt-2">
            {doneCount} contenido{doneCount > 1 ? 's' : ''} analizado{doneCount > 1 ? 's' : ''} — los skills impactados ya se reflejaron en tu Dashboard.
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
