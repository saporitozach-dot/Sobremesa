import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FormFocusProvider, useFormFocus } from '../context/FormFocusContext';
import { ChevronRight } from './icons/FeatureIcon';
import { colors, fonts, layout, radius, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function KeyboardFormScreenInner({ children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const focus = useFormFocus();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardOpen(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardOpen(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const showNext = keyboardOpen && focus?.hasNext;

  return (
    <LinearGradient colors={[colors.bg, colors.bgDeep]} style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: footer ? spacing.lg : insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>{children}</View>
      </ScrollView>

      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          {showNext ? (
            <Pressable
              onPress={() => focus?.focusNext()}
              hitSlop={8}
              style={styles.nextRow}
              accessibilityLabel="Next field"
            >
              <Text style={styles.nextLabel}>Next</Text>
              <View style={styles.nextIcon}>
                <ChevronRight size={16} color={colors.bgDeep} />
              </View>
            </Pressable>
          ) : null}
          <View style={styles.footerInner}>{footer}</View>
        </View>
      ) : null}
    </LinearGradient>
  );
}

export default function KeyboardFormScreen(props: Props) {
  return (
    <FormFocusProvider>
      <KeyboardFormScreenInner {...props} />
    </FormFocusProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
  },
  form: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.bg,
  },
  footerInner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.xs,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  nextLabel: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: fonts.sansSemibold,
  },
  nextIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
