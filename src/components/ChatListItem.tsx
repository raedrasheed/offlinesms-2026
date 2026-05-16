import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Avatar from './Avatar';
import { colors, radius, spacing } from '@/theme';
import { formatChatTime } from '@/services/chatService';
import { Timestamp } from 'firebase/firestore';

interface Props {
  title: string;
  subtitle: string;
  photoURL?: string | null;
  time?: Timestamp | null;
  unread?: number;
  onPress: () => void;
}

const ChatListItem: React.FC<Props> = ({
  title,
  subtitle,
  photoURL,
  time,
  unread = 0,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <Avatar uri={photoURL ?? undefined} name={title} size={52} />
      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle || 'No messages yet'}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.time, unread > 0 && styles.timeActive]}>
          {formatChatTime(time)}
        </Text>
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  middle: { flex: 1, marginHorizontal: spacing.md },
  title: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', minWidth: 50 },
  time: { fontSize: 12, color: colors.textMuted },
  timeActive: { color: colors.primary, fontWeight: '600' },
  badge: {
    marginTop: 6,
    backgroundColor: colors.unreadBadge,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

export default ChatListItem;
