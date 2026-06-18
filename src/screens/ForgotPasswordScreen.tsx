import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, spacing } from '../theme';
import Button from '../components/Button';
import AuthInput from '../components/AuthInput';
import {
  findAccountByPhone,
  formatPhoneDisplay,
  normalizePhone,
  resetPassword,
  startPhoneVerification,
  confirmPhoneVerification,
} from '../services/auth';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

type Step = 'phone' | 'verify' | 'newPassword';

export default function ForgotPasswordScreen({ navigation }: { navigation: Nav }) {
  const { logIn } = useApp();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSendCode() {
    const digits = normalizePhone(phone);
    if (digits.length < 10) {
      setError('Enter a valid phone number.');
      return;
    }

    setBusy(true);
    setError(null);
    const existing = await findAccountByPhone(phone);
    if (!existing) {
      setBusy(false);
      setError('No account found for this phone number.');
      return;
    }

    const sent = await startPhoneVerification(phone, 'reset');
    setBusy(false);
    if (!sent.ok) {
      setError(sent.error);
      return;
    }
    setDemoCode(sent.data.demoCode);
    setStep('verify');
  }

  async function handleVerify() {
    if (code.trim().length < 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await confirmPhoneVerification(phone, code);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStep('newPassword');
  }

  async function handleReset() {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await resetPassword(phone, newPassword);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    logIn(result.data);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Forgot password</Text>

          {step === 'phone' && (
            <>
              <Text style={styles.subtitle}>
                We&apos;ll text a verification code to the phone on your account.
              </Text>
              <AuthInput
                placeholder="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title="Send code"
                onPress={handleSendCode}
                loading={busy}
                style={{ marginTop: spacing.lg }}
              />
            </>
          )}

          {step === 'verify' && (
            <>
              <Text style={styles.subtitle}>
                Enter the code sent to {formatPhoneDisplay(phone)}.
              </Text>
              {demoCode ? (
                <View style={styles.demoBox}>
                  <Text style={styles.demoLabel}>Prototype — your code</Text>
                  <Text style={styles.demoCode}>{demoCode}</Text>
                  <Text style={styles.demoHint}>
                    SMS is not wired yet. In production this arrives by text.
                  </Text>
                </View>
              ) : null}
              <AuthInput
                placeholder="6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title="Verify"
                onPress={handleVerify}
                loading={busy}
                style={{ marginTop: spacing.lg }}
              />
              <Pressable onPress={() => setStep('phone')} style={styles.linkWrap}>
                <Text style={styles.link}>Use a different number</Text>
              </Pressable>
            </>
          )}

          {step === 'newPassword' && (
            <>
              <Text style={styles.subtitle}>Choose a new password.</Text>
              <AuthInput
                placeholder="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title="Update & log in"
                onPress={handleReset}
                loading={busy}
                style={{ marginTop: spacing.lg }}
              />
            </>
          )}

          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.linkWrap}
          >
            <Text style={styles.linkMuted}>
              Remember it? <Text style={styles.link}>Log in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.md },
  title: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontSize: font.small,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  demoBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  demoLabel: {
    color: colors.textMuted,
    fontSize: font.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  demoCode: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    marginVertical: spacing.sm,
  },
  demoHint: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkWrap: { alignItems: 'center', marginTop: spacing.lg },
  link: { color: colors.primary, fontSize: font.body, fontWeight: '600' },
  linkMuted: { color: colors.textMuted, fontSize: font.body },
});
