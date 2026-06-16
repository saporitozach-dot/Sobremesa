import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import StampIcon from './StampIcon';
import { STAMPS_FOR_REWARD } from '../types';

interface Props {
  stamps: number;
  size?: number;
}

export default function StampRow({ stamps, size = 32 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: STAMPS_FOR_REWARD }, (_, i) => (
        <StampIcon key={i} size={size} filled={i < stamps} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
