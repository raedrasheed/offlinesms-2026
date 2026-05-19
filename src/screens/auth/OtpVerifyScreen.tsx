import React, { useState } from 'react';
import {
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
import { colors, spacing } from '@/theme';
import { AuthStackParamList } from '@/navigation/types';
import { PhoneAuthService } from '@/services/authService';
import { UserService } from '@/services/userService';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

const OtpVerifyScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { phoneNumber } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    setError(null);
    if (code.length < 4) {
      setError('Enter the code we sent you');
      return;
    }
    try {
      setLoading(true);
      const cred = await PhoneAuthService.confirmCode(code);
      // Seed an empty user document so security rules let the user write later.
      if (cred?.user?.uid) {
        await UserService.createOrUpdateProfile(cred.user.uid, {
          phoneNumber,
          displayName: '',
        });
      }
      // RootNavigator will swap to the profile-setup gate automatically.
    } catch (e: any) {
      setError(e?.message ?? 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to <Text style={styles.phone}>{phoneNumber}</Text>
          </Text>
        </View>

        <Input
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          style={{ fontSize: 22, letterSpacing: 12, fontWeight: '700' }}
          error={error ?? undefined}
        />

        <Button title="Verify" fullWidth loading={loading} onPress={onVerify} />

        <TouchableOpacity style={{ marginTop: spacing.lg }} onPress={() => navigation.goBack()}>
          <Text style={styles.resend}>Wrong number? Go back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: spacing.xl },
  back: { color: colors.primary, fontSize: 16, fontWeight: '600', marginBottom: spacing.md },
  header: { marginVertical: spacing.xl, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  phone: { color: colors.primary, fontWeight: '600' },
  resend: { color: colors.primary, fontWeight: '600', textAlign: 'center' },
});

export default OtpVerifyScreen;
