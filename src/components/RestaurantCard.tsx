import React, { useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import PressableScale from './PressableScale';
import StampProgress from './StampProgress';
import { ChevronRight } from './icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, fonts, spacing } from '../theme';
import { Restaurant } from '../types';

type Props = {
  restaurant: Restaurant;
  stampCount: number;
  onPress: () => void;
  variant?: 'default' | 'arrived';
  showTopDivider?: boolean;
  style?: ViewStyle;
};

export default function RestaurantCard({
  restaurant,
  stampCount,
  onPress,
  variant = 'default',
  showTopDivider = false,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const isArrived = variant === 'arrived';

  return (
    <View style={[styles.divider, showTopDivider && styles.topDivider]}>
      <PressableScale
        style={[
          styles.row,
          isArrived && styles.rowArrived,
          focused && styles.rowFocused,
          style,
        ]}
        onPress={onPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityRole="button"
        accessibilityLabel={`${restaurant.name}, ${restaurant.cuisine}. Reward: ${restaurant.rewardLabel}. ${stampCount} of ${restaurant.stampsRequired} stamps.`}
        accessibilityHint={isArrived ? 'Starts a phone-down session' : 'Opens restaurant details'}
      >
        <View style={styles.content}>
          {isArrived ? (
            <Text style={[text.kicker, styles.arrivedKicker]}>You've arrived · start a session</Text>
          ) : null}

          <View style={styles.top}>
            <View style={styles.info}>
              <Text style={text.heading}>{restaurant.name}</Text>
              <Text style={[text.small, styles.metadata]} numberOfLines={2}>
                {restaurant.cuisine} · {restaurant.address}
              </Text>
            </View>
            <View style={styles.affordance} accessibilityElementsHidden>
              {isArrived ? <Text style={styles.actionText}>Start</Text> : null}
              <ChevronRight size={14} color={isArrived ? colors.primary : colors.textMuted} />
            </View>
          </View>

          <View style={styles.rewardRow}>
            <View style={styles.rewardCopy}>
              <Text style={[text.caption, styles.rewardLabel]}>Reward</Text>
              <Text style={[text.body, styles.reward]} numberOfLines={1}>
                {restaurant.rewardLabel}
              </Text>
            </View>
            <Text style={styles.stampText}>
              {stampCount} of {restaurant.stampsRequired} stamps
            </Text>
          </View>

          <StampProgress
            current={stampCount}
            required={restaurant.stampsRequired}
            showBadge={false}
            style={styles.progress}
          />
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  topDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  row: {
    minHeight: 44,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  rowArrived: {
    backgroundColor: colors.primaryMuted,
  },
  rowFocused: {
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    alignSelf: 'stretch',
    width: '100%',
  },
  arrivedKicker: {
    marginBottom: spacing.md,
    letterSpacing: 1.5,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  metadata: {
    color: colors.textSubtle,
  },
  affordance: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: -spacing.md,
    marginBottom: -spacing.md,
  },
  actionText: {
    ...text.caption,
    color: colors.primary,
    letterSpacing: 0,
    textTransform: 'none',
    fontFamily: fonts.sansSemibold,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  rewardCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  rewardLabel: {
    color: colors.primary,
  },
  reward: {
    color: colors.text,
  },
  stampText: {
    ...text.small,
    color: colors.textMuted,
    fontFamily: fonts.sansSemibold,
    textAlign: 'right',
  },
  progress: {
    marginTop: spacing.md,
  },
});
