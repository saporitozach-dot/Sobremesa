import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Linking, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import ActionSheet from '../components/ActionSheet';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';
import Screen from '../components/Screen';
import { formatMinutes } from '../utils/format';
import { updateSessionNotification } from '../services/sessionNotifications';
import { text } from '../theme/typography';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Locked'>;

export default function LockedModeScreen({ navigation }: Props) {
  const { activeSession, settings, endSessionEarly, completeSession } = useApp();
  const insets = useSafeAreaInsets();
  const goalSeconds = (activeSession?.goalMinutes ?? settings.goalMinutes) * 60;
  const [elapsed, setElapsed] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  const exitSession = useCallback(() => {
    setConfirmEnd(false);
    setSheetOpen(false);
    void endSessionEarly();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [endSessionEarly, navigation]);

  const simulateComplete = useCallback(async () => {
    setConfirmEnd(false);
    setSheetOpen(false);
    const result = await completeSession();
    if (result) navigation.replace('SessionComplete', result);
  }, [completeSession, navigation]);

  useEffect(() => {
    if (!activeSession) return;
    const started = new Date(activeSession.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - started) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession) return;
    if (elapsed % 30 !== 0 && elapsed !== 1) return;
    void updateSessionNotification(activeSession.restaurantName, elapsed, goalSeconds);
  }, [activeSession, elapsed, goalSeconds]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.02, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (elapsed >= goalSeconds && activeSession) {
      completeSession().then((result) => {
        if (result) navigation.replace('SessionComplete', result);
      });
    }
  }, [elapsed, goalSeconds, activeSession, completeSession, navigation]);

  const progress = useMemo(() => Math.min(elapsed / goalSeconds, 1), [elapsed, goalSeconds]);
  const ringSize = 220;
  const stroke = 5;
  const ringRadius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  const callEmergency = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setConfirmEnd(false);
  };

  if (!activeSession) {
    return (
      <Screen layout="centered">
        <Text style={text.titleBold}>No active session</Text>
        <Button
          label="Home"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        />
      </Screen>
    );
  }

  return (
    <Screen
      gradient
      style={{ paddingTop: insets.top + spacing.xl }}
      contentStyle={styles.content}
      footer={
        <Button label="Need something?" variant="ghost" onPress={() => setSheetOpen(true)} />
      }
    >
      <FadeSlideIn trigger="locked" style={styles.center}>
        <Text style={text.kicker}>Present mode</Text>
        <Text style={text.titleBold}>Sobremesa session</Text>
        <Text style={[text.small, styles.restaurant]}>{activeSession.restaurantName}</Text>
        <Text style={[text.small, styles.hint]}>
          Keep Sobremesa open — your phone stays usable for emergencies.
        </Text>

        <Animated.View style={[styles.ringWrap, { transform: [{ scale: pulse }] }]}>
          <Svg width={ringSize} height={ringSize}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke={colors.border}
              strokeWidth={stroke}
              fill="none"
            />
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke={colors.primary}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              rotation="-90"
              origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.timer}>{formatMinutes(elapsed)}</Text>
            <Text style={text.small}>of {formatMinutes(goalSeconds)}</Text>
          </View>
        </Animated.View>
      </FadeSlideIn>

      <ActionSheet visible={sheetOpen} title="Need something?" onClose={closeSheet}>
        {settings.emergencyContacts.map((c) => (
          <PressableScale
            key={c.id}
            style={styles.sheetRow}
            onPress={() => {
              closeSheet();
              callEmergency(c.phone);
            }}
          >
            <Text style={text.heading}>{c.name}</Text>
            <Text style={text.small}>{c.phone}</Text>
          </PressableScale>
        ))}

        {settings.cameraAllowed ? (
          <Button
            label="Open camera"
            variant="secondary"
            onPress={() => {
              closeSheet();
              Linking.openURL('photos-redirect://');
            }}
          />
        ) : null}

        <Button
          label="Stamp book"
          variant="secondary"
          onPress={() => {
            closeSheet();
            navigation.navigate('Rewards', { returnTo: 'Locked' });
          }}
        />

        {__DEV__ ? (
          <Button label="Simulate complete" variant="secondary" onPress={simulateComplete} />
        ) : null}

        {confirmEnd ? (
          <View style={styles.confirm}>
            <Text style={[text.small, styles.confirmText]}>
              End session? You will not earn a stamp.
            </Text>
            <Button label="End session" variant="danger" onPress={exitSession} />
            <Button label="Keep going" variant="ghost" onPress={() => setConfirmEnd(false)} />
          </View>
        ) : (
          <Button label="End early" variant="ghost" onPress={() => setConfirmEnd(true)} />
        )}
      </ActionSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  restaurant: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    maxWidth: 280,
    lineHeight: 20,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  timer: {
    ...text.display,
    fontSize: 40,
    lineHeight: 44,
  },
  sheetRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 2,
  },
  confirm: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  confirmText: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
