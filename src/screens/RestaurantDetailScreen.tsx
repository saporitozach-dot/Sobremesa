import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getRestaurant } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FadeSlideIn from '../components/FadeSlideIn';
import ScreenScroll from '../components/ScreenScroll';
import { colors, fonts, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>;

export default function RestaurantDetailScreen({ navigation, route }: Props) {
  const { stampCountFor } = useApp();
  const restaurant = getRestaurant(route.params.restaurantId);

  if (!restaurant) {
    return (
      <ScreenScroll edges={['top', 'bottom']}>
        <Text style={styles.title}>Restaurant not found</Text>
        <Button label="Back" onPress={() => navigation.goBack()} />
      </ScreenScroll>
    );
  }

  const stamps = stampCountFor(restaurant.id);
  const progress = Math.min(stamps / restaurant.stampsRequired, 1);

  return (
    <ScreenScroll edges={['top', 'bottom']}>
      <FadeSlideIn trigger={restaurant.id}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.meta}>{restaurant.cuisine}</Text>
        <Text style={styles.meta}>{restaurant.address}</Text>
        {route.params.distanceMiles != null ? (
          <Text style={styles.distance}>{route.params.distanceMiles.toFixed(1)} mi away</Text>
        ) : null}

        <Text style={styles.body}>{restaurant.description}</Text>

        <Card style={styles.rewardCard}>
          <Text style={styles.rewardLabel}>Reward</Text>
          <Text style={styles.reward}>{restaurant.rewardLabel}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.stamps}>
            {stamps} / {restaurant.stampsRequired} stamps
          </Text>
        </Card>

        <Button
          label="View stamp book"
          variant="secondary"
          onPress={() => navigation.navigate('Rewards')}
        />
      </FadeSlideIn>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontFamily: fonts.serifBold,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  meta: { color: colors.textMuted, fontSize: type.small, fontFamily: fonts.sans, lineHeight: 20 },
  distance: {
    color: colors.primary,
    fontSize: type.small,
    fontFamily: fonts.sansMedium,
    marginTop: spacing.xs,
  },
  body: {
    color: colors.text,
    fontSize: type.body,
    fontFamily: fonts.sans,
    lineHeight: 22,
    marginVertical: spacing.lg,
  },
  rewardCard: { marginBottom: spacing.lg, gap: spacing.xs },
  rewardLabel: {
    color: colors.primary,
    fontSize: type.caption,
    fontFamily: fonts.sansMedium,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reward: { color: colors.text, fontSize: type.heading, fontFamily: fonts.sansSemibold },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  stamps: { color: colors.textMuted, fontSize: type.small, fontFamily: fonts.sans, marginTop: spacing.xs },
});
