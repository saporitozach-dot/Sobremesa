export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  rewardLabel: string;
  stampsRequired: number;
  description: string;
};

export type Account = {
  id: string;
  firstName: string;
  email: string;
  phone: string;
};

export type SignUpDraft = {
  firstName: string;
  email: string;
  phone: string;
  password: string;
};

export type AppSettings = {
  monitoringEnabled: boolean;
  goalMinutes: 30 | 45 | 60 | 90;
  cameraAllowed: boolean;
  emergencyContacts: EmergencyContact[];
};

export type SessionRecord = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  startedAt: string;
  completedAt: string;
  goalMinutes: number;
  earnedStamp: boolean;
};

export type Voucher = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  rewardLabel: string;
  redeemedAt: string | null;
  expiresAt: string;
};

export type StampBalance = {
  restaurantId: string;
  count: number;
};

export type ActiveZone = {
  restaurantId: string;
  enteredAt: string;
};
