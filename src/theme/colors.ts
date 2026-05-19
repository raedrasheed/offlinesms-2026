// OfflineSMS brand palette — primary steel-blue #2596be
export const colors = {
  primary: '#2596be',
  primaryDark: '#1d7596',
  primaryLight: '#5fbdde',
  accent: '#00C2A8',

  background: '#FFFFFF',
  surface: '#F6F8FA',
  surfaceAlt: '#ECEFF1',

  // Outgoing bubbles use a soft cream; incoming stays white.
  bubbleOutgoing: '#F5EAD6',
  bubbleIncoming: '#FFFFFF',
  chatBackground: '#EFE7DD',

  textPrimary: '#0F1720',
  textSecondary: '#5B6770',
  textMuted: '#8A95A0',
  textOnPrimary: '#FFFFFF',

  border: '#E1E6EA',
  divider: '#EEF1F3',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  unreadBadge: '#2596be',
  online: '#22C55E',
  overlay: 'rgba(0,0,0,0.45)',

  // Date separator pill in the chat thread.
  datePill: 'rgba(255,255,255,0.92)',
} as const;

export type ColorKey = keyof typeof colors;
