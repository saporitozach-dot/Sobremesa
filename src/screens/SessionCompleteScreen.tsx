import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SessionComplete'>;

export default function SessionCompleteScreen({ navigation }: { navigation: Nav }) {
  const { activeSession, totalPoints, resetToIdle } = useApp();
  const completed = activeSession?.completed ?? false;
  const minutes = activeSession
    ? Math.round(
        ((activeSession.endedAt ?? Date.now()) - activeSession.startedAt) / 60000
      )
    : 0;

  function done() {
    resetToIdle();
    navigation.replace('Home');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{completed ? '🎉' : '👋'}</Text>
        <Text style={styles.title}>
          {completed ? 'Sobremesa complete' : 'Session ended'}
        </Text>
        <Text style={styles.body}>
          {completed
            ? `You spent ${minutes} minutes present at the table.`
            : `You were phone-free for ${minutes} minutes. Next time, stay for the whole meal.`}
        </Text>

        {completed && (
          <View style={styles.pointsCard}>
            <Text style={styles.pointsValue}>+{activeSession?.pointsEarned}</Text>
            <Text style={styles.pointsLabel}>points earned</Text>
            <Text style={styles.totalLabel}>{totalPoints} total</Text>
          </View>
        )}

        <View style={{ flex: 1 }} />
        <Button title="Back home" onPress={done} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, alignItems: 'center' },
  emoji: { fontSize: 80, marginTop: spacing.xl, marginBottom: spacing.lg },
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
  pointsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  pointsValue: { color: colors.primary, fontSize: 56, fontWeight: '800' },
  pointsLabel: { color: colors.text, fontSize: font.body },
  totalLabel: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.sm },
});
