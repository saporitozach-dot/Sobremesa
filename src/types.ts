export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  latitude: number;
  longitude: number;
  /** Geofence radius in meters. */
  radius: number;
  /** Reward points granted for completing a phone-free session here. */
  rewardPoints: number;
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
  startedAt: number;       // epoch ms
  endedAt: number | null;  // epoch ms, null while active
  /** Whether the user completed the session without bailing early. */
  completed: boolean;
  pointsEarned: number;
}

export type LockState = 'idle' | 'pinged' | 'locked' | 'completed';

export interface AppSettings {
  cameraAllowed: boolean;
  /** Minimum minutes the user commits to before a session counts. */
  goalMinutes: number;
  notificationsEnabled: boolean;
}
