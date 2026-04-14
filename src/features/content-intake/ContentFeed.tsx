import { useAppStore } from '@/app/providers/store'
import { ContentCard } from './ContentCard'

export function ContentFeed() {
  const contentItems = useAppStore((s) => s.contentItems)

  if (contentItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 text-sm">
          Todavia no analizaste ningun contenido.
        </p>
        <p className="text-zinc-600 text-xs mt-1">
          Pega una URL o texto de un articulo, newsletter o hilo sobre IA y marketing.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contentItems.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  )
}
