import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/theme';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

const initialsOf = (name?: string) =>
  (name ?? '?')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const Avatar: React.FC<Props> = ({ uri, name, size = 44, style }) => {
  const dims = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={[dims, style]} />;
  }
  return (
    <View style={[styles.fallback, dims, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initialsOf(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default Avatar;
