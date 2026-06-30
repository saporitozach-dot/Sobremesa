import React, { useState } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import EmailInput from '../components/EmailInput';
import FadeSlideIn from '../components/FadeSlideIn';
import FormHeader from '../components/FormHeader';
import KeyboardFormScreen from '../components/KeyboardFormScreen';
import TextField from '../components/TextField';
import { formatPhone } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { signUp } = useApp();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!firstName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Fill in all fields to continue.');
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
      Alert.alert('Sign up failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardFormScreen
      footer={<Button label="Continue" onPress={onSubmit} loading={loading} />}
    >
      <FadeSlideIn trigger="signup">
        <FormHeader title="Create account" subtitle="Start earning at partner restaurants." />
        <TextField
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Alex"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
        />
        <EmailInput label="Email" value={email} onChangeText={setEmail} />
        <TextField
          label="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(v) => setPhone(formatPhone(v))}
          placeholder="(555) 555-5555"
          textContentType="telephoneNumber"
          returnKeyType="next"
        />
        <TextField
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </FadeSlideIn>
    </KeyboardFormScreen>
  );
}
