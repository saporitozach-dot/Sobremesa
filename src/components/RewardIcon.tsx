import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
}

/** Cocktail glass — used for rewards / redemption. */
export default function RewardIcon({
  size = 24,
  color = colors.primary,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4h12l-2 9.5a4 4 0 0 1-3.6 2.5H11.6A4 4 0 0 1 8 13.5L6 4Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      <Path
        d="M12 16v3M9 21h6"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <Path
        d="M7 7h10"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
      />
    </Svg>
  );
}
