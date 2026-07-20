import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion() {
  // Settle content immediately until the platform preference is known.
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
      const updatePreference = (event: { matches: boolean }) => {
        if (mounted) setReduceMotion(event.matches);
      };

      updatePreference(mediaQuery);
      mediaQuery.addEventListener('change', updatePreference);

      return () => {
        mounted = false;
        mediaQuery.removeEventListener('change', updatePreference);
      };
    }

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
