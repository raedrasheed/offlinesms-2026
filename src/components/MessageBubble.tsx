import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

const MessageBubble: React.FC<Props> = ({
  text,
  outgoing,
  createdAt,
  status,
  showSenderName,
  onDelete,
}) => {
  const [pressed, setPressed] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(text);
  };

  const onLongPress = () => {
    const canDelete = !!onDelete && outgoing;
    const options = canDelete ? ['Copy', 'Delete', 'Cancel'] : ['Copy', 'Cancel'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: canDelete ? 1 : undefined,
          cancelButtonIndex: options.length - 1,
        },
        (index) => {
          if (index === 0) copy();
          if (canDelete && index === 1) onDelete?.();
        },
      );
      return;
    }

    Alert.alert('Message', text.length > 80 ? text.slice(0, 77) + '…' : text, [
      { text: 'Copy', onPress: copy },
      ...(canDelete
        ? [{ text: 'Delete', style: 'destructive' as const, onPress: onDelete }]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <View
      style={[
        styles.row,
        { justifyContent: outgoing ? 'flex-end' : 'flex-start' },
      ]}
    >
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
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    marginVertical: 3,
    flexDirection: 'row',
  },
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
});

export default MessageBubble;
