import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import { colors, font, spacing } from '../theme';
import Button from '../components/Button';
import AuthInput from '../components/AuthInput';
import {
  confirmPhoneVerification,
  formatPhoneDisplay,
  registerAccount,
  startPhoneVerification,
} from '../services/auth';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../../App';

type Route = RouteProp<RootStackParamList, 'PhoneVerify'>;

export default function PhoneVerifyScreen({ route }: { route: Route }) {
  const { logIn } = useApp();
  const { draft } = route.params;
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sent = await startPhoneVerification(draft.phone, 'signup', draft);
      if (cancelled) return;
      setSending(false);
      if (!sent.ok) {
        setError(sent.error);
        return;
      }
      setDemoCode(sent.data.demoCode);
    })();
    return () => {
      cancelled = true;
    };
  }, [draft]);

  async function handleResend() {
    setSending(true);
    setError(null);
    const sent = await startPhoneVerification(draft.phone, 'signup', draft);
    setSending(false);
    if (!sent.ok) {
      setError(sent.error);
      return;
    }
    setDemoCode(sent.data.demoCode);
  }

  async function handleVerify() {
    if (code.trim().length < 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setBusy(true);
    setError(null);

    const verified = await confirmPhoneVerification(draft.phone, code);
    if (!verified.ok) {
      setBusy(false);
      setError(verified.error);
      return;
    }
    if (verified.data === 'reset') {
      setBusy(false);
      setError('Verification mismatch. Please start sign-up again.');
      return;
    }

    const registered = await registerAccount(verified.data);
    setBusy(false);
    if (!registered.ok) {
      setError(registered.error);
      return;
    }
    logIn(registered.data);
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
          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>
            Enter the code we sent to {formatPhoneDisplay(draft.phone)}.
          </Text>

          {demoCode ? (
            <View style={styles.demoBox}>
              <Text style={styles.demoLabel}>Prototype — your code</Text>
              <Text style={styles.demoCode}>{demoCode}</Text>
              <Text style={styles.demoHint}>
                SMS is not connected yet. Type this code to continue.
              </Text>
            </View>
          ) : sending ? (
            <Text style={styles.sending}>Sending code…</Text>
          ) : null}

          <AuthInput
            placeholder="6-digit code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Verify & create account"
            onPress={handleVerify}
            loading={busy}
            disabled={sending}
            style={{ marginTop: spacing.lg }}
          />

          <Button
            title="Resend code"
            variant="ghost"
            onPress={handleResend}
            loading={sending}
            style={{ marginTop: spacing.sm }}
          />
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
  sending: {
    color: colors.textMuted,
    fontSize: font.body,
    marginBottom: spacing.md,
  },
  demoBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
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
    fontSize: 36,
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
  error: {
    color: colors.danger,
    fontSize: font.small,
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
