import React, { useMemo } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInputProps,
  View,
} from 'react-native';
import TextField from './TextField';
import { colors, fonts, radius, spacing, type } from '../theme';

const DOMAINS = ['gmail.com', 'icloud.com', 'outlook.com', 'yahoo.com', 'iu.edu', 'hotmail.com'];

function suggestionsFor(email: string): string[] {
  const at = email.indexOf('@');
  if (at < 1) return [];
  const local = email.slice(0, at);
  const domainPart = email.slice(at + 1).toLowerCase();
  return DOMAINS.filter((d) => d.startsWith(domainPart) || domainPart === '')
    .map((d) => `${local}@${d}`)
    .filter((s) => s.toLowerCase() !== email.toLowerCase())
    .slice(0, 5);
}

type Props = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
};

export default function EmailInput({ label, value, onChangeText, ...rest }: Props) {
  const suggestions = useMemo(() => suggestionsFor(value), [value]);
  const showSuggestions = value.includes('@') && suggestions.length > 0;

  return (
    <View style={styles.wrap}>
      <TextField
        label={label}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        value={value}
        onChangeText={onChangeText}
        placeholder="you@example.com"
        returnKeyType="next"
        {...rest}
      />
      {showSuggestions ? (
        <View style={styles.chips}>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              onPress={() => {
                onChangeText(s);
                Keyboard.dismiss();
              }}
            >
              <Text style={styles.chipText}>@{s.split('@')[1]}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xs },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipPressed: { opacity: 0.75 },
  chipText: { color: colors.primary, fontSize: type.small, fontFamily: fonts.sansMedium },
});
