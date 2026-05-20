import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

interface Props {
  size?: number;
  showWordmark?: boolean;
  tint?: string;
}

const Logo: React.FC<Props> = ({ size = 96, showWordmark = false, tint = colors.primary }) => {
  return (
    <View style={styles.row}>
      <Image
        source={require('../../assets/icon.png')}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
      />
      {showWordmark && (
        <Text style={[styles.wordmark, { color: tint, fontSize: size * 0.28 }]}>
          OfflineSMS
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wordmark: { fontWeight: '800', letterSpacing: 0.3 },
});

export default Logo;
