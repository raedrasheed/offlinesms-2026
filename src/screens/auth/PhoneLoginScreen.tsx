import React, { useRef, useState } from 'react';
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
import Logo from '@/components/Logo';
import { colors, spacing } from '@/theme';
import { AuthStackParamList } from '@/navigation/types';
import { PhoneAuthService } from '@/services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneLogin'>;

const PhoneLoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // recaptcha ref is wired only in EAS/dev-build environments; placeholder for now.
  const recaptchaRef = useRef<any>(null);

  const sanitizedPhone = `${countryCode}${phone.replace(/\D/g, '')}`;

  const onSend = async () => {
    setError(null);
    if (phone.replace(/\D/g, '').length < 6) {
      setError('Enter a valid phone number');
      return;
    }
    try {
      setLoading(true);
      await PhoneAuthService.sendCode(sanitizedPhone, recaptchaRef.current);
      navigation.navigate('OtpVerify', { phoneNumber: sanitizedPhone });
    } catch (e: any) {
      setError(e?.message ?? 'Could not send verification code.');
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
          <Logo size={64} />
          <Text style={styles.title}>Enter your phone number</Text>
          <Text style={styles.subtitle}>
            We'll send you an SMS with a verification code. Standard rates may apply.
          </Text>
        </View>

        <View style={styles.row}>
          <Input
            containerStyle={{ width: 96 }}
            value={countryCode}
            onChangeText={setCountryCode}
            keyboardType="phone-pad"
            maxLength={5}
          />
          <Input
            containerStyle={{ flex: 1, marginLeft: spacing.sm }}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            keyboardType="phone-pad"
            error={error ?? undefined}
          />
        </View>

        <Button title="Send code" fullWidth loading={loading} onPress={onSend} />
      </View>
    </KeyboardAvoidingView>
  );
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
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.lg },
});

export default PhoneLoginScreen;
