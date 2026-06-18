import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  accentColor?: string;
}

/** Location pin with always-on geofence rings — onboarding / permissions. */
export default function LocationAlwaysIcon({
  size = 88,
  color = colors.primary,
  accentColor = colors.bg,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle cx={40} cy={38} r={30} stroke={color} strokeWidth={1} opacity={0.14} />
      <Circle cx={40} cy={38} r={23} stroke={color} strokeWidth={1.25} opacity={0.26} />
      <Circle cx={40} cy={38} r={16} stroke={color} strokeWidth={1.5} opacity={0.4} />

      <Path
        d="M40 10 C28 10 18 20 18 32 C18 46 40 66 40 66 C40 66 62 46 62 32 C62 20 52 10 40 10 Z"
        fill={color}
      />
      <Circle cx={40} cy={31} r={9} fill={accentColor} opacity={0.22} />
      <Circle cx={40} cy={31} r={5.5} fill={accentColor} />

      <Path
        d="M54 18 A 22 22 0 0 1 64 30"
        stroke={accentColor}
        strokeWidth={2.25}
        strokeLinecap="round"
        opacity={0.85}
      />
    </Svg>
  );
}
