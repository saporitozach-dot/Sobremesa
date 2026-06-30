import React, { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { text } from '../theme/typography';
import { colors, fonts, radius, spacing } from '../theme';

type Props = TextInputProps & {
  label: string;
};

export default function TextField({ label, style, onFocus, onBlur, ...rest }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.wrap}>
      <Text style={text.label}>{label}</Text>
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
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...(Platform.OS === 'ios' ? { pointerEvents: 'none' as const } : null)}
          {...rest}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
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
