import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, layout, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Override nav header offset when not inside a stack screen */
  keyboardOffset?: number;
};

export default function KeyboardFormScreen({ children, footer, keyboardOffset }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const isWeb = Platform.OS === 'web';
  const scrollRef = useRef<ScrollView>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const verticalOffset = keyboardOffset ?? headerHeight;

  useEffect(() => {
    if (isWeb) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: { endCoordinates: { height: number }; duration?: number }) => {
      setKeyboardOpen(true);
      Animated.timing(keyboardHeight, {
        toValue: event.endCoordinates.height,
        duration: event.duration ?? 250,
        useNativeDriver: false,
      }).start();
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    };

    const onHide = (event: { duration?: number }) => {
      setKeyboardOpen(false);
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: event.duration ?? 200,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [isWeb, keyboardHeight]);

  return (
    <LinearGradient colors={[colors.bg, colors.bgDeep]} style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={!isWeb}
        keyboardVerticalOffset={verticalOffset}
      >
        <Animated.View
          style={[
            styles.flex,
            {
              paddingBottom: isWeb
                ? 0
                : keyboardHeight.interpolate({
                    inputRange: [0, 500],
                    outputRange: [0, 500],
                  }),
            },
          ]}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: footer ? spacing.md : insets.bottom + spacing.lg },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={isWeb ? 'none' : 'interactive'}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>{children}</View>
          </ScrollView>

          {footer ? (
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
              {keyboardOpen && !isWeb ? (
                <Pressable
                  onPress={Keyboard.dismiss}
                  hitSlop={8}
                  style={styles.dismissRow}
                >
                  <Text style={styles.dismissText}>Done typing</Text>
                </Pressable>
              ) : null}
              <View style={styles.footerInner}>{footer}</View>
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
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
  dismissRow: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  dismissText: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: fonts.sansSemibold,
  },
});
