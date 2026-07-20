import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import EmailInput from '../components/EmailInput';
import FadeSlideIn from '../components/FadeSlideIn';
import FormHeader from '../components/FormHeader';
import KeyboardFormScreen from '../components/KeyboardFormScreen';
import TextField from '../components/TextField';
import { text } from '../theme/typography';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation, route }: Props) {
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const onSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = 'Enter your email address.';
    if (!password.trim()) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'We could not log you in. Try again.');
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
        <FormHeader
          kicker="Welcome back"
          title="Return to the table"
          subtitle="Log in to see your restaurants, stamps, and rewards."
        />
        <EmailInput
          fieldIndex={0}
          label="Email address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: '' }));
          }}
          error={errors.email}
        />
        <TextField
          fieldIndex={1}
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: '' }));
          }}
          error={errors.password}
          placeholder="Enter your password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        {route.params?.prefillPhone ? (
          <Text style={styles.hint}>Phone on file: {route.params.prefillPhone}</Text>
        ) : null}
        {formError ? (
          <Text accessibilityLiveRegion="polite" style={styles.formError}>
            {formError}
          </Text>
        ) : null}
      </FadeSlideIn>
    </KeyboardFormScreen>
  );
}

const styles = StyleSheet.create({
  hint: {
    ...text.small,
    marginTop: spacing.sm,
  },
  formError: {
    ...text.small,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
