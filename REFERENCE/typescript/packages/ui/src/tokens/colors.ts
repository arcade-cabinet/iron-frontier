/**
 * Iron Frontier Color Palette
 *
 * Western/Steampunk theme colors inspired by rust, bronze, leather,
 * parchment, and the dusty frontier.
 */

export const colors = {
  // Primary - Rust/Bronze tones
  rust: {
    50: '#fdf5f3',
    100: '#fbe8e4',
    200: '#f9d5cc',
    300: '#f3b7a8',
    400: '#ea8d75',
    500: '#dd6849',
    600: '#c94f2e',
    700: '#a83f24',
    800: '#8b3721',
    900: '#733222',
    950: '#3e170d',
  },

  // Secondary - Bronze/Brass
  bronze: {
    50: '#fdf9ef',
    100: '#f9f0d8',
    200: '#f2deae',
    300: '#eac87c',
    400: '#e0ab4b',
    500: '#d59330',
    600: '#c67826',
    700: '#a55b21',
    800: '#864922',
    900: '#6d3d1f',
    950: '#3d1e0e',
  },

  // Tertiary - Aged leather
  leather: {
    50: '#f9f6f3',
    100: '#f0eae3',
    200: '#dfd3c6',
    300: '#ccb8a2',
    400: '#b6977c',
    500: '#a68062',
    600: '#997157',
    700: '#805c49',
    800: '#6a4d40',
    900: '#584136',
    950: '#2f211b',
  },

  // Neutral - Parchment/Paper
  parchment: {
    50: '#fdfbf7',
    100: '#f9f5ea',
    200: '#f2e9d4',
    300: '#e8d8b6',
    400: '#dbc492',
    500: '#cfaf71',
    600: '#be9657',
    700: '#9f7845',
    800: '#82633c',
    900: '#6b5234',
    950: '#3a2b1a',
  },

  // Accent - Desert sky/Steam
  sky: {
    50: '#f4f9fb',
    100: '#e4eff5',
    200: '#cee2ec',
    300: '#aacedd',
    400: '#80b3c8',
    500: '#6098b2',
    600: '#4c7d98',
    700: '#40677c',
    800: '#395667',
    900: '#334958',
    950: '#22303b',
  },

  // Semantic - Success (Desert sage)
  sage: {
    50: '#f5f9f4',
    100: '#e7f2e5',
    200: '#d0e4cc',
    300: '#aad0a3',
    400: '#7eb673',
    500: '#5a994d',
    600: '#467d3b',
    700: '#386331',
    800: '#30502b',
    900: '#294225',
    950: '#132411',
  },

  // Semantic - Warning (Sunset amber)
  amber: {
    50: '#fefbec',
    100: '#fdf3c9',
    200: '#fae58e',
    300: '#f7d254',
    400: '#f4be28',
    500: '#e4a00f',
    600: '#ca7b0a',
    700: '#a8570c',
    800: '#894410',
    900: '#713810',
    950: '#421c04',
  },

  // Semantic - Danger (Blood/Crimson)
  crimson: {
    50: '#fef2f3',
    100: '#fee2e4',
    200: '#ffc9cd',
    300: '#fda4aa',
    400: '#fa6f79',
    500: '#f14250',
    600: '#de2436',
    700: '#ba1a2a',
    800: '#9a1927',
    900: '#801a26',
    950: '#460910',
  },

  // Neutral grays with warm undertone
  sand: {
    50: '#faf9f7',
    100: '#f3f1ec',
    200: '#e6e2d8',
    300: '#d4cebd',
    400: '#bfb69e',
    500: '#aea186',
    600: '#9d8e73',
    700: '#847660',
    800: '#6c6152',
    900: '#595145',
    950: '#2f2a24',
  },

  // Deep blacks with warm tone
  obsidian: {
    50: '#f6f6f5',
    100: '#e7e6e4',
    200: '#d1d0cc',
    300: '#b1afaa',
    400: '#8a8780',
    500: '#6f6c65',
    600: '#5e5b55',
    700: '#4e4c47',
    800: '#43413d',
    900: '#3a3936',
    950: '#1f1e1c',
  },

  // Pure values
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

/**
 * Semantic color mappings for UI components
 */
export const semanticColors = {
  // Backgrounds
  background: {
    primary: colors.parchment[50],
    secondary: colors.parchment[100],
    tertiary: colors.parchment[200],
    inverse: colors.obsidian[950],
    card: colors.parchment[50],
    overlay: 'rgba(31, 30, 28, 0.8)',
  },

  // Foreground/Text
  foreground: {
    primary: colors.obsidian[950],
    secondary: colors.obsidian[700],
    tertiary: colors.obsidian[500],
    muted: colors.obsidian[400],
    inverse: colors.parchment[50],
    link: colors.bronze[600],
  },

  // Border colors
  border: {
    default: colors.leather[300],
    subtle: colors.parchment[300],
    strong: colors.leather[500],
    focus: colors.bronze[500],
  },

  // Component-specific
  button: {
    primary: {
      bg: colors.rust[600],
      bgHover: colors.rust[700],
      text: colors.white,
    },
    secondary: {
      bg: colors.bronze[500],
      bgHover: colors.bronze[600],
      text: colors.white,
    },
    danger: {
      bg: colors.crimson[600],
      bgHover: colors.crimson[700],
      text: colors.white,
    },
    ghost: {
      bg: colors.transparent,
      bgHover: colors.parchment[200],
      text: colors.obsidian[700],
    },
  },

  // Status colors
  status: {
    success: colors.sage[500],
    warning: colors.amber[500],
    error: colors.crimson[500],
    info: colors.sky[500],
  },
} as const;

export type ColorToken = keyof typeof colors;
export type SemanticColorToken = keyof typeof semanticColors;
