import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import BrandHeader from '../components/BrandHeader';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import VideoBackground from '../components/VideoBackground';
import { LANDING_VIDEO, LANDING_VIDEO_RATE } from '../config/landingVideo';
import { colors, layout, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <VideoBackground source={LANDING_VIDEO} dim={0.8} rate={LANDING_VIDEO_RATE} />

      <View
        style={[
          styles.inner,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.hero}>
          <FadeSlideIn delay={80} distance={16} trigger="auth-brand">
            <BrandHeader size="lg" animate />
          </FadeSlideIn>
        </View>

        <FadeSlideIn delay={280} distance={24} trigger="auth-footer">
          <View style={styles.actions}>
            <Button
              label="Create account"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.button}
            />
            <Button
              label="Log in"
              variant="secondary"
              onPress={() => navigation.navigate('Login')}
              style={styles.buttonSecondary}
            />
          </View>
        </FadeSlideIn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  inner: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 56,
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  actions: {
    gap: spacing.sm,
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: spacing.lg,
  },
  button: {
    minHeight: 52,
  },
  buttonSecondary: {
    minHeight: 52,
    backgroundColor: 'rgba(18, 28, 23, 0.72)',
    borderColor: 'rgba(212, 175, 90, 0.28)',
  },
});
