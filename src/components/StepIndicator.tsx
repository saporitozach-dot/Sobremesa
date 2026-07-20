import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, motion, radius, spacing } from '../theme';

const EASE_OUT = Easing.bezier(...motion.easing.out);

type Props = {
  total: number;
  current: number;
};

export default function StepIndicator({ total, current }: Props) {
  const reduceMotion = useReducedMotion();
  const fills = useRef<Animated.Value[]>([]);

  while (fills.current.length < total) {
    fills.current.push(new Animated.Value(fills.current.length <= current ? 1 : 0));
  }

  useEffect(() => {
    const animations = fills.current.slice(0, total).map((fill, index) => {
      const toValue = index <= current ? 1 : 0;
      if (reduceMotion) {
        fill.setValue(toValue);
        return null;
      }
      return Animated.timing(fill, {
        toValue,
        duration: motion.normal,
        easing: EASE_OUT,
        useNativeDriver: false,
      });
    }).filter((animation): animation is Animated.CompositeAnimation => animation !== null);

    const sequence = Animated.parallel(animations);
    sequence.start();
    return () => sequence.stop();
  }, [current, reduceMotion, total]);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel="Onboarding progress"
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-valuetext={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          accessible={false}
          style={styles.segment}
        >
          <Animated.View
            style={[
              styles.segmentFill,
              i < current ? styles.segmentComplete : styles.segmentActive,
              {
                width: fills.current[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentComplete: {
    backgroundColor: colors.primaryDark,
  },
});
