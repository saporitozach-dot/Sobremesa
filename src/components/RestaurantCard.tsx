import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import PressableScale from './PressableScale';
import StampProgress from './StampProgress';
import { ChevronRight } from './icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, fonts, radius, shadows, spacing } from '../theme';
import { Restaurant } from '../types';

type Props = {
  restaurant: Restaurant;
  stampCount: number;
  onPress: () => void;
  variant?: 'default' | 'arrived';
  style?: ViewStyle;
};

export default function RestaurantCard({
  restaurant,
  stampCount,
  onPress,
  variant = 'default',
  style,
}: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const isArrived = variant === 'arrived';

  useEffect(() => {
    if (!isArrived) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.015, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isArrived, pulse]);

  return (
    <Animated.View style={isArrived ? { transform: [{ scale: pulse }] } : undefined}>
      <PressableScale
        style={[styles.card, isArrived && styles.cardArrived, style]}
        onPress={onPress}
      >
        {isArrived ? (
          <Text style={[text.kicker, styles.arrivedKicker]}>You've arrived</Text>
        ) : null}

        <View style={styles.top}>
          <View style={styles.info}>
            <Text style={text.heading}>{restaurant.name}</Text>
            <Text style={text.small}>{restaurant.cuisine}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {stampCount}/{restaurant.stampsRequired}
            </Text>
          </View>
        </View>

        <Text style={[text.small, styles.address]} numberOfLines={1}>
          {restaurant.address}
        </Text>

        <StampProgress
          current={stampCount}
          required={restaurant.stampsRequired}
          showBadge={false}
          style={styles.progress}
        />

        <View style={styles.footer}>
          <Text style={[text.small, styles.reward]} numberOfLines={1}>
            {restaurant.rewardLabel}
          </Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{isArrived ? 'Start' : 'View'}</Text>
            <ChevronRight size={12} color={colors.primary} />
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardArrived: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  arrivedKicker: {
    marginBottom: spacing.sm,
    letterSpacing: 1.8,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  info: { flex: 1, marginRight: spacing.md, gap: 2 },
  badge: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeText: {
    ...text.caption,
    color: colors.primary,
    letterSpacing: 0,
    textTransform: 'none',
    fontFamily: fonts.sansSemibold,
  },
  address: { marginBottom: spacing.sm },
  progress: { marginBottom: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reward: { flex: 1 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ctaText: {
    ...text.caption,
    color: colors.primary,
    letterSpacing: 0,
    textTransform: 'none',
    fontFamily: fonts.sansSemibold,
  },
});
