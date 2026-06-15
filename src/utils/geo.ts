import { Restaurant } from '../types';

const METERS_PER_MILE = 1609.344;

export function metersBetween(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function milesBetween(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  return metersBetween(aLat, aLng, bLat, bLng) / METERS_PER_MILE;
}

export type NearbyRestaurant = Restaurant & { distanceMiles: number };

export function restaurantsWithinRadius(
  restaurants: Restaurant[],
  latitude: number,
  longitude: number,
  radiusMiles: number,
): NearbyRestaurant[] {
  return restaurants
    .map((restaurant) => ({
      ...restaurant,
      distanceMiles: milesBetween(
        latitude,
        longitude,
        restaurant.latitude,
        restaurant.longitude,
      ),
    }))
    .filter((r) => r.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
}

export function formatMiles(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/** GPS horizontal accuracy in meters, when the platform provides it. */
export function formatGpsAccuracy(accuracyMeters: number | null | undefined): string {
  if (accuracyMeters == null || !Number.isFinite(accuracyMeters) || accuracyMeters <= 0) {
    return 'GPS location (While Using permission)';
  }
  if (accuracyMeters < 1000) {
    return `GPS location ±${Math.round(accuracyMeters)} m (While Using permission)`;
  }
  return `GPS location ±${(accuracyMeters / 1000).toFixed(1)} km (While Using permission)`;
}

export const NEARBY_RADIUS_MILES = 25;

/** Demo anchor for sample partners (Las Olas, Fort Lauderdale). */
export const DEMO_LOCATION = { latitude: 26.1194, longitude: -80.1378 };
