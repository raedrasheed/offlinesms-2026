import React from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radii } from '@/theme';

/** Default 6-emoji palette for OfflineSMS reactions. */
export const DEFAULT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

export interface ReactionAnchor {
  /** Screen-coordinate page X of the long-press touch. */
  x: number;
  /** Screen-coordinate page Y of the long-press touch. */
  y: number;
}

interface Props {
  visible: boolean;
  anchor: ReactionAnchor | null;
  /** Aligns the strip to the right of the anchor (for outgoing bubbles). */
  alignRight?: boolean;
  /** Currently selected emoji, if the viewer already reacted. */
  selected?: string | null;
  emojis?: readonly string[];
  onSelect: (emoji: string) => void;
  /** Optional "More actions" handler (Reply/Copy/Delete). */
  onMore?: () => void;
  onDismiss: () => void;
}

const EMOJI_BUTTON_SIZE = 44;
const STRIP_VERTICAL_PADDING = 6;
const STRIP_HORIZONTAL_PADDING = 8;
const GAP_BETWEEN_BUTTONS = 4;
const SAFE_TOP_INSET = 80;

const ReactionStrip: React.FC<Props> = ({
  visible,
  anchor,
  alignRight = false,
  selected,
  emojis = DEFAULT_REACTIONS,
  onSelect,
  onMore,
  onDismiss,
}) => {
  if (!visible || !anchor) return null;

  const buttonCount = emojis.length + (onMore ? 1 : 0);
  const stripWidth =
    buttonCount * EMOJI_BUTTON_SIZE +
    (buttonCount - 1) * GAP_BETWEEN_BUTTONS +
    STRIP_HORIZONTAL_PADDING * 2;
  const stripHeight = EMOJI_BUTTON_SIZE + STRIP_VERTICAL_PADDING * 2;

  const { width: screenW, height: screenH } = Dimensions.get('window');

  // Position above the touch by default; flip below if it would clip the
  // top of the screen.
  let top = anchor.y - stripHeight - 12;
  if (top < SAFE_TOP_INSET) top = anchor.y + 16;
  top = Math.min(top, screenH - stripHeight - 16);

  let left = alignRight ? anchor.x - stripWidth + 24 : anchor.x - 24;
  left = Math.max(8, Math.min(left, screenW - stripWidth - 8));

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        {/* The inner Pressable absorbs taps so the backdrop doesn't dismiss
            when the user is interacting with the strip itself. */}
        <Pressable
          onPress={() => {}}
          style={[
            styles.strip,
            { top, left, width: stripWidth, height: stripHeight },
          ]}
        >
          {emojis.map((e) => {
            const isSelected = e === selected;
            return (
              <TouchableOpacity
                key={e}
                onPress={() => {
                  onSelect(e);
                  onDismiss();
                }}
                style={[styles.btn, isSelected && styles.btnSelected]}
                hitSlop={4}
                accessibilityLabel={`React with ${e}`}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            );
          })}
          {onMore && (
            <TouchableOpacity
              onPress={() => {
                onDismiss();
                onMore();
              }}
              style={styles.btn}
              hitSlop={4}
              accessibilityLabel="More actions"
            >
              <Text style={styles.more}>•••</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  strip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    paddingHorizontal: STRIP_HORIZONTAL_PADDING,
    paddingVertical: STRIP_VERTICAL_PADDING,
    gap: GAP_BETWEEN_BUTTONS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  btn: {
    width: EMOJI_BUTTON_SIZE,
    height: EMOJI_BUTTON_SIZE,
    borderRadius: EMOJI_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSelected: { backgroundColor: colors.primarySoft },
  emoji: { fontSize: 26 },
  more: { fontSize: 18, color: colors.textSecondary, fontWeight: '700', marginTop: -4 },
});

export default ReactionStrip;
