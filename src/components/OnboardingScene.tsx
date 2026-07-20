import React from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { colors, motion } from '../theme';

type Props = {
  progress: Animated.Value;
  isWide: boolean;
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
};

function PlaceSetting({
  x,
  y,
  radius,
}: {
  x: number;
  y: number;
  radius: number;
}) {
  return (
    <G>
      <Circle
        cx={x}
        cy={y}
        r={radius}
        fill="none"
        stroke={colors.primarySoft}
        strokeWidth="1.2"
      />
      <Circle
        cx={x}
        cy={y}
        r={radius * 0.66}
        fill="none"
        stroke={colors.border}
      />
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

function SceneBase({
  width,
  height,
  centerX,
  centerY,
  tableRX,
  tableRY,
}: SceneGeometry) {
  const horizonY = centerY - tableRY * 0.98;

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
        rx={tableRX * 1.16}
        ry={tableRY * 1.28}
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
        rx={tableRX * 0.78}
        ry={tableRY * 0.7}
        fill="none"
        stroke={colors.borderLight}
      />
      <Path
        d={`M ${centerX - tableRX * 0.72} ${horizonY}
          C ${centerX - tableRX * 0.34} ${horizonY - tableRY * 0.24},
            ${centerX + tableRX * 0.34} ${horizonY - tableRY * 0.24},
            ${centerX + tableRX * 0.72} ${horizonY}`}
        fill="none"
        stroke="url(#horizonGlow)"
        strokeLinecap="round"
      />
      <Path
        d={`M ${-width * 0.08} ${height * 0.84}
          C ${width * 0.28} ${height * 0.75},
            ${width * 0.72} ${height * 0.75},
            ${width * 1.08} ${height * 0.84}`}
        fill="none"
        stroke={colors.primarySoft}
        strokeOpacity="0.38"
        strokeLinecap="round"
      />
    </>
  );
}

function WelcomeDetails({
  centerX,
  centerY,
  placeOffset,
  plateRadius,
  tableRY,
}: SceneGeometry) {
  return (
    <>
      <PlaceSetting
        x={centerX - placeOffset}
        y={centerY + tableRY * 0.08}
        radius={plateRadius}
      />
      <PlaceSetting
        x={centerX + placeOffset}
        y={centerY + tableRY * 0.08}
        radius={plateRadius}
      />
      <Path
        d={`M ${centerX - plateRadius * 1.5} ${centerY + tableRY * 0.08}
          C ${centerX - plateRadius * 0.72} ${centerY - tableRY * 0.02},
            ${centerX + plateRadius * 0.72} ${centerY - tableRY * 0.02},
            ${centerX + plateRadius * 1.5} ${centerY + tableRY * 0.08}`}
        fill="none"
        stroke={colors.primarySoft}
        strokeLinecap="round"
      />
      <Circle
        cx={centerX}
        cy={centerY + tableRY * 0.08}
        r={plateRadius * 0.12}
        fill={colors.primary}
      />
    </>
  );
}

function PresenceDetails({
  centerX,
  centerY,
  placeOffset,
  plateRadius,
  tableRY,
}: SceneGeometry) {
  const phoneY = centerY + tableRY * 0.5;

  return (
    <>
      <PlaceSetting
        x={centerX - placeOffset}
        y={centerY + tableRY * 0.04}
        radius={plateRadius}
      />
      <PlaceSetting
        x={centerX + placeOffset}
        y={centerY + tableRY * 0.04}
        radius={plateRadius}
      />
      <Path
        d={`M ${centerX - plateRadius * 0.65} ${phoneY - plateRadius * 0.28}
          L ${centerX + plateRadius * 0.52} ${phoneY - plateRadius * 0.42}
          L ${centerX + plateRadius * 0.68} ${phoneY + plateRadius * 0.18}
          L ${centerX - plateRadius * 0.5} ${phoneY + plateRadius * 0.32} Z`}
        fill={colors.bgMid}
        fillOpacity="0.7"
        stroke={colors.primaryDark}
        strokeLinejoin="round"
      />
      <Line
        x1={centerX - plateRadius * 0.12}
        y1={phoneY + plateRadius * 0.17}
        x2={centerX + plateRadius * 0.14}
        y2={phoneY + plateRadius * 0.14}
        stroke={colors.primarySoft}
        strokeLinecap="round"
      />
      <Path
        d={`M ${centerX - plateRadius * 1.3} ${phoneY + plateRadius * 0.75}
          C ${centerX - plateRadius * 0.54} ${phoneY + plateRadius * 1.02},
            ${centerX + plateRadius * 0.54} ${phoneY + plateRadius * 1.02},
            ${centerX + plateRadius * 1.3} ${phoneY + plateRadius * 0.75}`}
        fill="none"
        stroke={colors.primarySoft}
        strokeLinecap="round"
      />
    </>
  );
}

function ArrivalDetails({
  centerX,
  centerY,
  placeOffset,
  plateRadius,
  tableRY,
}: SceneGeometry) {
  const pinY = centerY - tableRY * 0.72;

  return (
    <>
      <PlaceSetting
        x={centerX - placeOffset}
        y={centerY + tableRY * 0.16}
        radius={plateRadius}
      />
      <PlaceSetting
        x={centerX + placeOffset}
        y={centerY + tableRY * 0.16}
        radius={plateRadius}
      />
      <Path
        d={`M ${centerX} ${centerY + tableRY * 1.02}
          C ${centerX} ${centerY + tableRY * 0.7},
            ${centerX - plateRadius * 1.1} ${centerY + tableRY * 0.58},
            ${centerX - plateRadius * 0.78} ${centerY + tableRY * 0.28}
          C ${centerX - plateRadius * 0.58} ${centerY + tableRY * 0.08},
            ${centerX - plateRadius * 0.18} ${pinY + plateRadius * 0.6},
            ${centerX} ${pinY + plateRadius * 0.48}`}
        fill="none"
        stroke={colors.primarySoft}
        strokeDasharray="5 9"
        strokeLinecap="round"
      />
      <Path
        d={`M ${centerX} ${pinY - plateRadius * 0.58}
          C ${centerX - plateRadius * 0.54} ${pinY - plateRadius * 0.58},
            ${centerX - plateRadius * 0.82} ${pinY - plateRadius * 0.2},
            ${centerX - plateRadius * 0.82} ${pinY + plateRadius * 0.18}
          C ${centerX - plateRadius * 0.82} ${pinY + plateRadius * 0.78},
            ${centerX} ${pinY + plateRadius * 1.35},
            ${centerX} ${pinY + plateRadius * 1.35}
          C ${centerX} ${pinY + plateRadius * 1.35},
            ${centerX + plateRadius * 0.82} ${pinY + plateRadius * 0.78},
            ${centerX + plateRadius * 0.82} ${pinY + plateRadius * 0.18}
          C ${centerX + plateRadius * 0.82} ${pinY - plateRadius * 0.2},
            ${centerX + plateRadius * 0.54} ${pinY - plateRadius * 0.58},
            ${centerX} ${pinY - plateRadius * 0.58} Z`}
        fill={colors.primaryMuted}
        stroke={colors.primary}
        strokeWidth="1.5"
      />
      <Circle cx={centerX} cy={pinY + plateRadius * 0.12} r={plateRadius * 0.22} fill={colors.success} />
      <Circle cx={centerX} cy={pinY + plateRadius * 0.12} r={plateRadius * 0.08} fill={colors.bgDeep} />
      <Path
        d={`M ${centerX - plateRadius * 1.2} ${centerY + tableRY * 0.48}
          C ${centerX - plateRadius * 0.48} ${centerY + tableRY * 0.62},
            ${centerX + plateRadius * 0.48} ${centerY + tableRY * 0.62},
            ${centerX + plateRadius * 1.2} ${centerY + tableRY * 0.48}`}
        fill="none"
        stroke={colors.primaryDark}
        strokeLinecap="round"
      />
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
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
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

export default function OnboardingScene({ progress, isWide }: Props) {
  const { width, height } = useWindowDimensions();
  const centerX = isWide ? width * 0.69 : width * 0.5;
  const centerY = isWide ? height * 0.52 : height * 0.48;
  const geometry: SceneGeometry = {
    width,
    height,
    centerX,
    centerY,
    tableRX: isWide ? Math.min(width * 0.38, 430) : Math.max(width * 0.76, 286),
    tableRY: isWide ? Math.min(height * 0.34, 270) : Math.min(height * 0.27, 226),
    placeOffset: isWide ? Math.min(width * 0.2, 215) : Math.max(width * 0.59, 224),
    plateRadius: isWide ? Math.min(width * 0.055, 54) : Math.max(width * 0.105, 42),
  };
  // Soft overlapping crossfades so the table scene evolves as one continuous chapter.
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
  const arrivalOpacity = progress.interpolate({
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
  const arrivalX = progress.interpolate({
    inputRange: [1, 2],
    outputRange: [motion.chapterParallax, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
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
      <SceneLayer opacity={arrivalOpacity} translateX={arrivalX} geometry={geometry}>
        <ArrivalDetails {...geometry} />
      </SceneLayer>
    </View>
  );
}
