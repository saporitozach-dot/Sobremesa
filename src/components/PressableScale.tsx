import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, PressableProps } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { motion } from '../theme';

type Props = PressableProps & {
  children: React.ReactNode;
  scaleTo?: number;
  style?: PressableProps['style'];
};

export default function PressableScale({
  children,
  scaleTo = motion.pressScale,
  style,
  onPressIn,
  onPressOut,
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
      style={style}
      onPressIn={(e) => {
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
