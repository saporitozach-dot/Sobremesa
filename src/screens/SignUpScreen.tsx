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
import StaggeredFadeIn from '../components/StaggeredFadeIn';
import TextField from '../components/TextField';
import { text } from '../theme/typography';
import { colors, motion, spacing } from '../theme';
import { formatPhone } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { signUp } = useApp();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const onSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = 'Enter your first name.';
    if (!email.trim()) nextErrors.email = 'Enter your email address.';
    if (!phone.trim()) nextErrors.phone = 'Enter your phone number.';
    if (!password.trim()) nextErrors.password = 'Create a password.';
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      const draft = {
        firstName: firstName.trim(),
        email: email.trim(),
        phone: formatPhone(phone),
        password,
      };
      await signUp(draft);
      navigation.navigate('PhoneVerify', { draft });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'We could not create your account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardFormScreen
      footer={
        <FadeSlideIn delay={motion.stagger * 3} trigger="signup-action">
          <Button label="Continue" onPress={onSubmit} loading={loading} />
        </FadeSlideIn>
      }
    >
      <StaggeredFadeIn index={0} trigger="signup-header">
        <FormHeader
          kicker="Join the table"
          title="Create your account"
          subtitle="A few details, then you’re ready for more present meals."
        />
      </StaggeredFadeIn>
      <StaggeredFadeIn index={1} trigger="signup-name">
        <TextField
          fieldIndex={0}
          label="First name"
          value={firstName}
          onChangeText={(value) => {
            setFirstName(value);
            setErrors((current) => ({ ...current, firstName: '' }));
          }}
          error={errors.firstName}
          placeholder="Alex"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
        />
      </StaggeredFadeIn>
      <StaggeredFadeIn index={2} trigger="signup-email">
        <EmailInput
          fieldIndex={1}
          label="Email address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: '' }));
          }}
          error={errors.email}
        />
      </StaggeredFadeIn>
      <StaggeredFadeIn index={3} trigger="signup-phone">
        <TextField
          fieldIndex={2}
          label="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(value) => {
            setPhone(formatPhone(value));
            setErrors((current) => ({ ...current, phone: '' }));
          }}
          error={errors.phone}
          placeholder="(555) 555-5555"
          textContentType="telephoneNumber"
          returnKeyType="next"
        />
      </StaggeredFadeIn>
      <StaggeredFadeIn index={4} trigger="signup-password">
        <TextField
          fieldIndex={3}
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: '' }));
          }}
          helperText="Use a password you’ll remember."
          error={errors.password}
          placeholder="Create a password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </StaggeredFadeIn>
      {formError ? (
        <Text accessibilityLiveRegion="polite" style={styles.formError}>
          {formError}
        </Text>
      ) : null}
    </KeyboardFormScreen>
  );
}

const styles = StyleSheet.create({
  formError: {
    ...text.small,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});
