import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { colors } from '@/theme';

/**
 * Subtle background pattern for the chat thread — a sparse, tiled
 * arrangement of small geometric glyphs at very low opacity so the
 * messages stay legible.
 */
const Wallpaper: React.FC = () => {
  // Pre-compute a deterministic set of tile positions so the pattern
  // never reflows. 6 columns × 10 rows of small shapes.
  const tiles = useMemo(() => {
    const out: { x: number; y: number; rot: number; kind: 'dot' | 'tri' | 'sq' }[] = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 6; c++) {
        const x = c * 60 + (r % 2 === 0 ? 0 : 30);
        const y = r * 60 + 20;
        const kind = (['dot', 'tri', 'sq'] as const)[(r + c) % 3];
        out.push({ x, y, rot: (r * 17 + c * 23) % 360, kind });
      }
    }
    return out;
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice">
        <G opacity={0.06}>
          {tiles.map((t, i) => {
            if (t.kind === 'dot') {
              return (
                <Path
                  key={i}
                  d={`M ${t.x} ${t.y} m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
                  fill={colors.textPrimary}
                />
              );
            }
            if (t.kind === 'tri') {
              return (
                <Path
                  key={i}
                  d={`M ${t.x} ${t.y - 4} L ${t.x + 4} ${t.y + 3} L ${t.x - 4} ${t.y + 3} Z`}
                  fill={colors.textPrimary}
                  transform={`rotate(${t.rot} ${t.x} ${t.y})`}
                />
              );
            }
            return (
              <Path
                key={i}
                d={`M ${t.x - 3} ${t.y - 3} h 6 v 6 h -6 z`}
                fill={colors.textPrimary}
                transform={`rotate(${t.rot} ${t.x} ${t.y})`}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default Wallpaper;
