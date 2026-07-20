import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import PressableScale from './PressableScale';
import { text } from '../theme/typography';
import { colors, layout, radius, shadows, spacing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  selected = false,
  leadingIcon,
  trailingIcon,
  fullWidth = true,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const [focused, setFocused] = useState(false);
  const pressedStyle = {
    primary: styles.primaryPressed,
    secondary: styles.secondaryPressed,
    ghost: styles.ghostPressed,
    danger: styles.dangerPressed,
  }[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={variant === 'ghost' ? layout.hitSlop : undefined}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading, selected }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        selected && styles.selected,
        pressed && !isDisabled && pressedStyle,
        fullWidth && styles.fullWidth,
        variant === 'primary' && !isDisabled && shadows.button,
        focused && styles.focused,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={[styles.content, loading && styles.loadingContent]}>
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        <Text
          style={[
            text.button,
            styles.label,
            variant === 'primary' && styles.labelPrimary,
            variant === 'secondary' && styles.labelDefault,
            variant === 'ghost' && styles.labelGhost,
            variant === 'danger' && styles.labelDanger,
          ]}
        >
          {label}
        </Text>
        {trailingIcon ? (
          <View style={[styles.icon, variant === 'primary' && styles.primaryAccessory]}>
            {trailingIcon}
          </View>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator
          style={styles.spinner}
          color={variant === 'primary' ? colors.bgDeep : variant === 'danger' ? colors.danger : colors.text}
        />
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.controlHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    minHeight: layout.compactControlHeight,
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.dangerMuted,
    borderColor: colors.danger,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
    borderColor: colors.primaryPressed,
  },
  secondaryPressed: {
    backgroundColor: colors.surfacePressed,
    borderColor: colors.primaryDark,
  },
  ghostPressed: {
    backgroundColor: colors.primaryMuted,
  },
  dangerPressed: {
    backgroundColor: colors.danger,
  },
  selected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  focused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: spacing.sm,
  },
  disabled: {
    opacity: 0.46,
    shadowOpacity: 0,
  },
  content: {
    minHeight: layout.compactControlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingContent: {
    opacity: 0,
  },
  spinner: {
    position: 'absolute',
  },
  icon: {
    minWidth: layout.buttonIconSize,
    minHeight: layout.buttonIconSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAccessory: {
    borderRadius: radius.sm,
    backgroundColor: colors.overlaySoft,
  },
  label: {
    textAlign: 'center',
  },
  labelPrimary: {
    color: colors.bgDeep,
  },
  labelDefault: {
    color: colors.text,
  },
  labelGhost: {
    color: colors.primary,
  },
  labelDanger: {
    color: colors.danger,
  },
});
