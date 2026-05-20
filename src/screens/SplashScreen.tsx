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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logo: { width: 160, height: 160 },
  brand: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SplashScreen;
