import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { PARTNER_RESTAURANTS } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';
import { ChevronRight, SettingsIcon } from '../components/icons/FeatureIcon';
import { colors, fonts, layout, radius, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { account, pendingRestaurantId, simulateArrival, stampCountFor } = useApp();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (pendingRestaurantId) {
      navigation.navigate('ZonePrompt');
    }
  }, [pendingRestaurantId, navigation]);

  return (
    <LinearGradient colors={[colors.bg, colors.bgDeep]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Hola, {account?.firstName ?? 'friend'}</Text>
          <Text style={styles.title}>Partners nearby</Text>
        </View>
        <PressableScale
          onPress={() => navigation.navigate('Settings')}
          style={styles.iconBtn}
          accessibilityLabel="Settings"
        >
          <SettingsIcon size={20} color={colors.primary} />
        </PressableScale>
      </View>

      <FlatList
        data={PARTNER_RESTAURANTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 130 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const stamps = stampCountFor(item.id);
          const progress = Math.min(stamps / item.stampsRequired, 1);

          return (
            <FadeSlideIn delay={index * 60} distance={10} trigger={`card-${item.id}`}>
              <PressableScale
                style={styles.card}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardMeta}>{item.cuisine}</Text>
                  </View>
                  <View style={styles.stampBadge}>
                    <Text style={styles.stampBadgeText}>
                      {stamps}/{item.stampsRequired}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardAddress} numberOfLines={1}>
                  {item.address}
                </Text>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardReward} numberOfLines={1}>
                    {item.rewardLabel}
                  </Text>
                  <View style={styles.cardCta}>
                    <Text style={styles.cardCtaText}>View</Text>
                    <ChevronRight size={12} color={colors.primary} />
                  </View>
                </View>
              </PressableScale>
            </FadeSlideIn>
          );
        }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <View style={styles.footerInner}>
          <Button
            label="Simulate arrival"
            variant="secondary"
            onPress={() => simulateArrival('sobremesa-demo')}
            style={styles.footerBtn}
          />
          <Button
            label="Stamp book"
            variant="ghost"
            onPress={() => navigation.navigate('Rewards')}
            style={styles.footerBtnGhost}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: layout.maxContentWidth + layout.screenPadding * 2,
    alignSelf: 'center',
    width: '100%',
  },
  headerText: { flex: 1 },
  greeting: {
    color: colors.primary,
    fontSize: type.caption,
    fontFamily: fonts.sansMedium,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontFamily: fonts.serifBold,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingHorizontal: layout.screenPadding,
    maxWidth: layout.maxContentWidth + layout.screenPadding * 2,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardInfo: { flex: 1, marginRight: spacing.md },
  cardTitle: {
    color: colors.text,
    fontSize: type.heading,
    fontFamily: fonts.sansSemibold,
    letterSpacing: -0.2,
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    marginTop: 2,
  },
  stampBadge: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stampBadgeText: {
    color: colors.primary,
    fontSize: type.caption,
    fontFamily: fonts.sansSemibold,
  },
  cardAddress: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardReward: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    flex: 1,
  },
  cardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardCtaText: {
    color: colors.primary,
    fontSize: type.caption,
    fontFamily: fonts.sansSemibold,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  footerInner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    gap: 0,
  },
  footerBtn: { minHeight: 46 },
  footerBtnGhost: { minHeight: 40 },
});
