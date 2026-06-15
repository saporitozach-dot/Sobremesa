import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { getRestaurantById } from '../data/restaurants';
import { colors, font, radius, spacing } from '../theme';
import { formatMiles } from '../utils/geo';
import { openMapsNavigation } from '../utils/maps';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>;

export default function RestaurantDetailScreen({ route, navigation }: Props) {
  const { restaurantId, distanceMiles } = route.params;
  const restaurant = getRestaurantById(restaurantId);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: restaurant?.name ?? 'Partner',
      headerBackTitle: 'Back',
    });
  }, [navigation, restaurant?.name]);

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Restaurant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const partner = restaurant;

  async function handleDirections() {
    await openMapsNavigation(partner.name, partner.latitude, partner.longitude);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cuisineLabel}>Type of food</Text>
          <Text style={styles.cuisine}>{partner.cuisine}</Text>

          {distanceMiles != null && (
            <Text style={styles.distance}>{formatMiles(distanceMiles)} away</Text>
          )}

          <Text style={styles.descriptionLabel}>About</Text>
          <Text style={styles.description}>{partner.description}</Text>
        </View>

        <Button title="Get directions" onPress={handleDirections} />
        <Text style={styles.hint}>Opens in your maps app for turn-by-turn navigation.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cuisineLabel: {
    color: colors.textMuted,
    fontSize: font.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  cuisine: {
    color: colors.primary,
    fontSize: font.body,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  distance: {
    color: colors.textMuted,
    fontSize: font.small,
    marginTop: spacing.sm,
  },
  descriptionLabel: {
    color: colors.textMuted,
    fontSize: font.small,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  description: {
    color: colors.text,
    fontSize: font.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
});
