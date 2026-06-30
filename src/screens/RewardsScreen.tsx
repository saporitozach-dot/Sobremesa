import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../App';
import { PARTNER_RESTAURANTS } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';
import SectionLabel from '../components/SectionLabel';
import { colors, fonts, layout, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Rewards'>;

export default function RewardsScreen({ navigation, route }: Props) {
  const { stamps, vouchers } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={[colors.bg, colors.bgDeep]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Stamp book</Text>
        <Text style={styles.subtitle}>Your balances and vouchers</Text>
      </View>

      <FlatList
        data={PARTNER_RESTAURANTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        ListHeaderComponent={<SectionLabel>Balances</SectionLabel>}
        renderItem={({ item, index }) => {
          const count = stamps.find((s) => s.restaurantId === item.id)?.count ?? 0;
          return (
            <FadeSlideIn delay={index * 50} trigger={item.id}>
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>
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
              <Text style={styles.empty}>Complete sessions to earn vouchers.</Text>
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
                      <Text style={styles.cardTitle}>{v.restaurantName}</Text>
                      <Text style={styles.cardMeta}>{v.rewardLabel}</Text>
                      <Text style={styles.cardMeta}>
                        {v.redeemedAt ? 'Redeemed' : 'Tap to view'}
                      </Text>
                    </Card>
                  </PressableScale>
                </FadeSlideIn>
              ))
            )}
          </View>
        }
        style={styles.list}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
    maxWidth: layout.maxContentWidth + layout.screenPadding * 2,
    alignSelf: 'center',
    width: '100%',
  },
  list: {
    paddingHorizontal: layout.screenPadding,
    maxWidth: layout.maxContentWidth + layout.screenPadding * 2,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontFamily: fonts.serifBold,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    marginTop: spacing.xs,
  },
  card: { marginBottom: spacing.sm },
  cardTitle: { color: colors.text, fontFamily: fonts.sansSemibold, fontSize: type.body },
  cardMeta: { color: colors.textMuted, fontSize: type.small, fontFamily: fonts.sans, marginTop: 2 },
  redeemBtn: { marginTop: spacing.sm, minHeight: 44 },
  empty: { color: colors.textMuted, fontSize: type.small, fontFamily: fonts.sans, marginBottom: spacing.lg },
});
