import { I18nManager } from 'react-native';

export { colors, palettes } from './colors';
export type { Palette } from './colors';
export { spacing } from './spacing';
export type { SpacingKey } from './spacing';
export { typography } from './typography';
export type { TypographyKey } from './typography';
export { radii } from './radii';
export type { RadiiKey } from './radii';

// Back-compat alias — older code imports `radius` from the theme module.
export { radii as radius } from './radii';

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  bubble: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
};

export const motion = {
  fast: 150,
  base: 220,
  slow: 320,
  easing: 'ease-out' as const,
};

export const isRTL = I18nManager.isRTL;
