import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { colors, spacing } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { ChatService } from '@/services/chatService';
import { UserProfile } from '@/types/models';
import { AppStackParamList, MainTabParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Contacts'>,
  NativeStackScreenProps<AppStackParamList>
>;

const ContactsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
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
    navigation.navigate('ChatDetails', {
      chatId,
      title: other.displayName,
      photoURL: other.photoURL ?? null,
    });
  };

  if (!users) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="OfflineSMS" subtitle="Contacts" />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search contacts" />
      {filtered.length === 0 ? (
        <EmptyState
          title="No contacts found"
          message="Invite friends to OfflineSMS to start chatting."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.uid}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => startChat(item)}>
              <Avatar uri={item.photoURL ?? undefined} name={item.displayName} size={48} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.name}>{item.displayName}</Text>
                <Text style={styles.about} numberOfLines={1}>
                  {item.about || item.phoneNumber}
                </Text>
              </View>
              <Text style={styles.chatHint}>Chat ›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 76 },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  about: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chatHint: { color: colors.primary, fontWeight: '600' },
});

export default ContactsScreen;
