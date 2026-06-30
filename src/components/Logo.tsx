import React from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';

export type LogoVariant = 'wordmark' | 'emblem' | 'mark' | 'icon';
export type LogoTheme = 'dark' | 'light';
export type LogoSize = 'sm' | 'md' | 'lg' | 'compact' | 'full';

type Props = {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: LogoSize;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
};

const ASSETS = {
  wordmark: {
    dark: require('../../branding/logo-wordmark-dark.png'),
    light: require('../../branding/logo-wordmark-light.png'),
  },
  emblem: {
    dark: require('../../branding/emblem-dark.png'),
    light: require('../../branding/emblem-light.png'),
  },
  mark: {
    dark: require('../../branding/mark-dark.png'),
    light: require('../../branding/mark-light.png'),
  },
  icon: {
    dark: require('../../branding/app-icon.png'),
    light: require('../../branding/app-icon.png'),
  },
} as const;

const SIZES: Record<LogoVariant, Record<'sm' | 'md' | 'lg', number>> = {
  wordmark: { sm: 100, md: 160, lg: 220 },
  emblem: { sm: 36, md: 56, lg: 80 },
  mark: { sm: 32, md: 48, lg: 72 },
  icon: { sm: 32, md: 48, lg: 72 },
};

export default function Logo({
  variant = 'emblem',
  theme = 'dark',
  size = 'md',
  style,
  imageStyle,
}: Props) {
  const source = ASSETS[variant][theme];
  const dim = SIZES[variant][size === 'compact' || size === 'full' ? 'lg' : size];

  let dimensions: ImageStyle;
  if (variant === 'wordmark') {
    if (size === 'compact') {
      dimensions = { width: 260, height: 52 };
    } else if (size === 'full') {
      dimensions = { width: '100%' as const, height: 56 };
    } else {
      dimensions = { width: dim * 2.2, height: dim * 0.34 };
    }
  } else {
    const d = size === 'compact' ? SIZES[variant].sm : dim;
    dimensions = {
      width: d,
      height: d,
      borderRadius: variant === 'icon' ? d * 0.22 : d / 2,
    };
  }

  return (
    <View style={[styles.wrap, style]}>
      <Image source={source} style={[dimensions, imageStyle]} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
