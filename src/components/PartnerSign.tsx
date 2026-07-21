import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';
import { Restaurant } from '../types';

type Motif = 'agave' | 'glass' | 'cup' | 'table';

export type PartnerLook = {
  motif: Motif;
  accent: string;
};

const FALLBACK_ACCENTS = [
  colors.accentClay,
  colors.accentVine,
  colors.accentPlum,
  colors.accentSky,
];

/** Stable per-id index — a venue always gets the same sign. */
function hashIndex(id: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

/**
 * Derived from cuisine rather than stored on the restaurant, so this keeps working
 * when a backend replaces the seed data and supplies no presentation fields.
 */
export function partnerLook(restaurant: Pick<Restaurant, 'id' | 'cuisine'>): PartnerLook {
  const cuisine = restaurant.cuisine.toLowerCase();

  if (cuisine.includes('mexican') || cuisine.includes('taco')) {
    return { motif: 'agave', accent: colors.accentClay };
  }
  if (cuisine.includes('wine') || cuisine.includes('bar')) {
    return { motif: 'glass', accent: colors.accentPlum };
  }
  if (cuisine.includes('coffee') || cuisine.includes('cafe') || cuisine.includes('café')) {
    return { motif: 'cup', accent: colors.accentVine };
  }
  return {
    motif: 'table',
    accent: FALLBACK_ACCENTS[hashIndex(restaurant.id, FALLBACK_ACCENTS.length)],
  };
}

/**
 * The awning as a standalone band, for full-width surfaces. Flexed stripes with
 * large bottom radii scallop the hem at any width, with no measuring required.
 * Place it inside a paper container with `overflow: 'hidden'`.
 */
export function PartnerAwning({
  accent,
  height = 22,
  stripes = 11,
}: {
  accent: string;
  height?: number;
  stripes?: number;
}) {
  return (
    <View style={[awningStyles.awning, { height }]} accessibilityElementsHidden>
      {Array.from({ length: stripes }, (_, i) => (
        <View
          key={i}
          style={[
            awningStyles.stripe,
            { backgroundColor: i % 2 === 0 ? accent : colors.paper },
          ]}
        />
      ))}
    </View>
  );
}

const awningStyles = StyleSheet.create({
  awning: {
    flexDirection: 'row',
  },
  stripe: {
    flex: 1,
    height: '100%',
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
  },
});

/** The motif alone, for places that already carry the awning themselves. */
export function PartnerMotif({
  restaurant,
  size = 20,
}: {
  restaurant: Pick<Restaurant, 'id' | 'cuisine'>;
  size?: number;
}) {
  const { motif } = partnerLook(restaurant);
  return (
    <Svg width={size} height={size} viewBox="10 30 36 30" fill="none">
      <MotifArt motif={motif} />
    </Svg>
  );
}

/** Solid shapes only — thin outlined pictograms are what read as stock iconography. */
function MotifArt({ motif }: { motif: Motif }) {
  switch (motif) {
    case 'agave':
      return (
        <G>
          <Path
            d="M28 56 L28 34 M28 56 L18 38 M28 56 L38 38 M28 56 L13 47 M28 56 L43 47"
            stroke={colors.ink}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </G>
      );
    case 'glass':
      return (
        <G>
          {/* Rounded bowl, not a V — this is a wine bar, not a cocktail bar. */}
          <Path d="M18 32 H38 C38 43 33.5 47.5 28 47.5 C22.5 47.5 18 43 18 32 Z" fill={colors.ink} />
          <Rect x="26" y="46" width="4" height="9" fill={colors.ink} />
          <Rect x="19" y="53" width="18" height="4" rx="2" fill={colors.ink} />
        </G>
      );
    case 'cup':
      return (
        <G>
          <Path d="M16 34 L36 34 L33 54 L19 54 Z" fill={colors.ink} />
          <Path
            d="M37 38 C44 38 44 49 35 49"
            fill="none"
            stroke={colors.ink}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </G>
      );
    case 'table':
    default:
      return (
        <G>
          <Circle cx="28" cy="45" r="11" fill={colors.ink} />
          <Rect x="12" y="34" width="4" height="22" rx="2" fill={colors.ink} />
          <Rect x="40" y="34" width="4" height="22" rx="2" fill={colors.ink} />
        </G>
      );
  }
}

/**
 * A little storefront sign: striped awning over a paper panel with a solid motif.
 * Boxy and specific on purpose — it should read as a shop, not a list-item icon.
 */
export default function PartnerSign({
  restaurant,
  width = 50,
  style,
}: {
  restaurant: Pick<Restaurant, 'id' | 'cuisine'>;
  width?: number;
  style?: ViewStyle;
}) {
  const { motif, accent } = partnerLook(restaurant);
  const height = width * (64 / 56);

  return (
    <View
      style={[{ width, height }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={width} height={height} viewBox="0 0 56 64" fill="none">
        <Defs>
          {/* Rect plus circles gives the awning its scalloped hem without arc maths. */}
          <ClipPath id="awning">
            <Rect x="0" y="0" width="56" height="15" />
            <Circle cx="7" cy="15" r="7" />
            <Circle cx="21" cy="15" r="7" />
            <Circle cx="35" cy="15" r="7" />
            <Circle cx="49" cy="15" r="7" />
          </ClipPath>
        </Defs>

        <Rect x="1" y="1" width="54" height="62" rx="5" fill={colors.paper} />

        <G clipPath="url(#awning)">
          <Rect x="0" y="0" width="56" height="24" fill={accent} />
          <Rect x="7" y="0" width="7" height="24" fill={colors.paper} fillOpacity={0.82} />
          <Rect x="21" y="0" width="7" height="24" fill={colors.paper} fillOpacity={0.82} />
          <Rect x="35" y="0" width="7" height="24" fill={colors.paper} fillOpacity={0.82} />
          <Rect x="49" y="0" width="7" height="24" fill={colors.paper} fillOpacity={0.82} />
        </G>

        <MotifArt motif={motif} />

        <Rect
          x="1"
          y="1"
          width="54"
          height="62"
          rx="5"
          fill="none"
          stroke={colors.ink}
          strokeWidth="2"
          strokeOpacity={0.55}
        />
      </Svg>
    </View>
  );
}
