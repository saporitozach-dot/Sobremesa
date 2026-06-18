import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  accentColor?: string;
}

/** Padlock — phone-free session / set your phone aside. */
export default function SessionLockIcon({
  size = 88,
  color = colors.primary,
  accentColor = colors.bg,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Rect
        x={22}
        y={36}
        width={36}
        height={30}
        rx={5}
        fill={color}
      />
      <Path
        d="M28 36 V28 C28 18.6 35.6 11 45 11 C54.4 11 62 18.6 62 28 V36"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Path
        d="M28 36 V28 C28 18.6 35.6 11 45 11 C54.4 11 62 18.6 62 28 V36"
        stroke={accentColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.2}
      />
      <Rect
        x={38}
        y={46}
        width={4}
        height={10}
        rx={2}
        fill={accentColor}
        opacity={0.85}
      />
      <Path
        d="M40 46 C36.5 46 34 48.2 34 51"
        stroke={accentColor}
        strokeWidth={2.25}
        strokeLinecap="round"
        opacity={0.85}
      />
    </Svg>
  );
}
