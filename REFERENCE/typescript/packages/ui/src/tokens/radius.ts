/**
 * Iron Frontier Border Radius Scale
 *
 * Slightly rounded corners with a rustic feel.
 * Nothing too sharp, nothing too soft.
 */

export const radius = {
  /** 0px - sharp corners */
  none: 0,
  /** 2px - subtle rounding */
  sm: 2,
  /** 4px - default rounding */
  default: 4,
  /** 6px - medium rounding */
  md: 6,
  /** 8px - larger rounding */
  lg: 8,
  /** 12px - extra large */
  xl: 12,
  /** 16px - 2x large */
  '2xl': 16,
  /** 24px - 3x large */
  '3xl': 24,
  /** 9999px - pill/full round */
  full: 9999,
} as const;

/**
 * Component-specific radius values
 */
export const componentRadius = {
  /** Button border radius */
  button: radius.md,
  /** Card border radius */
  card: radius.lg,
  /** Input border radius */
  input: radius.md,
  /** Badge/tag border radius */
  badge: radius.full,
  /** Modal/sheet border radius */
  modal: radius.xl,
  /** Avatar border radius */
  avatar: radius.full,
  /** Tooltip border radius */
  tooltip: radius.md,
} as const;

export type RadiusToken = keyof typeof radius;
