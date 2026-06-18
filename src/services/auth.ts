import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account } from '../types';

const REGISTRY_KEY = 'sobremesa-accounts-v1';
const PENDING_VERIFY_KEY = 'sobremesa-pending-verify';

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface PendingSignup extends Omit<Account, 'id'> {
  password: string;
}

interface StoredAccount extends Account {
  id: string;
  phoneVerified: boolean;
  createdAt: number;
}

interface AccountRegistry {
  byPhone: Record<string, StoredAccount>;
  emailToPhone: Record<string, string>;
}

interface PendingVerification {
  phone: string;
  code: string;
  expiresAt: number;
  purpose: 'signup' | 'reset';
  signupDraft?: PendingSignup;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
}

export function formatPhoneDisplay(phone: string): string {
  const d = normalizePhone(phone);
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return phone;
}

async function loadRegistry(): Promise<AccountRegistry> {
  try {
    const raw = await AsyncStorage.getItem(REGISTRY_KEY);
    if (!raw) return { byPhone: {}, emailToPhone: {} };
    return JSON.parse(raw) as AccountRegistry;
  } catch {
    return { byPhone: {}, emailToPhone: {} };
  }
}

async function saveRegistry(registry: AccountRegistry): Promise<void> {
  await AsyncStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

function toPublicAccount(stored: StoredAccount): Account {
  return {
    id: stored.id,
    firstName: stored.firstName,
    email: stored.email,
    phone: stored.phone,
    password: stored.password,
    phoneVerified: stored.phoneVerified,
  };
}

export async function findAccountByPhone(
  phone: string,
): Promise<Account | null> {
  const registry = await loadRegistry();
  const key = normalizePhone(phone);
  const stored = registry.byPhone[key];
  return stored ? toPublicAccount(stored) : null;
}

export async function phoneIsRegistered(phone: string): Promise<boolean> {
  return (await findAccountByPhone(phone)) !== null;
}

export async function registerAccount(
  draft: PendingSignup,
): Promise<AuthResult<Account>> {
  const registry = await loadRegistry();
  const phoneKey = normalizePhone(draft.phone);

  if (registry.byPhone[phoneKey]) {
    return { ok: false, error: 'An account with this phone number already exists.' };
  }

  const emailKey = draft.email.trim().toLowerCase();
  if (registry.emailToPhone[emailKey]) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const stored: StoredAccount = {
    id: `u-${Date.now()}`,
    firstName: draft.firstName.trim(),
    email: emailKey,
    phone: draft.phone.trim(),
    password: draft.password,
    phoneVerified: true,
    createdAt: Date.now(),
  };

  registry.byPhone[phoneKey] = stored;
  registry.emailToPhone[emailKey] = phoneKey;
  await saveRegistry(registry);

  return { ok: true, data: toPublicAccount(stored) };
}

export async function loginAccount(
  identifier: string,
  password: string,
): Promise<AuthResult<Account>> {
  const registry = await loadRegistry();
  const trimmed = identifier.trim().toLowerCase();
  let stored: StoredAccount | undefined;

  if (trimmed.includes('@')) {
    const phoneKey = registry.emailToPhone[trimmed];
    stored = phoneKey ? registry.byPhone[phoneKey] : undefined;
  } else {
    stored = registry.byPhone[normalizePhone(identifier)];
  }

  if (!stored) {
    return { ok: false, error: 'No account found. Check your phone or email.' };
  }
  if (stored.password !== password) {
    return { ok: false, error: 'Incorrect password.' };
  }

  return { ok: true, data: toPublicAccount(stored) };
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function startPhoneVerification(
  phone: string,
  purpose: 'signup' | 'reset',
  signupDraft?: PendingSignup,
): Promise<AuthResult<{ demoCode: string }>> {
  const code = generateCode();
  const pending: PendingVerification = {
    phone: normalizePhone(phone),
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    purpose,
    signupDraft,
  };
  await AsyncStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(pending));
  // Prototype: no SMS — code is returned for on-screen display.
  return { ok: true, data: { demoCode: code } };
}

export async function confirmPhoneVerification(
  phone: string,
  code: string,
): Promise<AuthResult<PendingSignup | 'reset'>> {
  const raw = await AsyncStorage.getItem(PENDING_VERIFY_KEY);
  if (!raw) {
    return { ok: false, error: 'No verification in progress. Request a new code.' };
  }

  const pending = JSON.parse(raw) as PendingVerification;
  const phoneKey = normalizePhone(phone);

  if (pending.phone !== phoneKey) {
    return { ok: false, error: 'Phone number does not match this verification.' };
  }
  if (Date.now() > pending.expiresAt) {
    return { ok: false, error: 'Code expired. Request a new one.' };
  }
  if (pending.code !== code.trim()) {
    return { ok: false, error: 'Incorrect code. Try again.' };
  }

  await AsyncStorage.removeItem(PENDING_VERIFY_KEY);

  if (pending.purpose === 'reset') {
    return { ok: true, data: 'reset' };
  }
  if (!pending.signupDraft) {
    return { ok: false, error: 'Sign-up data missing. Please start again.' };
  }
  return { ok: true, data: pending.signupDraft };
}

export async function resetPassword(
  phone: string,
  newPassword: string,
): Promise<AuthResult<Account>> {
  if (newPassword.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const registry = await loadRegistry();
  const phoneKey = normalizePhone(phone);
  const stored = registry.byPhone[phoneKey];
  if (!stored) {
    return { ok: false, error: 'No account found for this phone number.' };
  }

  stored.password = newPassword;
  registry.byPhone[phoneKey] = stored;
  await saveRegistry(registry);

  return { ok: true, data: toPublicAccount(stored) };
}
