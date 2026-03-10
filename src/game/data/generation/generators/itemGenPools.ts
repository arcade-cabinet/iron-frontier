/**
 * Item Generator - Pool interfaces and default data pools
 */

import type { ItemRarity } from '../../schemas/item';

// ============================================================================
// ITEM POOLS
// ============================================================================

/**
 * Material pool - defines materials for item generation
 */
export interface MaterialPool {
  id: string;
  name: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Stat multiplier (affects damage, defense, etc.) */
  statMultiplier: number;
  /** Minimum rarity for this material */
  minRarity: ItemRarity;
  /** Tags for filtering (e.g., 'metal', 'organic', 'precious') */
  tags: string[];
}

/**
 * Quality pool - defines quality tiers
 */
export interface QualityPool {
  id: string;
  name: string;
  /** Adjective used in names */
  adjective: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Stat multiplier */
  statMultiplier: number;
  /** Associated rarity */
  rarity: ItemRarity;
  /** Weight for random selection */
  weight: number;
}

/**
 * Style pool - defines item styles/aesthetics
 */
export interface StylePool {
  id: string;
  name: string;
  /** Description modifier */
  descriptionSuffix: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Tags */
  tags: string[];
}

// ============================================================================
// DEFAULT POOLS
// ============================================================================

export const DEFAULT_MATERIALS: MaterialPool[] = [
  {
    id: 'iron',
    name: 'Iron',
    valueMultiplier: 1.0,
    statMultiplier: 1.0,
    minRarity: 'common',
    tags: ['metal', 'basic'],
  },
  {
    id: 'steel',
    name: 'Steel',
    valueMultiplier: 1.5,
    statMultiplier: 1.2,
    minRarity: 'common',
    tags: ['metal', 'refined'],
  },
  {
    id: 'brass',
    name: 'Brass',
    valueMultiplier: 1.3,
    statMultiplier: 1.1,
    minRarity: 'uncommon',
    tags: ['metal', 'steampunk'],
  },
  {
    id: 'silver',
    name: 'Silver',
    valueMultiplier: 2.5,
    statMultiplier: 1.3,
    minRarity: 'rare',
    tags: ['metal', 'precious'],
  },
  {
    id: 'gold',
    name: 'Gold',
    valueMultiplier: 5.0,
    statMultiplier: 1.0,
    minRarity: 'rare',
    tags: ['metal', 'precious', 'decorative'],
  },
  {
    id: 'leather',
    name: 'Leather',
    valueMultiplier: 0.8,
    statMultiplier: 0.9,
    minRarity: 'common',
    tags: ['organic', 'flexible'],
  },
  {
    id: 'cloth',
    name: 'Cloth',
    valueMultiplier: 0.5,
    statMultiplier: 0.7,
    minRarity: 'common',
    tags: ['organic', 'light'],
  },
  {
    id: 'reinforced_leather',
    name: 'Reinforced Leather',
    valueMultiplier: 1.4,
    statMultiplier: 1.1,
    minRarity: 'uncommon',
    tags: ['organic', 'reinforced'],
  },
  {
    id: 'damascus_steel',
    name: 'Damascus Steel',
    valueMultiplier: 3.0,
    statMultiplier: 1.5,
    minRarity: 'rare',
    tags: ['metal', 'premium', 'exotic'],
  },
  {
    id: 'clockwork_alloy',
    name: 'Clockwork Alloy',
    valueMultiplier: 4.0,
    statMultiplier: 1.4,
    minRarity: 'legendary',
    tags: ['metal', 'steampunk', 'exotic'],
  },
];

export const DEFAULT_QUALITIES: QualityPool[] = [
  {
    id: 'rusty',
    name: 'Rusty',
    adjective: 'Rusty',
    valueMultiplier: 0.5,
    statMultiplier: 0.7,
    rarity: 'common',
    weight: 15,
  },
  {
    id: 'worn',
    name: 'Worn',
    adjective: 'Worn',
    valueMultiplier: 0.7,
    statMultiplier: 0.85,
    rarity: 'common',
    weight: 25,
  },
  {
    id: 'standard',
    name: 'Standard',
    adjective: '',
    valueMultiplier: 1.0,
    statMultiplier: 1.0,
    rarity: 'common',
    weight: 35,
  },
  {
    id: 'fine',
    name: 'Fine',
    adjective: 'Fine',
    valueMultiplier: 1.5,
    statMultiplier: 1.15,
    rarity: 'uncommon',
    weight: 18,
  },
  {
    id: 'masterwork',
    name: 'Masterwork',
    adjective: 'Masterwork',
    valueMultiplier: 2.5,
    statMultiplier: 1.3,
    rarity: 'rare',
    weight: 6,
  },
  {
    id: 'legendary',
    name: 'Legendary',
    adjective: 'Legendary',
    valueMultiplier: 5.0,
    statMultiplier: 1.5,
    rarity: 'legendary',
    weight: 1,
  },
];

export const DEFAULT_STYLES: StylePool[] = [
  {
    id: 'frontier',
    name: 'Frontier',
    descriptionSuffix: 'Made for the harsh frontier life.',
    valueMultiplier: 1.0,
    tags: ['western', 'practical'],
  },
  {
    id: 'military',
    name: 'Military',
    descriptionSuffix: 'Standard military issue.',
    valueMultiplier: 1.2,
    tags: ['military', 'regulation'],
  },
  {
    id: 'ornate',
    name: 'Ornate',
    descriptionSuffix: 'Decorated with intricate engravings.',
    valueMultiplier: 1.8,
    tags: ['decorative', 'fancy'],
  },
  {
    id: 'rugged',
    name: 'Rugged',
    descriptionSuffix: 'Built to last in the toughest conditions.',
    valueMultiplier: 1.1,
    tags: ['durable', 'practical'],
  },
  {
    id: 'elegant',
    name: 'Elegant',
    descriptionSuffix: 'A refined piece of craftsmanship.',
    valueMultiplier: 2.0,
    tags: ['fancy', 'sophisticated'],
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    descriptionSuffix: 'Enhanced with brass gears and steam mechanisms.',
    valueMultiplier: 2.5,
    tags: ['steampunk', 'mechanical'],
  },
];

// ============================================================================
