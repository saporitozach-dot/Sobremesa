import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { SAMPLE_RESTAURANTS } from '../data/restaurants';
import { Restaurant } from '../types';
import { metersBetween } from '../utils/geo';
import {
  ArrivalValidation,
  isMockLocation,
  recordLocationSample,
  validateZoneArrival,
} from './locationIntegrity';

export const GEOFENCE_TASK = 'sobremesa-geofence-task';

export type MonitorResult = {
  ok: boolean;
  mode?: 'background' | 'foreground';
  message?: string;
};

export type ProximityResult = {
  restaurant: Restaurant | null;
  validation: ArrivalValidation | null;
};

type GeofenceEvent = {
  type: 'enter' | 'exit';
  restaurant: Restaurant;
  validation?: ArrivalValidation;
};

type Listener = (event: GeofenceEvent) => void;

const listeners = new Set<Listener>();
let foregroundWatch: Location.LocationSubscription | null = null;
let insideRegionIds = new Set<string>();

export function onGeofenceEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(event: GeofenceEvent) {
  listeners.forEach((l) => l(event));
}

function findRestaurant(regionId: string): Restaurant | undefined {
  return SAMPLE_RESTAURANTS.find((r) => r.id === regionId);
}

function tryEnterZone(
  restaurant: Restaurant,
  position: Location.LocationObject,
  options?: { bypassValidation?: boolean },
): boolean {
  if (options?.bypassValidation) {
    emit({ type: 'enter', restaurant, validation: { trusted: true } });
    return true;
  }

  const validation = validateZoneArrival(position, restaurant);
  if (!validation.trusted) {
    console.warn(
      `[geofence] rejected enter at ${restaurant.name}:`,
      validation.reason,
      validation.message,
    );
    return false;
  }

  emit({ type: 'enter', restaurant, validation });
  return true;
}

function updateProximityFromPosition(
  position: Location.LocationObject,
  options?: { bypassValidation?: boolean },
) {
  if (isMockLocation(position)) {
    console.warn('[geofence] mock location detected — ignoring proximity updates');
    return;
  }

  recordLocationSample(position);

  for (const restaurant of SAMPLE_RESTAURANTS) {
    const distance = metersBetween(
      position.coords.latitude,
      position.coords.longitude,
      restaurant.latitude,
      restaurant.longitude,
    );
    const inside = distance <= restaurant.radius;

    if (inside && !insideRegionIds.has(restaurant.id)) {
      const accepted = tryEnterZone(restaurant, position, options);
      if (accepted) insideRegionIds.add(restaurant.id);
    } else if (!inside && insideRegionIds.has(restaurant.id)) {
      insideRegionIds.delete(restaurant.id);
      emit({ type: 'exit', restaurant });
    }
  }
}

async function validateBackgroundEnter(restaurant: Restaurant): Promise<boolean> {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  }).catch(() => null);

  if (!position) return false;
  return tryEnterZone(restaurant, position);
}

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[geofence] task error', error.message);
    return;
  }
  const { eventType, region } = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };

  const restaurant = findRestaurant(region.identifier ?? '');
  if (!restaurant) return;

  if (eventType === Location.GeofencingEventType.Enter) {
    const accepted = await validateBackgroundEnter(restaurant);
    if (!accepted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `You're at ${restaurant.name}`,
        body: 'Tap to start a phone-free Sobremesa session.',
        data: { restaurantId: restaurant.id },
      },
      trigger: null,
    });
  } else if (eventType === Location.GeofencingEventType.Exit) {
    insideRegionIds.delete(restaurant.id);
    emit({ type: 'exit', restaurant });
  }
});

export async function requestPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  const fg = await Location.requestForegroundPermissionsAsync();
  let bg = { granted: false } as { granted: boolean };
  if (fg.granted) {
    try {
      bg = await Location.requestBackgroundPermissionsAsync();
    } catch {
      bg = { granted: false };
    }
  }
  try {
    await Notifications.requestPermissionsAsync();
  } catch {
    // Notifications are limited in Expo Go; don't block onboarding.
  }
  return { foreground: fg.granted, background: bg.granted };
}

/** Prompt for Always Allow if the user only granted while-in-use. */
export async function ensureBackgroundPermission(): Promise<boolean> {
  const fg = await Location.getForegroundPermissionsAsync();
  if (!fg.granted) {
    const req = await Location.requestForegroundPermissionsAsync();
    if (!req.granted) return false;
  }
  const bg = await Location.getBackgroundPermissionsAsync();
  if (bg.granted) return true;
  const req = await Location.requestBackgroundPermissionsAsync();
  return req.granted;
}

async function stopForegroundWatch() {
  if (foregroundWatch) {
    await foregroundWatch.remove();
    foregroundWatch = null;
  }
  insideRegionIds.clear();
}

async function startBackgroundGeofencing(): Promise<boolean> {
  const regions: Location.LocationRegion[] = SAMPLE_RESTAURANTS.map((r) => ({
    identifier: r.id,
    latitude: r.latitude,
    longitude: r.longitude,
    radius: r.radius,
    notifyOnEnter: true,
    notifyOnExit: true,
  }));

  const already = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(
    () => false,
  );
  if (already) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
  await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
  return true;
}

async function startForegroundWatch(): Promise<void> {
  await stopForegroundWatch();
  foregroundWatch = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 30,
      timeInterval: 15000,
    },
    (pos) => {
      updateProximityFromPosition(pos);
    },
  );

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  }).catch(() => null);
  if (pos) {
    recordLocationSample(pos);
  }
}

export async function startMonitoring(): Promise<MonitorResult> {
  const fg = await Location.getForegroundPermissionsAsync();
  if (!fg.granted) {
    return { ok: false, message: 'Location permission is required.' };
  }

  const bg = await Location.getBackgroundPermissionsAsync();

  if (bg.granted) {
    try {
      await stopForegroundWatch();
      await startBackgroundGeofencing();
      return { ok: true, mode: 'background' };
    } catch (e) {
      console.warn('[geofence] background monitoring failed', e);
    }
  }

  try {
    const running = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(
      () => false,
    );
    if (running) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
    }
    await startForegroundWatch();
    return {
      ok: true,
      mode: 'foreground',
      message: bg.granted
        ? undefined
        : 'Monitoring while Sobremesa is open. Set Expo Go location to Always Allow for background detection.',
    };
  } catch {
    return {
      ok: false,
      message:
        'Could not start zone monitoring. Check that location is enabled for Expo Go.',
    };
  }
}

export async function stopMonitoring(): Promise<void> {
  await stopForegroundWatch();
  const running = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(
    () => false,
  );
  if (running) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
}

async function readCurrentPosition(): Promise<Location.LocationObject | null> {
  const { granted } = await Location.getForegroundPermissionsAsync();
  if (!granted) return null;

  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  }).catch(() => null);
}

/** Trusted proximity check — rejects mock GPS and teleport-style jumps. */
export async function checkProximityOnce(): Promise<ProximityResult> {
  const position = await readCurrentPosition();
  if (!position) {
    return { restaurant: null, validation: null };
  }

  if (isMockLocation(position)) {
    return {
      restaurant: null,
      validation: {
        trusted: false,
        reason: 'mock_location',
        message: 'Mock location is enabled. Disable it to verify restaurant arrivals.',
      },
    };
  }

  recordLocationSample(position);

  for (const restaurant of SAMPLE_RESTAURANTS) {
    const distance = metersBetween(
      position.coords.latitude,
      position.coords.longitude,
      restaurant.latitude,
      restaurant.longitude,
    );
    if (distance <= restaurant.radius) {
      const validation = validateZoneArrival(position, restaurant);
      return {
        restaurant: validation.trusted ? restaurant : null,
        validation,
      };
    }
  }

  return { restaurant: null, validation: { trusted: true } };
}

/** Dev / demo only — skips travel and mock-location checks. */
export function simulateEnter(restaurant: Restaurant): void {
  insideRegionIds.add(restaurant.id);
  emit({ type: 'enter', restaurant, validation: { trusted: true } });
}
