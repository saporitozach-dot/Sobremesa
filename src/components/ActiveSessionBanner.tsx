import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PressableScale from './PressableScale';
import { ChevronRight } from './icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, radius, spacing } from '../theme';
import { SessionRecord } from '../types';
import { formatMinutes } from '../utils/format';

type Props = {
  session: SessionRecord;
  onPress: () => void;
};

export default function ActiveSessionBanner({ session, onPress }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const goalSeconds = session.goalMinutes * 60;

  useEffect(() => {
    const started = new Date(session.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - started) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.startedAt]);

  const remaining = Math.max(goalSeconds - elapsed, 0);

  return (
    <PressableScale style={styles.banner} onPress={onPress} accessibilityLabel="Return to active session">
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text style={text.kicker}>Session in progress</Text>
        <Text style={text.heading}>{session.restaurantName}</Text>
        <Text style={text.small}>
          {formatMinutes(elapsed)} elapsed · {formatMinutes(remaining)} left
        </Text>
      </View>
      <ChevronRight size={16} color={colors.primary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  content: { flex: 1, gap: 2 },
});
