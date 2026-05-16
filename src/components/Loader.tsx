import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

const Loader: React.FC<{ fullscreen?: boolean }> = ({ fullscreen = true }) => (
  <View style={[styles.wrapper, fullscreen && styles.fullscreen]}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  wrapper: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  fullscreen: { flex: 1, backgroundColor: colors.background },
});

export default Loader;
