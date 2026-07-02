import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Animated,
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
import { colors, fonts, radius, spacing } from '../theme';

type Props = TextInputProps & {
  label: string;
  /** Order in the form — enables Next field navigation */
  fieldIndex?: number;
};

const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, style, onFocus, onBlur, fieldIndex, returnKeyType, onSubmitEditing, ...rest },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const focusCtx = useFormFocus();
  const [focused, setFocused] = useState(false);
  const glow = useRef(new Animated.Value(0.35)).current;

  useImperativeHandle(ref, () => inputRef.current as TextInput);

  useEffect(() => {
    if (fieldIndex === undefined || !focusCtx) return;
    focusCtx.registerField(fieldIndex, inputRef);
    return () => focusCtx.unregisterField(fieldIndex);
  }, [fieldIndex, focusCtx]);

  useEffect(() => {
    if (!focused) {
      glow.setValue(0.35);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.95,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [focused, glow]);

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
      <Text style={text.label}>{label}</Text>
      <View style={styles.inputShell}>
        {focused ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glowRing,
              {
                opacity: glow,
              },
            ]}
          />
        ) : null}
        <Pressable
          onPress={focusInput}
          style={[styles.input, focused && styles.inputFocused, style]}
        >
          <TextInput
            ref={inputRef}
            style={[
              text.input,
              styles.inputInner,
              Platform.OS === 'web' && styles.inputWeb,
            ]}
            placeholderTextColor={colors.textMuted}
            returnKeyType={returnKeyType}
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
            {...(Platform.OS === 'ios' ? { pointerEvents: 'none' as const } : null)}
            {...rest}
          />
        </Pressable>
      </View>
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  inputShell: {
    position: 'relative',
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    margin: -3,
    borderRadius: radius.md + 3,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  inputInner: {
    padding: 0,
    margin: 0,
    width: '100%',
  },
  inputWeb: {
    outlineStyle: 'none',
    cursor: 'text',
    fontFamily: fonts.sans,
  } as object,
});
