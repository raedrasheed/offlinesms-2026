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
}

const initialsOf = (name?: string) =>
  (name ?? '?')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const Avatar: React.FC<Props> = ({ uri, name, size = 44, style, online = false }) => {
  const dims = { width: size, height: size, borderRadius: size / 2 };
  // Online dot sized relative to the avatar so it scales with the row.
  const dotSize = Math.max(8, Math.round(size * 0.26));
  const ringSize = dotSize + 4;
  return (
    <View style={[dims, { position: 'relative' }, style]}>
      {uri ? (
        <Image source={{ uri }} style={dims} />
      ) : (
        <View style={[styles.fallback, dims]}>
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
