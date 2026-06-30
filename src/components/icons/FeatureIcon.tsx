import React from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme';

type IconProps = {
  size?: number;
  color?: string;
  accent?: string;
};

export type FeatureIconName = 'dining' | 'reward' | 'setup';

export function FeatureIcon({
  name,
  size = 36,
  color = colors.primary,
  accent = colors.success,
}: IconProps & { name: FeatureIconName }) {
  switch (name) {
    case 'dining':
      return <DiningIcon size={size} color={color} accent={accent} />;
    case 'reward':
      return <RewardIcon size={size} color={color} accent={accent} />;
    case 'setup':
      return <SetupIcon size={size} color={color} accent={accent} />;
  }
}

function DiningIcon({ size, color, accent }: Required<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Circle cx="18" cy="18" r="16" stroke={color} strokeWidth="1.5" opacity={0.35} />
      <G rotation={-14} origin="18, 18">
        <Rect x="11" y="10" width="2.5" height="18" rx="1.25" fill={accent} />
        <Line x1="10" y1="10" x2="14.5" y2="10" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <Line x1="10.5" y1="7.5" x2="10.5" y2="10" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        <Line x1="12.25" y1="7.5" x2="12.25" y2="10" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        <Line x1="14" y1="7.5" x2="14" y2="10" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
      </G>
      <G rotation={14} origin="18, 18">
        <Rect x="22.5" y="10" width="2.5" height="18" rx="1.25" fill={color} />
        <Path d="M21 10 L26.5 10 L25 16 L22.5 16 Z" fill={color} />
      </G>
    </Svg>
  );
}

function RewardIcon({ size, color, accent }: Required<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Circle cx="18" cy="18" r="14" stroke={color} strokeWidth="2" strokeDasharray="4 3" />
      <Circle cx="18" cy="18" r="9" fill={color} opacity={0.2} />
      <Path
        d="M13 18.5 L16.5 22 L23 14.5"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SetupIcon({ size, color, accent }: Required<IconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Circle cx="18" cy="16" r="6" stroke={color} strokeWidth="2" />
      <Circle cx="18" cy="16" r="2.5" fill={accent} />
      <Path
        d="M18 22 C14 22 10 24 10 28 L26 28 C26 24 22 22 18 22 Z"
        fill={color}
        opacity={0.85}
      />
      <Circle cx="26" cy="10" r="5" fill={accent} opacity={0.25} />
      <Circle cx="26" cy="10" r="3" stroke={accent} strokeWidth="1.5" />
      <Line x1="26" y1="8" x2="26" y2="12" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="24" y1="10" x2="28" y2="10" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function ChevronRight({ size = 14, color = colors.primary }: Pick<IconProps, 'size' | 'color'>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M5 3 L9 7 L5 11"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SettingsIcon({ size = 20, color = colors.textMuted }: Pick<IconProps, 'size' | 'color'>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
        stroke={color}
        strokeWidth="1.75"
      />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
