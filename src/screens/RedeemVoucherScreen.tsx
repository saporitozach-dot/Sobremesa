import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FadeSlideIn from '../components/FadeSlideIn';
import Screen from '../components/Screen';
import { colors, fonts, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RedeemVoucher'>;

export default function RedeemVoucherScreen({ navigation, route }: Props) {
  const { vouchers, redeemVoucher } = useApp();
  const voucher = vouchers.find((v) => v.id === route.params.voucherId);

  if (!voucher) {
    return (
      <Screen layout="centered" footer={<Button label="Close" onPress={() => navigation.goBack()} />}>
        <Text style={styles.title}>Voucher not found</Text>
      </Screen>
    );
  }

  return (
    <Screen
      layout="centered"
      compactFooter
      footer={
        <>
          {!voucher.redeemedAt ? (
            <Button
              label="Mark redeemed"
              onPress={async () => {
                await redeemVoucher(voucher.id);
                navigation.goBack();
              }}
            />
          ) : null}
          <Button label="Close" variant="ghost" onPress={() => navigation.goBack()} />
        </>
      }
    >
      <FadeSlideIn trigger={voucher.id}>
        <Card style={styles.ticket}>
          <Text style={styles.kicker}>Voucher</Text>
          <Text style={styles.title}>{voucher.restaurantName}</Text>
          <Text style={styles.reward}>{voucher.rewardLabel}</Text>
          <Text style={styles.code}>#{voucher.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.meta}>
            {voucher.redeemedAt
              ? 'Redeemed'
              : `Expires ${new Date(voucher.expiresAt).toLocaleDateString()}`}
          </Text>
        </Card>
      </FadeSlideIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ticket: {
    alignItems: 'center',
    gap: spacing.xs,
    borderColor: colors.primary,
    width: '100%',
  },
  kicker: {
    color: colors.primary,
    fontSize: type.caption,
    fontFamily: fonts.sansMedium,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: type.heading,
    fontFamily: fonts.serifBold,
    textAlign: 'center',
  },
  reward: { color: colors.textMuted, fontSize: type.body, fontFamily: fonts.sans, textAlign: 'center' },
  code: {
    color: colors.text,
    fontSize: 24,
    fontFamily: fonts.serifBold,
    letterSpacing: 4,
    marginTop: spacing.md,
  },
  meta: { color: colors.textMuted, fontSize: type.small, fontFamily: fonts.sans, marginTop: spacing.xs },
});
