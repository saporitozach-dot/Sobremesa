import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, motion } from '../theme';

type Props = {
  progress: Animated.Value;
};

type SceneGeometry = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  tableRX: number;
  tableRY: number;
  placeOffset: number;
  plateRadius: number;
  /** Settings sit above centre so each chapter's motif has clear table below it. */
  plateRowY: number;
  /** Where the per-chapter object rests on the cloth. */
  motifY: number;
};

/**
 * The scene is drawn to fit the band it is given rather than the window, so the
 * table reads as a whole object instead of arcs running off every edge.
 */
function measure(width: number, height: number): SceneGeometry {
  const centerX = width / 2;
  const centerY = height / 2;
  const tableRX = width * 0.44;
  const tableRY = Math.min(height * 0.32, tableRX * 0.52);
  const plateRadius = Math.min(width * 0.082, height * 0.15, 40);

  return {
    width,
    height,
    centerX,
    centerY,
    tableRX,
    tableRY,
    // Kept well inside the table so a plate's outer utensil never clips the edge.
    placeOffset: Math.min(width * 0.26, tableRX * 0.6),
    plateRadius,
    plateRowY: centerY - tableRY * 0.34,
    motifY: centerY + tableRY * 0.4,
  };
}

function PlaceSetting({ x, y, radius }: { x: number; y: number; radius: number }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={radius} fill="none" stroke={colors.primarySoft} strokeWidth="1.2" />
      <Circle cx={x} cy={y} r={radius * 0.66} fill="none" stroke={colors.border} />
      <Line
        x1={x - radius * 1.38}
        y1={y - radius * 0.62}
        x2={x - radius * 1.38}
        y2={y + radius * 0.62}
        stroke={colors.primaryDark}
        strokeLinecap="round"
      />
      <Line
        x1={x + radius * 1.38}
        y1={y - radius * 0.62}
        x2={x + radius * 1.38}
        y2={y + radius * 0.62}
        stroke={colors.primaryDark}
        strokeLinecap="round"
      />
    </G>
  );
}

function SceneBase({ centerX, centerY, tableRX, tableRY }: SceneGeometry) {
  return (
    <>
      <Defs>
        <RadialGradient id="tableGlow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor={colors.surfaceAlt} stopOpacity="0.58" />
          <Stop offset="0.62" stopColor={colors.surface} stopOpacity="0.2" />
          <Stop offset="1" stopColor={colors.bgDeep} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="horizonGlow" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors.primary} stopOpacity="0" />
          <Stop offset="0.5" stopColor={colors.primary} stopOpacity="0.22" />
          <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Ellipse
        cx={centerX}
        cy={centerY}
        rx={tableRX * 1.24}
        ry={tableRY * 1.5}
        fill="url(#tableGlow)"
      />
      <Ellipse
        cx={centerX}
        cy={centerY}
        rx={tableRX}
        ry={tableRY}
        fill={colors.surface}
        fillOpacity="0.13"
        stroke={colors.border}
        strokeWidth="1.2"
      />
      <Ellipse
        cx={centerX}
        cy={centerY}
        rx={tableRX * 0.8}
        ry={tableRY * 0.74}
        fill="none"
        stroke={colors.borderLight}
      />
      <Path
        d={`M ${centerX - tableRX * 0.7} ${centerY - tableRY * 1.02}
          C ${centerX - tableRX * 0.32} ${centerY - tableRY * 1.24},
            ${centerX + tableRX * 0.32} ${centerY - tableRY * 1.24},
            ${centerX + tableRX * 0.7} ${centerY - tableRY * 1.02}`}
        fill="none"
        stroke="url(#horizonGlow)"
        strokeLinecap="round"
      />
    </>
  );
}

/** Chapter one: a laid table, nobody's phone in sight. */
function WelcomeDetails({ centerX, placeOffset, plateRadius, plateRowY, motifY }: SceneGeometry) {
  return (
    <>
      <PlaceSetting x={centerX - placeOffset} y={plateRowY} radius={plateRadius} />
      <PlaceSetting x={centerX + placeOffset} y={plateRowY} radius={plateRadius} />
      {/* A votive between the settings — the warm centre everyone leans toward. */}
      <Circle
        cx={centerX}
        cy={motifY - plateRadius * 0.3}
        r={plateRadius * 0.62}
        fill={colors.primary}
        fillOpacity="0.12"
      />
      <Rect
        x={centerX - plateRadius * 0.26}
        y={motifY - plateRadius * 0.08}
        width={plateRadius * 0.52}
        height={plateRadius * 0.6}
        rx={plateRadius * 0.12}
        fill={colors.surface}
        fillOpacity="0.55"
        stroke={colors.primaryDark}
      />
      <Ellipse
        cx={centerX}
        cy={motifY - plateRadius * 0.28}
        rx={plateRadius * 0.11}
        ry={plateRadius * 0.19}
        fill={colors.primary}
      />
    </>
  );
}

/** Chapter two: the phone is face-down on the cloth. */
function PresenceDetails({ centerX, placeOffset, plateRadius, plateRowY, motifY }: SceneGeometry) {
  return (
    <>
      <PlaceSetting x={centerX - placeOffset} y={plateRowY} radius={plateRadius} />
      <PlaceSetting x={centerX + placeOffset} y={plateRowY} radius={plateRadius} />
      <Path
        d={`M ${centerX - plateRadius * 0.62} ${motifY - plateRadius * 0.3}
          L ${centerX + plateRadius * 0.5} ${motifY - plateRadius * 0.44}
          L ${centerX + plateRadius * 0.66} ${motifY + plateRadius * 0.16}
          L ${centerX - plateRadius * 0.48} ${motifY + plateRadius * 0.3} Z`}
        fill={colors.bgMid}
        fillOpacity="0.7"
        stroke={colors.primaryDark}
        strokeLinejoin="round"
      />
      <Line
        x1={centerX - plateRadius * 0.12}
        y1={motifY + plateRadius * 0.15}
        x2={centerX + plateRadius * 0.14}
        y2={motifY + plateRadius * 0.12}
        stroke={colors.primarySoft}
        strokeLinecap="round"
      />
    </>
  );
}

/** Chapter three: stamps filling up toward a reward. */
function RewardDetails({ centerX, placeOffset, plateRadius, plateRowY, motifY }: SceneGeometry) {
  const stampGap = plateRadius * 0.94;
  const stampR = plateRadius * 0.29;

  return (
    <>
      <PlaceSetting x={centerX - placeOffset} y={plateRowY} radius={plateRadius} />
      <PlaceSetting x={centerX + placeOffset} y={plateRowY} radius={plateRadius} />
      {[-1, 0, 1].map((slot) => {
        const filled = slot < 1;
        const x = centerX + slot * stampGap;
        return (
          <G key={`stamp-${slot}`}>
            <Circle
              cx={x}
              cy={motifY}
              r={stampR}
              fill={filled ? colors.primaryMuted : 'none'}
              stroke={filled ? colors.primary : colors.border}
              strokeWidth="1.5"
            />
            {filled ? <Circle cx={x} cy={motifY} r={stampR * 0.34} fill={colors.primary} /> : null}
          </G>
        );
      })}
    </>
  );
}

function SceneLayer({
  opacity,
  translateX,
  geometry,
  children,
}: {
  opacity: Animated.AnimatedInterpolation<number>;
  translateX: Animated.AnimatedInterpolation<number>;
  geometry: SceneGeometry;
  children: React.ReactNode;
}) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity, transform: [{ translateX }] }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        accessible={false}
      >
        {children}
      </Svg>
    </Animated.View>
  );
}

export default function OnboardingScene({ progress }: Props) {
  const reduceMotion = useReducedMotion();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const drift = useRef(new Animated.Value(0)).current;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  // A single slow breath. Long enough that it reads as the scene being alive
  // rather than as something moving — the screen should stay calm.
  useEffect(() => {
    if (reduceMotion) {
      drift.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: motion.ambientDrift,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: motion.ambientDrift,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, reduceMotion]);

  const geometry = measure(box.width, box.height);

  // Soft overlapping crossfades so the table evolves as one continuous chapter.
  const welcomeOpacity = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [1, 0.42, 0],
    extrapolate: 'clamp',
  });
  const presenceOpacity = progress.interpolate({
    inputRange: [0, 0.45, 1, 1.55, 2],
    outputRange: [0, 0.55, 1, 0.55, 0],
    extrapolate: 'clamp',
  });
  const rewardOpacity = progress.interpolate({
    inputRange: [1, 1.45, 2],
    outputRange: [0, 0.55, 1],
    extrapolate: 'clamp',
  });
  const welcomeX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -motion.chapterParallax],
    extrapolate: 'clamp',
  });
  const presenceX = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [motion.chapterParallax, 0, -motion.chapterParallax],
    extrapolate: 'clamp',
  });
  const rewardX = progress.interpolate({
    inputRange: [1, 2],
    outputRange: [motion.chapterParallax, 0],
    extrapolate: 'clamp',
  });
  const driftY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -motion.ambientDistance],
  });

  return (
    <View
      onLayout={onLayout}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={styles.root}
    >
      {box.width > 0 && box.height > 0 ? (
        <Animated.View style={[styles.stack, { transform: [{ translateY: driftY }] }]}>
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            accessible={false}
          >
            <SceneBase {...geometry} />
          </Svg>
          <SceneLayer opacity={welcomeOpacity} translateX={welcomeX} geometry={geometry}>
            <WelcomeDetails {...geometry} />
          </SceneLayer>
          <SceneLayer opacity={presenceOpacity} translateX={presenceX} geometry={geometry}>
            <PresenceDetails {...geometry} />
          </SceneLayer>
          <SceneLayer opacity={rewardOpacity} translateX={rewardX} geometry={geometry}>
            <RewardDetails {...geometry} />
          </SceneLayer>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stack: { flex: 1 },
});
