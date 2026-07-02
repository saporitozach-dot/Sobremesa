import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { text } from '../theme/typography';
import { colors, layout, motion, radius, spacing } from '../theme';

type Props = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function ActionSheet({ visible, title, onClose, children, style }: Props) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(320)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, ...motion.spring }),
        Animated.timing(fade, { toValue: 1, duration: motion.fast, useNativeDriver: true }),
      ]).start();
    } else {
      slide.setValue(320);
      fade.setValue(0);
    }
  }, [visible, slide, fade]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close">
          <Animated.View style={[styles.backdrop, { opacity: fade }]} />
        </Pressable>
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY: slide }] },
            style,
          ]}
        >
          <View style={styles.handle} />
          {title ? <Text style={[text.titleBold, styles.title]}>{title}</Text> : null}
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    maxWidth: layout.maxContentWidth + layout.screenPadding * 2,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    gap: spacing.sm,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
});
