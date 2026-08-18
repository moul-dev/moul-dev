import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
  // Backgrounds: var(--xg2wbmg) is the exact Moul UI colorBgSubtle token (pure neutral dark)
  bgApp: 'var(--xg2wbmg)',
  bgSurface: 'var(--xg2wbmg)',
  bgCard: 'var(--x1qnu6yg)',
  bgCardHover: 'var(--x14tkvwa)',
  bgCardActive: 'var(--xle5duh)',
  bgSidebar: 'var(--xg2wbmg)',
  bgHeader: 'var(--xg2wbmg)',
  bgInput: 'var(--xg2wbmg)',
  bgInputFocus: 'var(--x1qnu6yg)',

  // Accents
  primary: 'var(--x11vz4nw)',
  primaryHover: 'var(--x1smr4m2)',
  primaryActive: 'var(--x19wncxt)',
  primaryMuted: 'var(--x27tw8h)',
  primaryText: '#ffffff',

  // Status & Feedback
  success: 'var(--xo79180)',
  successBg: 'var(--xvq252x)',
  successText: 'var(--x1eg0uv7)',
  warning: 'var(--x9boa8o)',
  warningBg: 'var(--xg2n39v)',
  warningText: 'var(--xxkj1oe)',
  danger: 'var(--xgm7y0w)',
  dangerBg: 'var(--x1u4wyvx)',
  dangerText: 'var(--xywa26s)',
  info: 'var(--x11vz4nw)',
  infoBg: 'var(--xfh678y)',
  infoText: 'var(--x189jvvz)',

  // Text
  textPrimary: 'var(--x1jfchzy)',
  textSecondary: 'var(--x1ol9w3z)',
  textMuted: 'var(--x7rwqrp)',
  textInverse: 'var(--x21z8aa)',

  // Borders
  border: 'var(--x4npmm6)',
  borderMuted: 'var(--xekkakv)',
  borderHighlight: 'var(--x6l5ye8)',
  borderPrimary: 'var(--x79fgis)',
});

export const spacing = stylex.defineVars({
  none: '0px',
  xxs: '2px',
  xs: 'var(--x1jforli)',
  sm: 'var(--x9epbqz)',
  md: 'var(--x1fim08e)',
  lg: 'var(--x1djehx3)',
  xl: 'var(--x1xsmz2k)',
  xxl: 'var(--x3461u0)',
  xxxl: '48px',
});

export const radii = stylex.defineVars({
  none: '0px',
  sm: 'var(--xcxkm4p)',
  md: 'var(--x11qts0k)',
  lg: 'var(--x8ikvy7)',
  xl: 'var(--x8ikvy7)',
  full: '9999px',
});

export const fonts = stylex.defineVars({
  sans: 'var(--xb7uvbd)',
  mono: 'var(--font-mono, ui-monospace, monospace)',
});


