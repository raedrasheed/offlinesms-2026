import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import { colors, spacing } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

interface Row {
  icon: string;
  label: string;
  hint?: string;
  onPress?: () => void;
  rightAccessory?: React.ReactNode;
}

const SettingsScreen: React.FC = () => {
  const { profile, logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [readReceipts, setReadReceipts] = React.useState(true);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'Notifications',
      rows: [
        {
          icon: '🔔',
          label: 'Push notifications',
          hint: 'New messages and mentions',
          rightAccessory: (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.primaryLight, false: colors.border }}
              thumbColor={notifications ? colors.primary : '#fff'}
            />
          ),
        },
      ],
    },
    {
      title: 'Privacy',
      rows: [
        {
          icon: '👁',
          label: 'Read receipts',
          hint: 'Share when you have read messages',
          rightAccessory: (
            <Switch
              value={readReceipts}
              onValueChange={setReadReceipts}
              trackColor={{ true: colors.primaryLight, false: colors.border }}
              thumbColor={readReceipts ? colors.primary : '#fff'}
            />
          ),
        },
        { icon: '🔒', label: 'Blocked users', hint: 'Manage who can contact you' },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        { icon: '🌐', label: 'Language', hint: 'English (RTL support coming soon)' },
        { icon: '💾', label: 'Storage and data', hint: 'Manage cache and downloads' },
        { icon: 'ℹ️', label: 'About OfflineSMS', hint: 'Version 1.0.0' },
      ],
    },
  ];

  const onLogout = () => {
    Alert.alert('Log out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.profileCard}>
          <Avatar uri={profile?.photoURL ?? undefined} name={profile?.displayName} size={64} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={styles.name}>{profile?.displayName ?? 'You'}</Text>
            <Text style={styles.subtle}>{profile?.about ?? 'Available on OfflineSMS'}</Text>
            <Text style={styles.subtle}>{profile?.phoneNumber}</Text>
          </View>
          <Text style={styles.edit}>Edit</Text>
        </View>

        {sections.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            {sec.rows.map((row, idx) => (
              <TouchableOpacity
                key={row.label}
                style={[styles.row, idx === sec.rows.length - 1 && { borderBottomWidth: 0 }]}
                onPress={row.onPress}
                disabled={!row.onPress && !row.rightAccessory}
                activeOpacity={0.7}
              >
                <Text style={styles.rowIcon}>{row.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  {row.hint ? <Text style={styles.rowHint}>{row.hint}</Text> : null}
                </View>
                {row.rightAccessory ?? <Text style={styles.chevron}>›</Text>}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity onPress={onLogout} style={styles.logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  subtle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  edit: { color: colors.primary, fontWeight: '600' },
  section: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.md,
  },
  rowIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  rowLabel: { fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  rowHint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  chevron: { color: colors.textMuted, fontSize: 22 },
  logout: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 16 },
});

export default SettingsScreen;
