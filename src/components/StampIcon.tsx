import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  filled?: boolean;
  color?: string;
  accentColor?: string;
}

/** Minimal Sobremesa stamp — filled when earned, outline when empty. */
export default function StampIcon({
  size = 28,
  filled = false,
  color = colors.primary,
  accentColor = colors.bg,
}: Props) {
  if (!filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Circle
          cx={16}
          cy={16}
          r={13}
          stroke={color}
          strokeWidth={1.75}
          opacity={0.45}
        />
        <Circle
          cx={16}
          cy={16}
          r={9}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.3}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx={16} cy={16} r={13} fill={color} />
      <Circle cx={16} cy={16} r={10} stroke={accentColor} strokeWidth={1.25} opacity={0.25} />
      <Path
        d="M11 16.5 L14.5 20 L21 12.5"
        stroke={accentColor}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
