import { TextStyle } from 'react-native';

// Typography scale. Use these tokens instead of inlining fontSize/fontWeight.
export const typography = {
  display: { fontSize: 32, fontWeight: '800', lineHeight: 38 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  h4: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  bodyLarge: { fontSize: 17, fontWeight: '400', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  small: { fontSize: 11, fontWeight: '400', lineHeight: 14 },
  tabLabel: { fontSize: 13, fontWeight: '700', lineHeight: 16, letterSpacing: 0.4 },
  buttonLabel: { fontSize: 15, fontWeight: '700', lineHeight: 20, letterSpacing: 0.2 },
} satisfies Record<string, TextStyle>;

export type TypographyKey = keyof typeof typography;
