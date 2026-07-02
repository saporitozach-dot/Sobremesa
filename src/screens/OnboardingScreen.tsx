import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import BrandHeader from '../components/BrandHeader';
import Button from '../components/Button';
import StaggeredFadeIn from '../components/StaggeredFadeIn';
import StepIndicator from '../components/StepIndicator';
import { FeatureIcon, FeatureIconName } from '../components/icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, fonts, layout, motion, radius, spacing } from '../theme';

const EASE_IN = Easing.bezier(0.4, 0, 1, 1);
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

/** Vertical anchor — slide 3 sits low, inside the ambient glow above the footer */
const ANCHOR_FRACTIONS = [0.04, 0.34, 0.5] as const;

type StepConfig = {
  kicker: string;
  title: string;
  body: string;
  footnote?: string;
  icon: FeatureIconName;
  showBrand: boolean;
};

const STEPS: StepConfig[] = [
  {
    kicker: 'Welcome in',
    title: 'Be here, together',
    body: 'Sobremesa helps you put the phone away and connect with the people at your table.',
    icon: 'dining',
    showBrand: true,
  },
  {
    kicker: 'The idea',
    title: 'Phone-free meals',
    body: 'Stay present through the meal — conversation, not scrolling.',
    icon: 'reward',
    showBrand: false,
  },
  {
    kicker: 'How it works',
    title: 'We meet you at the table',
    body: '',
    icon: 'setup',
    showBrand: false,
  },
];

const FLOW_STEPS = [
  'Arrive at a partner restaurant',
  'Start a phone-free session',
  'Earn stamps toward rewards',
];

type SlideProps = StepConfig & { step: number; isLast?: boolean };

function OnboardingSlide({ kicker, title, body, footnote, icon, showBrand, step, isLast }: SlideProps) {
  if (isLast) {
    return (
      <View style={styles.slide}>
        <View style={styles.glowCluster}>
          <View style={styles.glowRing} pointerEvents="none" />

          <StaggeredFadeIn index={0} trigger={step} distance={8}>
            <Text style={text.kicker}>{kicker}</Text>
          </StaggeredFadeIn>

          <StaggeredFadeIn index={1} trigger={step} scale style={styles.iconWrapTight}>
            <View style={styles.iconCircle}>
              <FeatureIcon name={icon} size={32} />
            </View>
          </StaggeredFadeIn>

          <StaggeredFadeIn index={2} trigger={step} style={styles.copyWrap}>
            <Text style={[text.titleBold, styles.centerText, styles.titleGapTight]}>{title}</Text>
          </StaggeredFadeIn>

          <StaggeredFadeIn index={3} trigger={step} distance={8} style={styles.flowWrap}>
            {FLOW_STEPS.map((line, i) => (
              <View key={line} style={styles.flowRow}>
                <View style={styles.flowDot}>
                  <Text style={styles.flowNum}>{i + 1}</Text>
                </View>
                <Text style={styles.flowText}>{line}</Text>
              </View>
            ))}
          </StaggeredFadeIn>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.slide}>
      <StaggeredFadeIn index={0} trigger={step} distance={8}>
        <Text style={text.kicker}>{kicker}</Text>
      </StaggeredFadeIn>

      {showBrand ? (
        <StaggeredFadeIn index={1} trigger={step} scale style={styles.brandWrap}>
          <BrandHeader size="md" animate />
        </StaggeredFadeIn>
      ) : (
        <StaggeredFadeIn index={1} trigger={step} scale style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <FeatureIcon name={icon} size={34} />
          </View>
        </StaggeredFadeIn>
      )}

      <StaggeredFadeIn index={2} trigger={step} style={styles.copyWrap}>
        <Text style={[text.titleBold, styles.centerText, styles.titleGap]}>{title}</Text>
      </StaggeredFadeIn>

      <StaggeredFadeIn index={3} trigger={step} distance={10} style={styles.copyWrap}>
        <Text style={[text.bodyMuted, styles.centerText]}>{body}</Text>
      </StaggeredFadeIn>

      {footnote ? (
        <StaggeredFadeIn index={4} trigger={step} distance={8} style={styles.copyWrap}>
          <Text style={[styles.footnote, styles.centerText]}>{footnote}</Text>
        </StaggeredFadeIn>
      ) : null}
    </View>
  );
}

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [stageHeight, setStageHeight] = useState(0);

  const contentY = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const glowY = useRef(new Animated.Value(0)).current;
  const lineHeight = useRef(new Animated.Value(0)).current;
  const lineOpacity = useRef(new Animated.Value(0.35)).current;

  const screenH = Dimensions.get('window').height;
  const screenW = Dimensions.get('window').width;
  const glowSize = screenH * 0.42;
  const glowLeft = (screenW - glowSize) / 2;

  const moveToAnchor = (nextStep: number, animateContent = true) => {
    if (stageHeight <= 0) return;

    const targetY = stageHeight * ANCHOR_FRACTIONS[nextStep] + insets.top * 0.12;
    const glowTarget =
      nextStep === STEPS.length - 1
        ? stageHeight * 0.48
        : stageHeight * (0.1 + nextStep * 0.28);

    const moves = [
      Animated.spring(contentY, {
        toValue: targetY,
        useNativeDriver: true,
        damping: 22,
        stiffness: 170,
        mass: 0.85,
      }),
      Animated.spring(glowY, {
        toValue: glowTarget,
        useNativeDriver: true,
        damping: 24,
        stiffness: 140,
      }),
      Animated.timing(lineHeight, {
        toValue: ((nextStep + 1) / STEPS.length) * stageHeight * 0.72,
        duration: motion.slow,
        easing: EASE_OUT,
        useNativeDriver: false,
      }),
      Animated.timing(lineOpacity, {
        toValue: 0.35 + nextStep * 0.2,
        duration: motion.normal,
        useNativeDriver: false,
      }),
    ];

    if (animateContent) {
      Animated.parallel(moves).start();
    } else {
      contentY.setValue(targetY);
      glowY.setValue(glowTarget);
      lineHeight.setValue(((nextStep + 1) / STEPS.length) * stageHeight * 0.72);
      lineOpacity.setValue(0.35 + nextStep * 0.2);
    }
  };

  useEffect(() => {
    if (stageHeight > 0) {
      moveToAnchor(step, false);
      Animated.timing(contentFade, {
        toValue: 1,
        duration: motion.slow,
        easing: EASE_OUT,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageHeight]);

  const requestPermissions = async () => {
    setLoading(true);
    setPermissionBlocked(false);

    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== 'granted') {
      setLoading(false);
      setPermissionBlocked(true);
      return;
    }

    await Location.requestBackgroundPermissionsAsync();
    await Notifications.requestPermissionsAsync();
    setLoading(false);
    await completeOnboarding();
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const goToStep = (next: number) => {
    Animated.timing(contentFade, {
      toValue: 0,
      duration: motion.fast,
      easing: EASE_IN,
      useNativeDriver: true,
    }).start(() => {
      setStep(next);
      moveToAnchor(next);
      Animated.timing(contentFade, {
        toValue: 1,
        duration: motion.slow,
        easing: EASE_OUT,
        useNativeDriver: true,
      }).start();
    });
  };

  const current = STEPS[step];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bgDeep, '#0D1612', colors.bg, colors.bgDeep]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient warmth — drifts down as you progress */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            left: glowLeft,
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            transform: [{ translateY: glowY }],
          },
        ]}
      />

      {/* Journey line — grows as you descend into the experience */}
      <View style={[styles.journeyTrack, { top: insets.top + spacing.xxl }]}>
        <Animated.View
          style={[
            styles.journeyLine,
            {
              height: lineHeight,
              opacity: lineOpacity,
            },
          ]}
        />
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.journeyNode,
              {
                top: stageHeight * ANCHOR_FRACTIONS[i] * 0.72,
                backgroundColor: i <= step ? colors.primary : colors.border,
                borderColor: i <= step ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      <View
        style={[styles.stage, { paddingTop: insets.top }]}
        onLayout={(e) => setStageHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.indicatorWrap}>
          <StepIndicator total={STEPS.length} current={step} />
        </View>

        <Animated.View
          style={[
            styles.contentSlot,
            {
              opacity: contentFade,
              transform: [{ translateY: contentY }],
            },
          ]}
        >
          <OnboardingSlide key={step} step={step} isLast={step === STEPS.length - 1} {...current} />
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {permissionBlocked ? (
          <View style={styles.blocked}>
            <Text style={styles.blockedTitle}>Location access needed</Text>
            <Text style={styles.blockedBody}>
              Sobremesa uses your location only at partner restaurants — to know when you have arrived and invite you into a session.
            </Text>
            <Button label="Open Settings" onPress={openSettings} />
            <Button label="Try again" variant="ghost" onPress={requestPermissions} loading={loading} />
          </View>
        ) : step < STEPS.length - 1 ? (
          <Button label="Continue" onPress={() => goToStep(step + 1)} />
        ) : (
          <Button label="Enter Sobremesa" onPress={requestPermissions} loading={loading} />
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
  glow: {
    position: 'absolute',
    top: -80,
    backgroundColor: colors.primary,
    opacity: 0.09,
  },
  journeyTrack: {
    position: 'absolute',
    left: layout.screenPadding,
    width: 2,
    bottom: 210,
  },
  journeyLine: {
    position: 'absolute',
    left: 0,
    width: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  journeyNode: {
    position: 'absolute',
    left: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  stage: {
    flex: 1,
  },
  indicatorWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  contentSlot: {
    position: 'absolute',
    left: layout.screenPadding,
    right: layout.screenPadding,
    alignItems: 'center',
  },
  slide: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignItems: 'center',
  },
  kicker: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  brandWrap: {
    marginBottom: spacing.lg,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyWrap: {
    width: '100%',
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
    maxWidth: 320,
  },
  titleGap: {
    marginBottom: spacing.sm,
  },
  titleGapTight: {
    marginBottom: spacing.md,
  },
  glowCluster: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  glowRing: {
    position: 'absolute',
    top: 0,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(212, 175, 90, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 90, 0.22)',
  },
  iconWrapTight: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flowWrap: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 280,
  },
  flowDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowNum: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.sansSemibold,
  },
  flowText: {
    ...text.small,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  footnote: {
    ...text.small,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  blocked: {
    gap: spacing.sm,
    alignItems: 'stretch',
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    backgroundColor: 'rgba(10, 16, 13, 0.92)',
  },
});
