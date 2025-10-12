import { useEffect, useState } from 'react';

interface AccessibilityPreferences {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
}

function getMatchMediaValue(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

export function useAccessibilityPreferences(): AccessibilityPreferences {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    getMatchMediaValue('(prefers-reduced-motion: reduce)')
  );
  const [prefersHighContrast, setPrefersHighContrast] = useState<boolean>(() =>
    getMatchMediaValue('(prefers-contrast: more)')
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const root = document.documentElement;

    const updateMotionPreference = (event: MediaQueryListEvent | MediaQueryList) => {
      const reduced = event.matches;
      setPrefersReducedMotion(reduced);
      root.setAttribute('data-motion', reduced ? 'reduced' : 'normal');
    };

    const updateContrastPreference = (event: MediaQueryListEvent | MediaQueryList) => {
      const highContrast = event.matches;
      setPrefersHighContrast(highContrast);
      root.setAttribute('data-contrast', highContrast ? 'high' : 'standard');
    };

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    updateMotionPreference(motionQuery);
    updateContrastPreference(contrastQuery);

    const handleMotionChange = (event: MediaQueryListEvent) => updateMotionPreference(event);
    const handleContrastChange = (event: MediaQueryListEvent) => updateContrastPreference(event);

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      root.removeAttribute('data-motion');
      root.removeAttribute('data-contrast');
    };
  }, []);

  return {
    prefersReducedMotion,
    prefersHighContrast,
  };
}
