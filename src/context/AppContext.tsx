import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  Account,
  AppSettings,
  EmergencyContact,
  LockState,
  Restaurant,
  Session,
} from '../types';
import {
  onGeofenceEvent,
  startMonitoring,
  stopMonitoring,
  MonitorResult,
} from '../services/geofence';

const STORAGE_KEY = 'sobremesa-state-v1';

interface State {
  lockState: LockState;
  activeRestaurant: Restaurant | null;
  activeSession: Session | null;
  history: Session[];
  totalPoints: number;
  settings: AppSettings;
  emergencyContacts: EmergencyContact[];
  monitoring: boolean;
  onboarded: boolean;
  account: Account | null;
}

const initialState: State = {
  lockState: 'idle',
  activeRestaurant: null,
  activeSession: null,
  history: [],
  totalPoints: 0,
  settings: { cameraAllowed: true, goalMinutes: 45, notificationsEnabled: true },
  emergencyContacts: [],
  monitoring: false,
  onboarded: false,
  account: null,
};

type Action =
  | { type: 'HYDRATE'; payload: Partial<State> }
  | { type: 'PING'; restaurant: Restaurant }
  | { type: 'START_LOCK'; session: Session }
  | { type: 'END_LOCK'; completed: boolean }
  | { type: 'DISMISS_PING' }
  | { type: 'SET_MONITORING'; value: boolean }
  | { type: 'SET_ONBOARDED' }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<AppSettings> }
  | { type: 'SET_CONTACTS'; contacts: EmergencyContact[] }
  | { type: 'SET_ACCOUNT'; account: Account }
  | { type: 'LOG_OUT' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'PING':
      // Don't interrupt an active lock.
      if (state.lockState === 'locked') return state;
      return { ...state, lockState: 'pinged', activeRestaurant: action.restaurant };
    case 'DISMISS_PING':
      return { ...state, lockState: 'idle', activeRestaurant: null };
    case 'START_LOCK':
      return { ...state, lockState: 'locked', activeSession: action.session };
    case 'END_LOCK': {
      const session = state.activeSession;
      if (!session) return { ...state, lockState: 'idle' };
      const ended: Session = {
        ...session,
        endedAt: Date.now(),
        completed: action.completed,
        pointsEarned: action.completed ? session.pointsEarned : 0,
      };
      return {
        ...state,
        lockState: 'completed',
        activeSession: ended,
        history: [ended, ...state.history],
        totalPoints: state.totalPoints + ended.pointsEarned,
      };
    }
    case 'SET_MONITORING':
      return { ...state, monitoring: action.value };
    case 'SET_ONBOARDED':
      return { ...state, onboarded: true };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'SET_CONTACTS':
      return { ...state, emergencyContacts: action.contacts };
    case 'SET_ACCOUNT':
      return { ...state, account: action.account };
    case 'LOG_OUT':
      return { ...state, account: null };
    default:
      return state;
  }
}

interface ContextValue extends State {
  enableMonitoring: () => Promise<MonitorResult>;
  disableMonitoring: () => Promise<void>;
  ping: (restaurant: Restaurant) => void;
  dismissPing: () => void;
  startLock: (restaurant: Restaurant) => void;
  endLock: (completed: boolean) => void;
  resetToIdle: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setContacts: (contacts: EmergencyContact[]) => void;
  completeOnboarding: () => void;
  logIn: (account: Account) => void;
  logOut: () => void;
}

const AppContext = createContext<ContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate persisted state on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
      } catch (e) {
        console.warn('[app] hydrate failed', e);
      }
    })();
  }, []);

  // Persist the durable slices of state whenever they change.
  useEffect(() => {
    const persisted = {
      history: state.history,
      totalPoints: state.totalPoints,
      settings: state.settings,
      emergencyContacts: state.emergencyContacts,
      onboarded: state.onboarded,
      account: state.account,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [
    state.history,
    state.totalPoints,
    state.settings,
    state.emergencyContacts,
    state.onboarded,
    state.account,
  ]);

  // Subscribe to geofence enter/exit events.
  useEffect(() => {
    const unsub = onGeofenceEvent((event) => {
      if (event.type === 'enter') {
        dispatch({ type: 'PING', restaurant: event.restaurant });
      }
    });
    return unsub;
  }, []);

  const enableMonitoring = useCallback(async (): Promise<MonitorResult> => {
    let fg = await Location.getForegroundPermissionsAsync();
    if (!fg.granted) {
      fg = await Location.requestForegroundPermissionsAsync();
    }
    if (!fg.granted) {
      return {
        ok: false,
        message: 'Allow location for Expo Go in Settings, then try again.',
      };
    }

    const result = await startMonitoring();
    if (result.ok) {
      dispatch({ type: 'SET_MONITORING', value: true });
    }
    return result;
  }, []);

  const disableMonitoring = useCallback(async () => {
    await stopMonitoring();
    dispatch({ type: 'SET_MONITORING', value: false });
  }, []);

  const ping = useCallback((restaurant: Restaurant) => {
    dispatch({ type: 'PING', restaurant });
  }, []);

  const dismissPing = useCallback(() => dispatch({ type: 'DISMISS_PING' }), []);

  const startLock = useCallback(
    (restaurant: Restaurant) => {
      const session: Session = {
        id: `s-${Date.now()}`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        startedAt: Date.now(),
        endedAt: null,
        completed: false,
        pointsEarned: restaurant.rewardPoints,
      };
      dispatch({ type: 'START_LOCK', session });
    },
    []
  );

  const endLock = useCallback(
    (completed: boolean) => dispatch({ type: 'END_LOCK', completed }),
    []
  );

  const resetToIdle = useCallback(() => dispatch({ type: 'DISMISS_PING' }), []);

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => dispatch({ type: 'UPDATE_SETTINGS', patch }),
    []
  );

  const setContacts = useCallback(
    (contacts: EmergencyContact[]) => dispatch({ type: 'SET_CONTACTS', contacts }),
    []
  );

  const completeOnboarding = useCallback(
    () => dispatch({ type: 'SET_ONBOARDED' }),
    []
  );

  const logIn = useCallback(
    (account: Account) => dispatch({ type: 'SET_ACCOUNT', account }),
    []
  );

  const logOut = useCallback(() => dispatch({ type: 'LOG_OUT' }), []);

  const value = useMemo<ContextValue>(
    () => ({
      ...state,
      enableMonitoring,
      disableMonitoring,
      ping,
      dismissPing,
      startLock,
      endLock,
      resetToIdle,
      updateSettings,
      setContacts,
      completeOnboarding,
      logIn,
      logOut,
    }),
    [
      state,
      enableMonitoring,
      disableMonitoring,
      ping,
      dismissPing,
      startLock,
      endLock,
      resetToIdle,
      updateSettings,
      setContacts,
      completeOnboarding,
      logIn,
      logOut,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): ContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
