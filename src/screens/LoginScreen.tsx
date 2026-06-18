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
import type { RouteProp } from '@react-navigation/native';
import { colors, font, spacing } from '../theme';
import Button from '../components/Button';
import AuthInput from '../components/AuthInput';
import { useApp } from '../context/AppContext';
import { loginAccount } from '../services/auth';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type Route = RouteProp<RootStackParamList, 'Login'>;

export default function LoginScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: Route;
}) {
  const { logIn } = useApp();
  const [identifier, setIdentifier] = useState(route.params?.prefillPhone ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = identifier.trim().length > 0 && password.length >= 6;

  async function handleSubmit() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    const result = await loginAccount(identifier, password);
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
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>
            Use the phone number or email on your account.
          </Text>

          <View style={styles.fields}>
            <AuthInput
              placeholder="Phone or email"
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
            />
            <AuthInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Log in"
            onPress={handleSubmit}
            disabled={!valid}
            loading={busy}
          />

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            hitSlop={8}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('SignUp')}
            hitSlop={8}
            style={styles.linkWrap}
          >
            <Text style={styles.linkMuted}>
              New here? <Text style={styles.link}>Create account</Text>
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
  fields: { gap: spacing.md, marginBottom: spacing.md },
  error: {
    color: colors.danger,
    fontSize: font.small,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  linkWrap: { alignItems: 'center', marginTop: spacing.md },
  link: { color: colors.primary, fontSize: font.body, fontWeight: '600' },
  linkMuted: { color: colors.textMuted, fontSize: font.body },
});
