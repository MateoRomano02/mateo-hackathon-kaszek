const LOCALE = 'es-AR'

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE)
}

export function formatDateLong(): string {
  return new Date().toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE)
}

export function nowISO(): string {
  return new Date().toISOString()
}
