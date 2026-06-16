import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import { SAMPLE_RESTAURANTS } from '../data/restaurants';
import StampRow from '../components/StampRow';
import RewardIcon from '../components/RewardIcon';
import Button from '../components/Button';
import { canRedeem } from '../services/stamps';
import { STAMPS_FOR_REWARD } from '../types';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Rewards'>;
type Route = RouteProp<RootStackParamList, 'Rewards'>;

export default function RewardsScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: Route;
}) {
  const { getBookForRestaurant, vouchers } = useApp();
  const returnTo = route.params?.returnTo;

  const visited = SAMPLE_RESTAURANTS.filter((r) => {
    const book = getBookForRestaurant(r.id);
    return book.totalStampsEarned > 0 || book.stamps > 0;
  });

  const notVisited = SAMPLE_RESTAURANTS.filter(
    (r) => !visited.some((v) => v.id === r.id),
  );

  function handleRedeem(restaurantId: string) {
    navigation.navigate('ConfirmRedeem', { restaurantId, returnTo });
  }

  function openVoucher(voucherId: string) {
    navigation.navigate('RedeemVoucher', { voucherId, returnTo });
  }

  const activeVouchers = vouchers.filter((v) => v.status === 'active');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.intro}>
          Earn 1 stamp per phone-free visit (30 min minimum, once per day). Collect{' '}
          {STAMPS_FOR_REWARD} stamps at a partner for a reward.
        </Text>

        {activeVouchers.length > 0 && (
          <>
            <Text style={styles.section}>Active vouchers</Text>
            {activeVouchers.map((v) => (
              <Pressable
                key={v.id}
                style={styles.voucherCard}
                onPress={() => openVoucher(v.id)}
              >
                <RewardIcon size={22} />
                <View style={styles.voucherInfo}>
                  <Text style={styles.voucherTitle}>{v.rewardLabel}</Text>
                  <Text style={styles.voucherSub}>{v.restaurantName}</Text>
                </View>
                <Text style={styles.voucherCode}>{v.code}</Text>
              </Pressable>
            ))}
          </>
        )}

        {visited.length > 0 && (
          <>
            <Text style={styles.section}>Your stamp books</Text>
            {visited.map((r) => {
              const book = getBookForRestaurant(r.id);
              const ready = canRedeem(book);
              return (
                <View key={r.id} style={styles.bookCard}>
                  <View style={styles.bookHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookName}>{r.name}</Text>
                      <Text style={styles.bookReward}>{r.rewardLabel}</Text>
                    </View>
                    <StampRow stamps={book.stamps} size={28} />
                  </View>
                  <Text style={styles.bookMeta}>
                    {book.stamps}/{STAMPS_FOR_REWARD} stamps
                    {book.redemptionsCount > 0
                      ? ` · ${book.redemptionsCount} redeemed`
                      : ''}
                  </Text>
                  {ready && (
                    <Button
                      title="Redeem"
                      onPress={() => handleRedeem(r.id)}
                      style={{ marginTop: spacing.md }}
                    />
                  )}
                </View>
              );
            })}
          </>
        )}

        {visited.length === 0 && (
          <View style={styles.emptyCard}>
            <StampRow stamps={0} size={36} />
            <Text style={styles.emptyTitle}>No stamps yet</Text>
            <Text style={styles.emptyBody}>
              Start a phone-free Sobremesa at a partner restaurant to earn your
              first stamp.
            </Text>
          </View>
        )}

        {notVisited.length > 0 && (
          <>
            <Text style={styles.section}>Partners to discover</Text>
            {notVisited.map((r) => (
              <View key={r.id} style={styles.partnerRow}>
                <Text style={styles.partnerName}>{r.name}</Text>
                <Text style={styles.partnerReward}>{r.rewardLabel}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xl },
  intro: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  section: {
    color: colors.textMuted,
    fontSize: font.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  bookCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bookName: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  bookReward: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  bookMeta: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.sm },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  voucherInfo: { flex: 1 },
  voucherTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  voucherSub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  voucherCode: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: font.body,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  partnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  partnerName: { color: colors.text, fontSize: font.body, flex: 1 },
  partnerReward: { color: colors.textMuted, fontSize: font.small },
});
