import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import ArrivalIcon from '../components/ArrivalIcon';
import StampRow from '../components/StampRow';
import SessionStartModal from '../components/SessionStartModal';
import { MIN_STAMP_MINUTES, STAMPS_FOR_REWARD } from '../types';
import { openSystemDistractionSettings } from '../services/appShield';
import {
  hasSeenAppBlockSetup,
  markAppBlockSetupSeen,
} from '../services/sessionPrefs';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ZonePrompt'>;

export default function ZonePromptScreen({ navigation }: { navigation: Nav }) {
  const { activeRestaurant, settings, startLock, dismissPing, getBookForRestaurant } =
    useApp();
  const insets = useSafeAreaInsets();
  const [showStartModal, setShowStartModal] = useState(false);
  const [firstTimeSetup, setFirstTimeSetup] = useState(true);

  useEffect(() => {
    hasSeenAppBlockSetup().then((seen) => setFirstTimeSetup(!seen));
  }, []);

  if (!activeRestaurant) {
    navigation.goBack();
    return null;
  }

  function beginSession() {
    setShowStartModal(false);
    void markAppBlockSetupSeen();
    startLock(activeRestaurant!);
    navigation.replace('Locked');
  }

  function handlePutPhoneAway() {
    setShowStartModal(true);
  }

  function handleSkip() {
    dismissPing();
    navigation.goBack();
  }

  const allowances = [
    'Emergency contacts',
    ...(settings.cameraAllowed ? ['Camera'] : []),
  ];

  const book = getBookForRestaurant(activeRestaurant.id);
  const stampsToday =
    book.lastStampDate === new Date().toISOString().slice(0, 10);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: Math.max(insets.top, spacing.md) },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.iconWrap}>
          <ArrivalIcon size={80} />
        </View>
        <Text style={styles.kicker}>You've arrived at</Text>
        <Text style={styles.name} numberOfLines={3}>
          {activeRestaurant.name}
        </Text>
        <Text style={styles.cuisine}>{activeRestaurant.cuisine}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start a phone-free Sobremesa?</Text>
          <DetailRow label="Goal" value={`${settings.goalMinutes} min at the table`} />
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Stamps</Text>
            <StampRow stamps={book.stamps} size={24} />
            <Text style={styles.stampHint}>
              +1 stamp after {MIN_STAMP_MINUTES} min phone-free
              {stampsToday ? ' · already earned today' : ' · once per day'}
              {' · '}
              {STAMPS_FOR_REWARD} stamps = {activeRestaurant.rewardLabel.toLowerCase()}
            </Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Still available</Text>
            <View style={styles.chipRow}>
              {allowances.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Button title="Put my phone away" onPress={handlePutPhoneAway} />
        <Button
          title="Not right now"
          variant="ghost"
          onPress={handleSkip}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>

      <SessionStartModal
        visible={showStartModal}
        firstTime={firstTimeSetup}
        cameraAllowed={settings.cameraAllowed}
        onOpenSettings={openSystemDistractionSettings}
        onContinue={beginSession}
        onCancel={() => setShowStartModal(false)}
      />
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  kicker: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: font.body,
    lineHeight: 22,
  },
  name: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: spacing.xs,
    maxWidth: '100%',
  },
  cuisine: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: font.body,
    lineHeight: 22,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    width: '100%',
  },
  cardTitle: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: spacing.xs,
  },
  detailRow: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  detailBlock: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  detailValue: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '600',
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
    lineHeight: 18,
  },
  stampHint: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
});
