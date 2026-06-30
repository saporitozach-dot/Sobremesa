import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import { text } from '../theme/typography';
import { colors, spacing } from '../theme';

type Props = {
  children: string;
  style?: ViewStyle;
};

export default function SectionLabel({ children, style }: Props) {
  return <Text style={[text.caption, styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
});
