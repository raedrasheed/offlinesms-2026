import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Timestamp } from 'firebase/firestore';
import ChatListItem from '@/components/ChatListItem';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { CameraIcon, SearchIcon, ComposeIcon } from '@/components/Icons';
import { colors, radii, shadow, spacing, typography } from '@/theme';
import { UserService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { useGroups } from '@/hooks/useGroups';
import { useChatActions } from '@/hooks/useChatActions';
import { isOnline } from '@/utils/presence';
import { Chat, Group, UserProfile } from '@/types/models';
import { AppStackParamList, MainTabParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chats'>,
  NativeStackScreenProps<AppStackParamList>
>;

type Filter = 'all' | 'unread' | 'favorites' | 'groups';

interface Conversation {
  id: string;
  isGroup: boolean;
  title: string;
  photoURL: string | null;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  unread: number;
  pinned: boolean;
  muted: boolean;
  online: boolean;
  sentByMe: boolean;
  colorSeed: string;
  peerUid?: string;
  source: Chat | Group;
}

const ChatsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const chats = useChats(user?.uid);
  const groups = useGroups(user?.uid);
  const actions = useChatActions();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch peer profiles for 1:1 chats (name + avatar + presence).
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

  // Normalize 1:1 chats and groups into one comparable shape.
  const conversations = useMemo<Conversation[]>(() => {
    if (!user) return [];
    const out: Conversation[] = [];

    (chats ?? []).forEach((c) => {
      if (c.archivedBy?.includes(user.uid)) return; // hide archived
      const peerUid = c.members.find((m) => m !== user.uid) ?? '';
      const peer = profiles[peerUid];
      out.push({
        id: c.id,
        isGroup: false,
        title: peer?.displayName ?? 'OfflineSMS user',
        photoURL: peer?.photoURL ?? null,
        lastMessage: c.lastMessage ?? '',
        lastMessageAt: c.lastMessageAt ?? null,
        unread: c.unread?.[user.uid] ?? 0,
        pinned: !!c.pinnedBy?.includes(user.uid),
        muted: !!c.mutedBy?.includes(user.uid),
        online: isOnline(peer?.lastSeen),
        sentByMe: c.lastMessageSenderId === user.uid,
        colorSeed: peerUid,
        peerUid,
        source: c,
      });
    });

    (groups ?? []).forEach((g) => {
      out.push({
        id: g.id,
        isGroup: true,
        title: g.name,
        photoURL: g.photoURL ?? null,
        lastMessage: g.lastMessage ?? '',
        lastMessageAt: g.lastMessageAt ?? null,
        // Groups don't track per-user unread in the current data model.
        unread: 0,
        pinned: !!g.pinnedBy?.includes(user.uid),
        muted: !!g.mutedBy?.includes(user.uid),
        online: false,
        sentByMe: false,
        colorSeed: g.id,
        source: g,
      });
    });

    out.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const at = a.lastMessageAt?.toMillis?.() ?? 0;
      const bt = b.lastMessageAt?.toMillis?.() ?? 0;
      return bt - at;
    });
    return out;
  }, [chats, groups, profiles, user]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations],
  );

  const visible = useMemo(() => {
    let list = conversations;
    if (filter === 'unread') list = list.filter((c) => c.unread > 0);
    else if (filter === 'favorites') list = list.filter((c) => c.pinned);
    else if (filter === 'groups') list = list.filter((c) => c.isGroup);

    const q = searchTerm.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q),
      );
    }
    return list;
  }, [conversations, filter, searchTerm]);

  const openConversation = (c: Conversation) => {
    if (c.isGroup) {
      navigation.navigate('GroupChat', {
        groupId: c.id,
        title: c.title,
        photoURL: c.photoURL,
      });
    } else {
      navigation.navigate('ChatDetails', {
        chatId: c.id,
        title: c.title,
        photoURL: c.photoURL,
        otherUid: c.peerUid,
      });
    }
  };

  const openLongPressMenu = (c: Conversation) => {
    const buttons: any[] = [
      {
        text: c.pinned ? 'Unpin' : 'Pin',
        onPress: () => actions.pin(c.source as any, !c.pinned).catch(() => {}),
      },
      {
        text: c.muted ? 'Unmute' : 'Mute notifications',
        onPress: () => actions.mute(c.source as any, !c.muted).catch(() => {}),
      },
    ];
    if (!c.isGroup) {
      buttons.push({
        text: 'Archive',
        onPress: () => actions.archive(c.source as Chat, true).catch(() => {}),
      });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(c.title, undefined, buttons);
  };

  if (!chats || !groups) return <Loader />;

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread', count: totalUnread },
    { key: 'favorites', label: 'Favorites' },
    { key: 'groups', label: 'Groups' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <CameraIcon size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => {
              setSearchOpen((v) => {
                if (v) setSearchTerm('');
                return !v;
              });
            }}
          >
            <SearchIcon size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {searchOpen && (
        <View style={styles.searchWrap}>
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoFocus
            autoCapitalize="none"
          />
        </View>
      )}

      {/* Filter pills */}
      <View style={styles.pillsRow}>
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.8}
              onPress={() => setFilter(f.key)}
              style={[styles.pill, active ? styles.pillActive : styles.pillIdle]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {f.label}
              </Text>
              {f.key === 'unread' && (f.count ?? 0) > 0 && (
                <View style={[styles.pillBadge, active && styles.pillBadgeActive]}>
                  <Text style={[styles.pillBadgeText, active && styles.pillBadgeTextActive]}>
                    {f.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {visible.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? 'No conversations yet' : 'Nothing here'}
          message={
            filter === 'all'
              ? 'Tap the compose button to start a chat.'
              : 'No conversations match this filter.'
          }
        />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(c) => (c.isGroup ? `g-${c.id}` : `c-${c.id}`)}
          contentContainerStyle={{ paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <ChatListItem
              title={item.title}
              subtitle={item.lastMessage}
              photoURL={item.photoURL}
              time={item.lastMessageAt}
              unread={item.unread}
              pinned={item.pinned}
              muted={item.muted}
              online={item.online}
              sentByMe={item.sentByMe}
              colorSeed={item.colorSeed}
              onPress={() => openConversation(item)}
              onLongPress={() => openLongPressMenu(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('NewChat')}
        style={[styles.fab, shadow.fab, { bottom: spacing.xl + insets.bottom }]}
      >
        <ComposeIcon size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: { ...typography.display, color: colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  searchWrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  searchInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    ...shadow.card,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 6,
  },
  pillActive: { backgroundColor: colors.primaryDark },
  pillIdle: { backgroundColor: colors.surfaceElevated, ...shadow.card },
  pillText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  pillTextActive: { color: colors.textOnPrimary },
  pillBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadgeActive: { backgroundColor: colors.surfaceElevated },
  pillBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pillBadgeTextActive: { color: colors.primaryDark },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 88 },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatsScreen;
