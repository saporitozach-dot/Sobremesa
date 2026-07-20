import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import FormHeader from '../components/FormHeader';
import KeyboardFormScreen from '../components/KeyboardFormScreen';
import { text } from '../theme/typography';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  return (
    <KeyboardFormScreen
      footer={
        <Button
          label="Back to login"
          onPress={() => navigation.navigate('Login')}
        />
      }
    >
      <FadeSlideIn trigger="forgot">
        <FormHeader
          kicker="Account access"
          title="Reset your password"
          subtitle="Password recovery will arrive with the full account service."
        />
        <View style={styles.note}>
          <Text style={[text.caption, styles.noteLabel]}>Demo mode</Text>
          <Text style={text.bodyMuted}>
            Nothing has been changed. Return to login and use any email and password.
          </Text>
        </View>
      </FadeSlideIn>
    </KeyboardFormScreen>
  );
}

const styles = StyleSheet.create({
  note: {
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  noteLabel: {
    color: colors.primary,
    marginBottom: spacing.sm,
  },
});
