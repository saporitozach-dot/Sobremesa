export const colors = {
  bg: '#121C17',
  bgDeep: '#0A100D',
  bgMid: '#0D1612',
  surface: '#1A2822',
  surfaceAlt: '#223329',
  surfaceElevated: '#2A3D34',
  surfacePressed: '#30463B',
  text: '#F4EFE6',
  textMuted: '#8FA598',
  textSubtle: '#6F8478',
  primary: '#D4AF5A',
  primaryPressed: '#C49D48',
  primaryMuted: 'rgba(212, 175, 90, 0.12)',
  primarySoft: 'rgba(212, 175, 90, 0.22)',
  primaryFocus: 'rgba(212, 175, 90, 0.32)',
  primaryDark: '#9A7D3E',
  border: '#2E4038',
  borderLight: 'rgba(244, 239, 230, 0.06)',
  success: '#6B9E78',
  successMuted: 'rgba(107, 158, 120, 0.14)',
  danger: '#C45C5C',
  dangerMuted: 'rgba(196, 92, 92, 0.12)',
  overlay: 'rgba(0,0,0,0.65)',
  overlayStrong: 'rgba(8, 12, 10, 0.92)',
  overlayMedium: 'rgba(8, 12, 10, 0.55)',
  overlaySoft: 'rgba(8, 12, 10, 0.45)',
  authButton: 'rgba(18, 28, 23, 0.72)',
  cameraVintageOverlay: 'rgba(95, 57, 21, 0.34)',
  cameraFrame: 'rgba(244, 239, 230, 0.2)',
  cameraTimestamp: '#E8D4AF',
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
  hero: 36,
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
  authFormWidth: 440,
  authCanvasWidth: 920,
  authAsideWidth: 320,
  authWideBreakpoint: 760,
  screenPadding: 20,
  hitSlop: 12,
  controlHeight: 52,
  compactControlHeight: 44,
  buttonIconSize: 28,
  compactCopyWidth: 280,
  readableCopyWidth: 320,
  onboardingMaxWidth: 1040,
  onboardingWideBreakpoint: 700,
  sessionRingSize: 220,
  stampRingSize: 120,
};

export const motion = {
  fast: 180,
  normal: 280,
  slow: 420,
  reduced: 1,
  stagger: 64,
  enterDistance: 12,
  directionalDistance: 32,
  /** Soft onboarding chapter travel — small enough to feel continuous, not swipey. */
  chapterDistance: 18,
  /** Floor for chapter enter fades so interrupt/rapid taps never leave copy invisible. */
  chapterEnterOpacity: 0.55,
  /** Scene detail drift tied to chapter progress (parallax, not a hard slide). */
  chapterParallax: 10,
  pressScale: 0.985,
  emphasisScale: 0.96,
  pressOpacity: 0.82,
  spring: { damping: 22, stiffness: 190, mass: 0.72 },
  /** Slightly softer settle for chapter copy / scene continuity. */
  chapterSpring: { damping: 26, stiffness: 170, mass: 0.8 },
  easing: {
    in: [0.4, 0, 1, 1] as const,
    out: [0.22, 1, 0.36, 1] as const,
  },
};

export const gradients = {
  screen: [colors.bg, colors.bgDeep] as const,
  ambient: [colors.bgDeep, colors.bgMid, colors.bg, colors.bgDeep] as const,
  vignette: [
    colors.overlayStrong,
    colors.overlaySoft,
    colors.overlayMedium,
    colors.overlayStrong,
  ] as const,
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
