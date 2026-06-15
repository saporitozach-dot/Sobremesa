import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import ArrivalIcon from './ArrivalIcon';

interface Props {
  title: string;
  subtitle?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export default function PulseArrivalButton({
  title,
  subtitle,
  onPress,
  style,
}: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0],
  });
  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.22],
  });
  const btnScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  return (
    <View style={[styles.wrap, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulseRing,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />
      <Pressable onPress={onPress} accessibilityRole="button">
        <Animated.View style={[styles.button, { transform: [{ scale: btnScale }] }]}>
          <View style={styles.iconBadge}>
            <ArrivalIcon size={32} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  pulseRing: {
    ...StyleSheet.absoluteFillObject,
    margin: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '100%',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iconBadge: {
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.bg,
    fontSize: font.body,
    fontWeight: '800',
    lineHeight: 22,
  },
  subtitle: {
    color: colors.bg,
    fontSize: font.small,
    opacity: 0.88,
    marginTop: 2,
    lineHeight: 18,
  },
});
