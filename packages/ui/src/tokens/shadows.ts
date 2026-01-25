/**
 * Iron Frontier Shadow System
 *
 * Warm-toned shadows for depth and elevation.
 */

export const shadows = {
  /** No shadow */
  none: 'none',
  /** Subtle shadow for cards at rest */
  xs: '0 1px 2px 0 rgba(47, 42, 36, 0.05)',
  /** Default elevation */
  sm: '0 1px 3px 0 rgba(47, 42, 36, 0.1), 0 1px 2px -1px rgba(47, 42, 36, 0.1)',
  /** Medium elevation for dropdowns */
  md: '0 4px 6px -1px rgba(47, 42, 36, 0.1), 0 2px 4px -2px rgba(47, 42, 36, 0.1)',
  /** Higher elevation for modals */
  lg: '0 10px 15px -3px rgba(47, 42, 36, 0.1), 0 4px 6px -4px rgba(47, 42, 36, 0.1)',
  /** Maximum elevation for popovers */
  xl: '0 20px 25px -5px rgba(47, 42, 36, 0.1), 0 8px 10px -6px rgba(47, 42, 36, 0.1)',
  /** Extra large for important overlays */
  '2xl': '0 25px 50px -12px rgba(47, 42, 36, 0.25)',
  /** Inset shadow for inputs */
  inner: 'inset 0 2px 4px 0 rgba(47, 42, 36, 0.05)',
} as const;

/**
 * Component-specific shadow mappings
 */
export const componentShadows = {
  card: shadows.sm,
  cardHover: shadows.md,
  button: shadows.xs,
  buttonActive: shadows.inner,
  input: shadows.inner,
  inputFocus: shadows.sm,
  dropdown: shadows.lg,
  modal: shadows.xl,
  tooltip: shadows.md,
} as const;

export type ShadowToken = keyof typeof shadows;
