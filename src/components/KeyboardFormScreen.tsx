import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FormFocusProvider, useFormFocus } from '../context/FormFocusContext';
import { text } from '../theme/typography';
import BrandHeader from './BrandHeader';
import { ChevronRight } from './icons/FeatureIcon';
import { colors, fonts, layout, motion, radius, shadows, spacing, type } from '../theme';

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function KeyboardFormScreenInner({ children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const route = useRoute();
  const focus = useFormFocus();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const isWide = width >= layout.authWideBreakpoint;
  const screenTitle = {
    SignUp: 'Sign up',
    Login: 'Log in',
    PhoneVerify: 'Verify phone',
    ForgotPassword: 'Forgot password',
  }[route.name];

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
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={layout.hitSlop}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <View style={styles.backIcon}>
            <ChevronRight size={type.heading} color={colors.text} />
          </View>
        </Pressable>
        <Text style={styles.topBarTitle}>{screenTitle}</Text>
      </View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          isWide && styles.scrollWide,
          {
            paddingBottom:
              footer && !isWide ? spacing.lg : insets.bottom + spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.composition, isWide && styles.compositionWide]}>
          {isWide ? (
            <View style={styles.aside}>
              <BrandHeader size="md" style={styles.brand} />
              <View style={styles.asideRule} />
              <Text style={[text.title, styles.asideTitle]}>
                More time at the table.
              </Text>
              <Text style={[text.bodyMuted, styles.asideCopy]}>
                A quieter way to discover restaurants, put the phone down, and stay present.
              </Text>
            </View>
          ) : null}
          <View style={[styles.form, isWide && styles.formWide]}>
            {children}
            {footer && isWide ? <View style={styles.inlineFooter}>{footer}</View> : null}
          </View>
        </View>
      </ScrollView>

      {footer && !isWide ? (
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
  topBar: {
    minHeight: layout.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  backButton: {
    width: layout.compactControlHeight,
    height: layout.compactControlHeight,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  backButtonPressed: {
    opacity: motion.pressOpacity,
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  topBarTitle: {
    fontFamily: fonts.serif,
    fontSize: type.body,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
  },
  scrollWide: {
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  composition: {
    width: '100%',
    maxWidth: layout.authFormWidth,
    alignSelf: 'center',
  },
  compositionWide: {
    maxWidth: layout.authCanvasWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxxl,
  },
  aside: {
    width: layout.authAsideWidth,
    paddingHorizontal: spacing.xl,
  },
  brand: {
    alignItems: 'flex-start',
  },
  asideRule: {
    width: spacing.xxxl,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.primary,
    marginVertical: spacing.xxl,
  },
  asideTitle: {
    marginBottom: spacing.md,
  },
  asideCopy: {
    maxWidth: layout.compactCopyWidth,
  },
  form: {
    width: '100%',
    alignSelf: 'center',
  },
  formWide: {
    maxWidth: layout.authFormWidth,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  inlineFooter: {
    gap: spacing.xs,
    marginTop: spacing.sm,
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
    fontSize: type.body,
    fontFamily: fonts.sansSemibold,
  },
  nextIcon: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
