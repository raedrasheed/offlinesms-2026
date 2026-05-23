import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import { PinIcon, MuteIcon, DoubleCheckIcon } from './Icons';
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
  online?: boolean;
  /** Prefix the preview with a read double-tick (last message was ours). */
  sentByMe?: boolean;
  /** Replace the preview with an italic "Typing…" label. */
  typing?: boolean;
  /** Seed for the deterministic avatar color (uid or id). */
  colorSeed?: string;
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
  online = false,
  sentByMe = false,
  typing = false,
  colorSeed,
  onPress,
  onLongPress,
}) => {
  const hasUnread = unread > 0;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      android_ripple={{ color: colors.pressedTint }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar
        uri={photoURL ?? undefined}
        name={title}
        size={56}
        online={online}
        colorSeed={colorSeed}
      />

      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {typing ? (
          <Text style={styles.typing} numberOfLines={1}>
            Typing…
          </Text>
        ) : (
          <View style={styles.previewRow}>
            {sentByMe && !hasUnread && (
              <View style={styles.tick}>
                <DoubleCheckIcon size={16} color={colors.tickRead} />
              </View>
            )}
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle || 'No messages yet'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        <Text style={[styles.time, hasUnread && styles.timeActive]}>
          {formatChatTime(time)}
        </Text>
        <View style={styles.rightBottom}>
          {muted && <MuteIcon size={16} color={colors.textMuted} />}
          {hasUnread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          ) : pinned && !muted ? (
            <PinIcon size={13} color={colors.textMuted} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  rowPressed: { backgroundColor: colors.pressedTint },
  middle: { flex: 1, marginHorizontal: spacing.md, justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  previewRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  tick: { marginRight: 4 },
  subtitle: { flex: 1, fontSize: 15, color: colors.textSecondary },
  typing: {
    fontSize: 15,
    color: colors.primary,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 3,
  },
  right: { alignItems: 'flex-end', minWidth: 56, gap: 8 },
  rightBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 24,
  },
  time: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  timeActive: { color: colors.primary, fontWeight: '700' },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

export default ChatListItem;
