import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';

export default function SignUpScreen() {
  const { logIn } = useApp();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const valid =
    firstName.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    phone.replace(/\D/g, '').length >= 7 &&
    password.length >= 6;

  function handleSubmit() {
    if (!valid) return;
    logIn({
      firstName: firstName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });
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
          <Text style={styles.title}>Create account</Text>

          <View style={styles.fields}>
            <TextInput
              placeholder="First name"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone #"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <Button title="Continue" onPress={handleSubmit} disabled={!valid} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  fields: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: font.body,
  },
});
