// OfflineSMS color tokens — primary #2596be.
// Two palettes (light/dark) so we can flip the app theme later without
// touching component code. Always reference colors through the theme
// module, never hardcode hex values in components.

export interface Palette {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string; // subtle background tint
  accent: string;

  // Surfaces
  background: string;
  screen: string; // tinted page background (chat list, etc.)
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;

  // Chat surfaces
  bubbleOutgoing: string;
  bubbleIncoming: string;
  chatBackground: string;
  chatBackgroundPattern: string;
  datePill: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  textLink: string;

  // Borders / dividers
  border: string;
  divider: string;
  hairline: string;

  // States
  success: string;
  warning: string;
  danger: string;
  info: string;

  // Affordances
  online: string;
  unreadBadge: string;
  overlay: string;
  pressedTint: string;

  // Ticks
  tickSent: string;
  tickRead: string;
}

const light: Palette = {
  primary: '#2596be',
  primaryDark: '#1d7596',
  primaryLight: '#5fbdde',
  primarySoft: '#E2F0F6',
  accent: '#00C2A8',

  background: '#FFFFFF',
  screen: '#EAEFF5',
  surface: '#F6F8FA',
  surfaceAlt: '#ECEFF1',
  surfaceElevated: '#FFFFFF',

  bubbleOutgoing: '#F5EAD6',
  bubbleIncoming: '#FFFFFF',
  chatBackground: '#EFE7DD',
  chatBackgroundPattern: '#0F1720',
  datePill: 'rgba(255,255,255,0.92)',

  textPrimary: '#0F1720',
  textSecondary: '#5B6770',
  textMuted: '#8A95A0',
  textOnPrimary: '#FFFFFF',
  textLink: '#2596be',

  border: '#E1E6EA',
  divider: '#EEF1F3',
  hairline: '#F2F4F6',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  online: '#22C55E',
  unreadBadge: '#2596be',
  overlay: 'rgba(0,0,0,0.45)',
  pressedTint: 'rgba(0,0,0,0.06)',

  tickSent: '#8A95A0',
  tickRead: '#34B7F1',
};

const dark: Palette = {
  primary: '#5fbdde',
  primaryDark: '#2596be',
  primaryLight: '#8FDCF2',
  primarySoft: '#0F2A36',
  accent: '#00C2A8',

  background: '#0B141B',
  screen: '#0B141B',
  surface: '#111B22',
  surfaceAlt: '#1A252D',
  surfaceElevated: '#1F2C35',

  bubbleOutgoing: '#1E3A47',
  bubbleIncoming: '#1F2C35',
  chatBackground: '#0B141B',
  chatBackgroundPattern: '#FFFFFF',
  datePill: 'rgba(31,44,53,0.92)',

  textPrimary: '#E9EDEF',
  textSecondary: '#A8B5BD',
  textMuted: '#7B8A93',
  textOnPrimary: '#FFFFFF',
  textLink: '#5fbdde',

  border: '#22313B',
  divider: '#1A252D',
  hairline: '#15202A',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  online: '#22C55E',
  unreadBadge: '#5fbdde',
  overlay: 'rgba(0,0,0,0.65)',
  pressedTint: 'rgba(255,255,255,0.06)',

  tickSent: '#7B8A93',
  tickRead: '#5fbdde',
};

export const palettes = { light, dark };

// The active palette. We default to light; a theme provider can swap this
// at runtime once we wire up persisted user preference.
export const colors: Palette = light;
