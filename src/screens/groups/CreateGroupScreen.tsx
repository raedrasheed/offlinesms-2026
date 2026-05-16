import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import { colors, spacing } from '@/theme';
import { UserService } from '@/services/userService';
import { GroupService } from '@/services/groupService';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/models';
import { AppStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateGroup'>;

const CreateGroupScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    UserService.listAllUsers(user.uid).then(setUsers);
  }, [user]);

  const toggle = (uid: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });

  const create = async () => {
    if (!user) return;
    if (name.trim().length < 2) return Alert.alert('Name required', 'Give the group a name.');
    if (selected.size === 0) return Alert.alert('Add members', 'Select at least one member.');
    try {
      setCreating(true);
      const members = [user.uid, ...Array.from(selected)];
      const id = await GroupService.createGroup({
        name: name.trim(),
        members,
        createdBy: user.uid,
      });
      navigation.replace('GroupChat', { groupId: id, title: name.trim() });
    } catch (e: any) {
      Alert.alert('Could not create group', e?.message ?? '');
    } finally {
      setCreating(false);
    }
  };

  if (!users) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="New group"
        leftIcon={<Text style={styles.close}>✕</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <View style={{ padding: spacing.lg }}>
        <Input label="Group name" value={name} onChangeText={setName} placeholder="Team OfflineSMS" />
        <Text style={styles.section}>
          Add members {selected.size > 0 ? `(${selected.size})` : ''}
        </Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(u) => u.uid}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.uid);
          return (
            <TouchableOpacity style={styles.row} onPress={() => toggle(item.uid)}>
              <Avatar uri={item.photoURL ?? undefined} name={item.displayName} size={44} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.name}>{item.displayName}</Text>
                <Text style={styles.about} numberOfLines={1}>
                  {item.about || item.phoneNumber}
                </Text>
              </View>
              <View style={[styles.check, isSelected && styles.checkActive]}>
                {isSelected && <Text style={{ color: '#fff' }}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <View style={{ padding: spacing.lg }}>
        <Button title="Create group" fullWidth loading={creating} onPress={create} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  close: { color: '#fff', fontSize: 22, fontWeight: '700' },
  section: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 72 },
  name: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  about: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});

export default CreateGroupScreen;
