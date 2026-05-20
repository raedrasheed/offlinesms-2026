export const radii = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  bubble: 16,
  bubbleTail: 4,
  card: 14,
  sheet: 20,
  pill: 999,
} as const;

export type RadiiKey = keyof typeof radii;
