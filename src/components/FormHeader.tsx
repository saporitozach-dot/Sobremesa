import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { text } from '../theme/typography';
import { spacing } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  kicker?: string;
  style?: ViewStyle;
};

export default function FormHeader({ title, subtitle, kicker, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      {kicker ? <Text style={[text.kicker, styles.kicker]}>{kicker}</Text> : null}
      <Text style={text.display}>{title}</Text>
      {subtitle ? <Text style={[text.bodyMuted, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },
  kicker: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
});
