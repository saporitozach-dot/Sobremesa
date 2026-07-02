import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { PARTNER_RESTAURANTS } from '../data/restaurants';
import { useApp } from '../context/AppContext';
import ActiveSessionBanner from '../components/ActiveSessionBanner';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import RestaurantCard from '../components/RestaurantCard';
import ScreenHeader from '../components/ScreenHeader';
import ScreenList from '../components/ScreenList';
import { FeatureIcon } from '../components/icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, radius, spacing } from '../theme';
import { Restaurant } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function sortRestaurants(restaurants: Restaurant[], arrivedId: string | null): Restaurant[] {
  if (!arrivedId) return restaurants;
  const arrived = restaurants.find((r) => r.id === arrivedId);
  if (!arrived) return restaurants;
  return [arrived, ...restaurants.filter((r) => r.id !== arrivedId)];
}

export default function HomeScreen({ navigation }: Props) {
  const {
    account,
    settings,
    activeZone,
    activeSession,
    pendingRestaurantId,
    stampCountFor,
  } = useApp();

  const arrivedRestaurantId = activeZone?.restaurantId ?? pendingRestaurantId ?? null;
  const restaurants = useMemo(
    () => sortRestaurants(PARTNER_RESTAURANTS, arrivedRestaurantId),
    [arrivedRestaurantId],
  );

  useEffect(() => {
    if (pendingRestaurantId) {
      navigation.navigate('ZonePrompt');
    }
  }, [pendingRestaurantId, navigation]);

  const listHeader = (
    <View style={styles.listHeader}>
      {activeSession ? (
        <FadeSlideIn trigger="active-banner">
          <ActiveSessionBanner
            session={activeSession}
            onPress={() => navigation.navigate('Locked')}
          />
        </FadeSlideIn>
      ) : null}

      {!activeSession && arrivedRestaurantId ? (
        <FadeSlideIn trigger={`arrived-${arrivedRestaurantId}`}>
          <View style={styles.arrivalHint}>
            <FeatureIcon name="dining" size={28} />
            <Text style={text.bodyMuted}>
              You're at a partner restaurant. Tap the highlighted card to start your session.
            </Text>
          </View>
        </FadeSlideIn>
      ) : null}

      {!activeSession && !arrivedRestaurantId ? (
        <FadeSlideIn trigger="empty-state">
          <View style={styles.emptyState}>
            <FeatureIcon name="dining" size={32} />
            <Text style={text.heading}>
              {settings.monitoringEnabled ? 'Waiting for arrival' : 'Monitoring is off'}
            </Text>
            <Text style={text.bodyMuted}>
              {settings.monitoringEnabled
                ? "We'll notify you when you arrive at a partner restaurant."
                : 'Turn on background monitoring in Settings to detect partner restaurants.'}
            </Text>
            {!settings.monitoringEnabled ? (
              <Button
                label="Open settings"
                variant="secondary"
                onPress={() => navigation.navigate('Settings')}
                style={styles.emptyBtn}
              />
            ) : null}
          </View>
        </FadeSlideIn>
      ) : null}
    </View>
  );

  return (
    <ScreenList
      header={
        <ScreenHeader
          kicker={`Hola, ${account?.firstName ?? 'friend'}`}
          title="Partners nearby"
          onSettingsPress={() => navigation.navigate('Settings')}
        />
      }
      data={restaurants}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={listHeader}
      renderItem={({ item, index }) => (
        <FadeSlideIn delay={index * 60} distance={10} trigger={`card-${item.id}`}>
          <RestaurantCard
            restaurant={item}
            stampCount={stampCountFor(item.id)}
            variant={item.id === arrivedRestaurantId && !activeSession ? 'arrived' : 'default'}
            onPress={() => {
              if (item.id === arrivedRestaurantId && !activeSession) {
                navigation.navigate('ZonePrompt');
              } else {
                navigation.navigate('RestaurantDetail', { restaurantId: item.id });
              }
            }}
          />
        </FadeSlideIn>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listHeader: {
    marginBottom: spacing.sm,
  },
  arrivalHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  emptyBtn: {
    marginTop: spacing.sm,
    minHeight: 44,
    alignSelf: 'stretch',
  },
});
