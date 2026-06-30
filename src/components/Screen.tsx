import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '../theme';

type Layout = 'default' | 'auth' | 'centered';

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  layout?: Layout;
  compactFooter?: boolean;
  gradient?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export default function Screen({
  children,
  footer,
  layout = 'default',
  compactFooter = false,
  gradient = true,
  style,
  contentStyle,
}: Props) {
  const insets = useSafeAreaInsets();

  const inner = (
    <View
      style={[
        styles.inner,
        { paddingBottom: insets.bottom },
        layout === 'auth' && styles.innerAuth,
        layout === 'centered' && styles.innerCentered,
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          layout === 'auth' && styles.contentAuth,
          layout === 'centered' && styles.contentCentered,
          contentStyle,
        ]}
      >
        {children}
      </View>
      {footer ? (
        <View
          style={[
            styles.footer,
            compactFooter && styles.footerCompact,
            layout === 'auth' && styles.footerAuth,
          ]}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient colors={[colors.bg, colors.bgDeep]} style={styles.root}>
        {inner}
      </LinearGradient>
    );
  }

  return <View style={[styles.root, { backgroundColor: colors.bg }]}>{inner}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  innerAuth: {
    flex: 1,
  },
  innerCentered: {
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  contentAuth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Nudge brand cluster slightly above geometric center so it
    // looks balanced against the bottom CTA block (standard app pattern).
    paddingBottom: 56,
  },
  contentCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  footerCompact: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  footerAuth: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
