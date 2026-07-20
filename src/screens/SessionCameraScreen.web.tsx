import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Button from '../components/Button';
import { text } from '../theme/typography';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionCamera'>;

export default function SessionCameraScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <Text style={text.titleBold}>Camera preview unavailable</Text>
      <Text style={[text.bodyMuted, styles.copy]}>
        The in-session camera is available in the native Sobremesa app.
      </Text>
      <Button label="Back to session" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  copy: {
    marginBottom: spacing.sm,
  },
});
