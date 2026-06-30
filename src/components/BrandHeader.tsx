import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Logo from './Logo';
import { colors, fonts, spacing } from '../theme';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  style?: ViewStyle;
  animate?: boolean;
};

const SIZES = {
  sm: { emblem: 'sm' as const, name: 20, tagline: 10, gap: spacing.sm },
  md: { emblem: 'md' as const, name: 26, tagline: 10, gap: spacing.md },
  lg: { emblem: 'lg' as const, name: 32, tagline: 11, gap: spacing.lg },
};

export default function BrandHeader({
  size = 'md',
  showTagline = true,
  style,
  animate = false,
}: Props) {
  const s = SIZES[size];
  const scale = useRef(new Animated.Value(animate ? 0.92 : 1)).current;
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animate, opacity, scale]);

  const content = (
    <View style={styles.cluster}>
      <Logo variant="emblem" theme="dark" size={s.emblem} />
      <Text style={[styles.name, { fontSize: s.name, marginTop: s.gap }]}>Sobremesa</Text>
      {showTagline ? (
        <Text style={[styles.tagline, { fontSize: s.tagline }]}>PHONE-FREE DINING</Text>
      ) : null}
    </View>
  );

  if (!animate) {
    return <View style={[styles.wrap, style]}>{content}</View>;
  }

  return (
    <Animated.View style={[styles.wrap, style, { opacity, transform: [{ scale }] }]}>
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  cluster: {
    alignItems: 'center',
  },
  name: {
    fontFamily: fonts.serifBold,
    color: colors.text,
    letterSpacing: -0.6,
  },
  tagline: {
    fontFamily: fonts.sansMedium,
    color: colors.primary,
    letterSpacing: 2.8,
    marginTop: spacing.xs,
  },
});
