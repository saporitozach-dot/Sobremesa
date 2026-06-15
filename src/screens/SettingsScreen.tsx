import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import { EmergencyContact } from '../types';

const GOAL_OPTIONS = [30, 45, 60, 90];

export default function SettingsScreen() {
  const {
    settings,
    updateSettings,
    monitoring,
    enableMonitoring,
    disableMonitoring,
    emergencyContacts,
    setContacts,
    account,
    logOut,
  } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [monitorBusy, setMonitorBusy] = useState(false);
  const [monitorHint, setMonitorHint] = useState<string | null>(null);

  function addContact() {
    if (!name.trim() || !phone.trim()) return;
    const contact: EmergencyContact = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
    };
    setContacts([...emergencyContacts, contact]);
    setName('');
    setPhone('');
  }

  function removeContact(id: string) {
    setContacts(emergencyContacts.filter((c) => c.id !== id));
  }

  async function handleMonitoringToggle(next: boolean) {
    if (monitorBusy) return;
    setMonitorBusy(true);
    setMonitorHint(null);
    try {
      if (next) {
        const result = await enableMonitoring();
        if (result.ok) {
          setMonitorHint(
            result.message ??
              (result.mode === 'background'
                ? 'Monitoring partner zones in the background.'
                : 'Monitoring partner zones while the app is open.'),
          );
        } else {
          setMonitorHint(result.message ?? 'Could not enable zone monitoring.');
        }
      } else {
        await disableMonitoring();
        setMonitorHint('Zone monitoring is off.');
      }
    } finally {
      setMonitorBusy(false);
    }
  }

  async function handleOpenLocationSettings() {
    await Linking.openSettings();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.section}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{account?.firstName}</Text>
          <Text style={styles.hint}>{account?.email}</Text>
          <Button
            title="Log out"
            variant="secondary"
            onPress={logOut}
            style={{ marginTop: spacing.md }}
          />
        </View>

        <Text style={styles.section}>Zone detection</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Monitor restaurant zones</Text>
            <Switch
              value={monitoring}
              disabled={monitorBusy}
              onValueChange={handleMonitoringToggle}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <Text style={styles.hint}>
            Detects when you arrive at a partner restaurant. Works while the app
            is open with While Using location. Always Allow enables detection when
            the app is closed.
          </Text>
          {monitorHint ? <Text style={styles.statusHint}>{monitorHint}</Text> : null}
          <Pressable onPress={handleOpenLocationSettings} hitSlop={8}>
            <Text style={styles.link}>Open Expo Go location settings</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Session goal</Text>
        <View style={styles.card}>
          <View style={styles.chips}>
            {GOAL_OPTIONS.map((m) => (
              <Pressable
                key={m}
                onPress={() => updateSettings({ goalMinutes: m })}
                style={[
                  styles.chip,
                  settings.goalMinutes === m && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    settings.goalMinutes === m && styles.chipTextActive,
                  ]}
                >
                  {m}m
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.section}>Allowances</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Keep camera available</Text>
            <Switch
              value={settings.cameraAllowed}
              onValueChange={(v) => updateSettings({ cameraAllowed: v })}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <Text style={styles.hint}>
            Emergency contacts are always reachable during a session.
          </Text>
        </View>

        <Text style={styles.section}>Emergency contacts</Text>
        <View style={styles.card}>
          {emergencyContacts.length === 0 && (
            <Text style={styles.hint}>No contacts yet.</Text>
          )}
          {emergencyContacts.map((c) => (
            <View key={c.id} style={styles.contactRow}>
              <View>
                <Text style={styles.label}>{c.name}</Text>
                <Text style={styles.hint}>{c.phone}</Text>
              </View>
              <Pressable onPress={() => removeContact(c.id)} hitSlop={10}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))}
          <TextInput
            placeholder="Name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone number"
            placeholderTextColor={colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Button title="Add contact" variant="secondary" onPress={addContact} />
        </View>

        <Text style={styles.version}>Sobremesa v0.1.0 — MVP</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },
  section: {
    color: colors.textMuted,
    fontSize: font.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: colors.text, fontSize: font.body, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.sm, lineHeight: 18 },
  statusHint: {
    color: colors.primary,
    fontSize: font.small,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '700' },
  chipTextActive: { color: colors.bg },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  remove: { color: colors.danger, fontSize: font.small, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  version: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
