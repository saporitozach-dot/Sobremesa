import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import Button from '../components/Button';
import PressableScale from '../components/PressableScale';
import { text } from '../theme/typography';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionCamera'>;
type Facing = 'back' | 'front';

function toFileUri(path: string) {
  return path.startsWith('file://') ? path : `file://${path}`;
}

export default function SessionCameraScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<Facing>('back');
  const device = useCameraDevice(facing);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [vintageEnabled, setVintageEnabled] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<Camera>(null);

  const headerPadding = useMemo(
    () => ({ paddingTop: insets.top + spacing.md }),
    [insets.top],
  );

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing || capturedUri) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });
      setCapturedUri(toFileUri(photo.path));
    } finally {
      setIsCapturing(false);
    }
  }, [capturedUri, isCapturing]);

  if (!hasPermission) {
    return (
      <View style={[styles.root, styles.permissionWrap, headerPadding]}>
        <Text style={text.titleBold}>Camera access needed</Text>
        <Text style={[text.bodyMuted, styles.permissionCopy]}>
          To keep memories inside your phone-down session, allow camera access.
        </Text>
        <Button label="Allow camera" onPress={() => void requestPermission()} />
        <Button label="Back to session" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.root, styles.permissionWrap, headerPadding]}>
        <Text style={text.titleBold}>Camera unavailable</Text>
        <Text style={[text.bodyMuted, styles.permissionCopy]}>
          No camera was found on this device.
        </Text>
        <Button label="Back to session" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {!capturedUri ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
        />
      ) : null}

      <View style={[styles.overlay, headerPadding]} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Button
            label="Back"
            variant="ghost"
            fullWidth={false}
            style={styles.topButton}
            onPress={() => navigation.goBack()}
          />
          <Button
            label={vintageEnabled ? 'Vintage on' : 'Vintage off'}
            variant="secondary"
            fullWidth={false}
            style={styles.topButton}
            onPress={() => setVintageEnabled((current) => !current)}
          />
        </View>

        <View style={styles.frameArea}>
          {capturedUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: capturedUri }} style={styles.preview} />
              {vintageEnabled ? <View style={styles.vintageOverlay} /> : null}
              <Text style={styles.timestamp}>SOBREMESA MEMORY</Text>
            </View>
          ) : (
            <View style={styles.previewHint}>
              <Text style={text.kicker}>In-session camera</Text>
              <Text style={[text.bodyMuted, styles.previewCopy]}>
                Snap a memory and stay in Sobremesa.
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            label="Flip"
            variant="secondary"
            fullWidth={false}
            style={styles.controlButton}
            onPress={toggleFacing}
            disabled={Boolean(capturedUri)}
          />
          <PressableScale
            style={styles.shutterWrap}
            onPress={() => void takePhoto()}
            disabled={Boolean(capturedUri) || isCapturing}
          >
            <View style={styles.shutterOuter}>
              <View style={styles.shutterInner} />
            </View>
          </PressableScale>
          <Button
            label={capturedUri ? 'Retake' : 'Close'}
            variant="secondary"
            fullWidth={false}
            style={styles.controlButton}
            onPress={() => {
              if (capturedUri) {
                setCapturedUri(null);
                return;
              }
              navigation.goBack();
            }}
          />
        </View>
      </View>

      {!capturedUri && vintageEnabled ? (
        <View style={styles.vintageOverlay} pointerEvents="none" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  frameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  previewHint: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cameraFrame,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewCopy: {
    textAlign: 'center',
  },
  previewWrap: {
    width: '100%',
    maxHeight: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cameraFrame,
    overflow: 'hidden',
    backgroundColor: colors.bg,
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    alignSelf: 'center',
  },
  timestamp: {
    ...text.caption,
    color: colors.cameraTimestamp,
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 92,
    minHeight: 44,
  },
  shutterWrap: {
    borderRadius: radius.pill,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
  },
  vintageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.cameraVintageOverlay,
  },
  permissionWrap: {
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  permissionCopy: {
    marginBottom: spacing.sm,
  },
});
