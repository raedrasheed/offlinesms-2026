import React, { useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { Timestamp } from 'firebase/firestore';
import { colors, radius, spacing } from '@/theme';
import { MessageStatus } from '@/types/models';

interface Props {
  text: string;
  outgoing: boolean;
  createdAt?: Timestamp | null;
  status?: MessageStatus;
  showSenderName?: string;
  onDelete?: () => void;
  /** Triggered when the user swipes the bubble to the right past the
   *  reply threshold. The screen is expected to populate the composer
   *  reply preview. */
  onReply?: () => void;
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

const MessageBubble: React.FC<Props> = ({
  text,
  outgoing,
  createdAt,
  status,
  showSenderName,
  onDelete,
  onReply,
}) => {
  const [pressed, setPressed] = useState(false);
  const swipeRef = useRef<Swipeable>(null);

  const copy = async () => {
    await Clipboard.setStringAsync(text);
  };

  const onLongPress = () => {
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

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    // Swipeable fires `left` when the LEFT actions are revealed, which
    // happens on a swipe to the right — exactly the gesture we want.
    if (direction === 'left' && onReply) {
      onReply();
    }
    // Close immediately; we don't want a sticky reveal.
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
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    marginVertical: 3,
    flexDirection: 'row',
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
  incoming: {
    backgroundColor: colors.bubbleIncoming,
  },
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
