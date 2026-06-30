import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { text } from '../theme/typography';
import { spacing } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
};

export default function FormHeader({ title, subtitle, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={text.titleBold}>{title}</Text>
      {subtitle ? <Text style={[text.small, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
