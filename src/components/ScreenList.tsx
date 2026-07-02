import React from 'react';
import { FlatList, FlatListProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '../theme';

type Props<T> = FlatListProps<T> & {
  header?: React.ReactNode;
};

export default function ScreenList<T>({ header, contentContainerStyle, ...rest }: Props<T>) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={[colors.bg, colors.bgDeep]} style={styles.root}>
      {header}
      <FlatList
        {...rest}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xl },
          contentContainerStyle,
        ]}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: {
    paddingHorizontal: layout.screenPadding,
    maxWidth: layout.maxContentWidth + layout.screenPadding * 2,
    alignSelf: 'center',
    width: '100%',
  },
});
