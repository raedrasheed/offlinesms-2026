import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { colors, spacing } from '@/theme';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const features = [
  { icon: '💬', label: 'Direct & group messaging' },
  { icon: '📇', label: 'Smart contact directory' },
  { icon: '🔔', label: 'Alerts & reminders' },
  { icon: '📣', label: 'Reach customers reliably' },
];

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <Logo size={110} />
        <Text style={styles.brand}>OfflineSMS</Text>
        <Text style={styles.tagline}>
          Messaging, contacts, groups, alerts and reminders — all in one calm, focused app.
        </Text>
      </View>

      <View style={styles.features}>
        {features.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title="Get Started"
          fullWidth
          onPress={() => navigation.navigate('EmailAuth', { mode: 'signUp' })}
        />
        <Button
          title="I already have an account"
          variant="ghost"
          fullWidth
          onPress={() => navigation.navigate('EmailAuth', { mode: 'signIn' })}
        />
        <Text style={styles.terms}>
          By continuing you agree to OfflineSMS Terms & Privacy Policy.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  brand: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 14,
  },
  tagline: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  features: { marginTop: spacing.lg, marginBottom: spacing.xl },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureIcon: { fontSize: 22, width: 32 },
  featureLabel: { fontSize: 15, color: colors.textPrimary },
  actions: { marginTop: 'auto', gap: spacing.sm },
  terms: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default WelcomeScreen;
