import React from 'react';
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
import { StampProgressInline } from '../components/StampProgress';
import { FeatureIcon } from '../components/icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, fonts, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Rewards'>;

export default function RewardsScreen({ navigation, route }: Props) {
  const { stamps, vouchers } = useApp();

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
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardCopy}>
                  <Text style={text.heading}>{item.name}</Text>
                  <Text style={text.small}>{item.rewardLabel}</Text>
                </View>
                <Text style={styles.count}>{count}/{item.stampsRequired}</Text>
              </View>
              <StampProgressInline
                current={count}
                required={item.stampsRequired}
                style={styles.progress}
              />
            </Card>
          </FadeSlideIn>
        );
      }}
      ListFooterComponent={
        <View>
          <SectionLabel>Vouchers</SectionLabel>
          {vouchers.length === 0 ? (
            <Card style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FeatureIcon name="reward" size={28} />
              </View>
              <Text style={text.heading}>No vouchers yet</Text>
              <Text style={[text.bodyMuted, styles.emptyCopy]}>
                Complete phone-down sessions and your unlocked rewards will appear here.
              </Text>
            </Card>
          ) : (
            vouchers.map((v, i) => (
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
                  <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardCopy}>
                        <Text style={text.heading}>{v.restaurantName}</Text>
                        <Text style={text.small}>{v.rewardLabel}</Text>
                      </View>
                      <View style={[styles.status, v.redeemedAt && styles.statusMuted]}>
                        <Text style={[styles.statusText, v.redeemedAt && styles.statusTextMuted]}>
                          {v.redeemedAt ? 'Redeemed' : 'Available'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[text.small, styles.voucherMeta]}>
                      {v.redeemedAt
                        ? `Used ${new Date(v.redeemedAt).toLocaleDateString()}`
                        : `Expires ${new Date(v.expiresAt).toLocaleDateString()} · Tap to view`}
                    </Text>
                  </Card>
                </PressableScale>
              </FadeSlideIn>
            ))
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  count: {
    ...text.small,
    color: colors.primary,
    fontFamily: fonts.sansSemibold,
  },
  progress: {
    marginTop: spacing.md,
  },
  status: {
    backgroundColor: colors.successMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusMuted: {
    backgroundColor: colors.surfaceAlt,
  },
  statusText: {
    ...text.caption,
    color: colors.success,
    letterSpacing: 0,
    textTransform: 'none',
  },
  statusTextMuted: {
    color: colors.textMuted,
  },
  voucherMeta: {
    marginTop: spacing.md,
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
