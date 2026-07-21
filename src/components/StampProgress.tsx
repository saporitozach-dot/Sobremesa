import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { text } from '../theme/typography';
import { colors, fonts, radius, spacing } from '../theme';

type Props = {
  current: number;
  required: number;
  showBadge?: boolean;
  style?: ViewStyle;
};

export default function StampProgress({ current, required, showBadge = true, style }: Props) {
  const progress = required > 0 ? Math.min(current / required, 1) : 0;

  return (
    <View style={style}>
      {showBadge ? (
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {current}/{required}
            </Text>
          </View>
        </View>
      ) : null}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

export function StampProgressInline({
  current,
  required,
  style,
}: Omit<Props, 'showBadge'> & { label?: string }) {
  const progress = required > 0 ? Math.min(current / required, 1) : 0;

  return (
    <View style={style}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={[text.small, styles.inlineLabel]}>
        {current} / {required} stamps
      </Text>
    </View>
  );
}

/**
 * Stamps drawn the way a paper loyalty card does — filled marks for what you've
 * earned, empty rings for what's left. Reads as a card, not a download bar.
 */
export function StampDots({
  current,
  required,
  size = 8,
  color = colors.primary,
  style,
}: Omit<Props, 'showBadge'> & { size?: number; color?: string }) {
  const total = Math.max(required, 0);
  const earned = Math.min(Math.max(current, 0), total);

  return (
    <View style={[styles.dotRow, style]} accessibilityElementsHidden>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { width: size, height: size, borderRadius: size / 2 },
            i < earned
              ? { backgroundColor: color, borderColor: color }
              : styles.dotEmpty,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
  },
  dot: {
    borderWidth: 1,
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.xs,
  },
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
  track: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  inlineLabel: { marginTop: spacing.xs },
});
