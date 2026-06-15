import React from 'react';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  /** Rendered width & height in points. The mark is square-ish. */
  size?: number;
  /** Color used for the negative-space utensils. Defaults to the app background. */
  utensilColor?: string;
  bubbleColor?: string;
}

/**
 * Sobremesa mark — a speech bubble (conversation) holding a crossed fork
 * and knife (the meal). Single source of truth for the in-app logo.
 */
export default function Logo({
  size = 64,
  utensilColor = colors.bg,
  bubbleColor = colors.primary,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Circle cx={100} cy={92} r={72} fill={bubbleColor} />
      <Path d="M64,152 L103,152 L75,186 Z" fill={bubbleColor} />
      <G fill={utensilColor} transform="translate(0 4)">
        <G transform="rotate(-19 100 92)">
          <Rect x={89} y={46} width={5} height={22} rx={2.5} />
          <Rect x={97.5} y={46} width={5} height={22} rx={2.5} />
          <Rect x={106} y={46} width={5} height={22} rx={2.5} />
          <Rect x={89} y={62} width={22} height={8} rx={4} />
          <Rect x={96.5} y={64} width={7} height={80} rx={3.5} />
        </G>
        <G transform="rotate(19 100 92)">
          <Path d="M100,44 C104,55 106,65 106,75 L106,90 L94,90 L94,75 C94,65 96,55 100,44 Z" />
          <Rect x={96.5} y={86} width={7} height={58} rx={3.5} />
        </G>
      </G>
    </Svg>
  );
}
