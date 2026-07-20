import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { getRestaurant } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import { ChevronRight, FeatureIcon } from '../components/icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, layout, motion, radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ZonePrompt'>;

export default function ZonePromptScreen({ navigation }: Props) {
  const { pendingRestaurantId, activeZone, settings, startSession, dismissZonePrompt } = useApp();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(300)).current;
  const [starting, setStarting] = useState(false);
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
          loading={starting}
          trailingIcon={<ChevronRight color={colors.bgDeep} />}
          onPress={async () => {
            setStarting(true);
            try {
              await startSession();
              navigation.replace('Locked');
            } finally {
              setStarting(false);
            }
          }}
        />
        <Button
          label="Not now"
          variant="ghost"
          disabled={starting}
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
    width: spacing.xxl,
    height: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  body: { alignItems: 'center', width: '100%' },
  iconCircle: {
    width: layout.controlHeight,
    height: layout.controlHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  kicker: {
    ...text.kicker,
    marginBottom: spacing.xs,
  },
  title: {
    ...text.titleBold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  copy: {
    ...text.small,
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: layout.compactCopyWidth,
  },
});
