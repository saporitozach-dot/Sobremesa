import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
}

/** Minimal camera — allowed during phone-free sessions. */
export default function CameraIcon({
  size = 28,
  color = colors.primary,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8.5h2.2l1.4-2h8.8l1.4 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={13} r={3.25} stroke={color} strokeWidth={1.75} />
      <Rect
        x={7}
        y={5.5}
        width={4}
        height={2.5}
        rx={0.75}
        stroke={color}
        strokeWidth={1.5}
        opacity={0.6}
      />
    </Svg>
  );
}
