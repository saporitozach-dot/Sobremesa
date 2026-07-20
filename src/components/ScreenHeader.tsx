import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FadeSlideIn from './FadeSlideIn';
import PressableScale from './PressableScale';
import { ChevronRight, SettingsIcon } from './icons/FeatureIcon';
import { text } from '../theme/typography';
import { colors, layout, radius, spacing, type } from '../theme';

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  onSettingsPress?: () => void;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
};

export default function ScreenHeader({
  kicker,
  title,
  subtitle,
  onSettingsPress,
  onBackPress,
  rightAction,
  style,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <FadeSlideIn trigger={`${kicker}-${title}`} style={[styles.wrap, { paddingTop: insets.top + spacing.md }, style]}>
      <View style={styles.row}>
        {onBackPress ? (
          <PressableScale
            onPress={onBackPress}
            style={styles.backBtn}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={layout.hitSlop}
          >
            <View style={styles.backChevron}>
              <ChevronRight size={16} color={colors.primary} />
            </View>
          </PressableScale>
        ) : null}
        <View style={[styles.text, onBackPress && styles.textWithBack]}>
          {kicker ? <Text style={text.kicker}>{kicker}</Text> : null}
          <Text style={[text.titleBold, styles.title]}>{title}</Text>
          {subtitle ? <Text style={[text.small, styles.subtitle]}>{subtitle}</Text> : null}
        </View>
        {rightAction ??
          (onSettingsPress ? (
            <PressableScale
              onPress={onSettingsPress}
              style={styles.iconBtn}
              accessibilityLabel="Settings"
              accessibilityRole="button"
              hitSlop={layout.hitSlop}
            >
              <SettingsIcon size={20} color={colors.primary} />
            </PressableScale>
          ) : (
            <View style={styles.iconSpacer} />
          ))}
      </View>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.md,
    maxWidth: layout.maxContentWidth + layout.screenPadding * 2,
    alignSelf: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: { flex: 1, gap: 2 },
  textWithBack: { paddingLeft: spacing.xs },
  title: {
    fontSize: type.display,
    lineHeight: 34,
  },
  subtitle: { marginTop: spacing.xs },
  backBtn: {
    width: layout.compactControlHeight,
    height: layout.compactControlHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  backChevron: { transform: [{ rotate: '180deg' }] },
  iconBtn: {
    width: layout.compactControlHeight,
    height: layout.compactControlHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconSpacer: { width: layout.compactControlHeight },
});
