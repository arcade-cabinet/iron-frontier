/**
 * Item Generation Pools - Default materials, qualities, styles, and name pools
 */

import type { MaterialPool, QualityPool, StylePool } from './schemas.ts';

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
// WEAPON NAME POOLS
// ============================================================================

export const WEAPON_PREFIXES: Record<string, string[]> = {
  revolver: [
    'Peacemaker',
    'Six-Shooter',
    'Colt',
    'Remington',
    'Schofield',
    'Navy',
    'Army',
    'Frontier',
    "Gunslinger's",
  ],
  rifle: [
    'Repeater',
    'Carbine',
    'Sharps',
    'Winchester',
    'Henry',
    'Lever-Action',
    'Bolt-Action',
    'Buffalo',
    "Scout's",
  ],
  shotgun: [
    'Scattergun',
    'Coach Gun',
    'Double-Barrel',
    'Pump-Action',
    'Buckshot',
    'Sawed-Off',
    'Fowling',
  ],
  knife: ['Bowie', 'Hunting', 'Skinning', 'Fighting', 'Frontier', 'Camp', "Trapper's", "Ranger's"],
  explosive: ['Dynamite', 'Blasting', 'Mining', 'Demolition'],
  melee: ['Hatchet', 'Tomahawk', 'Club', 'Pickaxe', 'Shovel', 'Crowbar', 'Hammer'],
};

export const WEAPON_SUFFIXES: string[] = [
  '', // No suffix
  'of the West',
  'of Justice',
  'of the Frontier',
  'Special',
  'Deluxe',
  'Custom',
  'Mark II',
  'Express',
];

// ============================================================================
// ARMOR NAME POOLS
// ============================================================================

export const ARMOR_PREFIXES: Record<string, string[]> = {
  head: ['Cowboy Hat', 'Stetson', 'Bandana', 'Cavalry Hat', 'Derby', "Miner's Helmet", 'Goggles'],
  body: ['Duster', 'Vest', 'Poncho', 'Jacket', 'Coat', 'Shirt', 'Overalls', 'Chaps'],
  legs: ['Trousers', 'Chaps', 'Dungarees', 'Riding Pants', 'Work Pants'],
  accessory: ['Belt', 'Holster', 'Bandolier', 'Gloves', 'Boots', 'Spurs', 'Watch', 'Charm'],
};

export const ARMOR_SUFFIXES: string[] = [
  '',
  'of Protection',
  'of the Trail',
  'of the Range',
  'Special',
  'Reinforced',
  'Padded',
];

// ============================================================================
// CONSUMABLE NAME POOLS
// ============================================================================

export const CONSUMABLE_PREFIXES: Record<string, string[]> = {
  healing: ["Dr. Thornton's", 'Snake Oil', 'Miracle', 'Patent', 'Frontier', 'Healing'],
  food: ['Trail', 'Camp', 'Frontier', 'Cowboy', 'Ranch', 'Homemade'],
  drink: ['Strong', 'Smooth', 'Aged', 'Local', 'Imported', 'Frontier'],
  buff: ['Invigorating', 'Fortifying', 'Energizing', 'Stimulating', 'Potent'],
};

export const CONSUMABLE_SUFFIXES: string[] = [
  'Tonic',
  'Elixir',
  'Remedy',
  'Medicine',
  'Potion',
  'Brew',
  'Concoction',
];
