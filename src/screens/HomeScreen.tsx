import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import { SAMPLE_RESTAURANTS } from '../data/restaurants';
import {
  checkProximityOnce,
  simulateEnter,
} from '../services/geofence';
import Logo from '../components/Logo';
import SettingsIcon from '../components/SettingsIcon';
import PulseArrivalButton from '../components/PulseArrivalButton';
import { Restaurant } from '../types';
import {
  DEMO_LOCATION,
  formatGpsAccuracy,
  formatMiles,
  NEARBY_RADIUS_MILES,
  NearbyRestaurant,
  restaurantsWithinRadius,
} from '../utils/geo';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type PermissionState = 'unknown' | 'granted' | 'denied';
type ListSource = 'location' | 'demo' | null;

export default function HomeScreen({ navigation }: { navigation: Nav }) {
  const { lockState, activeRestaurant } = useApp();
  const [nearby, setNearby] = useState<NearbyRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [listSource, setListSource] = useState<ListSource>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [atRestaurant, setAtRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (lockState === 'pinged' && activeRestaurant) {
      navigation.navigate('ZonePrompt');
    }
  }, [lockState, activeRestaurant, navigation]);

  const loadDemoPartners = useCallback(() => {
    setListSource('demo');
    setLocationError(null);
    setGpsAccuracy(null);
    setNearby(
      restaurantsWithinRadius(
        SAMPLE_RESTAURANTS,
        DEMO_LOCATION.latitude,
        DEMO_LOCATION.longitude,
        NEARBY_RADIUS_MILES,
      ),
    );
  }, []);

  const loadNearby = useCallback(
    async (requestIfNeeded = false) => {
      setLoading(true);
      setListSource(null);
      setLocationError(null);
      setGpsAccuracy(null);

      try {
        let fg = await Location.getForegroundPermissionsAsync();

        if (!fg.granted) {
          if (requestIfNeeded && fg.canAskAgain !== false) {
            fg = await Location.requestForegroundPermissionsAsync();
          }
          if (!fg.granted) {
            setPermission('denied');
            setNearby([]);
            return;
          }
        }

        setPermission('granted');

        let pos: Location.LocationObject | null = null;
        try {
          pos = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('location timeout')), 15000),
            ),
          ]);
        } catch {
          setLocationError('Could not determine your location. Try again or browse sample partners.');
          setNearby([]);
          return;
        }

        const results = restaurantsWithinRadius(
          SAMPLE_RESTAURANTS,
          pos.coords.latitude,
          pos.coords.longitude,
          NEARBY_RADIUS_MILES,
        );

        if (results.length === 0) {
          setLocationError(
            `No Sobremesa partners within ${NEARBY_RADIUS_MILES} miles of your location.`,
          );
          setNearby([]);
          return;
        }

        setListSource('location');
        setGpsAccuracy(pos.coords.accuracy ?? null);
        setNearby(results);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadNearby(true);
  }, [loadNearby]);

  useEffect(() => {
    if (permission !== 'granted' || lockState === 'locked') {
      setAtRestaurant(null);
      return;
    }

    let cancelled = false;

    async function pollZone() {
      const here = await checkProximityOnce().catch(() => null);
      if (!cancelled) setAtRestaurant(here);
    }

    pollZone();
    const id = setInterval(pollZone, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [permission, lockState]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadNearby(true);
    setRefreshing(false);
  }

  async function handleRequestLocation() {
    setLoading(true);
    await loadNearby(true);
  }

  async function handleStartSession() {
    const here = atRestaurant ?? (await checkProximityOnce().catch(() => null));
    simulateEnter(here ?? nearby[0] ?? SAMPLE_RESTAURANTS[0]);
  }

  async function handleSimulate() {
    await handleStartSession();
  }

  const showPermissionCard = permission === 'unknown' || permission === 'denied';
  const inPartnerZone = atRestaurant != null && lockState !== 'locked';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Logo size={32} />
          <Text style={styles.wordmark}>Sobremesa</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
          hitSlop={8}
          accessibilityLabel="Settings"
        >
          <SettingsIcon size={20} color={colors.text} />
        </Pressable>
      </View>

      {showPermissionCard && !loading && (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Location access needed</Text>
          <Text style={styles.permissionBody}>
            Sobremesa uses your location to find partner restaurants near you. iOS
            will ask via Expo Go — tap Allow While Using the App.
          </Text>
          {permission === 'denied' ? (
            <>
              <Pressable onPress={() => Linking.openSettings()} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Open Settings</Text>
              </Pressable>
              <Pressable onPress={loadDemoPartners} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Browse sample partners</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={handleRequestLocation} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Allow location</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Partner restaurants nearby</Text>
        <Text style={styles.sectionSub}>
          {listSource === 'location'
            ? `${formatGpsAccuracy(gpsAccuracy)} · within ${NEARBY_RADIUS_MILES} mi`
            : listSource === 'demo'
              ? 'Demo preview only — mileages hidden (not calculated from your phone)'
              : `Within ${NEARBY_RADIUS_MILES} miles of you`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={nearby}
          keyExtractor={(r) => r.id}
          style={styles.list}
          contentContainerStyle={[
            nearby.length === 0 ? styles.listEmpty : styles.listContent,
            inPartnerZone && styles.listContentWithZoneBar,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <RestaurantRow
              restaurant={item}
              showDistance={listSource === 'location'}
              onPress={() =>
                navigation.navigate('RestaurantDetail', {
                  restaurantId: item.id,
                  distanceMiles: listSource === 'location' ? item.distanceMiles : undefined,
                })
              }
            />
          )}
          ListEmptyComponent={
            !showPermissionCard ? (
              <View style={styles.emptyInline}>
                <Text style={styles.emptyTitle}>
                  {locationError ? 'Nothing nearby' : 'No partners nearby'}
                </Text>
                <Text style={styles.emptyBody}>
                  {locationError ??
                    `No Sobremesa partners within ${NEARBY_RADIUS_MILES} miles of your location.`}
                </Text>
                {locationError ? (
                  <Pressable onPress={handleRefresh} style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnText}>Try again</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={loadDemoPartners} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Browse sample partners</Text>
                </Pressable>
              </View>
            ) : null
          }
          ListFooterComponent={
            nearby.length > 0 && !inPartnerZone ? (
              <Pressable
                onPress={handleSimulate}
                style={({ pressed }) => [styles.simulate, pressed && styles.pressed]}
              >
                <Text style={styles.simulateText}>Simulate arrival (testing)</Text>
              </Pressable>
            ) : null
          }
        />
      )}

      {inPartnerZone && (
        <View style={styles.zoneBar}>
          <PulseArrivalButton
            title={`You're at ${atRestaurant.name}`}
            subtitle="Tap to start your phone-free session"
            onPress={handleStartSession}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function RestaurantRow({
  restaurant,
  showDistance,
  onPress,
}: {
  restaurant: NearbyRestaurant;
  showDistance: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}, ${restaurant.cuisine}`}
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{restaurant.name}</Text>
        <Text style={styles.rowSub}>{restaurant.cuisine}</Text>
      </View>
      <Text style={styles.rowChevron}>›</Text>
      {showDistance ? (
        <Text style={styles.rowDistance}>{formatMiles(restaurant.distanceMiles)}</Text>
      ) : (
        <Text style={styles.rowDemoBadge}>Demo</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  permissionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    backgroundColor: colors.surface,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
  permissionBody: {
    color: colors.textMuted,
    fontSize: font.small,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  primaryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: font.body,
  },
  secondaryBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: font.small,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '600',
  },
  sectionSub: {
    color: colors.textMuted,
    fontSize: font.small,
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  listContentWithZoneBar: {
    paddingBottom: 120,
  },
  zoneBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listEmpty: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
  },
  rowMain: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rowTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '500',
  },
  rowSub: {
    color: colors.textMuted,
    fontSize: font.small,
    marginTop: 3,
  },
  rowChevron: {
    color: colors.textMuted,
    fontSize: 20,
    marginRight: spacing.sm,
    marginTop: -2,
  },
  rowDistance: {
    color: colors.primaryDark,
    fontSize: font.small,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rowDemoBadge: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyInline: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 280,
  },
  simulate: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  simulateText: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '500',
  },
});
