import React, { useCallback, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { Video, ResizeMode, AVPlaybackSource, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, motion } from '../theme';

type Props = {
  source: AVPlaybackSource;
  style?: ViewStyle;
  /** 0–1 darkness of the scrim over the video */
  dim?: number;
  /** Playback rate — 1 is normal, lower is slower */
  rate?: number;
};

export default function VideoBackground({ source, style, dim = 0.78, rate = 1 }: Props) {
  const videoRef = useRef<Video>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const rateApplied = useRef(false);
  const [failed, setFailed] = useState(false);

  const applyRate = useCallback(async () => {
    if (rate === 1 || failed) return;
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.setStatusAsync({
        rate,
        shouldCorrectPitch: false,
        shouldPlay: true,
      });
      rateApplied.current = true;
    } catch {
      // Retry on next status tick if the native player is not ready yet.
    }
  }, [failed, rate]);

  const onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || failed) return;

    if (rate !== 1 && (!rateApplied.current || status.rate !== rate)) {
      void applyRate();
    }

    if (status.isPlaying) {
      Animated.timing(fade, {
        toValue: 1,
        duration: motion.slow,
        useNativeDriver: true,
      }).start();
    }

    // iOS can reset rate when the loop restarts.
    if (rate !== 1 && status.didJustFinish) {
      rateApplied.current = false;
      void applyRate();
    }
  };

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {!failed ? (
        <Animated.View style={[styles.videoWrap, { opacity: fade }]}>
          <Video
            ref={videoRef}
            source={source}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted
            shouldPlay
            rate={rate}
            shouldCorrectPitch={false}
            onPlaybackStatusUpdate={onStatus}
            onLoad={() => {
              rateApplied.current = false;
              void applyRate();
            }}
            onError={() => setFailed(true)}
            {...(Platform.OS === 'web' ? { useNativeControls: false } : {})}
          />
        </Animated.View>
      ) : null}

      {/* Base dim — keeps footage subtle */}
      <View style={[styles.scrim, { opacity: dim }]} />

      {/* Vignette: darker top + bottom for legibility */}
      <LinearGradient
        colors={[
          'rgba(8, 12, 10, 0.92)',
          'rgba(8, 12, 10, 0.45)',
          'rgba(8, 12, 10, 0.55)',
          'rgba(8, 12, 10, 0.94)',
        ]}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Brand tint */}
      <View style={styles.brandTint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgDeep,
    overflow: 'hidden',
  },
  videoWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.55,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgDeep,
  },
  brandTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    opacity: 0.18,
  },
});
