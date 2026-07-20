import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useFormFocus } from '../context/FormFocusContext';
import { text } from '../theme/typography';
import { colors, fonts, layout, radius, spacing, type } from '../theme';

type Props = TextInputProps & {
  label: string;
  /** Order in the form — enables Next field navigation */
  fieldIndex?: number;
  helperText?: string;
  error?: string;
};

const TextField = forwardRef<TextInput, Props>(function TextField(
  {
    label,
    style,
    onFocus,
    onBlur,
    fieldIndex,
    returnKeyType,
    onSubmitEditing,
    helperText,
    error,
    secureTextEntry,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const focusCtx = useFormFocus();
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useImperativeHandle(ref, () => inputRef.current as TextInput);

  useEffect(() => {
    if (fieldIndex === undefined || !focusCtx) return;
    focusCtx.registerField(fieldIndex, inputRef);
    return () => focusCtx.unregisterField(fieldIndex);
  }, [fieldIndex, focusCtx]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = (e: Parameters<NonNullable<TextInputProps['onSubmitEditing']>>[0]) => {
    onSubmitEditing?.(e);
    if (returnKeyType === 'next' && focusCtx) {
      focusCtx.focusNext();
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[text.formLabel, styles.label]}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            text.input,
            styles.inputInner,
            secureTextEntry && styles.inputWithAccessory,
            Platform.OS === 'web' && styles.inputWeb,
            style,
          ]}
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel={label}
          accessibilityHint={error ?? helperText}
          aria-invalid={Boolean(error)}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry && !passwordVisible}
          onFocus={(e) => {
            setFocused(true);
            if (fieldIndex !== undefined) focusCtx?.setActiveIndex(fieldIndex);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onSubmitEditing={handleSubmit}
          blurOnSubmit={returnKeyType !== 'next'}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? `Hide ${label}` : `Show ${label}`}
            hitSlop={spacing.sm}
            onPress={() => {
              setPasswordVisible((visible) => !visible);
              focusInput();
            }}
            style={({ pressed }) => [styles.accessory, pressed && styles.accessoryPressed]}
          >
            <Text style={styles.accessoryLabel}>{passwordVisible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    marginBottom: spacing.sm,
  },
  inputShell: {
    minHeight: layout.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: spacing.sm,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  inputInner: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    margin: 0,
    minHeight: layout.controlHeight,
  },
  inputWithAccessory: {
    paddingRight: spacing.sm,
  },
  inputWeb: {
    outlineStyle: 'none',
    cursor: 'text',
    fontFamily: fonts.sans,
  } as object,
  accessory: {
    minHeight: 44,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    borderRadius: radius.sm,
  },
  accessoryPressed: {
    backgroundColor: colors.primaryMuted,
  },
  accessoryLabel: {
    color: colors.primary,
    fontFamily: fonts.sansSemibold,
    fontSize: type.small,
  },
  helperText: {
    ...text.small,
    color: colors.textSubtle,
    marginTop: spacing.sm,
  },
  errorText: {
    ...text.small,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
