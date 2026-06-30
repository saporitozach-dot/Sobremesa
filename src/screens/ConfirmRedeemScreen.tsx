import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getRestaurant } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import Screen from '../components/Screen';
import { colors, fonts, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfirmRedeem'>;

export default function ConfirmRedeemScreen({ navigation, route }: Props) {
  const { vouchers } = useApp();
  const restaurant = getRestaurant(route.params.restaurantId);
  const voucher = vouchers.find((v) => v.restaurantId === route.params.restaurantId && !v.redeemedAt);

  return (
    <Screen
      layout="centered"
      compactFooter
      footer={
        <>
          {voucher ? (
            <Button
              label="Open voucher"
              onPress={() =>
                navigation.replace('RedeemVoucher', {
                  voucherId: voucher.id,
                  returnTo: route.params.returnTo,
                })
              }
            />
          ) : null}
          <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
        </>
      }
    >
      <FadeSlideIn trigger="confirm-redeem">
        <Text style={styles.title}>Redeem reward?</Text>
        <Text style={styles.body}>
          Show this to your server at {restaurant?.name ?? 'the restaurant'} for{' '}
          {restaurant?.rewardLabel ?? 'your reward'}.
        </Text>
        {!voucher ? (
          <Text style={styles.note}>Complete more sessions to unlock a voucher.</Text>
        ) : null}
      </FadeSlideIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontFamily: fonts.serifBold,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontSize: type.body,
    fontFamily: fonts.sans,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  note: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
