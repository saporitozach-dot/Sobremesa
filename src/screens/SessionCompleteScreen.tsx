import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import StampIcon from '../components/StampIcon';
import StampRow from '../components/StampRow';
import { STAMPS_FOR_REWARD } from '../types';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SessionComplete'>;

export default function SessionCompleteScreen({ navigation }: { navigation: Nav }) {
  const { activeSession, lastStampResult, resetToIdle } = useApp();
  const completed = activeSession?.completed ?? false;
  const minutes = activeSession
    ? Math.round(
        ((activeSession.endedAt ?? Date.now()) - activeSession.startedAt) / 60000,
      )
    : 0;

  const stampEarned = lastStampResult?.earned ?? false;
  const stampsAfter = lastStampResult?.stampsAfter ?? 0;
  const canRedeemNow = stampsAfter >= STAMPS_FOR_REWARD;

  function done() {
    resetToIdle();
    navigation.replace('Home');
  }

  function goRedeem() {
    const restaurantId = lastStampResult?.restaurantId;
    if (restaurantId && canRedeemNow) {
      navigation.navigate('ConfirmRedeem', { restaurantId });
      return;
    }
    resetToIdle();
    navigation.replace('Rewards');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{completed && stampEarned ? '✓' : completed ? '👋' : '👋'}</Text>
        <Text style={styles.title}>
          {completed ? 'Sobremesa complete' : 'Session ended'}
        </Text>
        <Text style={styles.body}>
          {completed
            ? `You spent ${minutes} minutes present at the table.`
            : `You were phone-free for ${minutes} minutes. Next time, stay for the whole meal.`}
        </Text>

        {lastStampResult && (
          <View style={styles.stampCard}>
            {stampEarned ? (
              <>
                <View style={styles.stampEarnedRow}>
                  <StampIcon size={40} filled />
                  <Text style={styles.stampEarnedText}>+1 stamp</Text>
                </View>
                <Text style={styles.stampAt}>{lastStampResult.restaurantName}</Text>
                <StampRow stamps={stampsAfter} size={32} />
                <Text style={styles.stampProgress}>
                  {stampsAfter}/{STAMPS_FOR_REWARD} toward your reward
                </Text>
                {canRedeemNow && (
                  <Text style={styles.redeemHint}>
                    You can redeem now in Rewards.
                  </Text>
                )}
              </>
            ) : (
              <>
                <StampRow stamps={stampsAfter} size={32} />
                <Text style={styles.noStampReason}>{lastStampResult.reason}</Text>
              </>
            )}
          </View>
        )}

        <View style={{ flex: 1 }} />
        {canRedeemNow && stampEarned ? (
          <>
            <Button title="Redeem reward" onPress={goRedeem} />
            <Button
              title="Back home"
              variant="ghost"
              onPress={done}
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : (
          <Button title="Back home" onPress={done} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, alignItems: 'center' },
  emoji: {
    color: colors.primary,
    fontSize: 64,
    fontWeight: '800',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  stampCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    gap: spacing.sm,
  },
  stampEarnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stampEarnedText: {
    color: colors.primary,
    fontSize: font.heading,
    fontWeight: '800',
  },
  stampAt: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  stampProgress: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs },
  redeemHint: { color: colors.primary, fontSize: font.small, fontWeight: '600' },
  noStampReason: {
    color: colors.textMuted,
    fontSize: font.body,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});
