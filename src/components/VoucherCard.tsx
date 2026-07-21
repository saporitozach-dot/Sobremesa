import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing, type } from '../theme';
import { Voucher } from '../types';

type Props = {
  voucher: Voucher;
  style?: ViewStyle;
};

const NOTCH = 18;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function VoucherCard({ voucher, style }: Props) {
  const redeemed = Boolean(voucher.redeemedAt);

  return (
    <View style={[styles.ticket, redeemed && styles.ticketSpent, style]}>
      <View style={styles.stub}>
        <Text style={styles.shopName} numberOfLines={1}>
          {voucher.restaurantName}
        </Text>
        <Text style={styles.reward} numberOfLines={2}>
          {voucher.rewardLabel}
        </Text>
      </View>

      {/* Ticket waist: notches punched from both edges, joined by a perforation. */}
      <View style={styles.waist}>
        <View style={[styles.notch, styles.notchLeft]} />
        <View style={styles.perforation} />
        <View style={[styles.notch, styles.notchRight]} />
      </View>

      <View style={styles.foot}>
        <Text style={styles.footText}>
          {redeemed
            ? `Used ${formatDate(voucher.redeemedAt as string)}`
            : `Expires ${formatDate(voucher.expiresAt)}`}
        </Text>
        {!redeemed ? <Text style={styles.footAction}>Tap to redeem</Text> : null}
      </View>

      {redeemed ? (
        <View style={styles.stampOverlay} pointerEvents="none">
          <Text style={styles.stampText}>Redeemed</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    overflow: 'hidden',
  },
  /** A spent ticket has sat in a wallet — knock it back so live ones lead. */
  ticketSpent: {
    backgroundColor: colors.paperShade,
    opacity: 0.72,
  },
  stub: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  shopName: {
    fontFamily: fonts.sansMedium,
    fontSize: type.caption,
    color: colors.ink,
    opacity: 0.6,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  reward: {
    fontFamily: fonts.serifBold,
    fontSize: type.display,
    lineHeight: 34,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  waist: {
    height: NOTCH,
    justifyContent: 'center',
  },
  notch: {
    position: 'absolute',
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: colors.bg,
    top: 0,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  perforation: {
    marginHorizontal: NOTCH,
    borderTopWidth: 1.5,
    borderTopColor: colors.inkSoft,
    borderStyle: 'dashed',
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  footText: {
    fontFamily: fonts.sans,
    fontSize: type.small,
    color: colors.ink,
    opacity: 0.65,
  },
  footAction: {
    fontFamily: fonts.sansSemibold,
    fontSize: type.small,
    color: colors.ink,
  },
  /**
   * Pressed off-square, the way a counter stamp lands. Anchored with position
   * rather than translateY — combining a translate with absoluteFill detaches the
   * card's content from its background under react-native-web.
   */
  stampOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.lg,
    alignItems: 'center',
    transform: [{ rotate: '-13deg' }],
  },
  stampText: {
    fontFamily: fonts.sansSemibold,
    fontSize: type.title,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: colors.ink,
    opacity: 0.42,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
