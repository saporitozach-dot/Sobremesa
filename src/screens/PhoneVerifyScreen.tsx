import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import FormHeader from '../components/FormHeader';
import KeyboardFormScreen from '../components/KeyboardFormScreen';
import StaggeredFadeIn from '../components/StaggeredFadeIn';
import TextField from '../components/TextField';
import { fonts, motion, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PhoneVerify'>;

export default function PhoneVerifyScreen({ route }: Props) {
  const { verifyPhone } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (code.length !== 6) {
      setError('Enter the six-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyPhone(route.params.draft, code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code did not work. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardFormScreen
      footer={
        <FadeSlideIn delay={motion.stagger * 2} trigger="verify-action">
          <Button label="Verify" onPress={onSubmit} loading={loading} />
        </FadeSlideIn>
      }
    >
      <StaggeredFadeIn index={0} trigger="verify-header">
        <FormHeader
          kicker="One last step"
          title="Check your phone"
          subtitle={`Enter the code sent to ${route.params.draft.phone}.`}
        />
      </StaggeredFadeIn>
      <StaggeredFadeIn index={1} trigger="verify-code">
        <TextField
          fieldIndex={0}
          label="Code"
          keyboardType="number-pad"
          value={code}
          onChangeText={(value) => {
            setCode(value.replace(/\D/g, ''));
            setError('');
          }}
          placeholder="123456"
          helperText="For this demo, use 123456."
          error={error}
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          style={styles.codeInput}
        />
      </StaggeredFadeIn>
    </KeyboardFormScreen>
  );
}

const styles = StyleSheet.create({
  codeInput: {
    fontSize: type.title,
    fontFamily: fonts.sansMedium,
    letterSpacing: spacing.sm,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
