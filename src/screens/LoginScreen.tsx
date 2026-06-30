import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import EmailInput from '../components/EmailInput';
import FadeSlideIn from '../components/FadeSlideIn';
import FormHeader from '../components/FormHeader';
import KeyboardFormScreen from '../components/KeyboardFormScreen';
import TextField from '../components/TextField';
import { colors, fonts, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation, route }: Props) {
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardFormScreen
      footer={
        <>
          <Button label="Log in" onPress={onSubmit} loading={loading} />
          <Button
            label="Forgot password?"
            variant="ghost"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
        </>
      }
    >
      <FadeSlideIn trigger="login">
        <FormHeader title="Welcome back" subtitle="Pick up where you left off." />
        <EmailInput label="Email" value={email} onChangeText={setEmail} />
        <TextField
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        {route.params?.prefillPhone ? (
          <Text style={styles.hint}>Phone on file: {route.params.prefillPhone}</Text>
        ) : null}
      </FadeSlideIn>
    </KeyboardFormScreen>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
