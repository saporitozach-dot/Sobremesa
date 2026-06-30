import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { PARTNER_RESTAURANTS } from '../data/restaurants';
import { getRestaurant } from '../data/restaurants';

export const GEOFENCE_TASK = 'SOBREMESA_GEOFENCE_TASK';

type ZoneListener = (restaurantId: string) => void;
const listeners = new Set<ZoneListener>();

export function onZoneEnter(listener: ZoneListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitZoneEnter(restaurantId: string) {
  listeners.forEach((listener) => listener(restaurantId));
}

if (!TaskManager.isTaskDefined(GEOFENCE_TASK)) {
  TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('Geofence task error', error);
    return;
  }

  const event = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };

  if (event?.eventType === Location.GeofencingEventType.Enter) {
    const restaurantId = event.region.identifier ?? '';
    const restaurant = getRestaurant(restaurantId);
    if (!restaurant) return;

    emitZoneEnter(restaurantId);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Welcome to ${restaurant.name}`,
        body: 'Ready for a phone-free meal? Tap to start your Sobremesa session.',
        data: { restaurantId },
      },
      trigger: null,
    });
  }
  });
}

export async function requestGeofencePermissions(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return false;

  const bg = await Location.requestBackgroundPermissionsAsync();
  return bg.status === 'granted';
}

export async function startGeofenceMonitoring(): Promise<void> {
  const regions: Location.LocationRegion[] = PARTNER_RESTAURANTS.map((r) => ({
    identifier: r.id,
    latitude: r.latitude,
    longitude: r.longitude,
    radius: r.radiusMeters,
    notifyOnEnter: true,
    notifyOnExit: false,
  }));

  const started = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (started) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }

  await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
}

export async function stopGeofenceMonitoring(): Promise<void> {
  const started = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (started) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
}

export function simulateZoneEnter(restaurantId: string) {
  emitZoneEnter(restaurantId);
}
