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
        <SectionLabel style={styles.firstSection}>Session</SectionLabel>
        <Card padded={false} style={styles.group}>
          <View style={styles.row}>
            <Text style={styles.label}>Background monitoring</Text>
            <Switch
              value={settings.monitoringEnabled}
              onValueChange={(monitoringEnabled) => updateSettings({ monitoringEnabled })}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={settings.monitoringEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>Camera shortcut</Text>
            <Switch
              value={settings.cameraAllowed}
              onValueChange={(cameraAllowed) => updateSettings({ cameraAllowed })}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={settings.cameraAllowed ? colors.primary : colors.textMuted}
            />
          </View>
        </Card>

        <SectionLabel>Goal time</SectionLabel>
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

        <SectionLabel>Emergency contacts</SectionLabel>
        {settings.emergencyContacts.map((c) => (
          <Text key={c.id} style={styles.contact}>
            {c.name} · {c.phone}
          </Text>
        ))}
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Name" />
        <TextField
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          keyboardType="phone-pad"
        />
        <Button label="Add contact" variant="secondary" onPress={addContact} style={styles.addBtn} />

        <View style={styles.footer}>
          <Button label="Stamp book" variant="ghost" onPress={() => navigation.navigate('Rewards')} />
          <Button label="Sign out" variant="danger" onPress={signOut} />
        </View>
      </FadeSlideIn>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  firstSection: { marginTop: 0 },
  group: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  label: { color: colors.text, fontSize: type.body, fontFamily: fonts.sans, flex: 1, marginRight: spacing.md },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  goalBtn: { minWidth: 68, minHeight: 44, paddingHorizontal: spacing.md },
  contact: { color: colors.textMuted, fontSize: type.small, fontFamily: fonts.sans, marginBottom: spacing.xs },
  addBtn: { marginBottom: spacing.md },
  footer: { marginTop: spacing.xl, gap: spacing.xs },
});
