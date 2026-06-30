import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Linking, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';
import { formatMinutes } from '../utils/format';
import { colors, fonts, layout, radius, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Locked'>;

export default function LockedModeScreen({ navigation }: Props) {
  const { activeSession, settings, endSessionEarly, completeSession } = useApp();
  const insets = useSafeAreaInsets();
  const goalSeconds = (activeSession?.goalMinutes ?? settings.goalMinutes) * 60;
  const [elapsed, setElapsed] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!activeSession) return;
    const started = new Date(activeSession.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - started) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeSession]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (elapsed >= goalSeconds && activeSession) {
      completeSession().then(() => navigation.replace('SessionComplete'));
    }
  }, [elapsed, goalSeconds, activeSession, completeSession, navigation]);

  const progress = useMemo(() => Math.min(elapsed / goalSeconds, 1), [elapsed, goalSeconds]);
  const ringSize = 200;
  const stroke = 6;
  const ringRadius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  const callEmergency = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  if (!activeSession) {
    return (
      <LinearGradient colors={[colors.bg, colors.bgDeep]} style={styles.empty}>
        <Text style={styles.title}>No active session</Text>
        <Button label="Home" onPress={() => navigation.navigate('Home')} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.bg, colors.bgDeep]}
      style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.md }]}
    >
      <FadeSlideIn trigger="locked" style={styles.content}>
        <Text style={styles.kicker}>Locked mode</Text>
        <Text style={styles.title}>Phone down</Text>
        <Text style={styles.subtitle}>{activeSession.restaurantName}</Text>

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
            <Text style={styles.goal}>of {formatMinutes(goalSeconds)}</Text>
          </View>
        </Animated.View>

        {settings.emergencyContacts.length > 0 ? (
          <View style={styles.contacts}>
            {settings.emergencyContacts.map((c) => (
              <PressableScale
                key={c.id}
                style={styles.contactBtn}
                onPress={() => callEmergency(c.phone)}
              >
                <Text style={styles.contactLabel}>{c.name}</Text>
                <Text style={styles.contactPhone}>{c.phone}</Text>
              </PressableScale>
            ))}
          </View>
        ) : null}
      </FadeSlideIn>

      <View style={styles.actions}>
        {settings.cameraAllowed ? (
          <Button label="Open camera" variant="secondary" onPress={() => Linking.openURL('photos-redirect://')} />
        ) : null}
        <Button
          label="End early"
          variant="ghost"
          onPress={() => {
            Alert.alert('End session?', 'You will not earn a stamp.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'End',
                style: 'destructive',
                onPress: () => {
                  endSessionEarly();
                  navigation.navigate('Home');
                },
              },
            ]);
          }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPadding,
    gap: spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  kicker: {
    color: colors.primary,
    fontSize: type.caption,
    fontFamily: fonts.sansMedium,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontFamily: fonts.serifBold,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    marginTop: spacing.xs,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  timer: {
    color: colors.text,
    fontSize: 36,
    fontFamily: fonts.serifBold,
    letterSpacing: -1,
  },
  goal: { color: colors.textMuted, fontSize: type.caption, fontFamily: fonts.sans, marginTop: 2 },
  contacts: { width: '100%', gap: spacing.sm },
  contactBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  contactLabel: { color: colors.text, fontFamily: fonts.sansSemibold, fontSize: type.body },
  contactPhone: { color: colors.textMuted, fontSize: type.small, fontFamily: fonts.sans, marginTop: 2 },
  actions: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: 0,
  },
});
