import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { colors, radius, spacing } from '@/theme';
import { MessageStatus } from '@/types/models';

interface Props {
  text: string;
  outgoing: boolean;
  createdAt?: Timestamp | null;
  status?: MessageStatus;
  showSenderName?: string;
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
}) => {
  return (
    <View
      style={[
        styles.row,
        { justifyContent: outgoing ? 'flex-end' : 'flex-start' },
      ]}
    >
      <View
        style={[
          styles.bubble,
          outgoing ? styles.outgoing : styles.incoming,
          outgoing ? styles.outgoingTail : styles.incomingTail,
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
      </View>
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
  },
  outgoing: { backgroundColor: colors.bubbleOutgoing },
  incoming: {
    backgroundColor: colors.bubbleIncoming,
    borderWidth: 1,
    borderColor: colors.border,
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
  tickRead: { color: colors.info },
});

export default MessageBubble;
