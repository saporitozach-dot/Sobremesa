import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import FormHeader from '../components/FormHeader';
import KeyboardFormScreen from '../components/KeyboardFormScreen';
import TextField from '../components/TextField';
import { fonts, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneVerify'>;

export default function PhoneVerifyScreen({ route }: Props) {
  const { verifyPhone } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await verifyPhone(route.params.draft, code);
    } catch (e) {
      Alert.alert('Verification failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardFormScreen footer={<Button label="Verify" onPress={onSubmit} loading={loading} />}>
      <FadeSlideIn trigger="verify">
        <FormHeader
          title="Verify phone"
          subtitle={`Code sent to ${route.params.draft.phone}. Demo code: 123456`}
        />
        <TextField
          label="Code"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          style={styles.codeInput}
        />
      </FadeSlideIn>
    </KeyboardFormScreen>
  );
}

const styles = StyleSheet.create({
  codeInput: {
    fontSize: 24,
    fontFamily: fonts.serif,
    letterSpacing: 10,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
