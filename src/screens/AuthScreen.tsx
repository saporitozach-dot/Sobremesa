import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import BrandHeader from '../components/BrandHeader';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import VideoBackground from '../components/VideoBackground';
import { ChevronRight } from '../components/icons/FeatureIcon';
import { LANDING_VIDEO, LANDING_VIDEO_RATE } from '../config/landingVideo';
import { text } from '../theme/typography';
import { colors, layout, motion, spacing } from '../theme';

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
          <FadeSlideIn delay={motion.stagger} trigger="auth-brand">
            <View style={styles.heroContent}>
              <BrandHeader size="lg" animate />
              <View style={styles.rule} />
              <Text style={[text.title, styles.heroLine]}>
                Put the phone down. Stay for what matters.
              </Text>
            </View>
          </FadeSlideIn>
        </View>

        <FadeSlideIn delay={motion.stagger * 3} distance={motion.directionalDistance} trigger="auth-footer">
          <View style={styles.actions}>
            <Button
              label="Create account"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.button}
              trailingIcon={<ChevronRight color={colors.bgDeep} />}
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
    paddingBottom: spacing.xxxl + spacing.sm,
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  heroContent: {
    alignItems: 'center',
  },
  rule: {
    width: spacing.xxxl,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroLine: {
    maxWidth: layout.readableCopyWidth,
    textAlign: 'center',
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
    backgroundColor: colors.authButton,
    borderColor: colors.primarySoft,
  },
});
