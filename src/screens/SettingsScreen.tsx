import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FadeSlideIn from '../components/FadeSlideIn';
import ScreenScroll from '../components/ScreenScroll';
import SectionLabel from '../components/SectionLabel';
import TextField from '../components/TextField';
import { EmergencyContact } from '../types';
import { text } from '../theme/typography';
import { colors, fonts, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const GOALS = [30, 45, 60, 90] as const;

export default function SettingsScreen({ navigation }: Props) {
  const { settings, updateSettings, signOut } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const addContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing info', 'Enter a name and phone number.');
      return;
    }
    const contact: EmergencyContact = {
      id: `${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
    };
    await updateSettings({
      emergencyContacts: [...settings.emergencyContacts, contact],
    });
    setName('');
    setPhone('');
  };

  return (
    <ScreenScroll edges={['top', 'bottom']}>
      <FadeSlideIn trigger="settings">
        <View style={styles.section}>
          <SectionLabel style={styles.firstSection}>Session</SectionLabel>
          <Text style={styles.sectionHint}>How Sobremesa runs while you dine.</Text>
          <Card padded={false} style={styles.group}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.label}>Background monitoring</Text>
                <Text style={styles.rowHint}>Detect when you arrive at a partner restaurant.</Text>
              </View>
              <Switch
                value={settings.monitoringEnabled}
                onValueChange={(monitoringEnabled) => updateSettings({ monitoringEnabled })}
                trackColor={{ false: colors.border, true: colors.primaryMuted }}
                thumbColor={settings.monitoringEnabled ? colors.primary : colors.textMuted}
              />
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowText}>
                <Text style={styles.label}>Camera shortcut</Text>
                <Text style={styles.rowHint}>Show a camera button during locked mode.</Text>
              </View>
              <Switch
                value={settings.cameraAllowed}
                onValueChange={(cameraAllowed) => updateSettings({ cameraAllowed })}
                trackColor={{ false: colors.border, true: colors.primaryMuted }}
                thumbColor={settings.cameraAllowed ? colors.primary : colors.textMuted}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionLabel>Goal time</SectionLabel>
          <Text style={styles.sectionHint}>Default session length when you start.</Text>
          <View style={styles.goalRow}>
            {GOALS.map((g) => (
              <Button
                key={g}
                label={`${g}m`}
                variant={settings.goalMinutes === g ? 'primary' : 'secondary'}
                onPress={() => updateSettings({ goalMinutes: g })}
                style={styles.goalBtn}
                fullWidth={false}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel>Emergency contacts</SectionLabel>
          <Text style={styles.sectionHint}>Quick-dial from locked mode.</Text>
          <Card padded={false} style={styles.group}>
            {settings.emergencyContacts.length === 0 ? (
              <Text style={styles.emptyContacts}>No contacts yet.</Text>
            ) : (
              settings.emergencyContacts.map((c, index) => (
                <View key={c.id} style={[styles.contactRow, index > 0 && styles.rowBorder]}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactPhone}>{c.phone}</Text>
                </View>
              ))
            )}
          </Card>

          <Text style={styles.subsectionLabel}>Add contact</Text>
          <View style={styles.addForm}>
            <TextField label="Name" value={name} onChangeText={setName} placeholder="Name" />
            <TextField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              keyboardType="phone-pad"
            />
            <Button label="Add contact" variant="secondary" onPress={addContact} />
          </View>
        </View>

        <View style={styles.footer}>
          <Button label="Stamp book" variant="ghost" onPress={() => navigation.navigate('Rewards')} />
          <Button label="Sign out" variant="danger" onPress={signOut} />
        </View>
      </FadeSlideIn>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  firstSection: {
    marginTop: spacing.sm,
  },
  sectionHint: {
    ...text.small,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  group: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: type.body,
    fontFamily: fonts.sansSemibold,
    lineHeight: 22,
  },
  rowHint: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    lineHeight: 20,
  },
  goalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalBtn: {
    minWidth: 68,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  emptyContacts: {
    ...text.small,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  contactRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 2,
  },
  contactName: {
    color: colors.text,
    fontSize: type.body,
    fontFamily: fonts.sansSemibold,
    lineHeight: 22,
  },
  contactPhone: {
    color: colors.textMuted,
    fontSize: type.small,
    fontFamily: fonts.sans,
    lineHeight: 20,
  },
  subsectionLabel: {
    ...text.label,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  addForm: {
    gap: spacing.xs,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
});
