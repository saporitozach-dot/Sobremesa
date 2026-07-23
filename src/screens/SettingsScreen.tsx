import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hapticLight } from '../services/haptics';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';
import ScreenHeader from '../components/ScreenHeader';
import ScreenScroll from '../components/ScreenScroll';
import SectionLabel from '../components/SectionLabel';
import { ChevronRight } from '../components/icons/FeatureIcon';
import { EmergencyContact } from '../types';
import { text } from '../theme/typography';
import { colors, fonts, layout, motion, radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const GOALS = [30, 45, 60, 90] as const;

/** Section heading + optional one-line explanation, sitting above a group. */
function Section({
  title,
  hint,
  first,
  children,
}: {
  title: string;
  hint?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <SectionLabel style={first ? styles.firstSectionLabel : undefined}>{title}</SectionLabel>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

/** Inset card that clips its rows — one visual container per group of settings. */
function Group({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.group, style]}>{children}</View>;
}

/**
 * A knob riding a thin rail, rather than a thumb inside a pill — the stock
 * silhouette is the thing that reads as a default component. The knob overhangs
 * the rail so it sits on the surface like a physical control.
 */
function Toggle({
  value,
  onValueChange,
  label,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  label: string;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: reduceMotion ? motion.reduced : motion.fast,
      useNativeDriver: false,
    }).start();
  }, [value, progress, reduceMotion]);

  const railColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bgDeep, colors.primary],
  });
  const railBorder = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, layout.toggleWidth - layout.toggleKnob],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={layout.hitSlop}
      onPress={() => {
        hapticLight();
        onValueChange(!value);
      }}
    >
      <View style={styles.toggle}>
        <Animated.View
          style={[styles.rail, { backgroundColor: railColor, borderColor: railBorder }]}
        />
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </View>
    </Pressable>
  );
}

/** Hairline between rows, inset to the label's left edge. */
function Divider() {
  return <View style={styles.divider} />;
}

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  // Label and control share the head line; the explanation runs the full width
  // beneath so it never wraps ragged against the switch.
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleHead}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Toggle value={value} onValueChange={onValueChange} label={label} />
      </View>
      <Text style={styles.rowHint}>{hint}</Text>
    </View>
  );
}

function ActionRow({
  label,
  onPress,
  danger = false,
  centered = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  centered?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [pressed && styles.rowPressed]}
    >
      <View style={styles.actionRow}>
        <Text
          style={[
            styles.rowLabel,
            danger && styles.rowLabelDanger,
            centered && styles.rowLabelCentered,
          ]}
        >
          {label}
        </Text>
        {centered ? null : <ChevronRight size={14} color={colors.textSubtle} />}
      </View>
    </PressableScale>
  );
}

/** Label in a fixed gutter, value typed alongside it — no second boxed shell. */
function InlineField({ label, ...rest }: { label: string } & TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.fieldRow, focused && styles.fieldRowFocused]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, Platform.OS === 'web' && styles.fieldInputWeb]}
        placeholderTextColor={colors.textSubtle}
        accessibilityLabel={label}
        {...rest}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const { settings, updateSettings, signOut, simulateArrival } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addingContact, setAddingContact] = useState(false);

  const canAddContact = Boolean(name.trim() && phone.trim());

  const addContact = async () => {
    if (!canAddContact) {
      Alert.alert('Missing info', 'Enter a name and phone number.');
      return;
    }
    const contact: EmergencyContact = {
      id: `${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
    };
    setAddingContact(true);
    try {
      await updateSettings({
        emergencyContacts: [...settings.emergencyContacts, contact],
      });
      setName('');
      setPhone('');
    } finally {
      setAddingContact(false);
    }
  };

  const confirmSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Sign out?\n\nYour local session history and stamp book will stay on this device.',
      );
      if (confirmed) void signOut();
      return;
    }

    Alert.alert('Sign out?', 'Your local session history and stamp book will stay on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  return (
    <ScreenScroll edges={['bottom']} contentContainerStyle={styles.scroll}>
      <ScreenHeader title="Settings" onBackPress={() => navigation.goBack()} />
      <FadeSlideIn trigger="settings">
        <Section first title="Session" hint="How Sobremesa runs while you dine.">
          <Group>
            <ToggleRow
              label="Background monitoring"
              hint="Detect when you arrive at a partner restaurant."
              value={settings.monitoringEnabled}
              onValueChange={(monitoringEnabled) => updateSettings({ monitoringEnabled })}
            />
            <Divider />
            <ToggleRow
              label="Camera shortcut"
              hint="Show a camera option during present mode."
              value={settings.cameraAllowed}
              onValueChange={(cameraAllowed) => updateSettings({ cameraAllowed })}
            />
          </Group>
        </Section>

        <Section title="Goal time" hint="Default session length when you start.">
          <View style={styles.segmented}>
            {GOALS.map((g) => {
              const selected = settings.goalMinutes === g;
              return (
                <PressableScale
                  key={g}
                  onPress={() => updateSettings({ goalMinutes: g })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${g} minutes`}
                  style={[styles.segment, selected && styles.segmentSelected]}
                >
                  <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                    {g}m
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </Section>

        <Section title="Emergency contacts" hint="Quick-dial from present mode.">
          <Group>
            {settings.emergencyContacts.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No contacts yet.</Text>
              </View>
            ) : (
              settings.emergencyContacts.map((c, index) => (
                <React.Fragment key={c.id}>
                  {index > 0 ? <Divider /> : null}
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{c.name}</Text>
                    <Text style={styles.rowValue}>{c.phone}</Text>
                  </View>
                </React.Fragment>
              ))
            )}
          </Group>

          <Text style={styles.subsectionLabel}>Add contact</Text>
          <Group>
            <InlineField
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Jordan"
              autoCapitalize="words"
              returnKeyType="next"
            />
            <Divider />
            <InlineField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 010-1234"
              keyboardType="phone-pad"
            />
          </Group>
          <View style={styles.addActions}>
            <Button
              label="Add contact"
              variant="secondary"
              onPress={addContact}
              loading={addingContact}
              disabled={!canAddContact}
              fullWidth={false}
            />
          </View>
        </Section>

        {__DEV__ ? (
          <Section title="Developer" hint="Testing tools — not shown in production.">
            <Group>
              <ActionRow
                label="Simulate arrival"
                onPress={() => simulateArrival('sobremesa-demo')}
              />
            </Group>
          </Section>
        ) : null}

        <View style={styles.footer}>
          <Group style={styles.pillGroup}>
            <ActionRow label="Stamp book" onPress={() => navigation.navigate('Rewards')} />
          </Group>
          <Group style={styles.pillGroup}>
            <ActionRow label="Sign out" onPress={confirmSignOut} danger centered />
          </Group>
        </View>
      </FadeSlideIn>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 0,
  },
  section: {
    marginBottom: spacing.xl,
  },
  firstSectionLabel: {
    marginTop: spacing.sm,
  },
  sectionHint: {
    ...text.small,
    marginBottom: spacing.md,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
    backgroundColor: colors.borderLight,
  },
  pillGroup: {
    borderRadius: radius.pill,
    borderColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.controlHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  toggleRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  toggleHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.compactControlHeight,
    gap: spacing.md,
  },
  toggle: {
    width: layout.toggleWidth,
    height: layout.toggleKnob,
    justifyContent: 'center',
  },
  rail: {
    height: layout.toggleRailHeight,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  knob: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: layout.toggleKnob,
    height: layout.toggleKnob,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.paperEdge,
    ...shadows.knob,
  },
  rowLabel: {
    ...text.body,
    fontFamily: fonts.sansMedium,
  },
  rowLabelDanger: {
    color: colors.danger,
  },
  rowLabelCentered: {
    flex: 1,
    textAlign: 'center',
  },
  rowHint: {
    ...text.small,
    color: colors.textSubtle,
  },
  rowValue: text.small,
  rowPressed: {
    backgroundColor: colors.surfacePressed,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.controlHeight,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyRow: {
    minHeight: layout.controlHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    ...text.small,
    color: colors.textSubtle,
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.bgDeep,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    minHeight: layout.compactControlHeight,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.primary,
  },
  segmentLabel: {
    ...text.button,
    color: colors.textMuted,
  },
  segmentLabelSelected: {
    color: colors.bgDeep,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.controlHeight,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  fieldRowFocused: {
    backgroundColor: colors.surfaceAlt,
  },
  fieldLabel: {
    ...text.body,
    color: colors.textMuted,
    width: layout.inlineLabelWidth,
  },
  fieldInput: {
    ...text.input,
    flex: 1,
    minWidth: 0,
    paddingVertical: spacing.md,
  },
  fieldInputWeb: {
    outlineStyle: 'none',
    fontFamily: fonts.sans,
  } as object,
  subsectionLabel: {
    ...text.label,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  addActions: {
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
});
