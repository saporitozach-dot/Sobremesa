import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, PressableProps } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hapticLight } from '../services/haptics';
import { motion } from '../theme';

type Props = PressableProps & {
  children: React.ReactNode;
  scaleTo?: number;
  /** Soft tap feedback. Defaults on; set false for purely decorative presses. */
  haptic?: boolean;
  style?: PressableProps['style'];
};

export default function PressableScale({
  children,
  scaleTo = motion.pressScale,
  haptic = true,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Props) {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => () => activeAnimation.current?.stop(), []);

  const animatePress = (pressed: boolean) => {
    scale.stopAnimation();
    opacity.stopAnimation();
    const animation = Animated.parallel([
      Animated.spring(scale, {
        toValue: pressed && !reduceMotion ? scaleTo : 1,
        useNativeDriver: true,
        ...motion.spring,
      }),
      Animated.timing(opacity, {
        toValue: pressed ? motion.pressOpacity : 1,
        duration: motion.fast,
        useNativeDriver: true,
      }),
    ]);
    activeAnimation.current = animation;
    animation.start();
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={style}
      onPressIn={(e) => {
        if (!disabled && haptic) {
          hapticLight();
        }
        animatePress(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animatePress(false);
        onPressOut?.(e);
      }}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
          alignSelf: 'stretch',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
