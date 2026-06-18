import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import RedeemConfirmSheet from '../components/RedeemConfirmSheet';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ConfirmRedeem'>;
type Route = RouteProp<RootStackParamList, 'ConfirmRedeem'>;

export default function ConfirmRedeemScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: Route;
}) {
  const { restaurantId, returnTo } = route.params;

  return (
    <RedeemConfirmSheet
      visible
      restaurantId={restaurantId}
      onClose={() => navigation.goBack()}
      onVoucher={(voucherId) => {
        navigation.replace('RedeemVoucher', { voucherId, returnTo });
      }}
    />
  );
}
