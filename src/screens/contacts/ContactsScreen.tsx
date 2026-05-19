import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import { colors, spacing } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { UserService, normalizePhoneTail } from '@/services/userService';
import { ChatService } from '@/services/chatService';
import { UserProfile } from '@/types/models';
import { AppStackParamList, MainTabParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Contacts'>,
  NativeStackScreenProps<AppStackParamList>
>;

interface DeviceContact {
  id: string;
  name: string;
  phone: string;
  appUser?: UserProfile;
}

type PermissionState = 'pending' | 'granted' | 'denied';

const ContactsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const { user } = useAuth();
  const [permission, setPermission] = useState<PermissionState>('pending');
  const [contacts, setContacts] = useState<DeviceContact[] | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      await loadContacts();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadContacts = async () => {
    if (!user) return;
    const [deviceResult, appUsers] = await Promise.all([
      Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
      }),
      UserService.listAllUsers(user.uid),
    ]);

    const usersByPhoneTail = new Map<string, UserProfile>();
    appUsers.forEach((u) => {
      const tail = normalizePhoneTail(u.phoneNumber);
      if (tail) usersByPhoneTail.set(tail, u);
    });

    const flat: DeviceContact[] = [];
    for (const c of deviceResult.data) {
      const phones = c.phoneNumbers ?? [];
      if (!phones.length) continue;
      const phone = phones[0].number ?? '';
      flat.push({
        id: c.id ?? `${c.name}-${phone}`,
        name: c.name ?? phone,
        phone,
        appUser: usersByPhoneTail.get(normalizePhoneTail(phone)),
      });
    }
    flat.sort((a, b) => {
      // App users first, then alphabetical
      if (!!a.appUser !== !!b.appUser) return a.appUser ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    setContacts(flat);
  };

  const filtered = useMemo(() => {
    if (!contacts) return [];
    const q = search.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [contacts, search]);

  const startChat = async (contact: DeviceContact) => {
    if (!user) return;
    if (!contact.appUser) {
      Alert.alert(
        `${contact.name} is not on OfflineSMS`,
        'Invite them to join and you can start chatting.',
      );
      return;
    }
    const chatId = await ChatService.getOrCreateOneToOneChat(user.uid, contact.appUser.uid);
    navigation.navigate('ChatDetails', {
      chatId,
      title: contact.appUser.displayName || contact.name,
      photoURL: contact.appUser.photoURL ?? null,
    });
  };

  if (permission === 'pending') return <Loader />;

  if (permission === 'denied') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="OfflineSMS" subtitle="Contacts" />
        <View style={styles.permWrapper}>
          <EmptyState
            title="Contacts permission needed"
            message="OfflineSMS uses your phone contacts to find friends already on the app. Grant access in system settings."
          />
          <Button
            title="Open Settings"
            onPress={() => Linking.openSettings()}
            fullWidth
          />
        </View>
      </View>
    );
  }

  if (!contacts) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="OfflineSMS" subtitle="Contacts" />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search contacts" />
      {filtered.length === 0 ? (
        <EmptyState
          title="No contacts found"
          message={
            contacts.length === 0
              ? "Your phone's address book is empty."
              : 'No contacts match your search.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => {
            const onApp = !!item.appUser;
            return (
              <TouchableOpacity style={styles.row} onPress={() => startChat(item)}>
                <Avatar
                  uri={item.appUser?.photoURL ?? undefined}
                  name={item.appUser?.displayName || item.name}
                  size={48}
                />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.name}>
                    {item.appUser?.displayName || item.name}
                  </Text>
                  <Text style={styles.about} numberOfLines={1}>
                    {onApp ? (item.appUser!.about || item.phone) : item.phone}
                  </Text>
                </View>
                <Text style={[styles.action, onApp ? styles.actionChat : styles.actionInvite]}>
                  {onApp ? 'Chat ›' : 'Invite'}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  permWrapper: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 76 },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  about: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  action: { fontWeight: '600', fontSize: 13 },
  actionChat: { color: colors.primary },
  actionInvite: { color: colors.textMuted },
});

export default ContactsScreen;
