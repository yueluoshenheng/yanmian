export const tokens = {
  bgPrimary: '#0D0F12',
  bgSecondary: '#141820',
  bgTertiary: '#1A1F2B',
  bgHover: '#222836',

  amber500: '#E8913A',
  amber400: '#F0A54E',
  amber600: '#C97A2E',

  statusGreen: '#34D399',
  statusYellow: '#FBBF24',
  statusRed: '#F87171',
  statusBlue: '#60A5FA',

  textPrimary: '#E8ECF1',
  textSecondary: '#8B95A5',
  textMuted: '#4B5563',

  border: '#2A3040',
  borderFocus: '#E8913A',

  fontDisplay: "'Rajdhani', sans-serif",
  fontBody: "'IBM Plex Sans', sans-serif",
} as const

export type Tokens = typeof tokens
