import React from 'react';
import { Platform, ScrollView, ScrollViewProps, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients, layout, spacing } from '../theme';

type Props = ScrollViewProps & {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom')[];
};

export default function ScreenScroll({
  children,
  contentStyle,
  edges = ['bottom'],
  contentContainerStyle,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={gradients.screen} style={styles.root}>
      <ScrollView
        {...rest}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: edges.includes('top') ? insets.top + spacing.md : spacing.md,
            paddingBottom: insets.bottom + spacing.xl,
          },
          contentContainerStyle,
        ]}
      >
        <View style={[styles.inner, contentStyle]}>{children}</View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenPadding,
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
});
