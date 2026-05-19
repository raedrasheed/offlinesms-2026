import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

const SplashScreen: React.FC = () => (
  <View style={styles.wrapper}>
    <Image
      source={require('../../assets/icon.png')}
      style={styles.logo}
      resizeMode="contain"
    />
    <Text style={styles.brand}>OfflineSMS</Text>
    <Text style={styles.tagline}>Reliable messaging, always within reach.</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logo: { width: 140, height: 140 },
  brand: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SplashScreen;
