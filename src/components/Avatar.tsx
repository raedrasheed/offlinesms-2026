import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/theme';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
  /** Render a small online dot in the bottom-right corner. */
  online?: boolean;
  /** Seed (e.g. uid or name) used to pick a deterministic vibrant
   *  background color for the initials fallback. */
  colorSeed?: string;
}

const initialsOf = (name?: string) =>
  (name ?? '?')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// Vibrant palette for initials avatars. Deterministic per seed so a
// contact always keeps the same color.
const AVATAR_COLORS = [
  '#4A7DFF',
  '#8B5CF6',
  '#10B981',
  '#F97316',
  '#06B6D4',
  '#EC4899',
  '#F59E0B',
  '#0AB39C',
];

const colorForSeed = (seed?: string): string => {
  if (!seed) return colors.primaryLight;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const Avatar: React.FC<Props> = ({
  uri,
  name,
  size = 44,
  style,
  online = false,
  colorSeed,
}) => {
  const dims = { width: size, height: size, borderRadius: size / 2 };
  // Online dot sized relative to the avatar so it scales with the row.
  const dotSize = Math.max(8, Math.round(size * 0.26));
  const ringSize = dotSize + 4;
  return (
    <View style={[dims, { position: 'relative' }, style]}>
      {uri ? (
        <Image source={{ uri }} style={dims} />
      ) : (
        <View style={[styles.fallback, dims, { backgroundColor: colorForSeed(colorSeed) }]}>
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initialsOf(name)}</Text>
        </View>
      )}
      {online && (
        <View
          style={[
            styles.dotRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              right: -1,
              bottom: -1,
            },
          ]}
        >
          <View
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#fff', fontWeight: '700' },
  dotRing: {
    position: 'absolute',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { backgroundColor: colors.online },
});

export default Avatar;
