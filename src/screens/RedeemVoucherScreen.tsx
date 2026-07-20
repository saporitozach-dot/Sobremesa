import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
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
  const [redeeming, setRedeeming] = useState(false);

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
              label="Redeem with server"
              loading={redeeming}
              onPress={() => {
                Alert.alert(
                  'Redeem this voucher?',
                  'Continue only when your server is ready to accept the reward. This cannot be undone in the demo.',
                  [
                    { text: 'Not yet', style: 'cancel' },
                    {
                      text: 'Redeem',
                      style: 'destructive',
                      onPress: async () => {
                        setRedeeming(true);
                        try {
                          await redeemVoucher(voucher.id);
                          navigation.goBack();
                        } finally {
                          setRedeeming(false);
                        }
                      },
                    },
                  ],
                );
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
          {!voucher.redeemedAt ? (
            <Text style={styles.note}>Keep this screen open and show it to your server.</Text>
          ) : null}
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
  note: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
