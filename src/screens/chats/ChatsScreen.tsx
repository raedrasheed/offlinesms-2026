import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import ChatListItem from '@/components/ChatListItem';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { ArchiveIcon } from '@/components/Icons';
import { colors, shadow, spacing } from '@/theme';
import { UserService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { useChatActions } from '@/hooks/useChatActions';
import { isOnline } from '@/utils/presence';
import { Chat, UserProfile } from '@/types/models';
import { AppStackParamList, MainTabParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chats'>,
  NativeStackScreenProps<AppStackParamList>
>;

type Row =
  | { kind: 'chat'; chat: Chat }
  | { kind: 'section'; id: string; label: string };

const ChatsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const chats = useChats(user?.uid);
  const actions = useChatActions();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Fetch peer profiles for display (name + avatar). Profiles are cached
  // across renders so repeated chats with the same user don't re-fetch.
  useEffect(() => {
    if (!user || !chats) return;
    const otherIds = new Set<string>();
    chats.forEach((c) => c.members.forEach((m) => m !== user.uid && otherIds.add(m)));
    otherIds.forEach(async (uid) => {
      if (!profiles[uid]) {
        const p = await UserService.getProfile(uid);
        if (p) setProfiles((prev) => ({ ...prev, [uid]: p }));
      }
    });
  }, [chats, user, profiles]);

  // Split into active vs archived, then filter by search term.
  const { active, archived } = useMemo(() => {
    if (!chats || !user) return { active: [] as Chat[], archived: [] as Chat[] };
    const q = searchTerm.toLowerCase().trim();
    const matches = (c: Chat) => {
      if (!q) return true;
      const other = c.members.find((m) => m !== user.uid) ?? '';
      const name = profiles[other]?.displayName ?? '';
      const last = c.lastMessage ?? '';
      return name.toLowerCase().includes(q) || last.toLowerCase().includes(q);
    };
    const isArchived = (c: Chat) => !!c.archivedBy?.includes(user.uid);
    return {
      active: chats.filter((c) => !isArchived(c)).filter(matches),
      archived: chats.filter(isArchived).filter(matches),
    };
  }, [chats, profiles, searchTerm, user]);

  // Build a single rendering list: optional archived banner, then active.
  // When the banner is tapped the archived chats expand inline below the
  // active list.
  const rows = useMemo<Row[]>(() => {
    const list: Row[] = [];
    if (archived.length > 0) {
      list.push({ kind: 'section', id: '__archived_banner', label: `Archived (${archived.length})` });
      if (showArchived) {
        archived.forEach((c) => list.push({ kind: 'chat', chat: c }));
      }
    }
    active.forEach((c) => list.push({ kind: 'chat', chat: c }));
    return list;
  }, [active, archived, showArchived]);

  const otherIdFor = (chat: Chat) => chat.members.find((m) => m !== user?.uid) ?? '';

  const openLongPressMenu = (chat: Chat, title: string) => {
    const isPinned = actions.isPinned(chat);
    const isMuted = actions.isMuted(chat);
    const isArchived = actions.isArchived(chat);
    Alert.alert(title, undefined, [
      {
        text: isPinned ? 'Unpin' : 'Pin',
        onPress: () => actions.pin(chat, !isPinned).catch(() => {}),
      },
      {
        text: isMuted ? 'Unmute' : 'Mute notifications',
        onPress: () => actions.mute(chat, !isMuted).catch(() => {}),
      },
      {
        text: isArchived ? 'Unarchive' : 'Archive',
        onPress: () => actions.archive(chat, !isArchived).catch(() => {}),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (!chats) return <Loader />;

  const totalRendered = active.length + archived.length;

  return (
    <View style={styles.container}>
      <Header
        title="OfflineSMS"
        subtitle="Chats"
        rightAccessory={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Text style={styles.headerIcon}>🔍</Text>
            <Text style={styles.headerIcon}>⋮</Text>
          </View>
        }
      />
      <SearchBar value={searchTerm} onChangeText={setSearchTerm} placeholder="Search chats" />

      {totalRendered === 0 ? (
        <EmptyState
          title="No conversations yet"
          message="Tap the + button to start a chat with one of your contacts."
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => (r.kind === 'chat' ? r.chat.id : r.id)}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => {
            if (item.kind === 'section') {
              return (
                <TouchableOpacity
                  style={styles.archivedBanner}
                  onPress={() => setShowArchived((v) => !v)}
                  activeOpacity={0.7}
                >
                  <View style={styles.archivedIcon}>
                    <ArchiveIcon size={18} color={colors.textSecondary} />
                  </View>
                  <Text style={styles.archivedLabel}>{item.label}</Text>
                  <Text style={styles.archivedChevron}>{showArchived ? '⌃' : '⌄'}</Text>
                </TouchableOpacity>
              );
            }
            const { chat } = item;
            const other = profiles[otherIdFor(chat)];
            const title = other?.displayName ?? 'OfflineSMS user';
            return (
              <ChatListItem
                title={title}
                subtitle={chat.lastMessage ?? ''}
                photoURL={other?.photoURL ?? null}
                time={chat.lastMessageAt ?? null}
                unread={user ? chat.unread?.[user.uid] ?? 0 : 0}
                pinned={actions.isPinned(chat)}
                muted={actions.isMuted(chat)}
                online={isOnline(other?.lastSeen)}
                onPress={() =>
                  navigation.navigate('ChatDetails', {
                    chatId: chat.id,
                    title,
                    photoURL: other?.photoURL ?? null,
                    otherUid: otherIdFor(chat),
                  })
                }
                onLongPress={() => openLongPressMenu(chat, title)}
              />
            );
          }}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('NewChat')}
        style={[styles.fab, shadow.fab, { bottom: spacing.xl + insets.bottom }]}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 80 },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: -2 },
  headerIcon: { color: '#fff', fontSize: 18, paddingHorizontal: 4 },
  archivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  archivedIcon: { width: 36, alignItems: 'center' },
  archivedLabel: { flex: 1, marginLeft: spacing.sm, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  archivedChevron: { fontSize: 18, color: colors.textMuted, fontWeight: '700' },
});

export default ChatsScreen;
