import { useState } from 'react'
import { ContentItem, ContentType } from '@/entities/content/types'
import { Button } from '@/shared/ui/Button/Button'
import { nowISO } from '@/shared/utils/dates'
import { resolveSource } from '@/shared/utils/urls'

const TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'link',    label: '🔗 Link' },
  { value: 'text',    label: '📝 Texto' },
  { value: 'summary', label: '📋 Resumen' },
]

interface ContentFormProps {
  onAdd: (item: ContentItem) => void
}

export function ContentForm({ onAdd }: ContentFormProps) {
  const [type, setType]     = useState<ContentType>('link')
  const [raw, setRaw]       = useState('')
  const [title, setTitle]   = useState('')
  const [source, setSource] = useState('')

  const handleRawChange = (value: string) => {
    setRaw(value)
    // Auto-detectar fuente al pegar un link
    if (type === 'link' && value.startsWith('http') && !source) {
      const detected = resolveSource(value)
      if (detected) setSource(detected)
    }
  }

  const handleTypeChange = (t: ContentType) => {
    setType(t)
    setSource('')
  }

  const handleSubmit = () => {
    if (!raw.trim()) return
    const resolvedSource = resolveSource(raw, source)
    onAdd({
      id: `c${Date.now()}`,
      type,
      raw,
      title: title || raw.slice(0, 60),
      source: resolvedSource || undefined,
      status: 'pending',
      addedAt: nowISO(),
      analysis: null,
    })
    setRaw('')
    setTitle('')
    setSource('')
  }

  return (
    <div className="card mb-20 fade-up">
      <div className="card-label">Agregar señal</div>

      <div className="flex gap-8 mb-16">
        {TYPE_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={type === opt.value ? 'primary' : 'secondary'}
            size="sm"
            type="button"
            onClick={() => handleTypeChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {type === 'link' ? (
        <input
          className="input mb-12"
          placeholder="Pegá una URL: https://..."
          value={raw}
          onChange={(e) => handleRawChange(e.target.value)}
        />
      ) : (
        <textarea
          className="input mb-12"
          style={{ minHeight: 100 }}
          placeholder={type === 'text' ? 'Pegá el texto, thread, artículo...' : 'Escribí o pegá el resumen de lo que leíste...'}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
      )}

      <div className="grid-2 gap-12 mb-12">
        <input
          className="input"
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input"
          placeholder="Fuente: LinkedIn, Newsletter..."
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </div>

      <Button variant="primary" type="button" onClick={handleSubmit} disabled={!raw.trim()}>
        + Agregar señal
      </Button>
    </div>
  )
}
