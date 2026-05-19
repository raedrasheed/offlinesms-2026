import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

interface Props {
  size?: number;
  showWordmark?: boolean;
  tint?: string;
  /** Render the icon inside a white circular badge. */
  whiteBadge?: boolean;
}

const Logo: React.FC<Props> = ({
  size = 96,
  showWordmark = false,
  tint = colors.primary,
  whiteBadge = true,
}) => {
  const badgePadding = size * 0.08;
  const innerSize = size - badgePadding * 2;
  return (
    <View style={styles.row}>
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            padding: badgePadding,
          },
          whiteBadge && styles.badge,
        ]}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
          resizeMode="contain"
        />
      </View>
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
  badge: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  wordmark: { fontWeight: '800', letterSpacing: 0.3 },
});

export default Logo;
