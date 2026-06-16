import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import RewardIcon from '../components/RewardIcon';
import Button from '../components/Button';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'RedeemVoucher'>;
type Route = RouteProp<RootStackParamList, 'RedeemVoucher'>;

export default function RedeemVoucherScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: Route;
}) {
  const { vouchers } = useApp();
  const voucher = vouchers.find((v) => v.id === route.params.voucherId);
  const returnTo = route.params.returnTo;

  function handleDone() {
    if (returnTo === 'Locked') {
      navigation.navigate('Locked');
      return;
    }
    navigation.goBack();
  }

  if (!voucher) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Voucher not found</Text>
          <Button title="Back to rewards" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const issued = new Date(voucher.issuedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <RewardIcon size={48} />
        </View>
        <Text style={styles.kicker}>Your voucher</Text>
        <Text style={styles.title}>{voucher.rewardLabel}</Text>
        <Text style={styles.restaurant}>{voucher.restaurantName}</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Server code</Text>
          <Text style={styles.code} selectable>
            {voucher.code}
          </Text>
          <Text style={styles.codeHint}>
            Show this to your server. They'll enter it at the kiosk to apply your
            reward.
          </Text>
        </View>

        <View style={styles.detailCard}>
          <DetailRow label="Issued" value={issued} />
          <DetailRow
            label="Confirmed by"
            value={voucher.serverConfirmedBy ?? 'Not recorded'}
          />
          <DetailRow label="Status" value="Active — single use" />
        </View>

        <View style={{ flex: 1 }} />
        <Button title="Done" onPress={handleDone} />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg },
  iconWrap: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  kicker: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: font.body,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    fontSize: font.title,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  restaurant: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: font.body,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  codeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  codeLabel: {
    color: colors.textMuted,
    fontSize: font.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  code: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 3,
  },
  codeHint: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.md,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: { color: colors.textMuted, fontSize: font.small },
  detailValue: { color: colors.text, fontSize: font.body, fontWeight: '600' },
});
