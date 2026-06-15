import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';

const STEPS = [
  {
    emoji: '🍷',
    title: 'Welcome to Sobremesa',
    body: 'Sobremesa is the time you linger at the table after the meal — talking, not scrolling. This app helps you reclaim it.',
  },
  {
    emoji: '📍',
    title: 'Always allow location',
    body: 'When you walk into a partner restaurant, Sobremesa detects your arrival and invites you into a phone-free session, even when the app is closed. On the next prompt, choose Always Allow.',
  },
  {
    emoji: '🔒',
    title: 'Your phone takes a seat',
    body: 'During a session your phone is set aside — only emergency contacts (and optionally the camera) stay available. Finish the session to earn rewards.',
  },
];

export default function OnboardingScreen() {
  const { enableMonitoring, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  async function handleNext() {
    if (step === 1) {
      await Location.requestForegroundPermissionsAsync();
    }
    if (!last) {
      setStep((s) => s + 1);
      return;
    }
    setBusy(true);
    try {
      await enableMonitoring();
    } finally {
      setBusy(false);
      completeOnboarding();
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {step > 0 && (
          <Pressable style={styles.back} onPress={handleBack} hitSlop={12}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        )}
        <View style={styles.hero}>
          {step === 0 ? (
            <View style={styles.logoWrap}>
              <Logo size={104} />
            </View>
          ) : (
            <Text style={styles.emoji}>{current.emoji}</Text>
          )}
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>
        </View>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>

        <Button
          title={last ? 'Enable & get started' : 'Next'}
          onPress={handleNext}
          loading={busy}
        />
        {last && (
          <Text style={styles.fineprint}>
            Choose Always Allow when iOS asks for location access so we can detect
            partner restaurants in the background.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  back: { position: 'absolute', top: spacing.lg, left: spacing.lg },
  backText: { color: colors.textMuted, fontSize: font.body, fontWeight: '600' },
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logoWrap: { marginBottom: spacing.lg },
  emoji: { fontSize: 72, marginBottom: spacing.lg },
  title: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary, width: 22 },
  fineprint: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
