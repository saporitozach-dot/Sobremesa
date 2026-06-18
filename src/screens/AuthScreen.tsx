import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, spacing } from '../theme';
import Button from '../components/Button';
import HeroBackground from '../components/HeroBackground';
import Logo from '../components/Logo';
import { RootStackParamList } from '../../App';

export default function AuthScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      <HeroBackground />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.brand}>
            <Logo size={56} />
            <Text style={styles.wordmark}>sobremesa</Text>
            <Text style={styles.motto}>Phone-free dining</Text>
          </View>

          <View style={styles.footer}>
            <Button
              title="Log in"
              onPress={() => navigation.navigate('Login')}
            />
            <Button
              title="Create account"
              variant="secondary"
              onPress={() => navigation.navigate('SignUp')}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  motto: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
