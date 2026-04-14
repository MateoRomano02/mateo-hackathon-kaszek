export const ICON_PATHS = {
  signal:   'M2 12h3m4-7l1 7h4l1-7h4m3 7h-3',
  dash:     'M3 12h18M3 6h18M3 18h12',
  inbox:    'M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zM8 12l2 2 4-4',
  brain:    'M9.5 2a2.5 2.5 0 015 0M9 7c0-1.66 1.34-3 3-3s3 1.34 3 3v1M6 12a3 3 0 106 0M12 12a3 3 0 106 0M12 12v9',
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  memory:   'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  plus:     'M12 5v14M5 12h14',
  link:     'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  text:     'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  check:    'M20 6L9 17l-5-5',
  arrow:    'M5 12h14M12 5l7 7-7 7',
  logo:     'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  user:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  noise:    'M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM15 9l-6 6M9 9l6 6',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  target:   'M22 12A10 10 0 1112 2M22 12h-4M12 12l-4-4',
  calendar: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
} as const

export type IconName = keyof typeof ICON_PATHS
