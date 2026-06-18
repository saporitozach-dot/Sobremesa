import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import Button from './Button';
import SessionLockIcon from './SessionLockIcon';

interface Props {
  visible: boolean;
  firstTime: boolean;
  cameraAllowed: boolean;
  onOpenSettings: () => void;
  onContinue: () => void;
  onCancel: () => void;
}

export default function SessionStartModal({
  visible,
  firstTime,
  cameraAllowed,
  onOpenSettings,
  onContinue,
  onCancel,
}: Props) {
  const allowances = [
    'Emergency contacts',
    ...(cameraAllowed ? ['Camera'] : []),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconWrap}>
            <SessionLockIcon size={64} />
          </View>
          <Text style={styles.title}>
            {firstTime ? 'Set up your phone-free session' : 'Ready to put your phone away?'}
          </Text>

          {firstTime ? (
            <Text style={styles.body}>
              {Platform.OS === 'ios'
                ? 'On iPhone, Sobremesa cannot block other apps from inside Expo Go. Open Settings → Screen Time or Focus to choose which apps to limit while you dine.'
                : 'Sobremesa cannot block other apps from inside Expo Go. Use Do Not Disturb or app timers in system settings for stronger protection.'}
              {'\n\n'}
              During your session, everything else is set aside inside Sobremesa — only
              what stays available is listed below.
            </Text>
          ) : (
            <Text style={styles.body}>
              Stay in Sobremesa for your phone-free session. Other apps should stay
              closed — only these remain available:
            </Text>
          )}

          <View style={styles.chipRow}>
            {allowances.map((item) => (
              <View key={item} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>

          {firstTime && (
            <Button
              title={Platform.OS === 'ios' ? 'Open Settings' : 'Open system settings'}
              variant="secondary"
              onPress={onOpenSettings}
              style={{ marginTop: spacing.md }}
            />
          )}
          <Button
            title="Start session"
            onPress={onContinue}
            style={{ marginTop: spacing.sm }}
          />
          <Button
            title="Not yet"
            variant="ghost"
            onPress={onCancel}
            style={{ marginTop: spacing.xs }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: { alignItems: 'center', marginBottom: spacing.md },
  title: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
  },
  chipText: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '600',
  },
});
