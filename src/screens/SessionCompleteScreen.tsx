import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import Button from '../components/Button';
import StaggeredFadeIn from '../components/StaggeredFadeIn';
import { FeatureIcon } from '../components/icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, fonts, layout, radius, shadows, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionComplete'>;

export default function SessionCompleteScreen({ navigation, route }: Props) {
  const {
    restaurantName,
    goalMinutes,
    stampCount,
    stampsRequired,
    rewardLabel,
    voucherUnlocked,
  } = route.params;
  const insets = useSafeAreaInsets();
  const progress = stampsRequired > 0 ? stampCount / stampsRequired : 1;
  const ringSize = 120;
  const stroke = 5;
  const ringRadius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  const glow = useRef(new Animated.Value(0.4)).current;
  const stampPop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.85, duration: 1400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();

    Animated.spring(stampPop, {
      toValue: 1,
      delay: 280,
      useNativeDriver: true,
      damping: 14,
      stiffness: 180,
      mass: 0.7,
    }).start();
  }, [glow, stampPop]);

  return (
    <LinearGradient
      colors={[colors.bg, colors.bgDeep, '#0D1612']}
      style={[styles.container, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { opacity: glow, transform: [{ scale: stampPop }] }]}
      />

      <View style={styles.content}>
        <StaggeredFadeIn trigger={restaurantName} index={0} scale distance={16}>
          <Text style={text.kicker}>{voucherUnlocked ? 'Reward unlocked' : 'Session complete'}</Text>
        </StaggeredFadeIn>

        <StaggeredFadeIn trigger={restaurantName} index={1} scale distance={14}>
          <Animated.View style={{ transform: [{ scale: stampPop }] }}>
            <View style={styles.iconCircle}>
              <FeatureIcon name="reward" size={36} />
            </View>
          </Animated.View>
        </StaggeredFadeIn>

        <StaggeredFadeIn trigger={restaurantName} index={2} distance={12}>
          <Text style={styles.title}>
            {voucherUnlocked ? 'You earned it' : 'Stamp earned'}
          </Text>
        </StaggeredFadeIn>

        <StaggeredFadeIn trigger={restaurantName} index={3} distance={10}>
          <Text style={styles.subtitle}>
            {goalMinutes} minutes present at {restaurantName}
          </Text>
        </StaggeredFadeIn>

        <StaggeredFadeIn trigger={restaurantName} index={4} distance={10} style={styles.cardWrap}>
          <View style={styles.card}>
            {voucherUnlocked ? (
              <>
                <Text style={styles.cardKicker}>Your voucher</Text>
                <Text style={styles.reward}>{rewardLabel}</Text>
                <Text style={styles.cardNote}>Find it in your stamp book — show your server when you redeem.</Text>
              </>
            ) : (
              <>
                <Text style={styles.cardKicker}>Progress at {restaurantName}</Text>
                <View style={styles.ringRow}>
                  <View style={styles.ringWrap}>
                    <Svg width={ringSize} height={ringSize}>
                      <Circle
                        cx={ringSize / 2}
                        cy={ringSize / 2}
                        r={ringRadius}
                        stroke={colors.border}
                        strokeWidth={stroke}
                        fill="none"
                      />
                      <Circle
                        cx={ringSize / 2}
                        cy={ringSize / 2}
                        r={ringRadius}
                        stroke={colors.primary}
                        strokeWidth={stroke}
                        fill="none"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={circumference * (1 - progress)}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${ringSize / 2}, ${ringSize / 2}`}
                      />
                    </Svg>
                    <View style={styles.ringCenter}>
                      <Text style={styles.stampCount}>{stampCount}</Text>
                      <Text style={styles.stampOf}>of {stampsRequired}</Text>
                    </View>
                  </View>
                  <View style={styles.rewardCol}>
                    <Text style={styles.rewardLabel}>Toward</Text>
                    <Text style={styles.reward}>{rewardLabel}</Text>
                    {stampsRequired - stampCount === 1 ? (
                      <Text style={styles.cardNote}>One more session to unlock.</Text>
                    ) : (
                      <Text style={styles.cardNote}>
                        {stampsRequired - stampCount} more to unlock.
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </StaggeredFadeIn>

        <StaggeredFadeIn trigger={restaurantName} index={5} distance={8}>
          <Text style={styles.closer}>You stayed present. That&apos;s the whole point.</Text>
        </StaggeredFadeIn>
      </View>

      <View style={styles.footer}>
        <Button label="Back home" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} />
        <Button
          label={voucherUnlocked ? 'View voucher' : 'Stamp book'}
          variant="secondary"
          onPress={() => navigation.navigate('Rewards')}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  glow: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  title: {
    color: colors.text,
    fontSize: type.display,
    fontFamily: fonts.serifBold,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...text.bodyMuted,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: spacing.xl,
  },
  cardWrap: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardKicker: {
    ...text.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  stampCount: {
    color: colors.text,
    fontSize: 28,
    fontFamily: fonts.serifBold,
    letterSpacing: -0.5,
  },
  stampOf: {
    color: colors.textMuted,
    fontSize: type.caption,
    fontFamily: fonts.sans,
  },
  rewardCol: {
    flex: 1,
    gap: spacing.xs,
  },
  rewardLabel: {
    ...text.caption,
    color: colors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  reward: {
    color: colors.text,
    fontSize: type.heading,
    fontFamily: fonts.serif,
    letterSpacing: -0.2,
  },
  cardNote: {
    ...text.small,
    marginTop: spacing.xs,
  },
  closer: {
    ...text.body,
    color: colors.textMuted,
    textAlign: 'center',
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    maxWidth: 280,
  },
  footer: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.sm,
  },
});
