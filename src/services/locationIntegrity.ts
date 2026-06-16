import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Restaurant } from '../types';
import { metersBetween } from '../utils/geo';

/** ~78 mph — faster than plausible last-mile arrival. */
const MAX_IMPLIED_SPEED_MPS = 35;
/** Must have been at least this far beyond the geofence edge before entering. */
const MIN_OUTSIDE_BUFFER_M = 75;
/** Instant jump larger than this within TELEPORT_WINDOW_MS is suspicious. */
const TELEPORT_DISTANCE_M = 350;
const TELEPORT_WINDOW_MS = 45_000;
const HISTORY_TTL_MS = 10 * 60 * 1000;
const MAX_SAMPLES = 24;

type LocationSample = {
  lat: number;
  lng: number;
  timestamp: number;
  mocked: boolean;
};

export type ArrivalRejectionReason =
  | 'mock_location'
  | 'teleport'
  | 'no_travel_history'
  | 'not_inside';

export type ArrivalValidation = {
  trusted: boolean;
  reason?: ArrivalRejectionReason;
  message?: string;
};

const samples: LocationSample[] = [];

/** Android exposes Location.isFromMockProvider as LocationObject.mocked. */
export function isMockLocation(position: Location.LocationObject): boolean {
  return Platform.OS === 'android' && position.mocked === true;
}

export function recordLocationSample(position: Location.LocationObject): void {
  if (isMockLocation(position)) return;

  const sample: LocationSample = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    timestamp: position.timestamp,
    mocked: false,
  };

  samples.push(sample);

  const cutoff = Date.now() - HISTORY_TTL_MS;
  while (samples.length > MAX_SAMPLES || (samples[0] && samples[0].timestamp < cutoff)) {
    samples.shift();
  }
}

export function clearLocationHistory(): void {
  samples.length = 0;
}

function priorSamples(beforeTimestamp: number): LocationSample[] {
  const cutoff = Date.now() - HISTORY_TTL_MS;
  return samples.filter(
    (s) => s.timestamp < beforeTimestamp && s.timestamp >= cutoff && !s.mocked,
  );
}

function distanceToRestaurant(sample: LocationSample, restaurant: Restaurant): number {
  return metersBetween(sample.lat, sample.lng, restaurant.latitude, restaurant.longitude);
}

/**
 * Validates that the device traveled into a partner zone rather than teleporting in.
 * Requires a recent GPS reading outside the geofence before accepting an enter event.
 */
export function validateZoneArrival(
  position: Location.LocationObject,
  restaurant: Restaurant,
): ArrivalValidation {
  if (isMockLocation(position)) {
    return {
      trusted: false,
      reason: 'mock_location',
      message: 'Mock location is enabled. Disable it to verify restaurant arrivals.',
    };
  }

  const insideDistance = distanceToRestaurant(
    {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: position.timestamp,
      mocked: false,
    },
    restaurant,
  );

  if (insideDistance > restaurant.radius) {
    return {
      trusted: false,
      reason: 'not_inside',
      message: 'Not inside the partner zone.',
    };
  }

  const history = priorSamples(position.timestamp);
  if (history.length === 0) {
    return {
      trusted: false,
      reason: 'no_travel_history',
      message: 'Could not verify travel into this zone. Move away, then walk back in.',
    };
  }

  const latest = history[history.length - 1];
  const jumpMeters = metersBetween(
    latest.lat,
    latest.lng,
    position.coords.latitude,
    position.coords.longitude,
  );
  const elapsedSec = Math.max(0.001, (position.timestamp - latest.timestamp) / 1000);
  const impliedSpeed = jumpMeters / elapsedSec;

  if (jumpMeters > TELEPORT_DISTANCE_M && position.timestamp - latest.timestamp < TELEPORT_WINDOW_MS) {
    return {
      trusted: false,
      reason: 'teleport',
      message: 'Location jumped too quickly to trust this arrival.',
    };
  }

  if (impliedSpeed > MAX_IMPLIED_SPEED_MPS) {
    return {
      trusted: false,
      reason: 'teleport',
      message: 'Location moved faster than expected for a real arrival.',
    };
  }

  const outsideThreshold = restaurant.radius + MIN_OUTSIDE_BUFFER_M;
  const traveledIn = history.some(
    (sample) => distanceToRestaurant(sample, restaurant) > outsideThreshold,
  );

  if (!traveledIn) {
    return {
      trusted: false,
      reason: 'no_travel_history',
      message: 'You need to travel into the zone — a sudden jump inside is not accepted.',
    };
  }

  return { trusted: true };
}

export function rejectionMessage(reason: ArrivalRejectionReason): string {
  switch (reason) {
    case 'mock_location':
      return 'Mock location detected. Turn off developer mock GPS to use partner zones.';
    case 'teleport':
      return 'This arrival looks like a location jump, not a real visit.';
    case 'no_travel_history':
      return 'We could not confirm you walked or drove into this zone.';
    default:
      return 'Location could not be verified for this partner zone.';
  }
}
