import React from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import FormHeader from '../components/FormHeader';
import Screen from '../components/Screen';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  return (
    <Screen
      layout="centered"
      compactFooter
      footer={
        <Button
          label="Back to login"
          onPress={() => {
            Alert.alert('Demo mode', 'Use any credentials on the login screen.');
            navigation.navigate('Login');
          }}
        />
      }
    >
      <FadeSlideIn trigger="forgot">
        <FormHeader
          title="Reset password"
          subtitle="Not wired up in this demo. Use any email and password to log in."
        />
      </FadeSlideIn>
    </Screen>
  );
}
