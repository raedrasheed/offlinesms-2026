import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/theme';

interface Props {
  size?: number;
  showWordmark?: boolean;
  tint?: string;
}

/**
 * Original OfflineSMS mark — a turquoise chat bubble with offline arrows,
 * drawn from scratch so we don't ship any third-party brand assets.
 */
const Logo: React.FC<Props> = ({ size = 96, showWordmark = false, tint = colors.primary }) => {
  return (
    <View style={styles.row}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M20 20 H72 a8 8 0 0 1 8 8 v32 a8 8 0 0 1 -8 8 H42 l-12 12 v-12 h-2 a8 8 0 0 1 -8 -8 V28 a8 8 0 0 1 8 -8 z"
          fill={tint}
        />
        <Circle cx="38" cy="46" r="4" fill="#fff" />
        <Circle cx="50" cy="46" r="4" fill="#fff" />
        <Circle cx="62" cy="46" r="4" fill="#fff" />
      </Svg>
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
