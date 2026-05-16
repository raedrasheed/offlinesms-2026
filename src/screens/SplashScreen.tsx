import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Logo from '@/components/Logo';
import { colors } from '@/theme';

const SplashScreen: React.FC = () => (
  <View style={styles.wrapper}>
    <Logo size={140} tint="#fff" />
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
  brand: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SplashScreen;
