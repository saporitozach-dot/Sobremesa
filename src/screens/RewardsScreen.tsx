import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { PARTNER_RESTAURANTS } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';
import ScreenHeader from '../components/ScreenHeader';
import ScreenList from '../components/ScreenList';
import SectionLabel from '../components/SectionLabel';
import StampCard from '../components/StampCard';
import VoucherCard from '../components/VoucherCard';
import { FeatureIcon } from '../components/icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, fonts, layout, radius, spacing, type } from '../theme';
import { Voucher } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Rewards'>;

export default function RewardsScreen({ navigation, route }: Props) {
  const { stamps, vouchers } = useApp();
  const [showRedeemed, setShowRedeemed] = useState(false);

  // A used voucher is history, not something to act on — keep it out of the way.
  const active = useMemo(() => vouchers.filter((v) => !v.redeemedAt), [vouchers]);
  const redeemed = useMemo(() => vouchers.filter((v) => v.redeemedAt), [vouchers]);

  const renderVoucher = useCallback(
    (v: Voucher, i: number) => (
      <FadeSlideIn key={v.id} delay={i * 50} trigger={v.id}>
        <PressableScale
          onPress={() =>
            navigation.navigate('RedeemVoucher', {
              voucherId: v.id,
              returnTo: route.params?.returnTo,
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`${v.restaurantName} voucher, ${v.redeemedAt ? 'redeemed' : 'available'}`}
        >
          <VoucherCard voucher={v} style={styles.card} />
        </PressableScale>
      </FadeSlideIn>
    ),
    [navigation, route.params?.returnTo],
  );

  return (
    <ScreenList
      header={
        <ScreenHeader
          title="Stamp book"
          subtitle="Your balances and vouchers"
          onBackPress={() => navigation.goBack()}
        />
      }
      data={PARTNER_RESTAURANTS}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<SectionLabel>Balances</SectionLabel>}
      renderItem={({ item, index }) => {
        const count = stamps.find((s) => s.restaurantId === item.id)?.count ?? 0;
        return (
          <FadeSlideIn delay={index * 50} trigger={item.id}>
            <StampCard restaurant={item} current={count} style={styles.card} />
          </FadeSlideIn>
        );
      }}
      ListFooterComponent={
        <View>
          <SectionLabel>Vouchers</SectionLabel>
          {active.length === 0 ? (
            <Card style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FeatureIcon name="reward" size={28} />
              </View>
              <Text style={text.heading}>
                {redeemed.length > 0 ? 'Nothing to redeem' : 'No vouchers yet'}
              </Text>
              <Text style={[text.bodyMuted, styles.emptyCopy]}>
                Complete phone-down sessions and your unlocked rewards will appear here.
              </Text>
            </Card>
          ) : (
            active.map(renderVoucher)
          )}

          {redeemed.length > 0 ? (
            <>
              <PressableScale
                onPress={() => setShowRedeemed((v) => !v)}
                style={styles.disclosure}
                accessibilityRole="button"
                accessibilityState={{ expanded: showRedeemed }}
                accessibilityLabel={`${showRedeemed ? 'Hide' : 'Show'} ${redeemed.length} redeemed ${
                  redeemed.length === 1 ? 'voucher' : 'vouchers'
                }`}
              >
                <Text style={styles.disclosureText}>
                  {showRedeemed
                    ? 'Hide redeemed'
                    : `Show ${redeemed.length} redeemed`}
                </Text>
              </PressableScale>
              {showRedeemed ? redeemed.map(renderVoucher) : null}
            </>
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  /** Quiet by design — this reveals history, it isn't a primary action. */
  disclosure: {
    alignSelf: 'flex-start',
    minHeight: layout.compactControlHeight,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  disclosureText: {
    fontFamily: fonts.sansMedium,
    fontSize: type.small,
    color: colors.textMuted,
  },
  empty: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyCopy: {
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 280,
  },
});
