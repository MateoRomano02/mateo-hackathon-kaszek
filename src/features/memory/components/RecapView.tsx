import { Recap } from '@/entities/analysis/types'

interface RecapViewProps {
  recap: Recap
}

interface MemorySection {
  title: string
  dotClass: string
  items: string[]
  emptyMessage?: string
}

function MemoryList({ title, dotClass, items, emptyMessage }: MemorySection) {
  return (
    <div className="memory-section">
      <div className="memory-section-title">{title}</div>
      {items.length > 0
        ? items.map((item, i) => (
            <div key={i} className="memory-item">
              <div className={`memory-dot ${dotClass}`} />
              {item}
            </div>
          ))
        : emptyMessage && <div className="text-muted text-sm">{emptyMessage}</div>
      }
    </div>
  )
}

export function RecapView({ recap }: RecapViewProps) {
  return (
    <div className="card mb-16">
      <MemoryList
        title="✓ Lo que aprendí"
        dotClass="dot-learned"
        items={recap.learned}
      />
      <hr className="divider" />
      <MemoryList
        title="⚡ Lo que apliqué"
        dotClass="dot-applied"
        items={recap.applied}
        emptyMessage="Aún no marcaste acciones como completadas."
      />
      <hr className="divider" />
      <MemoryList
        title="⏳ Pendiente"
        dotClass="dot-pending"
        items={recap.pending}
      />
    </div>
  )
}
