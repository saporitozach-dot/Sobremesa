import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { PARTNER_RESTAURANTS } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';
import ScreenHeader from '../components/ScreenHeader';
import ScreenList from '../components/ScreenList';
import SectionLabel from '../components/SectionLabel';
import { text } from '../theme/typography';
import { spacing } from '../theme';

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
              <Text style={text.heading}>{item.name}</Text>
              <Text style={text.small}>
                {count} / {item.stampsRequired} stamps · {item.rewardLabel}
              </Text>
              {count >= item.stampsRequired ? (
                <Button
                  label="Redeem"
                  onPress={() =>
                    navigation.navigate('ConfirmRedeem', {
                      restaurantId: item.id,
                      returnTo: route.params?.returnTo,
                    })
                  }
                  style={styles.redeemBtn}
                />
              ) : null}
            </Card>
          </FadeSlideIn>
        );
      }}
      ListFooterComponent={
        <View>
          <SectionLabel>Vouchers</SectionLabel>
          {vouchers.length === 0 ? (
            <Text style={[text.small, styles.empty]}>Complete sessions to earn vouchers.</Text>
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
                >
                  <Card style={styles.card}>
                    <Text style={text.heading}>{v.restaurantName}</Text>
                    <Text style={text.small}>{v.rewardLabel}</Text>
                    <Text style={text.small}>{v.redeemedAt ? 'Redeemed' : 'Tap to view'}</Text>
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
  card: { marginBottom: spacing.sm },
  redeemBtn: { marginTop: spacing.sm, minHeight: 44 },
  empty: { marginBottom: spacing.lg },
});
