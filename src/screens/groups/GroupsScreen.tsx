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
import { GroupService } from '@/services/groupService';
import { useAuth } from '@/hooks/useAuth';
import { Group } from '@/types/models';
import { AppStackParamList, MainTabParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Groups'>,
  NativeStackScreenProps<AppStackParamList>
>;

const GroupsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    return GroupService.listenToUserGroups(user.uid, setGroups);
  }, [user]);

  const filtered = useMemo(() => {
    if (!groups) return [];
    return groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  }, [groups, search]);

  if (!groups) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="OfflineSMS" subtitle="Groups" />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search groups" />
      {filtered.length === 0 ? (
        <EmptyState
          title="No groups yet"
          message="Tap the + button to create a group and invite members."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.id}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <ChatListItem
              title={item.name}
              subtitle={item.lastMessage ?? `${item.members.length} members`}
              photoURL={item.photoURL ?? null}
              time={item.lastMessageAt ?? null}
              onPress={() =>
                navigation.navigate('GroupChat', {
                  groupId: item.id,
                  title: item.name,
                  photoURL: item.photoURL ?? null,
                })
              }
            />
          )}
        />
      )}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CreateGroup')}
        style={[styles.fab, shadow.fab, { bottom: spacing.xl + insets.bottom }]}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default GroupsScreen;
