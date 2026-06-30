export const colors = {
  bg: '#121C17',
  bgDeep: '#0A100D',
  surface: '#1A2822',
  surfaceAlt: '#223329',
  surfaceElevated: '#2A3D34',
  text: '#F4EFE6',
  textMuted: '#8FA598',
  primary: '#D4AF5A',
  primaryMuted: 'rgba(212, 175, 90, 0.12)',
  primaryDark: '#9A7D3E',
  border: '#2E4038',
  borderLight: 'rgba(244, 239, 230, 0.06)',
  success: '#6B9E78',
  danger: '#C45C5C',
  overlay: 'rgba(0,0,0,0.65)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const type = {
  display: 28,
  title: 22,
  heading: 18,
  body: 15,
  small: 13,
  caption: 11,
};

/** Fraunces = warm editorial voice; DM Sans = clean UI */
export const fonts = {
  serif: 'Fraunces_600SemiBold',
  serifBold: 'Fraunces_700Bold',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemibold: 'DMSans_600SemiBold',
} as const;

export const layout = {
  maxContentWidth: 400,
  screenPadding: 20,
  hitSlop: 12,
};

export const motion = {
  fast: 180,
  normal: 280,
  slow: 420,
  spring: { damping: 20, stiffness: 200, mass: 0.7 },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: '#D4AF5A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
};
