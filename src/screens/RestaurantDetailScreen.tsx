import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getRestaurant } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FadeSlideIn from '../components/FadeSlideIn';
import ScreenHeader from '../components/ScreenHeader';
import ScreenScroll from '../components/ScreenScroll';
import StampCard from '../components/StampCard';
import { text } from '../theme/typography';
import { colors, fonts, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>;

export default function RestaurantDetailScreen({ navigation, route }: Props) {
  const { activeSession, stampCountFor, simulateArrival } = useApp();
  const restaurant = getRestaurant(route.params.restaurantId);

  if (!restaurant) {
    return (
      <ScreenScroll edges={['top', 'bottom']}>
        <Text style={text.titleBold}>Restaurant not found</Text>
        <Button label="Back" onPress={() => navigation.goBack()} />
      </ScreenScroll>
    );
  }

  const stamps = stampCountFor(restaurant.id);

  return (
    <ScreenScroll edges={['bottom']} contentContainerStyle={styles.scroll}>
      <ScreenHeader
        kicker="Partner"
        title={restaurant.name}
        onBackPress={() => navigation.goBack()}
      />
      <FadeSlideIn trigger={restaurant.id}>
        <Text style={text.small}>{restaurant.cuisine}</Text>
        <Text style={text.small}>{restaurant.address}</Text>
        {route.params.distanceMiles != null ? (
          <Text style={[text.small, styles.distance]}>
            {route.params.distanceMiles.toFixed(1)} mi away
          </Text>
        ) : null}

        <Text style={[text.body, styles.body]}>{restaurant.description}</Text>

        <StampCard restaurant={restaurant} current={stamps} style={styles.rewardCard} />

        <Button
          label="View stamp book"
          variant="secondary"
          onPress={() => navigation.navigate('Rewards')}
        />
        {restaurant.id === 'sobremesa-demo' && !activeSession ? (
          <Button
            label="Start demo session"
            onPress={() => {
              simulateArrival(restaurant.id);
              navigation.navigate('ZonePrompt');
            }}
            style={styles.demoStartButton}
          />
        ) : null}
      </FadeSlideIn>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 0,
  },
  distance: {
    color: colors.primary,
    marginTop: spacing.xs,
    fontFamily: fonts.sansMedium,
  },
  body: {
    marginVertical: spacing.lg,
  },
  rewardCard: { marginBottom: spacing.lg, gap: spacing.xs },
  progress: { marginTop: spacing.sm },
  demoStartButton: { marginTop: spacing.sm },
});
