import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { PartnerAwning, partnerLook } from './PartnerSign';
import { colors, fonts, radius, spacing, type } from '../theme';
import { Restaurant } from '../types';

type Props = {
  /** Takes the venue so the card can wear its awning, not just its name. */
  restaurant: Pick<Restaurant, 'id' | 'name' | 'cuisine' | 'rewardLabel' | 'stampsRequired'>;
  current: number;
  style?: ViewStyle;
};

/**
 * Hand-placed angles. A real stamp is never pressed square, and that irregularity
 * is the whole point — perfectly aligned marks read as printed, not earned.
 */
const PRESS_ANGLES = [-8, 6, -4, 9, -6, 5, -9, 7, -5, 4];

const SLOT_SIZE = 46;

function StampMark({ size = SLOT_SIZE }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 46 46" fill="none">
      {/* Outer ring, deliberately chunky — a rubber stamp bites the paper. */}
      <Circle
        cx="23"
        cy="23"
        r="19"
        stroke={colors.ink}
        strokeWidth="2.6"
        strokeDasharray="3 2.5"
        opacity={0.9}
      />
      <Circle cx="23" cy="23" r="15" stroke={colors.ink} strokeWidth="1.4" opacity={0.55} />
      <G rotation={-12} origin="23, 23">
        <Rect x="17" y="15" width="2.4" height="16" rx="1.2" fill={colors.ink} />
        <Line x1="16" y1="15" x2="20.4" y2="15" stroke={colors.ink} strokeWidth="2" strokeLinecap="round" />
        <Line x1="16.6" y1="12.5" x2="16.6" y2="15" stroke={colors.ink} strokeWidth="1.7" strokeLinecap="round" />
        <Line x1="18.2" y1="12.5" x2="18.2" y2="15" stroke={colors.ink} strokeWidth="1.7" strokeLinecap="round" />
        <Line x1="19.8" y1="12.5" x2="19.8" y2="15" stroke={colors.ink} strokeWidth="1.7" strokeLinecap="round" />
      </G>
      <G rotation={12} origin="23, 23">
        <Rect x="26.6" y="15" width="2.4" height="16" rx="1.2" fill={colors.ink} />
        <Path d="M25.2 15 L30.4 15 L29 20.5 L26.6 20.5 Z" fill={colors.ink} />
      </G>
    </Svg>
  );
}

function EmptySlot({ size = SLOT_SIZE }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 46 46" fill="none">
      <Circle
        cx="23"
        cy="23"
        r="19"
        stroke={colors.inkSoft}
        strokeWidth="1.8"
        strokeDasharray="3 3.5"
      />
    </Svg>
  );
}

export default function StampCard({ restaurant, current, style }: Props) {
  const total = Math.max(restaurant.stampsRequired, 0);
  const earned = Math.min(Math.max(current, 0), total);
  const { accent } = partnerLook(restaurant);

  return (
    <View
      style={[styles.card, style]}
      accessibilityLabel={`Stamp card for ${restaurant.name}. ${earned} of ${total} stamps collected. Reward: ${restaurant.rewardLabel}.`}
    >
      <PartnerAwning accent={accent} />

      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.shopName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.cardKicker}>Stamp card</Text>
        </View>

        <View style={styles.slots}>
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={[
                styles.slot,
                // Only pressed stamps tilt. Empty slots are printed, so they stay square.
                i < earned ? { transform: [{ rotate: `${PRESS_ANGLES[i % PRESS_ANGLES.length]}deg` }] } : null,
              ]}
            >
              {i < earned ? <StampMark /> : <EmptySlot />}
            </View>
          ))}
        </View>

        <View style={styles.tear} />

        <View style={styles.footer}>
          <Text style={styles.footerCount}>
            {earned === total ? 'Card complete' : `${total - earned} to go`}
          </Text>
          <Text style={styles.footerReward} numberOfLines={1}>
            {restaurant.rewardLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.paperEdge,
    borderStyle: 'dashed',
    // Clips the awning to the card's rounded corners.
    overflow: 'hidden',
  },
  /** Padding lives here so the awning can span the full card width. */
  inner: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: 2,
  },
  shopName: {
    fontFamily: fonts.serifBold,
    fontSize: type.title,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  cardKicker: {
    fontFamily: fonts.sansMedium,
    fontSize: type.caption,
    color: colors.ink,
    opacity: 0.55,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Perforation line, like the tear-off strip on a real card. */
  tear: {
    borderTopWidth: 1.5,
    borderTopColor: colors.inkSoft,
    borderStyle: 'dashed',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  footerCount: {
    fontFamily: fonts.sansSemibold,
    fontSize: type.small,
    color: colors.ink,
    opacity: 0.7,
  },
  footerReward: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.serifBold,
    fontSize: type.heading,
    color: colors.ink,
  },
});
