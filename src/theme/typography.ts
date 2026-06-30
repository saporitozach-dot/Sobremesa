import { StyleSheet, TextStyle } from 'react-native';
import { colors, fonts, type } from '../theme';

/** Shared text presets — Fraunces for voice, DM Sans for UI */
export const text = StyleSheet.create({
  brand: {
    fontFamily: fonts.serifBold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  display: {
    fontFamily: fonts.serifBold,
    fontSize: type.display,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: type.title,
    color: colors.text,
    letterSpacing: -0.25,
    lineHeight: 28,
  },
  titleBold: {
    fontFamily: fonts.serifBold,
    fontSize: type.title,
    color: colors.text,
    letterSpacing: -0.25,
    lineHeight: 28,
  },
  heading: {
    fontFamily: fonts.sansSemibold,
    fontSize: type.heading,
    color: colors.text,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: type.body,
    color: colors.text,
    lineHeight: 22,
  },
  bodyMuted: {
    fontFamily: fonts.sans,
    fontSize: type.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  small: {
    fontFamily: fonts.sans,
    fontSize: type.small,
    color: colors.textMuted,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.sansMedium,
    fontSize: type.caption,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    fontSize: type.caption,
    color: colors.primary,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: type.caption,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fonts.sansSemibold,
    fontSize: type.body,
    letterSpacing: 0.25,
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: type.body,
    color: colors.text,
  },
});

export function serif(size?: number, extra?: TextStyle): TextStyle {
  return {
    fontFamily: fonts.serif,
    ...(size ? { fontSize: size } : null),
    ...extra,
  };
}

export function serifBold(size?: number, extra?: TextStyle): TextStyle {
  return {
    fontFamily: fonts.serifBold,
    ...(size ? { fontSize: size } : null),
    ...extra,
  };
}

export function sans(size?: number, extra?: TextStyle): TextStyle {
  return {
    fontFamily: fonts.sans,
    ...(size ? { fontSize: size } : null),
    ...extra,
  };
}
