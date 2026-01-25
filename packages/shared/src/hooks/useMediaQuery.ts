import * as React from 'react';

/**
 * Hook that returns true if the given media query matches
 * Works in browser environments with matchMedia support
 *
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    // Guard for SSR/non-browser environments
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = window.matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => result.removeEventListener('change', onChange);
  }, [query]);

  return value;
}
