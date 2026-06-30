import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Button from '../components/Button';
import FadeSlideIn from '../components/FadeSlideIn';
import Screen from '../components/Screen';
import { FeatureIcon } from '../components/icons/FeatureIcon';
import { colors, fonts, radius, spacing, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionComplete'>;

export default function SessionCompleteScreen({ navigation }: Props) {
  return (
    <Screen
      layout="centered"
      compactFooter
      footer={
        <>
          <Button label="Back home" onPress={() => navigation.navigate('Home')} />
          <Button
            label="Stamp book"
            variant="secondary"
            onPress={() => navigation.navigate('Rewards')}
          />
        </>
      }
    >
      <FadeSlideIn trigger="complete">
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <FeatureIcon name="reward" size={32} />
          </View>
          <Text style={styles.title}>Stamp earned</Text>
          <Text style={styles.body}>You stayed present. Nice work.</Text>
        </View>
      </FadeSlideIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontFamily: fonts.serifBold,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textMuted,
    fontSize: type.body,
    fontFamily: fonts.sans,
    textAlign: 'center',
    lineHeight: 22,
  },
});
