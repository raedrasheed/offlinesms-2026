import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import { colors, spacing } from '@/theme';
import { UserService } from '@/services/userService';
import { UserProfile } from '@/types/models';
import { AppStackParamList } from '@/navigation/types';
import { formatLastSeen } from '@/utils/presence';

type Props = NativeStackScreenProps<AppStackParamList, 'ContactProfile'>;

const ContactProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { uid } = route.params;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    UserService.getProfile(uid)
      .then((p) => setProfile(p))
      .finally(() => setLoading(false));
  }, [uid]);

  if (loading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header
        title="Contact info"
        leftIcon={<Text style={styles.back}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.hero}>
          <Avatar
            uri={profile?.photoURL ?? undefined}
            name={profile?.displayName}
            size={112}
          />
          <Text style={styles.name}>{profile?.displayName || 'OfflineSMS user'}</Text>
          {profile?.phoneNumber ? (
            <Text style={styles.phone}>{profile.phoneNumber}</Text>
          ) : null}
          <Text style={styles.presence}>{formatLastSeen(profile?.lastSeen)}</Text>
        </View>

        <Section title="About">
          <Text style={styles.body}>
            {profile?.about?.trim() || 'Available on OfflineSMS'}
          </Text>
        </Section>

        <Section title="Joined">
          <Text style={styles.body}>
            {profile?.createdAt
              ? profile.createdAt
                  .toDate()
                  .toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })
              : 'Recently'}
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  back: { color: '#fff', fontSize: 28, fontWeight: '700' },
  hero: {
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  phone: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  presence: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  section: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 14,
  },
  sectionTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  body: { fontSize: 15, color: colors.textPrimary, lineHeight: 22 },
});

export default ContactProfileScreen;
