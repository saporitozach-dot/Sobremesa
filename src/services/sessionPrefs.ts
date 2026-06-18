import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sobremesa-session-prefs-v1';

interface SessionPrefs {
  hasSeenAppBlockSetup: boolean;
}

const defaults: SessionPrefs = { hasSeenAppBlockSetup: false };

async function load(): Promise<SessionPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

async function save(prefs: SessionPrefs): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}

export async function hasSeenAppBlockSetup(): Promise<boolean> {
  const prefs = await load();
  return prefs.hasSeenAppBlockSetup;
}

export async function markAppBlockSetupSeen(): Promise<void> {
  const prefs = await load();
  await save({ ...prefs, hasSeenAppBlockSetup: true });
}
