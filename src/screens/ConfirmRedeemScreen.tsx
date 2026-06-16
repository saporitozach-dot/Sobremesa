import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import { getRestaurantById } from '../data/restaurants';
import RewardIcon from '../components/RewardIcon';
import StampRow from '../components/StampRow';
import Button from '../components/Button';
import { canRedeem } from '../services/stamps';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ConfirmRedeem'>;
type Route = RouteProp<RootStackParamList, 'ConfirmRedeem'>;

export default function ConfirmRedeemScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: Route;
}) {
  const { restaurantId, returnTo } = route.params;
  const { getBookForRestaurant, redeemStampsForRestaurant } = useApp();
  const restaurant = getRestaurantById(restaurantId);
  const book = getBookForRestaurant(restaurantId);

  const [serverAcknowledged, setServerAcknowledged] = useState(false);
  const [serverName, setServerName] = useState('');
  const [busy, setBusy] = useState(false);

  if (!restaurant || !canRedeem(book)) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Cannot redeem</Text>
          <Text style={styles.body}>
            You need 3 stamps at this restaurant before redeeming.
          </Text>
          <Button title="Go back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  async function handleComplete() {
    const name = serverName.trim();
    if (!serverAcknowledged || !name || busy) return;

    setBusy(true);
    const voucher = redeemStampsForRestaurant(restaurantId, name);
    setBusy(false);

    if (voucher) {
      navigation.replace('RedeemVoucher', { voucherId: voucher.id, returnTo });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconWrap}>
            <RewardIcon size={44} />
          </View>
          <Text style={styles.kicker}>Redeem reward</Text>
          <Text style={styles.title}>{restaurant.rewardLabel}</Text>
          <Text style={styles.restaurant}>{restaurant.name}</Text>

          <View style={styles.card}>
            <StampRow stamps={book.stamps} size={32} />
            <Text style={styles.cardHint}>
              This will use all 3 stamps at {restaurant.name}.
            </Text>
          </View>

          <View style={styles.serverCard}>
            <Text style={styles.serverTitle}>Server confirmation</Text>
            <Text style={styles.serverBody}>
              Hand your phone to your server. They must confirm this redemption so
              it isn’t accidental.
            </Text>

            {!serverAcknowledged ? (
              <Button
                title="Server: confirm redemption"
                onPress={() => setServerAcknowledged(true)}
                style={{ marginTop: spacing.md }}
              />
            ) : (
              <>
                <View style={styles.confirmedBadge}>
                  <Text style={styles.confirmedText}>Server acknowledged</Text>
                </View>
                <Text style={styles.nameLabel}>Server name</Text>
                <TextInput
                  placeholder="Type server name"
                  placeholderTextColor={colors.textMuted}
                  value={serverName}
                  onChangeText={setServerName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.input}
                />
                <Button
                  title="Complete redemption"
                  onPress={handleComplete}
                  disabled={!serverName.trim()}
                  loading={busy}
                  style={{ marginTop: spacing.sm }}
                />
              </>
            )}
          </View>

          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xl },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  iconWrap: { alignItems: 'center', marginBottom: spacing.md },
  kicker: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: font.body,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    fontSize: font.title,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  restaurant: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: font.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardHint: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    lineHeight: 18,
  },
  serverCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serverTitle: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
  },
  serverBody: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  confirmedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
  },
  confirmedText: {
    color: colors.success,
    fontSize: font.small,
    fontWeight: '700',
  },
  nameLabel: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: font.body,
  },
});
