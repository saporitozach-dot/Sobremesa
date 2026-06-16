import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  accentColor?: string;
}

/** Small stamp book — used on the locked session screen. */
export default function StampBookIcon({
  size = 24,
  color = colors.primary,
  accentColor = colors.textMuted,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={5}
        y={3}
        width={14}
        height={18}
        rx={2}
        stroke={color}
        strokeWidth={1.75}
      />
      <Path
        d="M9 3v18M15 3v18"
        stroke={accentColor}
        strokeWidth={1}
        opacity={0.35}
      />
      <Circle cx={9} cy={9} r={1.75} fill={color} opacity={0.9} />
      <Circle cx={15} cy={9} r={1.75} stroke={color} strokeWidth={1.25} opacity={0.45} />
      <Circle cx={9} cy={14} r={1.75} stroke={color} strokeWidth={1.25} opacity={0.45} />
      <Circle cx={15} cy={14} r={1.75} stroke={color} strokeWidth={1.25} opacity={0.25} />
    </Svg>
  );
}
