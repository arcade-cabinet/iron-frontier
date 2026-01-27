import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Hook that returns true when the viewport width is below the mobile breakpoint
 * Works in browser environments with matchMedia support
 *
 * @returns boolean indicating if the current viewport is mobile-sized
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Guard for SSR - return false during server-side rendering
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    // Guard for SSR/non-browser environments
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

/**
 * The mobile breakpoint value in pixels
 */
export const MOBILE_BREAKPOINT_PX = MOBILE_BREAKPOINT;
