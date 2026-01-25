/**
 * Iron Frontier - Crafting & Cooking System
 *
 * Complete crafting recipe database with 36 recipes across 5 categories:
 * - Ammunition (6 recipes)
 * - Medicine (8 recipes)
 * - Equipment Upgrades (6 recipes)
 * - Survival Items (6 recipes)
 * - Cooking (10 recipes)
 */

import type { CraftingRecipe, CraftingCategory } from '../schemas/crafting';

// ============================================================================
// AMMUNITION RECIPES (6)
// ============================================================================

export const AMMUNITION_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_standard_bullets',
    name: 'Standard Bullets',
    description:
      'Standard .45 caliber rounds for revolvers. Reliable ammunition for everyday use on the frontier.',
    category: 'ammunition',
    station: 'workbench',
    ingredients: [
      { itemId: 'scrap_metal', quantity: 2, consumed: true },
      { itemId: 'mechanical_parts', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'pistol_ammo', quantity: 12, chance: 1 }],
    craftingTime: 10,
    requiredSkill: 'gunsmith',
    skillLevel: 0,
    skillXpGain: 5,
    unlockedByDefault: true,
    tags: ['ammunition', 'pistol', 'basic'],
    icon: 'ammo_pistol',
    lore: 'The lifeblood of any gunslinger - a steady supply of ammunition.',
  },
  {
    id: 'craft_shotgun_shells',
    name: 'Shotgun Shells',
    description:
      'Buckshot shells packed with lead pellets. Devastating at close range.',
    category: 'ammunition',
    station: 'workbench',
    ingredients: [
      { itemId: 'scrap_metal', quantity: 3, consumed: true },
      { itemId: 'mechanical_parts', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'shotgun_ammo', quantity: 8, chance: 1 }],
    craftingTime: 12,
    requiredSkill: 'gunsmith',
    skillLevel: 10,
    skillXpGain: 8,
    unlockedByDefault: true,
    tags: ['ammunition', 'shotgun', 'basic'],
    icon: 'ammo_shotgun',
    lore: 'Load up and let loose - one shot, many projectiles.',
  },
  {
    id: 'craft_armor_piercing',
    name: 'Armor-Piercing Rounds',
    description:
      'Hardened steel-core bullets designed to penetrate armor and metal plating. Essential against automatons.',
    category: 'ammunition',
    station: 'workbench',
    ingredients: [
      { itemId: 'scrap_metal', quantity: 4, consumed: true },
      { itemId: 'mechanical_parts', quantity: 2, consumed: true },
      { itemId: 'automaton_plating', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'pistol_ammo', quantity: 6, chance: 1 }],
    craftingTime: 20,
    requiredSkill: 'gunsmith',
    skillLevel: 35,
    skillXpGain: 15,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'blacksmith_jonas',
      description: 'Learn from Jonas the Blacksmith after reaching Trusted reputation with the Free Miners',
    },
    tags: ['ammunition', 'pistol', 'advanced', 'armor_pierce'],
    icon: 'ammo_special',
    lore: 'When regular lead just bounces off, these steel-tipped rounds punch through.',
  },
  {
    id: 'craft_incendiary_rounds',
    name: 'Incendiary Rounds',
    description:
      'Phosphorus-tipped bullets that ignite on impact. Sets targets ablaze.',
    category: 'ammunition',
    station: 'workbench',
    ingredients: [
      { itemId: 'scrap_metal', quantity: 3, consumed: true },
      { itemId: 'oil_can', quantity: 2, consumed: true },
      { itemId: 'mechanical_parts', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'pistol_ammo', quantity: 6, chance: 1 }],
    craftingTime: 18,
    requiredSkill: 'gunsmith',
    skillLevel: 40,
    skillXpGain: 12,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'quest_complete',
      targetId: 'quest_fire_in_the_hole',
      description: 'Complete "Fire in the Hole" side quest',
    },
    tags: ['ammunition', 'pistol', 'advanced', 'fire'],
    icon: 'ammo_fire',
    lore: 'Forged in fire, delivering fire. Watch your targets dance.',
  },
  {
    id: 'craft_explosive_shells',
    name: 'Explosive Shells',
    description:
      'Shotgun shells packed with blasting powder. Creates a small explosion on impact.',
    category: 'ammunition',
    station: 'forge',
    ingredients: [
      { itemId: 'scrap_metal', quantity: 5, consumed: true },
      { itemId: 'dynamite', quantity: 1, consumed: true },
      { itemId: 'mechanical_parts', quantity: 2, consumed: true },
    ],
    outputs: [{ itemId: 'shotgun_ammo', quantity: 4, chance: 1 }],
    craftingTime: 25,
    requiredSkill: 'gunsmith',
    skillLevel: 50,
    skillXpGain: 20,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'clara_cogsworth',
      description: 'Learn from Clara Cogsworth after helping with her experiments',
    },
    tags: ['ammunition', 'shotgun', 'advanced', 'explosive'],
    icon: 'ammo_explosive',
    lore: 'Handle with extreme care. The brass casing can barely contain the fury within.',
  },
  {
    id: 'craft_silver_bullets',
    name: 'Silver Bullets',
    description:
      'Blessed silver ammunition effective against supernatural threats. The silver is melted from old church artifacts.',
    category: 'ammunition',
    station: 'forge',
    ingredients: [
      { itemId: 'scrap_metal', quantity: 2, consumed: true },
      { itemId: 'gold_nugget', quantity: 1, consumed: true },
      { itemId: 'mechanical_parts', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'pistol_ammo', quantity: 6, chance: 1 }],
    craftingTime: 30,
    requiredSkill: 'gunsmith',
    skillLevel: 45,
    skillXpGain: 25,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'father_miguel',
      description: 'Learn from Father Miguel after investigating the supernatural occurrences',
    },
    tags: ['ammunition', 'pistol', 'advanced', 'holy', 'supernatural'],
    icon: 'ammo_silver',
    lore: 'When the dead walk and darkness creeps, only silver can put them to rest.',
  },
];

// ============================================================================
// MEDICINE RECIPES (8)
// ============================================================================

export const MEDICINE_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_basic_bandages',
    name: 'Basic Bandages',
    description:
      'Clean cloth strips for binding wounds. Simple but effective first aid.',
    category: 'medicine',
    station: 'none',
    ingredients: [
      { itemId: 'old_newspaper', quantity: 2, consumed: true },
      { itemId: 'empty_bottle', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'bandages', quantity: 3, chance: 1 }],
    craftingTime: 5,
    requiredSkill: 'medicine',
    skillLevel: 0,
    skillXpGain: 3,
    unlockedByDefault: true,
    tags: ['medicine', 'healing', 'basic'],
    icon: 'bandage',
    lore: 'Any frontier traveler knows: a clean bandage can mean the difference between life and death.',
  },
  {
    id: 'craft_health_potion',
    name: 'Health Tonic',
    description:
      'A restorative tonic that accelerates natural healing. Brewed from frontier herbs.',
    category: 'medicine',
    station: 'alchemy_table',
    ingredients: [
      { itemId: 'herbal_remedy', quantity: 2, consumed: true },
      { itemId: 'empty_bottle', quantity: 1, consumed: true },
      { itemId: 'canteen_refill', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'health_potion', quantity: 1, chance: 1 }],
    craftingTime: 15,
    requiredSkill: 'medicine',
    skillLevel: 15,
    skillXpGain: 10,
    unlockedByDefault: true,
    tags: ['medicine', 'healing', 'tonic'],
    icon: 'potion_red',
    lore: 'The recipe has been passed down through generations of frontier healers.',
  },
  {
    id: 'craft_antidote',
    name: 'Antidote',
    description:
      'Neutralizes snake venom and scorpion poison. Essential for desert survival.',
    category: 'medicine',
    station: 'alchemy_table',
    ingredients: [
      { itemId: 'snake_venom', quantity: 1, consumed: true },
      { itemId: 'herbal_remedy', quantity: 1, consumed: true },
      { itemId: 'empty_bottle', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'antidote', quantity: 1, chance: 1 }],
    craftingTime: 12,
    requiredSkill: 'medicine',
    skillLevel: 20,
    skillXpGain: 12,
    unlockedByDefault: true,
    tags: ['medicine', 'cure', 'poison'],
    icon: 'potion_green',
    lore: 'Fight poison with poison - the venom becomes the cure when properly processed.',
  },
  {
    id: 'craft_stimulant',
    name: 'Stimulant Tonic',
    description:
      'A powerful energizing brew that sharpens reflexes and wards off exhaustion.',
    category: 'medicine',
    station: 'alchemy_table',
    ingredients: [
      { itemId: 'coffee_beans', quantity: 3, consumed: true },
      { itemId: 'herbal_remedy', quantity: 1, consumed: true },
      { itemId: 'empty_bottle', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'stimulant_tonic', quantity: 1, chance: 1 }],
    craftingTime: 10,
    requiredSkill: 'medicine',
    skillLevel: 25,
    skillXpGain: 10,
    unlockedByDefault: true,
    tags: ['medicine', 'buff', 'stamina'],
    icon: 'potion_yellow',
    lore: 'When the night is long and the trail longer, this keeps you on your feet.',
  },
  {
    id: 'craft_painkiller',
    name: 'Painkiller',
    description:
      'A strong analgesic that numbs pain and allows you to fight through injuries.',
    category: 'medicine',
    station: 'alchemy_table',
    ingredients: [
      { itemId: 'laudanum', quantity: 1, consumed: true },
      { itemId: 'whiskey', quantity: 1, consumed: true },
      { itemId: 'empty_bottle', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'laudanum', quantity: 2, chance: 1 }],
    craftingTime: 8,
    requiredSkill: 'medicine',
    skillLevel: 30,
    skillXpGain: 12,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'doc_chen',
      description: 'Learn from Doc Chen Wei after gaining her trust',
    },
    tags: ['medicine', 'buff', 'damage_resist'],
    icon: 'medicine',
    lore: 'The frontier teaches hard lessons. This helps you forget the pain, at least for a while.',
  },
  {
    id: 'craft_healing_salve',
    name: 'Healing Salve',
    description:
      'A thick medicinal paste that promotes rapid wound healing over time.',
    category: 'medicine',
    station: 'alchemy_table',
    ingredients: [
      { itemId: 'herbal_remedy', quantity: 2, consumed: true },
      { itemId: 'coyote_pelt', quantity: 1, consumed: true },
      { itemId: 'oil_can', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'herbal_remedy', quantity: 3, chance: 1 }],
    craftingTime: 15,
    requiredSkill: 'medicine',
    skillLevel: 35,
    skillXpGain: 15,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'quest_complete',
      targetId: 'quest_docs_dilemma',
      description: 'Complete "Doc\'s Dilemma" quest',
    },
    tags: ['medicine', 'healing', 'regen'],
    icon: 'salve',
    lore: 'Old remedies from the native peoples, adapted for frontier life.',
  },
  {
    id: 'craft_revival_tonic',
    name: 'Revival Tonic',
    description:
      'An emergency concoction that can bring someone back from the brink of death.',
    category: 'medicine',
    station: 'alchemy_table',
    ingredients: [
      { itemId: 'health_potion_greater', quantity: 1, consumed: true },
      { itemId: 'stimulant_tonic', quantity: 1, consumed: true },
      { itemId: 'antidote', quantity: 1, consumed: true },
      { itemId: 'gold_nugget', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'medical_kit', quantity: 1, chance: 1 }],
    craftingTime: 30,
    requiredSkill: 'medicine',
    skillLevel: 50,
    skillXpGain: 30,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'skill_level',
      value: 50,
      description: 'Reach Medicine skill level 50',
    },
    tags: ['medicine', 'healing', 'advanced', 'revival'],
    icon: 'potion_special',
    lore: 'They say only the best doctors know this formula. It can cheat death itself.',
  },
  {
    id: 'craft_doc_chen_special',
    name: "Doc Chen's Special Blend",
    description:
      'A legendary medicine combining Eastern and Western healing traditions. Provides multiple powerful buffs.',
    category: 'medicine',
    station: 'alchemy_table',
    ingredients: [
      { itemId: 'herbal_remedy', quantity: 3, consumed: true },
      { itemId: 'snake_venom', quantity: 1, consumed: true },
      { itemId: 'coffee_beans', quantity: 2, consumed: true },
      { itemId: 'gold_nugget', quantity: 1, consumed: true },
      { itemId: 'empty_bottle', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'medicine', quantity: 2, chance: 1 }],
    craftingTime: 45,
    requiredSkill: 'medicine',
    skillLevel: 60,
    skillXpGain: 40,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'doc_chen',
      description: 'Complete Doc Chen\'s personal quest "The Healer\'s Path"',
    },
    tags: ['medicine', 'healing', 'buff', 'legendary', 'special'],
    icon: 'potion_legendary',
    lore: 'Doc Chen guards this recipe fiercely. Only those who have earned her complete trust learn its secrets.',
  },
];

// ============================================================================
// EQUIPMENT UPGRADE RECIPES (6)
// ============================================================================

export const EQUIPMENT_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_weapon_cleaning_kit',
    name: 'Weapon Cleaning Kit',
    description:
      'A kit for maintaining firearms. Restores weapon condition and improves reliability.',
    category: 'equipment_upgrade',
    station: 'workbench',
    ingredients: [
      { itemId: 'oil_can', quantity: 2, consumed: true },
      { itemId: 'old_newspaper', quantity: 1, consumed: true },
      { itemId: 'rope', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'oil_can', quantity: 3, chance: 1 }],
    craftingTime: 8,
    requiredSkill: 'gunsmith',
    skillLevel: 5,
    skillXpGain: 5,
    unlockedByDefault: true,
    tags: ['equipment', 'maintenance', 'weapon'],
    icon: 'cleaning_kit',
    lore: 'A clean gun is a reliable gun. Regular maintenance saves lives.',
  },
  {
    id: 'craft_armor_repair_kit',
    name: 'Armor Repair Kit',
    description:
      'Patches and tools for repairing leather and metal armor. Restores protection.',
    category: 'equipment_upgrade',
    station: 'workbench',
    ingredients: [
      { itemId: 'scrap_metal', quantity: 3, consumed: true },
      { itemId: 'coyote_pelt', quantity: 1, consumed: true },
      { itemId: 'rope', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'scrap_metal', quantity: 4, chance: 1 }],
    craftingTime: 12,
    requiredSkill: 'engineering',
    skillLevel: 10,
    skillXpGain: 8,
    unlockedByDefault: true,
    tags: ['equipment', 'maintenance', 'armor'],
    icon: 'repair_kit',
    lore: 'Armor takes a beating so you don\'t have to. Keep it in good shape.',
  },
  {
    id: 'craft_scope_attachment',
    name: 'Rifle Scope',
    description:
      'A precision optical scope for rifles. Greatly improves accuracy at long range.',
    category: 'equipment_upgrade',
    station: 'workbench',
    ingredients: [
      { itemId: 'mechanical_parts', quantity: 3, consumed: true },
      { itemId: 'copper_wire', quantity: 2, consumed: true },
      { itemId: 'steam_valve', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'mechanical_parts', quantity: 4, chance: 1 }],
    craftingTime: 25,
    requiredSkill: 'engineering',
    skillLevel: 35,
    skillXpGain: 20,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'clara_cogsworth',
      description: 'Learn from Clara Cogsworth',
    },
    tags: ['equipment', 'upgrade', 'weapon', 'accuracy'],
    icon: 'scope',
    lore: 'See your target clearly before you pull the trigger. Precision engineering at its finest.',
  },
  {
    id: 'craft_extended_magazine',
    name: 'Extended Magazine',
    description:
      'A modified cylinder or magazine that holds additional rounds. More shots before reloading.',
    category: 'equipment_upgrade',
    station: 'forge',
    ingredients: [
      { itemId: 'scrap_metal', quantity: 4, consumed: true },
      { itemId: 'mechanical_parts', quantity: 2, consumed: true },
      { itemId: 'copper_wire', quantity: 2, consumed: true },
    ],
    outputs: [{ itemId: 'mechanical_parts', quantity: 3, chance: 1 }],
    craftingTime: 20,
    requiredSkill: 'gunsmith',
    skillLevel: 40,
    skillXpGain: 18,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'reputation',
      targetId: 'faction_free_miners',
      value: 50,
      description: 'Reach 50 reputation with the Free Miners',
    },
    tags: ['equipment', 'upgrade', 'weapon', 'capacity'],
    icon: 'magazine',
    lore: 'When six shots aren\'t enough, eight will have to do.',
  },
  {
    id: 'craft_reinforced_holster',
    name: 'Reinforced Holster',
    description:
      'A leather holster reinforced with metal plates. Protects your sidearm and allows faster draws.',
    category: 'equipment_upgrade',
    station: 'workbench',
    ingredients: [
      { itemId: 'coyote_pelt', quantity: 2, consumed: true },
      { itemId: 'scrap_metal', quantity: 2, consumed: true },
      { itemId: 'rope', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'quickdraw_holster', quantity: 1, chance: 1 }],
    craftingTime: 15,
    requiredSkill: 'survival',
    skillLevel: 20,
    skillXpGain: 12,
    unlockedByDefault: true,
    tags: ['equipment', 'upgrade', 'holster', 'speed'],
    icon: 'holster',
    lore: 'The fastest hand in the West needs the right holster to match.',
  },
  {
    id: 'craft_quickdraw_mod',
    name: 'Quick-Draw Modification',
    description:
      'A gunsmith modification that lightens the trigger and smooths the action for faster shooting.',
    category: 'equipment_upgrade',
    station: 'workbench',
    ingredients: [
      { itemId: 'mechanical_parts', quantity: 4, consumed: true },
      { itemId: 'oil_can', quantity: 2, consumed: true },
      { itemId: 'copper_wire', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'mechanical_parts', quantity: 5, chance: 1 }],
    craftingTime: 30,
    requiredSkill: 'gunsmith',
    skillLevel: 50,
    skillXpGain: 25,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'quest_complete',
      targetId: 'quest_gunslingers_legacy',
      description: 'Complete "The Gunslinger\'s Legacy" quest',
    },
    tags: ['equipment', 'upgrade', 'weapon', 'speed', 'advanced'],
    icon: 'trigger',
    lore: 'A hair trigger and polished action - the edge every gunslinger dreams of.',
  },
];

// ============================================================================
// SURVIVAL RECIPES (6)
// ============================================================================

export const SURVIVAL_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_campfire_kit',
    name: 'Campfire Kit',
    description:
      'Everything needed to start a fire in the wilderness. Provides warmth, light, and a place to cook.',
    category: 'survival',
    station: 'none',
    ingredients: [
      { itemId: 'old_newspaper', quantity: 2, consumed: true },
      { itemId: 'rope', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'lantern', quantity: 1, chance: 1 }],
    craftingTime: 5,
    requiredSkill: 'survival',
    skillLevel: 0,
    skillXpGain: 3,
    unlockedByDefault: true,
    tags: ['survival', 'fire', 'basic', 'camp'],
    icon: 'campfire',
    lore: 'Fire means life on the frontier. Never travel without the means to make one.',
  },
  {
    id: 'craft_trail_rations',
    name: 'Trail Rations',
    description:
      'Preserved food for long journeys. Dried meat and hardtack that keeps for weeks.',
    category: 'survival',
    station: 'campfire',
    ingredients: [
      { itemId: 'dried_jerky', quantity: 2, consumed: true },
      { itemId: 'trail_biscuits', quantity: 2, consumed: true },
    ],
    outputs: [{ itemId: 'rations', quantity: 4, chance: 1 }],
    craftingTime: 10,
    requiredSkill: 'survival',
    skillLevel: 5,
    skillXpGain: 5,
    unlockedByDefault: true,
    tags: ['survival', 'food', 'travel'],
    icon: 'food_rations',
    lore: 'Not fancy, but it\'ll keep you going when there\'s nothing else.',
  },
  {
    id: 'craft_waterskin_refill',
    name: 'Purified Water',
    description:
      'Clean drinking water purified over a fire. Essential for desert survival.',
    category: 'survival',
    station: 'campfire',
    ingredients: [
      { itemId: 'empty_bottle', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'canteen_refill', quantity: 1, chance: 1 }],
    craftingTime: 8,
    requiredSkill: 'survival',
    skillLevel: 0,
    skillXpGain: 2,
    unlockedByDefault: true,
    tags: ['survival', 'water', 'basic'],
    icon: 'canteen',
    lore: 'Boil it first. The desert sun kills many, but bad water kills more.',
  },
  {
    id: 'craft_rope_grapple',
    name: 'Rope and Grapple',
    description:
      'A sturdy rope with an iron grappling hook. Used for climbing and crossing gaps.',
    category: 'survival',
    station: 'workbench',
    ingredients: [
      { itemId: 'rope', quantity: 2, consumed: true },
      { itemId: 'scrap_metal', quantity: 3, consumed: true },
    ],
    outputs: [{ itemId: 'rope', quantity: 3, chance: 1 }],
    craftingTime: 15,
    requiredSkill: 'survival',
    skillLevel: 15,
    skillXpGain: 10,
    unlockedByDefault: true,
    tags: ['survival', 'tool', 'climbing'],
    icon: 'grapple',
    lore: 'When the only way forward is up, you\'ll be glad you packed this.',
  },
  {
    id: 'craft_signal_flare',
    name: 'Signal Flare',
    description:
      'A bright flare visible for miles. Used to signal for help or mark locations.',
    category: 'survival',
    station: 'workbench',
    ingredients: [
      { itemId: 'dynamite', quantity: 1, consumed: true },
      { itemId: 'oil_can', quantity: 1, consumed: true },
      { itemId: 'scrap_metal', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'dynamite', quantity: 2, chance: 1 }],
    craftingTime: 12,
    requiredSkill: 'survival',
    skillLevel: 25,
    skillXpGain: 12,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'quest_complete',
      targetId: 'quest_lost_in_desert',
      description: 'Complete "Lost in the Desert" quest',
    },
    tags: ['survival', 'signal', 'emergency'],
    icon: 'flare',
    lore: 'When you\'re lost and alone, this crimson light might be your salvation.',
  },
  {
    id: 'craft_trap_kit',
    name: 'Trap Kit',
    description:
      'A set of snares and traps for catching small game or slowing pursuers.',
    category: 'survival',
    station: 'workbench',
    ingredients: [
      { itemId: 'rope', quantity: 2, consumed: true },
      { itemId: 'scrap_metal', quantity: 2, consumed: true },
      { itemId: 'mechanical_parts', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'mechanical_parts', quantity: 2, chance: 1 }],
    craftingTime: 18,
    requiredSkill: 'survival',
    skillLevel: 30,
    skillXpGain: 15,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'trapper_old_jake',
      description: 'Learn from Old Jake the Trapper',
    },
    tags: ['survival', 'trap', 'hunting', 'defense'],
    icon: 'trap',
    lore: 'Catch dinner or catch bandits - a good trap serves many purposes.',
  },
];

// ============================================================================
// COOKING RECIPES (10)
// ============================================================================

export const COOKING_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_campfire_beans',
    name: 'Campfire Beans',
    description:
      'A hearty can of beans cooked over an open flame. Restores stamina for the trail ahead.',
    category: 'cooking',
    station: 'campfire',
    ingredients: [
      { itemId: 'beans', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'beans', quantity: 1, chance: 1 }],
    craftingTime: 5,
    requiredSkill: 'cooking',
    skillLevel: 0,
    skillXpGain: 2,
    unlockedByDefault: true,
    tags: ['cooking', 'food', 'stamina', 'basic'],
    icon: 'beans',
    lore: 'The cowboy\'s best friend. Simple, filling, and keeps you regular.',
  },
  {
    id: 'craft_frontier_stew',
    name: 'Frontier Stew',
    description:
      'A thick stew of meat and vegetables. Provides health regeneration over time.',
    category: 'cooking',
    station: 'kitchen',
    ingredients: [
      { itemId: 'dried_jerky', quantity: 2, consumed: true },
      { itemId: 'beans', quantity: 1, consumed: true },
      { itemId: 'canteen_refill', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'hot_meal', quantity: 2, chance: 1 }],
    craftingTime: 15,
    requiredSkill: 'cooking',
    skillLevel: 10,
    skillXpGain: 8,
    unlockedByDefault: true,
    tags: ['cooking', 'food', 'healing', 'regen'],
    icon: 'stew',
    lore: 'A proper stew takes time, but the healing warmth is worth every minute.',
  },
  {
    id: 'craft_jerky',
    name: 'Dried Jerky',
    description:
      'Salted and dried meat that keeps indefinitely. Perfect travel food.',
    category: 'cooking',
    station: 'campfire',
    ingredients: [
      { itemId: 'coyote_pelt', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'dried_jerky', quantity: 3, chance: 1 }],
    craftingTime: 20,
    requiredSkill: 'cooking',
    skillLevel: 5,
    skillXpGain: 5,
    unlockedByDefault: true,
    tags: ['cooking', 'food', 'preserved', 'travel'],
    icon: 'jerky',
    lore: 'Salt, smoke, and patience turn any meat into trail provisions.',
  },
  {
    id: 'craft_coffee',
    name: 'Strong Coffee',
    description:
      'Black as midnight, hot as hell. Boosts alertness and reduces fatigue.',
    category: 'cooking',
    station: 'campfire',
    ingredients: [
      { itemId: 'coffee_beans', quantity: 1, consumed: true },
      { itemId: 'canteen_refill', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'coffee_hot', quantity: 2, chance: 1 }],
    craftingTime: 5,
    requiredSkill: 'cooking',
    skillLevel: 0,
    skillXpGain: 2,
    unlockedByDefault: true,
    tags: ['cooking', 'drink', 'stamina', 'buff', 'alertness'],
    icon: 'coffee',
    lore: 'No frontier morning starts without it. The smell alone can raise the dead.',
  },
  {
    id: 'craft_whiskey',
    name: 'Frontier Whiskey',
    description:
      'A potent homebrew that provides liquid courage. Boosts damage but impairs accuracy.',
    category: 'cooking',
    station: 'kitchen',
    ingredients: [
      { itemId: 'beans', quantity: 2, consumed: true },
      { itemId: 'canteen_refill', quantity: 2, consumed: true },
      { itemId: 'empty_bottle', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'whiskey', quantity: 1, chance: 1 }],
    craftingTime: 30,
    requiredSkill: 'cooking',
    skillLevel: 20,
    skillXpGain: 12,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'bartender_sal',
      description: 'Learn from Sal the Bartender',
    },
    tags: ['cooking', 'drink', 'alcohol', 'buff', 'courage'],
    icon: 'bottle',
    lore: 'When you need to steady your nerves before a gunfight, nothing works quite like rotgut.',
  },
  {
    id: 'craft_apple_pie',
    name: 'Apple Pie',
    description:
      'A slice of home on the frontier. Greatly boosts morale and provides moderate healing.',
    category: 'cooking',
    station: 'kitchen',
    ingredients: [
      { itemId: 'trail_biscuits', quantity: 2, consumed: true },
      { itemId: 'herbal_remedy', quantity: 1, consumed: true },
      { itemId: 'canteen_refill', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'hot_meal', quantity: 1, chance: 1 }],
    craftingTime: 25,
    requiredSkill: 'cooking',
    skillLevel: 25,
    skillXpGain: 15,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'ma_kettle',
      description: 'Learn from Ma Kettle at the boarding house',
    },
    tags: ['cooking', 'food', 'morale', 'healing', 'comfort'],
    icon: 'pie',
    lore: 'Reminds you what you\'re fighting for. A taste of civilization in the wild.',
  },
  {
    id: 'craft_roasted_game',
    name: 'Roasted Game',
    description:
      'Fresh game roasted over an open fire. A full meal that restores health and stamina.',
    category: 'cooking',
    station: 'campfire',
    ingredients: [
      { itemId: 'coyote_pelt', quantity: 1, consumed: true },
      { itemId: 'herbal_remedy', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'hot_meal', quantity: 1, chance: 1 }],
    craftingTime: 15,
    requiredSkill: 'cooking',
    skillLevel: 15,
    skillXpGain: 10,
    unlockedByDefault: true,
    tags: ['cooking', 'food', 'healing', 'stamina', 'full_meal'],
    icon: 'meat',
    lore: 'Nothing beats fresh game cooked under the stars.',
  },
  {
    id: 'craft_hardtack',
    name: 'Hardtack',
    description:
      'Rock-hard biscuits that last forever. Emergency rations when nothing else is available.',
    category: 'cooking',
    station: 'campfire',
    ingredients: [
      { itemId: 'trail_biscuits', quantity: 3, consumed: true },
    ],
    outputs: [{ itemId: 'trail_biscuits', quantity: 5, chance: 1 }],
    craftingTime: 20,
    requiredSkill: 'cooking',
    skillLevel: 5,
    skillXpGain: 5,
    unlockedByDefault: true,
    tags: ['cooking', 'food', 'preserved', 'emergency'],
    icon: 'hardtack',
    lore: 'Soldiers have survived on these for months. Not pleasant, but you won\'t starve.',
  },
  {
    id: 'craft_snake_meat',
    name: 'Rattlesnake Steak',
    description:
      'Grilled snake meat. Eating it grants temporary resistance to poison.',
    category: 'cooking',
    station: 'campfire',
    ingredients: [
      { itemId: 'snake_venom', quantity: 1, consumed: true },
      { itemId: 'herbal_remedy', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'antidote', quantity: 1, chance: 1 }],
    craftingTime: 12,
    requiredSkill: 'cooking',
    skillLevel: 30,
    skillXpGain: 12,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'discovered',
      description: 'Discover by killing 10 rattlesnakes',
    },
    tags: ['cooking', 'food', 'buff', 'poison_resist', 'exotic'],
    icon: 'snake_meat',
    lore: 'Tastes like chicken, they say. Grants you a bit of the serpent\'s resilience.',
  },
  {
    id: 'craft_doc_chen_tea',
    name: "Doc Chen's Medicinal Tea",
    description:
      'A special herbal tea that combines healing, stamina restoration, and multiple protective buffs.',
    category: 'cooking',
    station: 'kitchen',
    ingredients: [
      { itemId: 'herbal_remedy', quantity: 3, consumed: true },
      { itemId: 'coffee_beans', quantity: 1, consumed: true },
      { itemId: 'snake_venom', quantity: 1, consumed: true },
      { itemId: 'canteen_refill', quantity: 1, consumed: true },
    ],
    outputs: [{ itemId: 'medicine', quantity: 1, chance: 1 }],
    craftingTime: 20,
    requiredSkill: 'cooking',
    skillLevel: 50,
    skillXpGain: 30,
    unlockedByDefault: false,
    unlockCondition: {
      type: 'npc_taught',
      targetId: 'doc_chen',
      description: 'Learn from Doc Chen Wei after becoming her trusted friend',
    },
    tags: ['cooking', 'drink', 'healing', 'buff', 'legendary', 'special'],
    icon: 'tea',
    lore: 'An ancient recipe from Doc Chen\'s homeland, adapted with frontier ingredients. Restores body and spirit alike.',
  },
];

// ============================================================================
// ALL RECIPES COMBINED
// ============================================================================

export const ALL_CRAFTING_RECIPES: CraftingRecipe[] = [
  ...AMMUNITION_RECIPES,
  ...MEDICINE_RECIPES,
  ...EQUIPMENT_RECIPES,
  ...SURVIVAL_RECIPES,
  ...COOKING_RECIPES,
];

/** Recipe library indexed by ID */
export const RECIPES_BY_ID: Record<string, CraftingRecipe> = Object.fromEntries(
  ALL_CRAFTING_RECIPES.map((recipe) => [recipe.id, recipe])
);

/** Recipes organized by category */
export const RECIPES_BY_CATEGORY: Record<CraftingCategory, CraftingRecipe[]> = {
  ammunition: AMMUNITION_RECIPES,
  medicine: MEDICINE_RECIPES,
  equipment_upgrade: EQUIPMENT_RECIPES,
  survival: SURVIVAL_RECIPES,
  cooking: COOKING_RECIPES,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a recipe by its ID
 */
export function getRecipeById(recipeId: string): CraftingRecipe | undefined {
  return RECIPES_BY_ID[recipeId];
}

/**
 * Get all recipes in a category
 */
export function getRecipesByCategory(category: CraftingCategory): CraftingRecipe[] {
  return RECIPES_BY_CATEGORY[category] ?? [];
}

/**
 * Get all recipes that can be crafted at a specific station
 */
export function getRecipesByStation(station: string): CraftingRecipe[] {
  return ALL_CRAFTING_RECIPES.filter(
    (recipe) => recipe.station === station || recipe.station === 'none'
  );
}

/**
 * Get all recipes with a specific tag
 */
export function getRecipesByTag(tag: string): CraftingRecipe[] {
  return ALL_CRAFTING_RECIPES.filter((recipe) => recipe.tags.includes(tag));
}

/**
 * Get all recipes that require a specific skill
 */
export function getRecipesBySkill(skill: string): CraftingRecipe[] {
  return ALL_CRAFTING_RECIPES.filter((recipe) => recipe.requiredSkill === skill);
}

/**
 * Get all recipes unlocked by default
 */
export function getDefaultUnlockedRecipes(): CraftingRecipe[] {
  return ALL_CRAFTING_RECIPES.filter((recipe) => recipe.unlockedByDefault);
}

/**
 * Get all recipes that need to be unlocked
 */
export function getLockedRecipes(): CraftingRecipe[] {
  return ALL_CRAFTING_RECIPES.filter((recipe) => !recipe.unlockedByDefault);
}

/**
 * Get recipes that use a specific ingredient
 */
export function getRecipesUsingIngredient(itemId: string): CraftingRecipe[] {
  return ALL_CRAFTING_RECIPES.filter((recipe) =>
    recipe.ingredients.some((ing) => ing.itemId === itemId)
  );
}

/**
 * Get recipes that produce a specific item
 */
export function getRecipesProducingItem(itemId: string): CraftingRecipe[] {
  return ALL_CRAFTING_RECIPES.filter((recipe) =>
    recipe.outputs.some((out) => out.itemId === itemId)
  );
}

/**
 * Check if a recipe exists
 */
export function recipeExists(recipeId: string): boolean {
  return recipeId in RECIPES_BY_ID;
}

/**
 * Get recipe count by category (for UI display)
 */
export function getRecipeCountByCategory(): Record<CraftingCategory, number> {
  return {
    ammunition: AMMUNITION_RECIPES.length,
    medicine: MEDICINE_RECIPES.length,
    equipment_upgrade: EQUIPMENT_RECIPES.length,
    survival: SURVIVAL_RECIPES.length,
    cooking: COOKING_RECIPES.length,
  };
}

/**
 * Get total recipe count
 */
export function getTotalRecipeCount(): number {
  return ALL_CRAFTING_RECIPES.length;
}

// ============================================================================
// EXPORTS FOR TYPE SAFETY
// ============================================================================

export type {
  CraftingRecipe,
  CraftingCategory,
  CraftingStation,
  CraftingIngredient,
  CraftingOutput,
  UnlockCondition,
  SkillType,
} from '../schemas/crafting';

export {
  CraftingCategorySchema,
  CraftingStationSchema,
  CraftingRecipeSchema,
  CraftingIngredientSchema,
  CraftingOutputSchema,
  UnlockConditionSchema,
  SkillTypeSchema,
  validateCraftingRecipe,
  hasIngredients,
  meetsSkillRequirement,
  hasStationAccess,
  isRecipeUnlocked,
  calculateSuccessChance,
  getCategoryColor,
  getCategoryName,
  getStationName,
  CRAFTING_SCHEMA_VERSION,
} from '../schemas/crafting';
