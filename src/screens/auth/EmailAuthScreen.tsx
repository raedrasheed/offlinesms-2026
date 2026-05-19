import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { colors, spacing } from '@/theme';
import { AuthStackParamList } from '@/navigation/types';
import { EmailAuthService } from '@/services/authService';
import { UserService } from '@/services/userService';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailAuth'>;

const EmailAuthScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signIn' | 'signUp'>(route.params?.mode ?? 'signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      const cred =
        mode === 'signUp'
          ? await EmailAuthService.signUp(email, password)
          : await EmailAuthService.signIn(email, password);
      if (cred?.user?.uid) {
        await UserService.createOrUpdateProfile(cred.user.uid, {
          phoneNumber: '',
          displayName: cred.user.displayName ?? '',
        });
      }
      // RootNavigator will swap to ProfileSetup / AppStack automatically.
    } catch (e: any) {
      setError(friendlyAuthError(e?.code, e?.message));
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Email required', 'Enter your email above first, then tap Forgot password.');
      return;
    }
    try {
      await EmailAuthService.sendReset(email);
      Alert.alert('Check your inbox', 'We sent a reset link to ' + email);
    } catch (e: any) {
      Alert.alert('Could not send reset email', e?.message ?? '');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.wrapper, { paddingTop: insets.top + 24 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>‹  Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Logo size={64} />
          <Text style={styles.title}>
            {mode === 'signUp' ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'signUp'
              ? 'Sign up with your email to start messaging on OfflineSMS.'
              : 'Sign in to pick up where you left off.'}
          </Text>
        </View>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          autoCapitalize="none"
          error={error ?? undefined}
        />

        <Button
          title={mode === 'signUp' ? 'Create account' : 'Sign in'}
          fullWidth
          loading={loading}
          onPress={onSubmit}
        />

        {mode === 'signIn' && (
          <TouchableOpacity onPress={onForgot} style={{ marginTop: spacing.md }}>
            <Text style={styles.linkMuted}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
          style={{ marginTop: spacing.xl }}
        >
          <Text style={styles.linkSwap}>
            {mode === 'signIn'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const friendlyAuthError = (code?: string, fallback?: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/weak-password':
      return 'Please choose a stronger password.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Wrong email or password.';
    case 'auth/user-not-found':
      return 'No account exists for that email.';
    case 'auth/network-request-failed':
      return 'Network error — check your internet connection.';
    default:
      return fallback ?? 'Something went wrong. Please try again.';
  }
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: spacing.xl },
  back: { color: colors.primary, fontSize: 16, fontWeight: '600', marginBottom: spacing.md },
  header: { alignItems: 'center', marginVertical: spacing.lg },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  linkMuted: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  linkSwap: { color: colors.primary, fontWeight: '600', fontSize: 15, textAlign: 'center' },
});

export default EmailAuthScreen;
