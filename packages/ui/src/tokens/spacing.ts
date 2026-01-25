/**
 * Iron Frontier Spacing Scale
 *
 * A consistent spacing system based on 4px base unit.
 * Used for margins, padding, gaps, and layout dimensions.
 */

export const spacing = {
  /** 0px */
  0: 0,
  /** 1px */
  px: 1,
  /** 2px - micro spacing */
  0.5: 2,
  /** 4px - tight spacing */
  1: 4,
  /** 6px */
  1.5: 6,
  /** 8px - base spacing */
  2: 8,
  /** 10px */
  2.5: 10,
  /** 12px */
  3: 12,
  /** 14px */
  3.5: 14,
  /** 16px - standard */
  4: 16,
  /** 20px */
  5: 20,
  /** 24px */
  6: 24,
  /** 28px */
  7: 28,
  /** 32px */
  8: 32,
  /** 36px */
  9: 36,
  /** 40px */
  10: 40,
  /** 44px */
  11: 44,
  /** 48px */
  12: 48,
  /** 56px */
  14: 56,
  /** 64px */
  16: 64,
  /** 80px */
  20: 80,
  /** 96px */
  24: 96,
  /** 128px */
  32: 128,
  /** 160px */
  40: 160,
  /** 192px */
  48: 192,
  /** 224px */
  56: 224,
  /** 256px */
  64: 256,
  /** 320px */
  80: 320,
  /** 384px */
  96: 384,
} as const;

/**
 * Named spacing values for semantic use
 */
export const namedSpacing = {
  /** Component internal padding (12px) */
  componentPadding: spacing[3],
  /** Card padding (16px) */
  cardPadding: spacing[4],
  /** Section gap (24px) */
  sectionGap: spacing[6],
  /** Page margin (16px mobile, 24px tablet, 32px desktop) */
  pageMargin: {
    mobile: spacing[4],
    tablet: spacing[6],
    desktop: spacing[8],
  },
  /** Stack gap - small (8px) */
  stackGapSm: spacing[2],
  /** Stack gap - medium (12px) */
  stackGapMd: spacing[3],
  /** Stack gap - large (16px) */
  stackGapLg: spacing[4],
  /** Inline gap - small (4px) */
  inlineGapSm: spacing[1],
  /** Inline gap - medium (8px) */
  inlineGapMd: spacing[2],
  /** Inline gap - large (12px) */
  inlineGapLg: spacing[3],
} as const;

export type SpacingToken = keyof typeof spacing;
