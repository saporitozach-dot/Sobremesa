import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import StampBookIcon from '../components/StampBookIcon';
import EmergencyPhoneIcon from '../components/EmergencyPhoneIcon';
import CameraIcon from '../components/CameraIcon';
import { canRedeem } from '../services/stamps';
import { activateSessionShield } from '../services/appShield';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Locked'>;

function format(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LockedModeScreen({
  navigation,
}: {
  navigation: Nav;
}) {
  const { activeSession, settings, emergencyContacts, endLock, getBookForRestaurant } =
    useApp();
  const [now, setNow] = useState(Date.now());
  const [leaveCount, setLeaveCount] = useState(0);
  const sessionBook = activeSession
    ? getBookForRestaurant(activeSession.restaurantId)
    : null;
  const readyToRedeem = sessionBook ? canRedeem(sessionBook) : false;

  const goalMs = settings.goalMinutes * 60 * 1000;
  const startedAt = activeSession?.startedAt ?? Date.now();
  const elapsed = now - startedAt;
  const remaining = Math.max(0, goalMs - elapsed);
  const goalReached = elapsed >= goalMs;
  const progress = useMemo(
    () => Math.min(1, elapsed / goalMs),
    [elapsed, goalMs],
  );

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const deactivate = activateSessionShield({
      onLeaveApp: () => setLeaveCount((c) => c + 1),
    });
    return deactivate;
  }, []);

  function finish(completed: boolean) {
    endLock(completed);
    navigation.replace('SessionComplete');
  }

  function handleEndEarly() {
    Alert.alert(
      'Leave the table early?',
      'Your phone-free session isn’t complete yet. You won’t earn a stamp for this visit.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'End anyway', style: 'destructive', onPress: () => finish(false) },
      ],
    );
  }

  function handleEmergency() {
    if (emergencyContacts.length === 0) {
      Alert.alert(
        'No emergency contacts',
        'Add contacts in Settings so they’re reachable during sessions.',
      );
      return;
    }
    const buttons = emergencyContacts.map((c) => ({
      text: `${c.name}`,
      onPress: () => Linking.openURL(`tel:${c.phone}`),
    }));
    Alert.alert('Emergency contacts', 'Call who you need:', [
      ...buttons,
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable
        style={styles.stampAccess}
        onPress={() => navigation.navigate('Rewards', { returnTo: 'Locked' })}
        hitSlop={12}
        accessibilityLabel="Open stamp book"
      >
        <StampBookIcon size={22} />
        {readyToRedeem && <View style={styles.stampBadge} />}
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.kicker}>Phone-free at</Text>
        <Text style={styles.name}>{activeSession?.restaurantName}</Text>

        <View style={styles.ring}>
          <Text style={styles.timer}>{format(elapsed)}</Text>
          <Text style={styles.timerSub}>
            {goalReached
              ? 'Goal reached — linger as long as you like'
              : `${format(remaining)} to your goal`}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.encourage}>
          Set your phone face-down. Sobremesa is watching the session — leaving the app
          sends a reminder to come back.
        </Text>

        {leaveCount > 0 && (
          <Text style={styles.leaveHint}>
            Left the app {leaveCount} time{leaveCount === 1 ? '' : 's'} this session
          </Text>
        )}

        <View style={styles.allowances}>
          <Pressable style={styles.allowance} onPress={handleEmergency}>
            <EmergencyPhoneIcon size={28} />
            <Text style={styles.allowanceText}>Emergency</Text>
          </Pressable>
          {settings.cameraAllowed && (
            <Pressable
              style={styles.allowance}
              onPress={() =>
                Alert.alert(
                  'Camera',
                  'The camera stays available so you can capture the moment.',
                )
              }
            >
              <CameraIcon size={28} />
              <Text style={styles.allowanceText}>Camera</Text>
            </Pressable>
          )}
        </View>

        <View style={{ flex: 1 }} />

        {goalReached ? (
          <Button title="Finish & claim reward" onPress={() => finish(true)} />
        ) : (
          <Button
            title="End session early"
            variant="ghost"
            onPress={handleEndEarly}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  stampAccess: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stampBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  content: { flex: 1, padding: spacing.lg, alignItems: 'center' },
  kicker: {
    color: colors.textMuted,
    fontSize: font.body,
    marginTop: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '800',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  ring: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  timer: { color: colors.primary, fontSize: 64, fontWeight: '800' },
  timerSub: { color: colors.textMuted, fontSize: font.small, marginBottom: spacing.md },
  progressTrack: {
    height: 8,
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: { height: 8, backgroundColor: colors.primary },
  encourage: {
    color: colors.textMuted,
    fontSize: font.body,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  leaveHint: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  allowances: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  allowance: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minWidth: 110,
    gap: spacing.xs,
  },
  allowanceText: { color: colors.text, fontSize: font.small, fontWeight: '600' },
});
