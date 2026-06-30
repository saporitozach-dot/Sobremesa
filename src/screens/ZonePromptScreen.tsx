import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { getRestaurant } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import { FeatureIcon } from '../components/icons/FeatureIcon';
import { colors, fonts, layout, motion, radius, shadows, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ZonePrompt'>;

export default function ZonePromptScreen({ navigation }: Props) {
  const { pendingRestaurantId, activeZone, settings, startSession, dismissZonePrompt } = useApp();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(300)).current;
  const restaurantId = pendingRestaurantId ?? activeZone?.restaurantId;
  const restaurant = restaurantId ? getRestaurant(restaurantId) : undefined;

  useEffect(() => {
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, ...motion.spring }).start();
  }, [slide]);

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY: slide }] }]}>
          <Text style={styles.title}>No active zone</Text>
          <Button label="Back home" onPress={() => navigation.navigate('Home')} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY: slide }] },
        ]}
      >
        <View style={styles.handle} />
        <FadeSlideIn trigger={restaurant.id} style={styles.body}>
          <View style={styles.iconCircle}>
            <FeatureIcon name="dining" size={28} />
          </View>
          <Text style={styles.kicker}>You've arrived</Text>
          <Text style={styles.title}>{restaurant.name}</Text>
          <Text style={styles.copy}>
            {settings.goalMinutes}-min session · stamp toward {restaurant.rewardLabel}
          </Text>
        </FadeSlideIn>
        <Button
          label="Start session"
          onPress={async () => {
            await startSession();
            navigation.replace('Locked');
          }}
        />
        <Button
          label="Not now"
          variant="ghost"
          onPress={() => {
            dismissZonePrompt();
            navigation.goBack();
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
    ...shadows.card,
  },
  handle: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  body: { alignItems: 'center', width: '100%' },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  kicker: {
    color: colors.primary,
    fontSize: type.caption,
    fontFamily: fonts.sansMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontFamily: fonts.serifBold,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  copy: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: 280,
  },
});
