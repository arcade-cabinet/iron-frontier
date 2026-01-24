/**
 * World Map Styling - Tailwind CSS v4 Utilities
 *
 * Visual styling for Iron Frontier's steampunk western world map.
 * Designed to evoke an aged paper map from the Old West era.
 */

import type { RegionBiome, LocationType, TravelMethod } from '@/data/schemas/world';

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Map color palette - Old West aged paper aesthetic
 * Colors chosen to complement the game's amber/stone dark theme
 */
export const mapColors = {
  // Paper tones
  paper: '#f5e6c8',
  paperLight: '#faf3e3',
  paperDark: '#d4c4a8',
  paperStain: '#c9b896',

  // Ink tones
  ink: '#2a1810',
  inkFaded: '#5a4838',
  inkLight: '#8a7868',

  // Region biome colors (muted, map-like)
  desert: '#d4a574',
  desertDark: '#b88a5a',
  grassland: '#8b9a6b',
  grasslandDark: '#6b7a4b',
  badlands: '#a85a3b',
  badlandsDark: '#883a2b',
  mountain: '#6b7c8a',
  mountainDark: '#4b5c6a',
  scrubland: '#8a8a5a',
  scrublandDark: '#6a6a3a',
  riverside: '#6b8a9a',
  riversideDark: '#4b6a7a',
  saltFlat: '#c4b8a0',
  saltFlatDark: '#a49880',

  // Location marker colors
  town: '#8b4513',
  townGlow: '#cd853f',
  mine: '#4a4a4a',
  mineGlow: '#708090',
  ranch: '#228b22',
  ranchGlow: '#32cd32',
  waystation: '#b8860b',
  waystationGlow: '#daa520',
  hideout: '#8b0000',
  hideoutGlow: '#dc143c',
  ruins: '#696969',
  ruinsGlow: '#a9a9a9',
  wilderness: '#556b2f',
  wildernessGlow: '#6b8e23',
  trainStation: '#2f4f4f',
  trainStationGlow: '#5f9ea0',
  farm: '#8fbc8f',
  farmGlow: '#98fb98',
  landmark: '#daa520',
  landmarkGlow: '#ffd700',

  // UI state colors
  discovered: 'rgba(255, 255, 255, 0.95)',
  undiscovered: 'rgba(60, 40, 30, 0.7)',
  selected: '#f59e0b',
  selectedGlow: 'rgba(245, 158, 11, 0.4)',
  hover: 'rgba(217, 119, 6, 0.3)',
  current: '#22c55e',
  currentGlow: 'rgba(34, 197, 94, 0.4)',

  // Path colors
  road: '#5a4838',
  trail: '#7a6848',
  railroad: '#2a1810',
  railroadTies: '#8b4513',
  river: '#4682b4',
} as const;

// ============================================================================
// CSS CUSTOM PROPERTIES (for use in index.css if needed)
// ============================================================================

/**
 * CSS custom properties for map theming
 * Can be added to :root or a .map-container class
 */
export const mapCssVars = `
  --map-paper: ${mapColors.paper};
  --map-paper-light: ${mapColors.paperLight};
  --map-paper-dark: ${mapColors.paperDark};
  --map-paper-stain: ${mapColors.paperStain};
  --map-ink: ${mapColors.ink};
  --map-ink-faded: ${mapColors.inkFaded};
  --map-ink-light: ${mapColors.inkLight};
`;

// ============================================================================
// MAP CONTAINER STYLES
// ============================================================================

/**
 * Base map container - aged paper background with texture effect
 */
export const mapContainer = {
  base: [
    'relative',
    'overflow-hidden',
    'rounded-lg',
    // Aged paper background
    'bg-[#f5e6c8]',
    // Border like old map edges
    'border-4',
    'border-[#8b7355]',
    // Shadow for depth
    'shadow-xl',
    'shadow-amber-950/30',
  ].join(' '),

  /**
   * Aged paper texture overlay (apply as ::before pseudo-element)
   * Uses CSS gradients to simulate paper grain and staining
   */
  textureOverlay: [
    'before:absolute',
    'before:inset-0',
    'before:pointer-events-none',
    'before:z-10',
    // Noise-like texture using radial gradients
    'before:bg-[radial-gradient(circle_at_20%_30%,rgba(139,115,85,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(139,115,85,0.06)_0%,transparent_40%),radial-gradient(circle_at_50%_50%,rgba(201,184,150,0.1)_0%,transparent_60%)]',
    'before:mix-blend-multiply',
  ].join(' '),

  /**
   * Vignette effect for worn edges
   */
  vignette: [
    'after:absolute',
    'after:inset-0',
    'after:pointer-events-none',
    'after:z-20',
    'after:bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(139,115,85,0.15)_100%)]',
  ].join(' '),

  /**
   * Full container with all effects
   */
  full: [
    'relative',
    'overflow-hidden',
    'rounded-lg',
    'bg-[#f5e6c8]',
    'border-4',
    'border-[#8b7355]',
    'shadow-xl',
    'shadow-amber-950/30',
    // Texture
    'before:absolute',
    'before:inset-0',
    'before:pointer-events-none',
    'before:z-10',
    'before:bg-[radial-gradient(circle_at_20%_30%,rgba(139,115,85,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(139,115,85,0.06)_0%,transparent_40%)]',
    'before:mix-blend-multiply',
    // Vignette
    'after:absolute',
    'after:inset-0',
    'after:pointer-events-none',
    'after:z-20',
    'after:bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(139,115,85,0.15)_100%)]',
  ].join(' '),
};

/**
 * Map border decoration - western style ornate border
 */
export const mapBorder = {
  outer: [
    'absolute',
    'inset-0',
    'border-8',
    'border-double',
    'border-[#5a4838]',
    'rounded-lg',
    'pointer-events-none',
    'z-30',
  ].join(' '),

  inner: [
    'absolute',
    'inset-3',
    'border',
    'border-[#8b7355]/50',
    'rounded',
    'pointer-events-none',
    'z-30',
  ].join(' '),

  corner: [
    'absolute',
    'w-6',
    'h-6',
    'border-2',
    'border-[#5a4838]',
    'z-30',
  ].join(' '),
};

// ============================================================================
// REGION STYLES
// ============================================================================

/**
 * Get Tailwind classes for region background by biome type
 */
export function getRegionStyles(biome: RegionBiome): string {
  const styles: Record<RegionBiome, string> = {
    desert: 'bg-[#d4a574]/60',
    badlands: 'bg-[#a85a3b]/50',
    grassland: 'bg-[#8b9a6b]/50',
    scrubland: 'bg-[#8a8a5a]/50',
    mountain: 'bg-[#6b7c8a]/50',
    riverside: 'bg-[#6b8a9a]/40',
    salt_flat: 'bg-[#c4b8a0]/40',
  };
  return styles[biome] || 'bg-[#c9b896]/40';
}

/**
 * Region label styling
 */
export const regionLabel = {
  base: [
    'font-serif',
    'italic',
    'text-[#5a4838]',
    'tracking-wide',
    'select-none',
    'pointer-events-none',
  ].join(' '),

  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
};

// ============================================================================
// LOCATION MARKER STYLES
// ============================================================================

/**
 * Location marker base styles
 */
export const locationMarker = {
  base: [
    'absolute',
    'flex',
    'items-center',
    'justify-center',
    'rounded-full',
    'cursor-pointer',
    'transition-all',
    'duration-200',
    'z-40',
    // Touch-friendly minimum size
    'min-w-[44px]',
    'min-h-[44px]',
  ].join(' '),

  // Size variants
  tiny: 'w-3 h-3',
  small: 'w-4 h-4',
  medium: 'w-5 h-5',
  large: 'w-6 h-6',
  huge: 'w-8 h-8',

  // Interactive states
  interactive: [
    'hover:scale-110',
    'hover:z-50',
    'active:scale-95',
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-amber-500',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[#f5e6c8]',
  ].join(' '),
};

/**
 * Get Tailwind classes for location marker by type
 */
export function getLocationMarkerStyles(
  type: LocationType,
  options?: {
    discovered?: boolean;
    selected?: boolean;
    current?: boolean;
  }
): string {
  const { discovered = true, selected = false, current = false } = options || {};

  // Type-specific colors
  const typeColors: Partial<Record<LocationType, { bg: string; border: string; glow: string }>> = {
    city: { bg: 'bg-[#8b4513]', border: 'border-[#cd853f]', glow: 'shadow-[#cd853f]/50' },
    town: { bg: 'bg-[#8b4513]', border: 'border-[#cd853f]', glow: 'shadow-[#cd853f]/50' },
    village: { bg: 'bg-[#a0522d]', border: 'border-[#d2691e]', glow: 'shadow-[#d2691e]/50' },
    hamlet: { bg: 'bg-[#a0522d]', border: 'border-[#d2691e]', glow: 'shadow-[#d2691e]/40' },
    outpost: { bg: 'bg-[#b8860b]', border: 'border-[#daa520]', glow: 'shadow-[#daa520]/50' },
    mine: { bg: 'bg-[#4a4a4a]', border: 'border-[#708090]', glow: 'shadow-[#708090]/50' },
    quarry: { bg: 'bg-[#5a5a5a]', border: 'border-[#808080]', glow: 'shadow-[#808080]/50' },
    oil_field: { bg: 'bg-[#2f2f2f]', border: 'border-[#505050]', glow: 'shadow-[#505050]/50' },
    lumber_camp: { bg: 'bg-[#654321]', border: 'border-[#8b6914]', glow: 'shadow-[#8b6914]/50' },
    ranch: { bg: 'bg-[#228b22]', border: 'border-[#32cd32]', glow: 'shadow-[#32cd32]/50' },
    farm: { bg: 'bg-[#8fbc8f]', border: 'border-[#98fb98]', glow: 'shadow-[#98fb98]/50' },
    train_station: { bg: 'bg-[#2f4f4f]', border: 'border-[#5f9ea0]', glow: 'shadow-[#5f9ea0]/50' },
    telegraph_office: { bg: 'bg-[#4a5568]', border: 'border-[#718096]', glow: 'shadow-[#718096]/50' },
    trading_post: { bg: 'bg-[#b8860b]', border: 'border-[#daa520]', glow: 'shadow-[#daa520]/50' },
    waystation: { bg: 'bg-[#b8860b]', border: 'border-[#daa520]', glow: 'shadow-[#daa520]/50' },
    ruins: { bg: 'bg-[#696969]', border: 'border-[#a9a9a9]', glow: 'shadow-[#a9a9a9]/50' },
    cave: { bg: 'bg-[#3d3d3d]', border: 'border-[#5d5d5d]', glow: 'shadow-[#5d5d5d]/50' },
    camp: { bg: 'bg-[#654321]', border: 'border-[#8b6914]', glow: 'shadow-[#8b6914]/40' },
    hideout: { bg: 'bg-[#8b0000]', border: 'border-[#dc143c]', glow: 'shadow-[#dc143c]/50' },
    landmark: { bg: 'bg-[#daa520]', border: 'border-[#ffd700]', glow: 'shadow-[#ffd700]/50' },
    wilderness: { bg: 'bg-[#556b2f]', border: 'border-[#6b8e23]', glow: 'shadow-[#6b8e23]/40' },
  };

  const colors = typeColors[type] || { bg: 'bg-[#8b7355]', border: 'border-[#a0926c]', glow: 'shadow-[#a0926c]/50' };

  const classes = [
    colors.bg,
    'border-2',
    colors.border,
    'shadow-md',
    colors.glow,
  ];

  // Discovery state
  if (!discovered) {
    classes.push('opacity-40', 'grayscale', 'border-dashed');
  }

  // Current location
  if (current) {
    classes.push(
      '!bg-green-600',
      '!border-green-400',
      'ring-4',
      'ring-green-400/40',
      'animate-pulse'
    );
  }

  // Selected state
  if (selected && !current) {
    classes.push(
      'ring-4',
      'ring-amber-500/50',
      'scale-110'
    );
  }

  return classes.join(' ');
}

/**
 * Location label styling
 */
export const locationLabel = {
  base: [
    'absolute',
    'whitespace-nowrap',
    'text-[10px]',
    'font-medium',
    'text-[#2a1810]',
    'select-none',
    'pointer-events-none',
    'px-1',
    'py-0.5',
    'rounded',
    'bg-[#f5e6c8]/80',
    'backdrop-blur-sm',
  ].join(' '),

  // Position relative to marker
  below: 'top-full mt-1 left-1/2 -translate-x-1/2',
  above: 'bottom-full mb-1 left-1/2 -translate-x-1/2',
  right: 'left-full ml-1 top-1/2 -translate-y-1/2',
  left: 'right-full mr-1 top-1/2 -translate-y-1/2',

  // Discovered/undiscovered
  discovered: 'text-[#2a1810]',
  undiscovered: 'text-[#5a4838]/60 italic',
};

// ============================================================================
// CONNECTION / PATH STYLES
// ============================================================================

/**
 * Get SVG stroke styles for connection paths
 */
export function getConnectionStyles(
  method: TravelMethod,
  options?: {
    passable?: boolean;
    danger?: 'safe' | 'low' | 'moderate' | 'high' | 'extreme';
  }
): {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  strokeLinecap: 'round' | 'butt' | 'square';
  opacity: number;
} {
  const { passable = true, danger = 'moderate' } = options || {};

  const baseOpacity = passable ? 1 : 0.4;

  // Danger-based color intensity
  const dangerOpacity: Record<string, number> = {
    safe: 1,
    low: 0.9,
    moderate: 0.8,
    high: 0.7,
    extreme: 0.6,
  };

  const opacity = baseOpacity * (dangerOpacity[danger] || 0.8);

  switch (method) {
    case 'road':
      return {
        stroke: mapColors.road,
        strokeWidth: 3,
        strokeLinecap: 'round',
        opacity,
      };

    case 'trail':
      return {
        stroke: mapColors.trail,
        strokeWidth: 2,
        strokeDasharray: '8 4',
        strokeLinecap: 'round',
        opacity,
      };

    case 'railroad':
      return {
        stroke: mapColors.railroad,
        strokeWidth: 2,
        strokeDasharray: '1 4',
        strokeLinecap: 'butt',
        opacity,
      };

    case 'wilderness':
      return {
        stroke: mapColors.trail,
        strokeWidth: 1,
        strokeDasharray: '2 4',
        strokeLinecap: 'round',
        opacity: opacity * 0.6,
      };

    case 'river':
      return {
        stroke: mapColors.river,
        strokeWidth: 3,
        strokeLinecap: 'round',
        opacity,
      };

    default:
      return {
        stroke: mapColors.inkFaded,
        strokeWidth: 1,
        strokeDasharray: '4 4',
        strokeLinecap: 'round',
        opacity: 0.5,
      };
  }
}

/**
 * Tailwind classes for path container
 */
export const pathStyles = {
  container: [
    'absolute',
    'inset-0',
    'pointer-events-none',
    'z-30',
  ].join(' '),

  // For SVG element
  svg: [
    'w-full',
    'h-full',
  ].join(' '),
};

// ============================================================================
// DISCOVERY STATE STYLES
// ============================================================================

/**
 * Fog of war overlay for undiscovered regions
 */
export const fogOfWar = {
  base: [
    'absolute',
    'inset-0',
    'pointer-events-none',
    'z-50',
  ].join(' '),

  // Gradient from edges
  overlay: 'bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(60,40,30,0.8)_80%)]',

  // Solid undiscovered
  solid: 'bg-[#3c281e]/70',

  // Partial discovery (edges visible)
  partial: 'bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(60,40,30,0.6)_100%)]',
};

// ============================================================================
// TOOLTIP STYLES
// ============================================================================

/**
 * Map tooltip styling - parchment style
 */
export const mapTooltip = {
  container: [
    'absolute',
    'z-[100]',
    'min-w-[150px]',
    'max-w-[250px]',
    'p-3',
    // Parchment background
    'bg-[#f5e6c8]',
    'border-2',
    'border-[#8b7355]',
    'rounded-lg',
    'shadow-xl',
    'shadow-amber-950/30',
    // Animation
    'animate-in',
    'fade-in-0',
    'zoom-in-95',
    'duration-200',
  ].join(' '),

  header: [
    'font-bold',
    'text-[#2a1810]',
    'text-sm',
    'border-b',
    'border-[#8b7355]/30',
    'pb-1',
    'mb-2',
  ].join(' '),

  type: [
    'text-[10px]',
    'uppercase',
    'tracking-wider',
    'text-[#5a4838]',
    'font-medium',
  ].join(' '),

  description: [
    'text-xs',
    'text-[#5a4838]',
    'leading-relaxed',
  ].join(' '),

  stats: [
    'mt-2',
    'pt-2',
    'border-t',
    'border-[#8b7355]/30',
    'grid',
    'grid-cols-2',
    'gap-1',
    'text-[10px]',
    'text-[#5a4838]',
  ].join(' '),

  statLabel: 'font-medium',
  statValue: 'text-[#2a1810]',

  // Arrow pointer
  arrow: [
    'absolute',
    'w-3',
    'h-3',
    'bg-[#f5e6c8]',
    'border-l-2',
    'border-b-2',
    'border-[#8b7355]',
    'rotate-45',
  ].join(' '),

  arrowTop: '-top-1.5 left-1/2 -translate-x-1/2 -rotate-[135deg]',
  arrowBottom: '-bottom-1.5 left-1/2 -translate-x-1/2 rotate-45',
  arrowLeft: '-left-1.5 top-1/2 -translate-y-1/2 rotate-[135deg]',
  arrowRight: '-right-1.5 top-1/2 -translate-y-1/2 -rotate-45',
};

// ============================================================================
// COMPASS ROSE STYLES
// ============================================================================

/**
 * Decorative compass rose for map corner
 */
export const compassRose = {
  container: [
    'absolute',
    'w-16',
    'h-16',
    'pointer-events-none',
    'z-40',
    'opacity-60',
  ].join(' '),

  // Positioning
  topLeft: 'top-4 left-4',
  topRight: 'top-4 right-4',
  bottomLeft: 'bottom-4 left-4',
  bottomRight: 'bottom-4 right-4',

  // Inner styling
  inner: [
    'w-full',
    'h-full',
    'text-[#5a4838]',
  ].join(' '),
};

// ============================================================================
// LEGEND STYLES
// ============================================================================

/**
 * Map legend styling
 */
export const mapLegend = {
  container: [
    'absolute',
    'bottom-4',
    'right-4',
    'bg-[#f5e6c8]/95',
    'backdrop-blur-sm',
    'border-2',
    'border-[#8b7355]',
    'rounded-lg',
    'p-3',
    'z-50',
    'max-w-[200px]',
  ].join(' '),

  title: [
    'text-xs',
    'font-bold',
    'text-[#2a1810]',
    'uppercase',
    'tracking-wider',
    'mb-2',
    'pb-1',
    'border-b',
    'border-[#8b7355]/30',
  ].join(' '),

  item: [
    'flex',
    'items-center',
    'gap-2',
    'text-[10px]',
    'text-[#5a4838]',
    'py-0.5',
  ].join(' '),

  icon: [
    'w-3',
    'h-3',
    'rounded-full',
    'border',
    'flex-shrink-0',
  ].join(' '),

  line: [
    'w-6',
    'h-0.5',
    'flex-shrink-0',
  ].join(' '),
};

// ============================================================================
// SCALE BAR STYLES
// ============================================================================

/**
 * Map scale bar styling
 */
export const scaleBar = {
  container: [
    'absolute',
    'bottom-4',
    'left-4',
    'flex',
    'flex-col',
    'items-start',
    'gap-1',
    'z-50',
  ].join(' '),

  bar: [
    'h-1',
    'bg-[#2a1810]',
    'border',
    'border-[#5a4838]',
  ].join(' '),

  labels: [
    'flex',
    'justify-between',
    'w-full',
    'text-[8px]',
    'text-[#5a4838]',
    'font-mono',
  ].join(' '),

  unit: [
    'text-[8px]',
    'text-[#5a4838]/70',
    'italic',
  ].join(' '),
};

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

/**
 * Responsive map container sizes
 */
export const mapResponsive = {
  // Minimum readable marker size
  markerMinSize: 'min-w-[32px] min-h-[32px] sm:min-w-[24px] sm:min-h-[24px]',

  // Container sizing
  fullscreen: 'w-full h-full',
  contained: 'w-full max-w-4xl mx-auto aspect-[4/3]',
  square: 'w-full max-w-2xl mx-auto aspect-square',

  // Font scaling
  labels: 'text-[8px] sm:text-[10px] md:text-xs',

  // Padding adjustments
  padding: 'p-2 sm:p-4 md:p-6',
};

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Map animation classes
 */
export const mapAnimations = {
  // Location pulse for current position
  pulse: 'animate-pulse',

  // Hover scale
  hoverScale: 'transition-transform duration-200 hover:scale-110',

  // Fade in for newly discovered locations
  fadeIn: 'animate-in fade-in-0 duration-500',

  // Slide in for tooltips
  slideIn: 'animate-in slide-in-from-bottom-2 duration-200',

  // Path drawing animation (for SVG)
  drawPath: 'animate-[draw_1s_ease-in-out_forwards]',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combine multiple style strings
 */
export function combineStyles(...styles: (string | undefined | false)[]): string {
  return styles.filter(Boolean).join(' ');
}

/**
 * Get complete marker classes based on state
 */
export function getMarkerClasses(
  type: LocationType,
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' = 'medium',
  options?: {
    discovered?: boolean;
    selected?: boolean;
    current?: boolean;
    interactive?: boolean;
  }
): string {
  const { interactive = true, ...stateOptions } = options || {};

  return combineStyles(
    locationMarker.base,
    locationMarker[size],
    getLocationMarkerStyles(type, stateOptions),
    interactive && locationMarker.interactive
  );
}
