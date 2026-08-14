import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
  // Backgrounds
  bgApp: '#0b0f17',
  bgSurface: '#111827',
  bgCard: '#1e293b',
  bgCardHover: '#243248',
  bgCardActive: '#2d3f5a',
  bgSidebar: '#0f172a',
  bgHeader: '#0f172aee',
  bgInput: '#0f172a',
  bgInputFocus: '#1e293b',

  // Accents (Cyan / Blue palette for mould)
  primary: '#0ea5e9',
  primaryHover: '#38bdf8',
  primaryActive: '#0284c7',
  primaryMuted: '#0284c726',
  primaryText: '#e0f2fe',

  // Status & Feedback
  success: '#10b981',
  successBg: '#064e3b33',
  successText: '#6ee7b7',
  warning: '#f59e0b',
  warningBg: '#78350f33',
  warningText: '#fcd34d',
  danger: '#ef4444',
  dangerBg: '#7f1d1d33',
  dangerText: '#fca5a5',
  info: '#6366f1',
  infoBg: '#312e8133',
  infoText: '#a5b4fc',

  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textInverse: '#0f172a',

  // Borders
  border: '#334155',
  borderMuted: '#1e293b',
  borderHighlight: '#475569',
  borderPrimary: '#0ea5e9',
});

export const spacing = stylex.defineVars({
  none: '0px',
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
});

export const radii = stylex.defineVars({
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
});

export const fonts = stylex.defineVars({
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
});
