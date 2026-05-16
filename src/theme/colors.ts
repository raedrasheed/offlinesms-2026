// OfflineSMS brand palette — primary turquoise/blue inspired by offlinesms.com
export const colors = {
  primary: '#0AB3B8',
  primaryDark: '#078A8E',
  primaryLight: '#3FD2D6',
  accent: '#00C2A8',

  background: '#FFFFFF',
  surface: '#F6F8FA',
  surfaceAlt: '#ECEFF1',

  bubbleOutgoing: '#D8F5F6',
  bubbleIncoming: '#FFFFFF',
  chatBackground: '#E9EEF1',

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

  unreadBadge: '#0AB3B8',
  online: '#22C55E',
  overlay: 'rgba(0,0,0,0.45)',
} as const;

export type ColorKey = keyof typeof colors;
