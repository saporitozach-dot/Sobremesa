import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';
import { motion } from '../theme';

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

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
  distance = 14,
  duration = motion.slow,
  style,
  trigger,
  scale = false,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const scaleVal = useRef(new Animated.Value(scale ? 0.9 : 1)).current;
  const delay = delayOverride ?? index * 72;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(distance);
    if (scale) scaleVal.setValue(0.9);

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
          damping: 19,
          stiffness: 210,
          mass: 0.65,
        }),
      );
    }

    Animated.parallel(animations).start();
  }, [delay, distance, duration, opacity, scale, scaleVal, translateY, trigger]);

  const transform = scale
    ? [{ translateY }, { scale: scaleVal }]
    : [{ translateY }];

  return (
    <Animated.View style={[{ opacity, transform }, style]}>
      {children}
    </Animated.View>
  );
}
