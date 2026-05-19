import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

const SplashScreen: React.FC = () => (
  <View style={styles.wrapper}>
    <View style={styles.badge}>
      <Image
        source={require('../../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
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
  badge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: { width: 130, height: 130 },
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
