import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from '@/theme';

interface Props {
  reactions?: Record<string, string[]>;
  /** Used to highlight the chip the viewer reacted with and to gate
   *  the tap handler. */
  viewerUid?: string;
  /** Align the row to the right (under outgoing bubbles) or left (under
   *  incoming bubbles). */
  alignRight?: boolean;
  /** Tap a chip to toggle the viewer's reaction on that emoji. */
  onPress?: (emoji: string) => void;
}

const ReactionChips: React.FC<Props> = ({
  reactions,
  viewerUid,
  alignRight = false,
  onPress,
}) => {
  if (!reactions) return null;
  const entries = Object.entries(reactions).filter(([, uids]) => uids && uids.length > 0);
  if (entries.length === 0) return null;

  // Most-reacted emoji first; stable order for the rest.
  entries.sort((a, b) => b[1].length - a[1].length);

  return (
    <View
      style={[
        styles.row,
        { justifyContent: alignRight ? 'flex-end' : 'flex-start' },
      ]}
    >
      {entries.map(([emoji, uids]) => {
        const mine = !!viewerUid && uids.includes(viewerUid);
        return (
          <TouchableOpacity
            key={emoji}
            activeOpacity={0.7}
            onPress={() => onPress?.(emoji)}
            style={[styles.chip, mine && styles.chipMine]}
            hitSlop={4}
            accessibilityLabel={`Reaction ${emoji} ${uids.length}`}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            {uids.length > 1 && (
              <Text style={[styles.count, mine && styles.countMine]}>
                {uids.length}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: -6, // sit just under the bubble's tail
    marginBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  chipMine: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryLight,
  },
  emoji: { fontSize: 14 },
  count: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginLeft: 3 },
  countMine: { color: colors.primaryDark },
});

export default ReactionChips;
