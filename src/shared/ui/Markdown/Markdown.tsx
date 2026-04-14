interface MarkdownProps {
  content: string
}

function parseLine(line: string, i: number) {
  // Horizontal rule
  if (line.trim() === '---' || line.trim() === '***') {
    return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
  }

  // H2
  if (line.startsWith('## ')) {
    return <h2 key={i} style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--accent)', marginTop: 24, marginBottom: 8 }}>{parseInline(line.slice(3))}</h2>
  }

  // H3
  if (line.startsWith('### ')) {
    return <h3 key={i} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 16, marginBottom: 6 }}>{parseInline(line.slice(4))}</h3>
  }

  // Bold-only line (phase header)
  if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
    return <h3 key={i} style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-serif)', color: 'var(--accent)', marginTop: 20, marginBottom: 8 }}>{line.slice(2, -2)}</h3>
  }

  // Numbered list with bold
  const numBoldMatch = line.match(/^(\d+)\.\s\*\*(.+?)\*\*(.*)/)
  if (numBoldMatch) {
    return (
      <div key={i} style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 4, paddingLeft: 4 }}>
        <span style={{
          width: 24, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 1,
          background: 'rgba(109,40,217,.08)', border: '1px solid rgba(109,40,217,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)',
        }}>
          {numBoldMatch[1]}
        </span>
        <div style={{ flex: 1 }}>
          <strong style={{ color: 'var(--text)', fontSize: 13 }}>{numBoldMatch[2]}</strong>
          <span style={{ color: 'var(--text2)', fontSize: 13 }}>{parseInlineToString(numBoldMatch[3])}</span>
        </div>
      </div>
    )
  }

  // Bullet list
  if (line.startsWith('- ') || line.startsWith('* ')) {
    return (
      <div key={i} style={{ display: 'flex', gap: 8, marginTop: 4, paddingLeft: 4 }}>
        <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}>-</span>
        <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{parseInline(line.slice(2))}</span>
      </div>
    )
  }

  // Empty line
  if (line.trim() === '') return <div key={i} style={{ height: 8 }} />

  // Normal paragraph
  return <p key={i} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 4 }}>{parseInline(line)}</p>
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>)
      }
      parts.push(<strong key={key++} style={{ color: 'var(--text)', fontWeight: 600 }}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
      continue
    }

    // Code
    const codeMatch = remaining.match(/`(.+?)`/)
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, codeMatch.index)}</span>)
      }
      parts.push(
        <code key={key++} style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '1px 5px', fontSize: 12, fontFamily: 'var(--font-mono)',
        }}>
          {codeMatch[1]}
        </code>,
      )
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length)
      continue
    }

    parts.push(<span key={key++}>{remaining}</span>)
    break
  }

  return parts
}

function parseInlineToString(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1')
}

export function Markdown({ content }: MarkdownProps) {
  const lines = content.split('\n')

  return (
    <div style={{ lineHeight: 1.7 }}>
      {lines.map((line, i) => parseLine(line, i))}
    </div>
  )
}
