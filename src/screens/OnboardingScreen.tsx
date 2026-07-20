import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Logo from '../components/Logo';
import OnboardingScene from '../components/OnboardingScene';
import StepIndicator from '../components/StepIndicator';
import { ChevronRight } from '../components/icons/FeatureIcon';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hapticMedium, hapticSelection, hapticSuccess } from '../services/haptics';
import { text } from '../theme/typography';
import { colors, gradients, layout, motion, spacing, type as typeScale } from '../theme';

const EASE_OUT = Easing.bezier(...motion.easing.out);

type StepConfig = {
  kicker: string;
  title: string;
  body: string;
  footnote?: string;
};

const STEPS: StepConfig[] = [
  {
    kicker: 'Welcome to the table',
    title: 'Be here for the meal.',
    body: 'Put your phone down. Stay with the people around you.',
  },
  {
    kicker: 'A small ritual',
    title: 'Set it down. Stay awhile.',
    body: 'Start a phone-down session. Your phone is still there when you need it.',
  },
  {
    kicker: 'A quiet reward',
    title: 'Earn stamps. Unlock a treat.',
    body: 'Finish a session. Collect stamps. A partner reward waits.',
    footnote: 'Next, allow location so we can greet you at partners.',
  },
];

type SlideProps = StepConfig & {
  isWide: boolean;
  copyLift: Animated.Value;
};

function OnboardingSlide({
  kicker,
  title,
  body,
  footnote,
  isWide,
  copyLift,
}: SlideProps) {
  return (
    <View style={[styles.slide, isWide && styles.slideWide]}>
      <Animated.View
        style={[
          styles.copyWrap,
          isWide && styles.copyWrapWide,
          {
            transform: [{ translateY: copyLift }],
          },
        ]}
      >
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={[styles.title, isWide && styles.textWide]}>{title}</Text>
        <Text style={[styles.body, isWide && styles.textWide]}>{body}</Text>
        {footnote ? <Text style={[styles.footnote, isWide && styles.textWide]}>{footnote}</Text> : null}
      </Animated.View>
    </View>
  );
}

function settleVisible(
  contentX: Animated.Value,
  contentFade: Animated.Value,
  copyLift: Animated.Value,
) {
  contentX.setValue(0);
  contentFade.setValue(1);
  copyLift.setValue(0);
}

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const contentX = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const copyLift = useRef(new Animated.Value(0)).current;
  const sceneProgress = useRef(new Animated.Value(0)).current;
  const stepRef = useRef(0);
  const transitionId = useRef(0);
  const permissionRequestPending = useRef(false);
  const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const isWide = width >= layout.onboardingWideBreakpoint;

  useEffect(() => {
    activeAnimation.current?.stop();
    if (reduceMotion) {
      settleVisible(contentX, contentFade, copyLift);
      sceneProgress.setValue(stepRef.current);
      return undefined;
    }

    contentFade.setValue(1);
    contentX.setValue(0);
    copyLift.setValue(motion.enterDistance);
    const entrance = Animated.spring(copyLift, {
      toValue: 0,
      delay: motion.stagger,
      useNativeDriver: true,
      ...motion.chapterSpring,
    });
    activeAnimation.current = entrance;
    entrance.start();
    return () => entrance.stop();
  }, [contentFade, contentX, copyLift, reduceMotion, sceneProgress]);

  useEffect(() => () => {
    transitionId.current += 1;
    activeAnimation.current?.stop();
  }, []);

  const requestPermissions = async () => {
    if (permissionRequestPending.current) return;
    permissionRequestPending.current = true;
    setLoading(true);
    setPermissionBlocked(false);

    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== 'granted') {
      permissionRequestPending.current = false;
      setLoading(false);
      setPermissionBlocked(true);
      return;
    }

    await Location.requestBackgroundPermissionsAsync();
    await Notifications.requestPermissionsAsync();
    setLoading(false);
    hapticSuccess();
    await completeOnboarding();
    permissionRequestPending.current = false;
  };

  const openSettings = () => {
    hapticSelection();
    Linking.openSettings();
  };

  const moveStep = (delta: -1 | 1) => {
    const next = Math.max(0, Math.min(STEPS.length - 1, stepRef.current + delta));
    if (next === stepRef.current) return;

    const direction = delta;
    stepRef.current = next;
    transitionId.current += 1;
    const id = transitionId.current;
    activeAnimation.current?.stop();

    if (delta > 0) {
      hapticMedium();
    } else {
      hapticSelection();
    }

    setStep(next);
    AccessibilityInfo.announceForAccessibility(`Onboarding step ${next + 1} of ${STEPS.length}`);

    if (reduceMotion) {
      settleVisible(contentX, contentFade, copyLift);
      sceneProgress.setValue(next);
      return;
    }

    // Enter-only chapter change: new copy arrives from the travel direction while the
    // full-bleed scene morphs in parallel. Opacity never rests at 0 (interrupt-safe).
    contentX.setValue(direction * motion.chapterDistance);
    contentFade.setValue(motion.chapterEnterOpacity);
    copyLift.setValue(motion.enterDistance);

    const entrance = Animated.parallel([
      Animated.spring(contentX, {
        toValue: 0,
        useNativeDriver: true,
        ...motion.chapterSpring,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: motion.normal,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
      Animated.spring(copyLift, {
        toValue: 0,
        delay: motion.stagger / 2,
        useNativeDriver: true,
        ...motion.chapterSpring,
      }),
      Animated.timing(sceneProgress, {
        toValue: next,
        duration: motion.slow,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
    ]);
    activeAnimation.current = entrance;
    entrance.start(({ finished }) => {
      if (id !== transitionId.current) return;
      if (!finished) {
        settleVisible(contentX, contentFade, copyLift);
        return;
      }
      settleVisible(contentX, contentFade, copyLift);
    });
  };

  const current = STEPS[step];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.ambient}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <OnboardingScene progress={sceneProgress} isWide={isWide} />

      <View style={[styles.progress, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.brandRow}>
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Sobremesa"
            style={styles.brand}
          >
            <Logo variant="emblem" theme="dark" size="sm" />
            <Text style={styles.brandName}>Sobremesa</Text>
          </View>
          <Text style={styles.progressCount}>0{step + 1} / 0{STEPS.length}</Text>
        </View>
        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>YOUR FIRST SOBREMESA</Text>
        </View>
        <StepIndicator total={STEPS.length} current={step} />
      </View>

      <ScrollView
        style={styles.stage}
        contentContainerStyle={styles.stageContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.contentSlot,
            {
              opacity: contentFade,
              transform: [{ translateX: contentX }],
            },
          ]}
        >
          <OnboardingSlide
            isWide={isWide}
            copyLift={copyLift}
            {...current}
          />
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {permissionBlocked ? (
          <View style={styles.blocked}>
            <Text style={styles.blockedTitle}>Location access needed</Text>
            <Text style={styles.blockedBody}>
              Sobremesa uses your location only at partner restaurants — to know when you have arrived and invite you into a session.
            </Text>
            <Button label="Open settings" onPress={openSettings} />
            <Button label="Try again" variant="ghost" onPress={requestPermissions} loading={loading} />
          </View>
        ) : (
          <View style={styles.footerActions}>
            {step > 0 ? (
              <Button
                label="Back"
                variant="ghost"
                fullWidth={false}
                style={styles.backAction}
                onPress={() => moveStep(-1)}
              />
            ) : null}
            <Button
              label={step < STEPS.length - 1 ? 'Continue' : 'Allow & enter'}
              fullWidth={false}
              style={styles.primaryAction}
              trailingIcon={<ChevronRight color={colors.bgDeep} />}
              loading={loading}
              onPress={step < STEPS.length - 1 ? () => moveStep(1) : requestPermissions}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  progress: {
    width: '100%',
    maxWidth: layout.onboardingMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  brandRow: {
    minHeight: layout.compactControlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandName: {
    ...text.brand,
    fontSize: typeScale.heading,
  },
  progressMeta: {
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...text.caption,
    color: colors.textSubtle,
  },
  progressCount: {
    ...text.caption,
    color: colors.primary,
    letterSpacing: 0.6,
  },
  stage: {
    flex: 1,
  },
  stageContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  contentSlot: {
    width: '100%',
    maxWidth: layout.onboardingMaxWidth,
    alignSelf: 'center',
    alignItems: 'center',
  },
  slide: {
    width: '100%',
    alignItems: 'center',
  },
  slideWide: {
    alignItems: 'flex-start',
    paddingRight: '54%',
  },
  kicker: {
    ...text.kicker,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  copyWrap: {
    width: '100%',
    maxWidth: layout.readableCopyWidth,
    alignItems: 'center',
  },
  copyWrapWide: {
    maxWidth: layout.authFormWidth,
    alignItems: 'flex-start',
  },
  title: {
    ...text.display,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  body: {
    ...text.bodyMuted,
    textAlign: 'center',
  },
  footnote: {
    ...text.small,
    color: colors.textSubtle,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  textWide: {
    textAlign: 'left',
  },
  blocked: {
    gap: spacing.sm,
    alignItems: 'stretch',
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  blockedTitle: {
    ...text.heading,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  blockedBody: {
    ...text.small,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
  },
  footerActions: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backAction: {
    minWidth: spacing.xxxl * 2,
  },
  primaryAction: {
    flex: 1,
  },
});
