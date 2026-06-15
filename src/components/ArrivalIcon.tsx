import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  accentColor?: string;
}

/**
 * Arrival mark — geofence pulse locking onto a partner zone.
 */
export default function ArrivalIcon({
  size = 72,
  color = colors.primary,
  accentColor = colors.bg,
}: Props) {
  const cx = 40;
  const cy = 40;

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle
        cx={cx}
        cy={cy}
        r={36}
        stroke={color}
        strokeWidth={1}
        opacity={0.15}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={28}
        stroke={color}
        strokeWidth={1.35}
        opacity={0.28}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={21}
        stroke={color}
        strokeWidth={1.65}
        opacity={0.42}
      />

      <Circle
        cx={cx}
        cy={cy}
        r={24}
        stroke={color}
        strokeWidth={1.35}
        strokeDasharray="5 7"
        opacity={0.5}
      />

      <Path
        d="M40 14 A 26 26 0 0 1 60 28"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.92}
      />

      <Circle cx={cx} cy={cy} r={15} fill={color} />
      <Circle
        cx={cx}
        cy={cy}
        r={12}
        stroke={accentColor}
        strokeWidth={1.5}
        opacity={0.18}
      />

      <G
        stroke={accentColor}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M33 40.5 L37.5 45 L48 33.5" />
      </G>
    </Svg>
  );
}
