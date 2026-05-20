import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { Timestamp } from 'firebase/firestore';
import { useRef } from 'react';
import ReplyPreviewBar from './ReplyPreviewBar';
import ReactionStrip, { DEFAULT_REACTIONS, ReactionAnchor } from './ReactionStrip';
import ReactionChips from './ReactionChips';
import { colors, radius, spacing } from '@/theme';
import { MessageStatus, ReplyPreview } from '@/types/models';

interface Props {
  text: string;
  outgoing: boolean;
  createdAt?: Timestamp | null;
  status?: MessageStatus;
  showSenderName?: string;
  replyTo?: ReplyPreview | null;
  /** Aggregated reactions map. The viewer's own reaction is highlighted
   *  in both the chips below the bubble and the long-press strip. */
  reactions?: Record<string, string[]>;
  /** The viewing user's uid — needed to know which chip to highlight
   *  and which emoji is pre-selected in the strip. */
  viewerUid?: string;
  onDelete?: () => void;
  onReply?: () => void;
  /** Called when the viewer picks an emoji from the long-press strip
   *  OR taps an existing reaction chip below the bubble. */
  onReact?: (emoji: string) => void;
}

const formatTime = (ts?: Timestamp | null) =>
  ts ? ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

const StatusTicks: React.FC<{ status?: MessageStatus }> = ({ status }) => {
  if (!status) return null;
  if (status === 'sending') return <Text style={styles.tick}>⏳</Text>;
  if (status === 'sent') return <Text style={styles.tick}>✓</Text>;
  if (status === 'delivered') return <Text style={styles.tick}>✓✓</Text>;
  return <Text style={[styles.tick, styles.tickRead]}>✓✓</Text>;
};

const ReplyHint: React.FC = () => (
  <View style={styles.replyHint}>
    <View style={styles.replyHintCircle}>
      <Text style={styles.replyHintGlyph}>↩</Text>
    </View>
  </View>
);

const findMyReaction = (
  reactions: Record<string, string[]> | undefined,
  viewerUid: string | undefined,
): string | null => {
  if (!reactions || !viewerUid) return null;
  for (const [emoji, uids] of Object.entries(reactions)) {
    if (uids?.includes(viewerUid)) return emoji;
  }
  return null;
};

const MessageBubble: React.FC<Props> = ({
  text,
  outgoing,
  createdAt,
  status,
  showSenderName,
  replyTo,
  reactions,
  viewerUid,
  onDelete,
  onReply,
  onReact,
}) => {
  const [pressed, setPressed] = useState(false);
  const [stripAnchor, setStripAnchor] = useState<ReactionAnchor | null>(null);
  const swipeRef = useRef<Swipeable>(null);
  const myReaction = findMyReaction(reactions, viewerUid);

  const copy = async () => {
    await Clipboard.setStringAsync(text);
  };

  const openActions = () => {
    const canDelete = !!onDelete && outgoing;
    const canReply = !!onReply;
    const options = [
      ...(canReply ? ['Reply'] : []),
      'Copy',
      ...(canDelete ? ['Delete'] : []),
      'Cancel',
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: canDelete ? options.indexOf('Delete') : undefined,
          cancelButtonIndex: options.length - 1,
        },
        (index) => {
          const label = options[index];
          if (label === 'Reply') onReply?.();
          if (label === 'Copy') copy();
          if (label === 'Delete') onDelete?.();
        },
      );
      return;
    }

    const buttons = [];
    if (canReply) buttons.push({ text: 'Reply', onPress: onReply });
    buttons.push({ text: 'Copy', onPress: copy });
    if (canDelete) {
      buttons.push({ text: 'Delete', style: 'destructive' as const, onPress: onDelete });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' as const });
    Alert.alert('Message', text.length > 80 ? text.slice(0, 77) + '…' : text, buttons);
  };

  const onLongPress = (e: GestureResponderEvent) => {
    if (onReact) {
      const { pageX, pageY } = e.nativeEvent;
      setStripAnchor({ x: pageX, y: pageY });
      return;
    }
    // No reactions wired — fall back to the actions sheet directly.
    openActions();
  };

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    if (direction === 'left' && onReply) onReply();
    swipeRef.current?.close();
  };

  const bubbleContent = (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={300}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.bubble,
        outgoing ? styles.outgoing : styles.incoming,
        outgoing ? styles.outgoingTail : styles.incomingTail,
        pressed && { opacity: 0.85 },
      ]}
    >
      {showSenderName && !outgoing && (
        <Text style={styles.senderName}>{showSenderName}</Text>
      )}
      {replyTo && <ReplyPreviewBar reply={replyTo} variant="inline" />}
      <Text style={styles.text}>{text}</Text>
      <View style={styles.meta}>
        <Text style={styles.time}>{formatTime(createdAt)}</Text>
        {outgoing && <StatusTicks status={status} />}
      </View>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.row,
        { justifyContent: outgoing ? 'flex-end' : 'flex-start' },
      ]}
    >
      <View
        style={[
          styles.column,
          { alignItems: outgoing ? 'flex-end' : 'flex-start' },
        ]}
      >
        {onReply ? (
          <Swipeable
            ref={swipeRef}
            renderLeftActions={() => <ReplyHint />}
            onSwipeableOpen={handleSwipeOpen}
            leftThreshold={48}
            friction={2}
            overshootLeft={false}
            containerStyle={styles.swipeable}
          >
            {bubbleContent}
          </Swipeable>
        ) : (
          bubbleContent
        )}

        <ReactionChips
          reactions={reactions}
          viewerUid={viewerUid}
          alignRight={outgoing}
          onPress={(emoji) => onReact?.(emoji)}
        />
      </View>

      <ReactionStrip
        visible={!!stripAnchor}
        anchor={stripAnchor}
        alignRight={outgoing}
        selected={myReaction ?? undefined}
        emojis={DEFAULT_REACTIONS}
        onSelect={(emoji) => onReact?.(emoji)}
        onMore={openActions}
        onDismiss={() => setStripAnchor(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    marginVertical: 3,
    flexDirection: 'row',
  },
  column: {
    flexShrink: 1,
    maxWidth: '85%',
  },
  swipeable: { flexShrink: 1 },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.bubble,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  outgoing: { backgroundColor: colors.bubbleOutgoing },
  incoming: { backgroundColor: colors.bubbleIncoming },
  outgoingTail: { borderBottomRightRadius: 4 },
  incomingTail: { borderBottomLeftRadius: 4 },
  text: { fontSize: 15, color: colors.textPrimary, lineHeight: 20 },
  senderName: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700',
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 2,
    gap: 4,
  },
  time: { fontSize: 10, color: colors.textMuted },
  tick: { fontSize: 11, color: colors.textMuted },
  tickRead: { color: '#34B7F1' },
  replyHint: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: spacing.md,
  },
  replyHintCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyHintGlyph: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default MessageBubble;
