import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import { PinIcon, MuteIcon } from './Icons';
import { colors, radii, spacing } from '@/theme';
import { formatChatTime } from '@/services/chatService';
import { Timestamp } from 'firebase/firestore';

interface Props {
  title: string;
  subtitle: string;
  photoURL?: string | null;
  time?: Timestamp | null;
  unread?: number;
  pinned?: boolean;
  muted?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const ChatListItem: React.FC<Props> = ({
  title,
  subtitle,
  photoURL,
  time,
  unread = 0,
  pinned = false,
  muted = false,
  onPress,
  onLongPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      android_ripple={{ color: colors.pressedTint }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar uri={photoURL ?? undefined} name={title} size={52} />
      <View style={styles.middle}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {muted && (
            <View style={styles.titleIcon}>
              <MuteIcon size={13} color={colors.textMuted} />
            </View>
          )}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle || 'No messages yet'}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.time, unread > 0 && styles.timeActive]}>
          {formatChatTime(time)}
        </Text>
        <View style={styles.rightBottom}>
          {pinned && (
            <View style={styles.pinSlot}>
              <PinIcon size={12} color={colors.textMuted} />
            </View>
          )}
          {unread > 0 && (
            <View style={[styles.badge, muted && styles.badgeMuted]}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
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
  rowPressed: { backgroundColor: colors.pressedTint },
  middle: { flex: 1, marginHorizontal: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flexShrink: 1 },
  titleIcon: { marginLeft: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', minWidth: 50, gap: 4 },
  rightBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 22 },
  pinSlot: { opacity: 0.85 },
  time: { fontSize: 12, color: colors.textMuted },
  timeActive: { color: colors.primary, fontWeight: '600' },
  badge: {
    backgroundColor: colors.unreadBadge,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMuted: { backgroundColor: colors.textMuted },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

export default ChatListItem;
