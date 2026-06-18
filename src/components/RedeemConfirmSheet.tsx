import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import { getRestaurantById } from '../data/restaurants';
import RewardIcon from './RewardIcon';
import StampRow from './StampRow';
import Button from './Button';
import HoldToConfirmButton from './HoldToConfirmButton';
import { canRedeem } from '../services/stamps';

type Step = 'diner' | 'server' | 'name';

interface Props {
  visible: boolean;
  restaurantId: string | null;
  onClose: () => void;
  onVoucher: (voucherId: string) => void;
}

export default function RedeemConfirmSheet({
  visible,
  restaurantId,
  onClose,
  onVoucher,
}: Props) {
  const { getBookForRestaurant, redeemStampsForRestaurant } = useApp();
  const [step, setStep] = useState<Step>('diner');
  const [serverName, setServerName] = useState('');
  const [busy, setBusy] = useState(false);

  const restaurant = restaurantId ? getRestaurantById(restaurantId) : null;
  const book = restaurantId ? getBookForRestaurant(restaurantId) : null;
  const canProceed = restaurant && book && canRedeem(book);

  function reset() {
    setStep('diner');
    setServerName('');
    setBusy(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleComplete() {
    if (!restaurantId) return;
    const name = serverName.trim();
    if (!name || busy) return;

    setBusy(true);
    const voucher = redeemStampsForRestaurant(restaurantId, name);
    setBusy(false);

    if (voucher) {
      reset();
      onVoucher(voucher.id);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={() => reset()}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {!canProceed || !restaurant || !book ? (
            <>
              <Text style={styles.title}>Cannot redeem</Text>
              <Text style={styles.body}>
                You need 3 stamps at this restaurant before redeeming.
              </Text>
              <Button title="Close" onPress={handleClose} />
            </>
          ) : (
            <>
              <View style={styles.iconWrap}>
                <RewardIcon size={40} />
              </View>
              <Text style={styles.title}>{restaurant.rewardLabel}</Text>
              <Text style={styles.subtitle}>{restaurant.name}</Text>

              <View style={styles.card}>
                <StampRow stamps={book.stamps} size={28} />
                <Text style={styles.cardHint}>Uses all 3 stamps</Text>
              </View>

              <Text style={styles.sectionTitle}>Server confirmation</Text>

              {step === 'diner' && (
                <>
                  <Text style={styles.body}>
                    Tap below when you're ready to pay, then hand your phone to your
                    server. They must press and hold to confirm — this prevents
                    accidental or repeated redemptions.
                  </Text>
                  <Button
                    title="I'm ready — hand to server"
                    onPress={() => setStep('server')}
                    style={{ marginTop: spacing.md }}
                  />
                </>
              )}

              {step === 'server' && (
                <>
                  <Text style={styles.body}>
                    Server only: press and hold the button for 3 full seconds.
                  </Text>
                  <HoldToConfirmButton
                    title="Server: hold to confirm"
                    hint="Release early to cancel"
                    onConfirmed={() => setStep('name')}
                  />
                  <Button
                    title="Back"
                    variant="ghost"
                    onPress={() => setStep('diner')}
                    style={{ marginTop: spacing.sm }}
                  />
                </>
              )}

              {step === 'name' && (
                <>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Server verified</Text>
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

              <Button
                title="Cancel"
                variant="ghost"
                onPress={handleClose}
                style={{ marginTop: spacing.sm }}
              />
            </>
          )}
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
    maxHeight: '92%',
  },
  iconWrap: { alignItems: 'center', marginBottom: spacing.sm },
  title: {
    color: colors.text,
    fontSize: font.heading,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.body,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  cardHint: { color: colors.textMuted, fontSize: font.small },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  verifiedText: {
    color: colors.success,
    fontSize: font.small,
    fontWeight: '700',
  },
  nameLabel: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '600',
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
