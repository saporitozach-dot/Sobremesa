import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getRestaurant } from '../data/restaurants';
import {
  onZoneEnter,
  requestGeofencePermissions,
  simulateZoneEnter,
  startGeofenceMonitoring,
  stopGeofenceMonitoring,
} from '../services/geofence';
import {
  Account,
  ActiveZone,
  AppSettings,
  SessionCompleteResult,
  SessionRecord,
  SignUpDraft,
  StampBalance,
  Voucher,
} from '../types';
import { colors } from '../theme';

const STORAGE_KEY = 'sobremesa.v1';

type PersistedState = {
  account: Account | null;
  onboarded: boolean;
  settings: AppSettings;
  stamps: StampBalance[];
  sessions: SessionRecord[];
  vouchers: Voucher[];
  activeSession: SessionRecord | null;
};

type AppContextValue = {
  account: Account | null;
  onboarded: boolean;
  settings: AppSettings;
  stamps: StampBalance[];
  sessions: SessionRecord[];
  vouchers: Voucher[];
  activeZone: ActiveZone | null;
  activeSession: SessionRecord | null;
  pendingRestaurantId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (draft: SignUpDraft) => Promise<Account>;
  verifyPhone: (draft: SignUpDraft, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  simulateArrival: (restaurantId?: string) => void;
  dismissZonePrompt: () => void;
  startSession: () => Promise<void>;
  endSessionEarly: () => Promise<void>;
  completeSession: () => Promise<SessionCompleteResult | null>;
  redeemVoucher: (voucherId: string) => Promise<void>;
  stampCountFor: (restaurantId: string) => number;
};

const defaultSettings: AppSettings = {
  monitoringEnabled: true,
  goalMinutes: 45,
  cameraAllowed: true,
  emergencyContacts: [
    { id: '1', name: 'Emergency', phone: '911' },
  ],
};

const AppContext = createContext<AppContextValue | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [stamps, setStamps] = useState<StampBalance[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [activeZone, setActiveZone] = useState<ActiveZone | null>(null);
  const [activeSession, setActiveSession] = useState<SessionRecord | null>(null);
  const [pendingRestaurantId, setPendingRestaurantId] = useState<string | null>(null);

  const persist = useCallback(async (next: Partial<PersistedState>) => {
    const snapshot: PersistedState = {
      account: next.account !== undefined ? next.account : account,
      onboarded: next.onboarded !== undefined ? next.onboarded : onboarded,
      settings: next.settings ?? settings,
      stamps: next.stamps ?? stamps,
      sessions: next.sessions ?? sessions,
      vouchers: next.vouchers ?? vouchers,
      activeSession: next.activeSession !== undefined ? next.activeSession : activeSession,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [account, onboarded, settings, stamps, sessions, vouchers, activeSession]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw) as PersistedState;
          setAccount(data.account ?? null);
          setOnboarded(data.onboarded ?? false);
          setSettings({ ...defaultSettings, ...data.settings });
          setStamps(data.stamps ?? []);
          setSessions(data.sessions ?? []);
          setVouchers(data.vouchers ?? []);
          setActiveSession(data.activeSession ?? null);
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated || !onboarded || !settings.monitoringEnabled) return;

    (async () => {
      const granted = await requestGeofencePermissions();
      if (granted) {
        await startGeofenceMonitoring();
      }
    })();

    return () => {
      stopGeofenceMonitoring().catch(() => undefined);
    };
  }, [hydrated, onboarded, settings.monitoringEnabled]);

  useEffect(() => {
    return onZoneEnter((restaurantId) => {
      setActiveZone({ restaurantId, enteredAt: new Date().toISOString() });
      setPendingRestaurantId(restaurantId);
    });
  }, []);

  const stampCountFor = useCallback(
    (restaurantId: string) => stamps.find((s) => s.restaurantId === restaurantId)?.count ?? 0,
    [stamps],
  );

  const signIn = useCallback(async (email: string, _password: string) => {
    const nextAccount: Account = {
      id: makeId(),
      firstName: email.split('@')[0] || 'Guest',
      email,
      phone: '',
    };
    setAccount(nextAccount);
    await persist({ account: nextAccount });
  }, [persist]);

  const signUp = useCallback(async (draft: SignUpDraft) => {
    const nextAccount: Account = {
      id: makeId(),
      firstName: draft.firstName,
      email: draft.email,
      phone: draft.phone,
    };
    return nextAccount;
  }, []);

  const verifyPhone = useCallback(async (draft: SignUpDraft, code: string) => {
    if (code.trim() !== '123456') {
      throw new Error('Invalid code. Use 123456 for demo verification.');
    }
    const nextAccount: Account = {
      id: makeId(),
      firstName: draft.firstName,
      email: draft.email,
      phone: draft.phone,
    };
    setAccount(nextAccount);
    await persist({ account: nextAccount });
  }, [persist]);

  const signOut = useCallback(async () => {
    setAccount(null);
    setOnboarded(false);
    setActiveSession(null);
    setPendingRestaurantId(null);
    await persist({ account: null, onboarded: false, activeSession: null });
  }, [persist]);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    await persist({ onboarded: true });
  }, [persist]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await persist({ settings: next });
  }, [persist, settings]);

  const simulateArrival = useCallback((restaurantId = 'sobremesa-demo') => {
    simulateZoneEnter(restaurantId);
    setActiveZone({ restaurantId, enteredAt: new Date().toISOString() });
    setPendingRestaurantId(restaurantId);
  }, []);

  const dismissZonePrompt = useCallback(() => {
    setPendingRestaurantId(null);
  }, []);

  const startSession = useCallback(async () => {
    const restaurantId = pendingRestaurantId ?? activeZone?.restaurantId;
    const restaurant = restaurantId ? getRestaurant(restaurantId) : undefined;
    if (!restaurant) return;

    const session: SessionRecord = {
      id: makeId(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      startedAt: new Date().toISOString(),
      completedAt: '',
      goalMinutes: settings.goalMinutes,
      earnedStamp: false,
    };
    setActiveSession(session);
    setPendingRestaurantId(null);
    await persist({ activeSession: session });
  }, [activeZone?.restaurantId, pendingRestaurantId, settings.goalMinutes, persist]);

  const endSessionEarly = useCallback(async () => {
    setActiveSession(null);
    await persist({ activeSession: null });
  }, [persist]);

  const completeSession = useCallback(async (): Promise<SessionCompleteResult | null> => {
    if (!activeSession) return null;

    const completed: SessionRecord = {
      ...activeSession,
      completedAt: new Date().toISOString(),
      earnedStamp: true,
    };

    const nextSessions = [completed, ...sessions];
    const restaurant = getRestaurant(completed.restaurantId);
    const existing = stamps.find((s) => s.restaurantId === completed.restaurantId);
    const nextCount = (existing?.count ?? 0) + 1;
    const nextStamps = existing
      ? stamps.map((s) => (s.restaurantId === completed.restaurantId ? { ...s, count: nextCount } : s))
      : [...stamps, { restaurantId: completed.restaurantId, count: nextCount }];

    const stampsRequired = restaurant?.stampsRequired ?? nextCount;
    const rewardLabel = restaurant?.rewardLabel ?? 'Partner reward';
    const voucherUnlocked = Boolean(restaurant && nextCount >= restaurant.stampsRequired);
    const displayStampCount = voucherUnlocked ? 0 : nextCount;

    const result: SessionCompleteResult = {
      restaurantId: completed.restaurantId,
      restaurantName: completed.restaurantName,
      goalMinutes: completed.goalMinutes,
      stampCount: displayStampCount,
      stampsRequired,
      rewardLabel,
      voucherUnlocked,
    };

    let nextVouchers = vouchers;
    if (voucherUnlocked && restaurant) {
      const voucher: Voucher = {
        id: makeId(),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        rewardLabel: restaurant.rewardLabel,
        redeemedAt: null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      nextVouchers = [voucher, ...vouchers];
      const resetStamps = nextStamps.map((s) =>
        s.restaurantId === completed.restaurantId ? { ...s, count: 0 } : s,
      );
      setStamps(resetStamps);
      setVouchers(nextVouchers);
      setSessions(nextSessions);
      setActiveSession(null);
      await persist({
        sessions: nextSessions,
        stamps: resetStamps,
        vouchers: nextVouchers,
        activeSession: null,
      });
      return result;
    }

    setStamps(nextStamps);
    setSessions(nextSessions);
    setActiveSession(null);
    await persist({
      sessions: nextSessions,
      stamps: nextStamps,
      vouchers: nextVouchers,
      activeSession: null,
    });
    return result;
  }, [activeSession, sessions, stamps, vouchers, persist]);

  const redeemVoucher = useCallback(async (voucherId: string) => {
    const nextVouchers = vouchers.map((v) =>
      v.id === voucherId ? { ...v, redeemedAt: new Date().toISOString() } : v,
    );
    setVouchers(nextVouchers);
    await persist({ vouchers: nextVouchers });
  }, [vouchers, persist]);

  const value = useMemo<AppContextValue>(
    () => ({
      account,
      onboarded,
      settings,
      stamps,
      sessions,
      vouchers,
      activeZone,
      activeSession,
      pendingRestaurantId,
      signIn,
      signUp,
      verifyPhone,
      signOut,
      completeOnboarding,
      updateSettings,
      simulateArrival,
      dismissZonePrompt,
      startSession,
      endSessionEarly,
      completeSession,
      redeemVoucher,
      stampCountFor,
    }),
    [
      account,
      onboarded,
      settings,
      stamps,
      sessions,
      vouchers,
      activeZone,
      activeSession,
      pendingRestaurantId,
      signIn,
      signUp,
      verifyPhone,
      signOut,
      completeOnboarding,
      updateSettings,
      simulateArrival,
      dismissZonePrompt,
      startSession,
      endSessionEarly,
      completeSession,
      redeemVoucher,
      stampCountFor,
    ],
  );

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
