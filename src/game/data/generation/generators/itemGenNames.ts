/**
 * Item Generator - Name generation prefixes and suffixes
 */

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

