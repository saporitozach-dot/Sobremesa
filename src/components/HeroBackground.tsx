import React, { useEffect, useRef } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const AUTH_HERO_VIDEO = require('../../assets/auth-hero.mp4');

export default function HeroBackground() {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    void videoRef.current?.playAsync();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void videoRef.current?.playAsync();
      } else {
        void videoRef.current?.pauseAsync();
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Video
        ref={videoRef}
        source={AUTH_HERO_VIDEO}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted
        shouldPlay
        useNativeControls={false}
        onReadyForDisplay={() => {
          void videoRef.current?.playAsync();
        }}
      />

      <View style={[StyleSheet.absoluteFill, styles.tint]} />

      <LinearGradient
        colors={[
          'rgba(27, 42, 36, 0.35)',
          'rgba(27, 42, 36, 0.72)',
          colors.bg,
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={['rgba(232, 176, 75, 0.14)', 'transparent']}
        style={styles.warmGlow}
      />

      <LinearGradient
        colors={['transparent', 'rgba(27, 42, 36, 0.9)', colors.bg]}
        locations={[0.28, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={['rgba(14, 23, 19, 0.45)', 'transparent', 'rgba(14, 23, 19, 0.45)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tint: {
    backgroundColor: 'rgba(36, 58, 49, 0.28)',
  },
  warmGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
});
