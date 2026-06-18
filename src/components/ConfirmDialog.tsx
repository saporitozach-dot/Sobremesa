import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import Button from './Button';

interface Action {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

interface Props {
  visible: boolean;
  title: string;
  message: string;
  actions: Action[];
  onDismiss?: () => void;
}

/** Cross-platform confirm sheet (Alert.alert is unreliable on web). */
export default function ConfirmDialog({
  visible,
  title,
  message,
  actions,
  onDismiss,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {actions.map((action) => (
              <Button
                key={action.label}
                title={action.label}
                variant={action.variant ?? 'secondary'}
                onPress={action.onPress}
                style={styles.actionBtn}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  actions: { gap: spacing.sm },
  actionBtn: { width: '100%' },
});
