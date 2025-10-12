import { useState, useEffect } from 'react';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface ResponsiveLayout {
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
}

/**
 * Custom hook for responsive layout detection
 *
 * Breakpoints:
 * - mobile: < 768px
 * - tablet: 768px - 1023px
 * - desktop: 1024px - 1439px
 * - wide: >= 1440px
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const [layout, setLayout] = useState<ResponsiveLayout>(() => {
    if (typeof window === 'undefined') {
      return {
        screenSize: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWide: false,
        width: 1024,
        height: 768,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const screenSize: ScreenSize =
      width < 768 ? 'mobile'
      : width < 1024 ? 'tablet'
      : width < 1440 ? 'desktop'
      : 'wide';

    return {
      screenSize,
      isMobile: screenSize === 'mobile',
      isTablet: screenSize === 'tablet',
      isDesktop: screenSize === 'desktop',
      isWide: screenSize === 'wide',
      width,
      height,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const screenSize: ScreenSize =
        width < 768 ? 'mobile'
        : width < 1024 ? 'tablet'
        : width < 1440 ? 'desktop'
        : 'wide';

      setLayout({
        screenSize,
        isMobile: screenSize === 'mobile',
        isTablet: screenSize === 'tablet',
        isDesktop: screenSize === 'desktop',
        isWide: screenSize === 'wide',
        width,
        height,
      });
    };

    // Debounce resize event for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);

    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return layout;
}
