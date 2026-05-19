import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import ChatListItem from '@/components/ChatListItem';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { colors, shadow, spacing } from '@/theme';
import { ChatService } from '@/services/chatService';
import { UserService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Chat, UserProfile } from '@/types/models';
import { AppStackParamList, MainTabParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chats'>,
  NativeStackScreenProps<AppStackParamList>
>;

const ChatsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = ChatService.listenToUserChats(user.uid, setChats);
    return unsub;
  }, [user]);

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

  const filtered = useMemo(() => {
    if (!chats || !user) return [];
    return chats.filter((c) => {
      const other = c.members.find((m) => m !== user.uid);
      const name = other ? profiles[other]?.displayName ?? '' : '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [chats, profiles, searchTerm, user]);

  if (!chats) return <Loader />;

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

      {filtered.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          message="Tap the + button to start a chat with one of your contacts."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => {
            const otherId = item.members.find((m) => m !== user?.uid) ?? '';
            const other = profiles[otherId];
            return (
              <ChatListItem
                title={other?.displayName ?? 'OfflineSMS user'}
                subtitle={item.lastMessage ?? ''}
                photoURL={other?.photoURL ?? null}
                time={item.lastMessageAt ?? null}
                unread={user ? item.unread?.[user.uid] ?? 0 : 0}
                onPress={() =>
                  navigation.navigate('ChatDetails', {
                    chatId: item.id,
                    title: other?.displayName ?? 'Chat',
                    photoURL: other?.photoURL ?? null,
                    otherUid: otherId,
                  })
                }
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
});

export default ChatsScreen;
