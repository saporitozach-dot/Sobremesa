export const STAMPS_FOR_REWARD = 3;
export const MIN_STAMP_MINUTES = 30;

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  latitude: number;
  longitude: number;
  /** Geofence radius in meters. */
  radius: number;
  /** @deprecated Use stamp rewards instead. */
  rewardPoints: number;
  /** Shown on redemption voucher. */
  rewardLabel: string;
}

export interface Account {
  firstName: string;
  email: string;
  phone: string;
  password: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

/** A single phone-free dining session. */
export interface Session {
  id: string;
  restaurantId: string;
  restaurantName: string;
  startedAt: number;
  endedAt: number | null;
  completed: boolean;
  pointsEarned: number;
  stampEarned?: boolean;
}

export type LockState = 'idle' | 'pinged' | 'locked' | 'completed';

export interface AppSettings {
  cameraAllowed: boolean;
  goalMinutes: number;
  notificationsEnabled: boolean;
}

export interface RestaurantStampBook {
  restaurantId: string;
  /** Current stamps toward next reward (0–3). */
  stamps: number;
  totalStampsEarned: number;
  /** YYYY-MM-DD of last stamp earned. */
  lastStampDate: string | null;
  redemptionsCount: number;
}

export interface RedemptionVoucher {
  id: string;
  restaurantId: string;
  restaurantName: string;
  code: string;
  rewardLabel: string;
  /** Server who confirmed the 2FA redemption step. */
  serverConfirmedBy?: string;
  issuedAt: number;
  redeemedAt: number | null;
  status: 'active' | 'redeemed';
}

export interface StampAwardResult {
  earned: boolean;
  reason?: string;
}

export interface LastStampResult {
  restaurantId: string;
  restaurantName: string;
  earned: boolean;
  reason?: string;
  stampsAfter: number;
}
