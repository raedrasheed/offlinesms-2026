import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import { colors, spacing } from '@/theme';
import { UserService } from '@/services/userService';
import { ChatService } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/models';
import { AppStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'NewChat'>;

const NewChatScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    UserService.listAllUsers(user.uid).then(setUsers).catch(() => setUsers([]));
  }, [user]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(q) || u.phoneNumber?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const startChat = async (other: UserProfile) => {
    if (!user) return;
    const chatId = await ChatService.getOrCreateOneToOneChat(user.uid, other.uid);
    navigation.replace('ChatDetails', {
      chatId,
      title: other.displayName,
      photoURL: other.photoURL ?? null,
    });
  };

  if (!users) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="New chat"
        leftIcon={<Text style={styles.close}>✕</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search users" />
      {filtered.length === 0 ? (
        <EmptyState
          title="No users yet"
          message="As more people join OfflineSMS, they'll appear here."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.uid}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => startChat(item)}>
              <Avatar uri={item.photoURL ?? undefined} name={item.displayName} size={48} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={styles.name}>{item.displayName}</Text>
                <Text style={styles.about} numberOfLines={1}>
                  {item.about || item.phoneNumber}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  close: { color: '#fff', fontSize: 22, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 76 },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  about: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});

export default NewChatScreen;
