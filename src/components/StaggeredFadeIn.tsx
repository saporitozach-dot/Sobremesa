import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewStyle } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { motion } from '../theme';

const EASE_OUT = Easing.bezier(...motion.easing.out);

type Props = {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  distance?: number;
  duration?: number;
  style?: ViewStyle;
  trigger?: number | string;
  scale?: boolean;
};

export default function StaggeredFadeIn({
  children,
  index = 0,
  delay: delayOverride,
  distance = motion.enterDistance,
  duration = motion.slow,
  style,
  trigger,
  scale = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const scaleVal = useRef(new Animated.Value(scale ? motion.emphasisScale : 1)).current;
  const delay = delayOverride ?? index * motion.stagger;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(reduceMotion ? 0 : distance);
    if (scale) scaleVal.setValue(reduceMotion ? 1 : motion.emphasisScale);

    if (reduceMotion) {
      opacity.setValue(1);
      return undefined;
    }

    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: EASE_OUT,
        useNativeDriver: true,
      }),
    ];

    if (scale) {
      animations.push(
        Animated.spring(scaleVal, {
          toValue: 1,
          delay,
          useNativeDriver: true,
          ...motion.spring,
        }),
      );
    }

    const animation = Animated.parallel(animations);
    animation.start();

    return () => animation.stop();
  }, [delay, distance, duration, opacity, reduceMotion, scale, scaleVal, translateY, trigger]);

  const transform = scale
    ? [{ translateY }, { scale: scaleVal }]
    : [{ translateY }];

  return (
    <Animated.View pointerEvents="box-none" style={[styles.wrap, { opacity, transform }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
});
