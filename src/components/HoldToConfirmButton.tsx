import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, font, radius, spacing } from '../theme';

const HOLD_MS = 3000;

interface Props {
  title: string;
  hint?: string;
  onConfirmed: () => void;
  disabled?: boolean;
}

export default function HoldToConfirmButton({
  title,
  hint = 'Press and hold for 3 seconds',
  onConfirmed,
  disabled,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holding = useRef(false);
  const [isHolding, setIsHolding] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3);

  const clearHold = () => {
    holding.current = false;
    setIsHolding(false);
    setSecondsLeft(3);
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (tickTimer.current) {
      clearInterval(tickTimer.current);
      tickTimer.current = null;
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const startHold = () => {
    if (disabled || holding.current) return;
    holding.current = true;
    setIsHolding(true);
    setSecondsLeft(3);

    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    }).start();

    const started = Date.now();
    tickTimer.current = setInterval(() => {
      const elapsed = Date.now() - started;
      const left = Math.max(1, Math.ceil((HOLD_MS - elapsed) / 1000));
      setSecondsLeft(left);
    }, 100);

    holdTimer.current = setTimeout(() => {
      clearHold();
      onConfirmed();
      progress.setValue(0);
    }, HOLD_MS);
  };

  useEffect(() => () => clearHold(), []);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const webPointerProps =
    Platform.OS === 'web'
      ? ({
          onMouseDown: (e: { preventDefault: () => void }) => {
            e.preventDefault();
            startHold();
          },
          onMouseUp: clearHold,
          onMouseLeave: clearHold,
        } as object)
      : {};

  return (
    <View style={styles.wrap}>
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityHint={hint}
        style={[styles.button, disabled && styles.disabled, isHolding && styles.holding]}
        onPressIn={startHold}
        onPressOut={clearHold}
        {...webPointerProps}
      >
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
        <Text style={styles.label}>
          {isHolding ? `Hold… ${secondsLeft}` : title}
        </Text>
      </Pressable>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  button: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', userSelect: 'none' } : {}),
  },
  holding: { borderColor: colors.primaryDark },
  disabled: { opacity: 0.5 },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    opacity: 0.35,
  },
  label: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    zIndex: 1,
  },
  hint: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
