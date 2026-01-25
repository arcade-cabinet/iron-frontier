/**
 * Iron Frontier Animation System
 *
 * Timing functions and durations for consistent motion.
 */

/**
 * Duration values in milliseconds
 */
export const durations = {
  /** 75ms - instant feedback */
  instant: 75,
  /** 100ms - quick response */
  fast: 100,
  /** 150ms - default transitions */
  normal: 150,
  /** 200ms - deliberate motion */
  moderate: 200,
  /** 300ms - slow, noticeable */
  slow: 300,
  /** 500ms - very slow, dramatic */
  slower: 500,
} as const;

/**
 * Easing functions
 */
export const easings = {
  /** Linear - no acceleration */
  linear: 'linear',
  /** Ease in - slow start */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Ease out - slow end */
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Ease in-out - slow start and end */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Spring-like bounce */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Sharp/snappy */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

/**
 * Pre-composed transition strings
 */
export const transitions = {
  /** Fast color/opacity changes */
  colors: `color ${durations.fast}ms ${easings.easeOut}, background-color ${durations.fast}ms ${easings.easeOut}, border-color ${durations.fast}ms ${easings.easeOut}`,
  /** Default property transition */
  default: `all ${durations.normal}ms ${easings.easeInOut}`,
  /** Transform transitions (scale, rotate, translate) */
  transform: `transform ${durations.normal}ms ${easings.easeOut}`,
  /** Opacity transitions */
  opacity: `opacity ${durations.normal}ms ${easings.easeOut}`,
  /** Shadow transitions */
  shadow: `box-shadow ${durations.normal}ms ${easings.easeOut}`,
  /** Modal/sheet enter */
  enter: `all ${durations.moderate}ms ${easings.easeOut}`,
  /** Modal/sheet exit */
  exit: `all ${durations.fast}ms ${easings.easeIn}`,
} as const;

export type DurationToken = keyof typeof durations;
export type EasingToken = keyof typeof easings;
