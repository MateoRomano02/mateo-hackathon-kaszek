import { ContentItem } from '@/entities/content/types'
import { ContentForm } from './components/ContentForm'
import { ContentList } from './components/ContentList'

interface ContentIntakeProps {
  items: ContentItem[]
  onAdd: (item: ContentItem) => void
  onDelete: (id: string) => void
}

export function ContentIntake({ items, onAdd, onDelete }: ContentIntakeProps) {
  return (
    <>
      <ContentForm onAdd={onAdd} />
      <ContentList items={items} onDelete={onDelete} />
    </>
  )
}
