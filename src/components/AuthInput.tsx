import React from 'react';
import { StyleSheet, TextInput, ViewStyle } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  style?: ViewStyle;
}

export default function AuthInput({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry,
  autoCapitalize = 'none',
  style,
}: Props) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: font.body,
  },
});
