import React, { useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PartnerAwning, PartnerMotif, partnerLook } from './PartnerSign';
import PressableScale from './PressableScale';
import { StampDots } from './StampProgress';
import { ChevronRight } from './icons/FeatureIcon';
import { colors, fonts, radius, spacing, type } from '../theme';
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
  const [focused, setFocused] = useState(false);
  const isArrived = variant === 'arrived';
  const { accent } = partnerLook(restaurant);

  return (
    <PressableScale
      style={[styles.wrap, style]}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}, ${restaurant.cuisine}. Reward: ${restaurant.rewardLabel}. ${stampCount} of ${restaurant.stampsRequired} stamps.`}
      accessibilityHint={isArrived ? 'Starts a phone-down session' : 'Opens restaurant details'}
    >
      <View
        style={[
          styles.card,
          isArrived && { borderColor: accent, borderWidth: 2 },
          focused && styles.cardFocused,
        ]}
      >
        <PartnerAwning accent={accent} />

        <View style={styles.body}>
          {isArrived ? (
            <Text style={[styles.arrivedKicker, { color: accent }]}>
              You've arrived · start a session
            </Text>
          ) : null}

          <View style={styles.titleRow}>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <Text style={styles.metadata} numberOfLines={2}>
                {restaurant.cuisine} · {restaurant.address}
              </Text>
            </View>
            <View style={styles.affordance} accessibilityElementsHidden>
              {isArrived ? (
                <Text style={[styles.actionText, { color: accent }]}>Start</Text>
              ) : null}
              <ChevronRight size={14} color={colors.ink} />
            </View>
          </View>

          <View style={styles.rewardRow}>
            <PartnerMotif restaurant={restaurant} size={18} />
            <Text style={styles.reward} numberOfLines={1}>
              {restaurant.rewardLabel}
            </Text>
            <StampDots
              current={stampCount}
              required={restaurant.stampsRequired}
              color={accent}
            />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  card: {
    width: '100%',
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.paperEdge,
    // Clips the awning to the card's rounded corners.
    overflow: 'hidden',
  },
  cardFocused: {
    borderColor: colors.ink,
  },
  body: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  arrivedKicker: {
    fontFamily: fonts.sansSemibold,
    fontSize: type.caption,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.serifBold,
    fontSize: type.title,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  metadata: {
    fontFamily: fonts.sans,
    fontSize: type.small,
    lineHeight: 19,
    color: colors.ink,
    opacity: 0.6,
  },
  affordance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  actionText: {
    fontFamily: fonts.sansSemibold,
    fontSize: type.small,
  },
  /** Perforation echoes the stamp card, so a partner reads as the same object family. */
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.inkSoft,
    borderStyle: 'dashed',
  },
  reward: {
    flex: 1,
    fontFamily: fonts.sansSemibold,
    fontSize: type.body,
    color: colors.ink,
  },
});
