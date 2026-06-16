import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
}

/** Phone handset with alert pulse — emergency contacts during a session. */
export default function EmergencyPhoneIcon({
  size = 28,
  color = colors.primary,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 4.5c.5 2.2 1.4 4.2 2.6 6.1M17.5 4.5c-.5 2.2-1.4 4.2-2.6 6.1"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.45}
      />
      <Path
        d="M8.2 14.8c1.4 2.5 3.3 4.4 5.8 5.8l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.7.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.3 21 3 13.7 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.5.6 3.7.1.4 0 .8-.3 1.1l-2.2 2.2Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
