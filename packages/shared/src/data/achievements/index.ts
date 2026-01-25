/**
 * Iron Frontier - Achievement System
 *
 * A comprehensive achievement/accomplishment system with 45 achievements
 * organized into 6 categories. All achievements are thematic to the
 * Steampunk Western setting.
 *
 * Categories:
 * - Story Achievements (10): Main quest and narrative milestones
 * - Combat Achievements (8): Battle prowess and combat feats
 * - Exploration Achievements (8): Discovery and travel accomplishments
 * - Economic Achievements (6): Trading, wealth, and commerce
 * - Social Achievements (8): NPCs, factions, and relationships
 * - Secret Achievements (5): Hidden discoveries and easter eggs
 */

import { z } from 'zod';

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export const AchievementCategorySchema = z.enum([
  'story',
  'combat',
  'exploration',
  'economic',
  'social',
  'secret',
]);
export type AchievementCategory = z.infer<typeof AchievementCategorySchema>;

export const AchievementRaritySchema = z.enum([
  'common',
  'uncommon',
  'rare',
  'legendary',
]);
export type AchievementRarity = z.infer<typeof AchievementRaritySchema>;

export const RewardTypeSchema = z.enum([
  'gold',
  'xp',
  'item',
  'title',
  'cosmetic',
]);
export type RewardType = z.infer<typeof RewardTypeSchema>;

export const UnlockConditionTypeSchema = z.enum([
  'quest_complete',
  'kill_count',
  'kill_specific',
  'visit_location',
  'visit_all',
  'collect_item',
  'collect_count',
  'gold_earned',
  'gold_spent',
  'shop_count',
  'sell_count',
  'talk_npc',
  'talk_all',
  'reputation_max',
  'side_quest_count',
  'moral_choice',
  'ability_use',
  'travel_distance',
  'no_damage',
  'lore_discovered',
  'hidden_area',
  'special_action',
  'bounty_complete',
]);
export type UnlockConditionType = z.infer<typeof UnlockConditionTypeSchema>;

// ============================================================================
// SCHEMAS
// ============================================================================

export const AchievementRewardSchema = z.object({
  type: RewardTypeSchema,
  value: z.union([z.number(), z.string()]),
  description: z.string().optional(),
});
export type AchievementReward = z.infer<typeof AchievementRewardSchema>;

export const UnlockConditionSchema = z.object({
  type: UnlockConditionTypeSchema,
  target: z.string().optional(),
  count: z.number().optional(),
  description: z.string(),
});
export type UnlockCondition = z.infer<typeof UnlockConditionSchema>;

export const ProgressTrackingSchema = z.object({
  enabled: z.boolean().default(false),
  current: z.number().default(0),
  max: z.number(),
  displayFormat: z.string().optional(), // e.g., "{current}/{max}"
});
export type ProgressTracking = z.infer<typeof ProgressTrackingSchema>;

export const AchievementSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display title (thematic Western name) */
  title: z.string(),

  /** Flavor description */
  description: z.string(),

  /** Category for grouping */
  category: AchievementCategorySchema,

  /** Rarity determines visual treatment and points */
  rarity: AchievementRaritySchema,

  /** Condition(s) to unlock this achievement */
  unlockCondition: UnlockConditionSchema,

  /** Rewards granted on unlock */
  rewards: z.array(AchievementRewardSchema),

  /** Whether this achievement is hidden until unlocked */
  hidden: z.boolean().default(false),

  /** Progress tracking for incremental achievements */
  progress: ProgressTrackingSchema.optional(),

  /** Icon identifier for UI */
  icon: z.string().optional(),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),

  /** Points value for achievement score */
  points: z.number().default(10),

  /** Sort order within category */
  sortOrder: z.number().default(0),
});
export type Achievement = z.infer<typeof AchievementSchema>;

export const PlayerAchievementStateSchema = z.object({
  achievementId: z.string(),
  unlocked: z.boolean().default(false),
  unlockedAt: z.number().optional(), // timestamp
  progress: z.number().default(0),
  notified: z.boolean().default(false),
});
export type PlayerAchievementState = z.infer<typeof PlayerAchievementStateSchema>;

// ============================================================================
// STORY ACHIEVEMENTS (10)
// ============================================================================

/** ACH_S01: Complete the tutorial quest */
export const ACH_NewInTown: Achievement = {
  id: 'ach_new_in_town',
  title: 'New In Town',
  description:
    "Completed the tutorial and earned the Sheriff's trust. Every legend starts somewhere.",
  category: 'story',
  rarity: 'common',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq1_stranger_arrives',
    description: 'Complete "A Stranger Arrives" quest',
  },
  rewards: [
    { type: 'xp', value: 50, description: '+50 XP' },
    { type: 'title', value: 'The Newcomer', description: 'Title: The Newcomer' },
  ],
  hidden: false,
  icon: 'badge_sheriff',
  tags: ['story', 'tutorial', 'act1'],
  points: 10,
  sortOrder: 1,
};

/** ACH_S02: Find the missing prospector */
export const ACH_TrailOfGold: Achievement = {
  id: 'ach_trail_of_gold',
  title: 'Trail of Gold',
  description:
    "Discovered the fate of the missing prospector. Some trails lead to riches, others to ruin.",
  category: 'story',
  rarity: 'common',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq2_missing_prospector',
    description: 'Complete "The Missing Prospector" quest',
  },
  rewards: [{ type: 'gold', value: 50, description: '+50 Gold' }],
  hidden: false,
  icon: 'pickaxe_gold',
  tags: ['story', 'investigation', 'act1'],
  points: 15,
  sortOrder: 2,
};

/** ACH_S03: Complete Act 1 */
export const ACH_DeepInTheMine: Achievement = {
  id: 'ach_deep_in_the_mine',
  title: 'Deep in the Mine',
  description:
    'Uncovered the sabotage plot at Iron Gulch. The conspiracy runs deeper than the mine shafts.',
  category: 'story',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq5_confrontation',
    description: 'Complete Act 1 - "Confrontation"',
  },
  rewards: [
    { type: 'xp', value: 150, description: '+150 XP' },
    { type: 'title', value: 'Mine Detective', description: 'Title: Mine Detective' },
  ],
  hidden: false,
  icon: 'mine_entrance',
  tags: ['story', 'act1', 'milestone'],
  points: 25,
  sortOrder: 3,
};

/** ACH_S04: Complete the Mesa Point storyline */
export const ACH_HonorAmongThieves: Achievement = {
  id: 'ach_honor_among_thieves',
  title: 'Honor Among Thieves',
  description:
    "Navigated the dangerous world of outlaws at Mesa Point. Even criminals have their code.",
  category: 'story',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq6a_honor_among_thieves',
    description: 'Complete "Honor Among Thieves" quest',
  },
  rewards: [
    { type: 'gold', value: 100, description: '+100 Gold' },
    { type: 'item', value: 'outlaw_bandana', description: 'Item: Outlaw Bandana' },
  ],
  hidden: false,
  icon: 'mask_outlaw',
  tags: ['story', 'outlaws', 'act2'],
  points: 20,
  sortOrder: 4,
};

/** ACH_S05: Complete the Coldwater storyline */
export const ACH_HomeOnTheRange: Achievement = {
  id: 'ach_home_on_the_range',
  title: 'Home on the Range',
  description:
    'Helped the ranchers of Coldwater deal with rustlers. The frontier rewards those who protect it.',
  category: 'story',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq6b_ranchers_plight',
    description: 'Complete "The Rancher\'s Plight" quest',
  },
  rewards: [
    { type: 'gold', value: 100, description: '+100 Gold' },
    { type: 'item', value: 'rancher_hat', description: 'Item: Rancher Hat' },
  ],
  hidden: false,
  icon: 'cattle_brand',
  tags: ['story', 'ranching', 'act2'],
  points: 20,
  sortOrder: 5,
};

/** ACH_S06: Complete Act 2 */
export const ACH_PiecesOfThePuzzle: Achievement = {
  id: 'ach_pieces_puzzle',
  title: 'Pieces of the Puzzle',
  description:
    'Connected the conspiracy threads from across the frontier. The truth awaits in Salvation.',
  category: 'story',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq7_pieces_of_puzzle',
    description: 'Complete Act 2 - "Pieces of the Puzzle"',
  },
  rewards: [
    { type: 'xp', value: 200, description: '+200 XP' },
    { type: 'title', value: 'Conspiracy Hunter', description: 'Title: Conspiracy Hunter' },
  ],
  hidden: false,
  icon: 'document_conspiracy',
  tags: ['story', 'act2', 'milestone'],
  points: 30,
  sortOrder: 6,
};

/** ACH_S07: Reach Salvation */
export const ACH_RoadToSalvation: Achievement = {
  id: 'ach_road_to_salvation',
  title: 'Road to Salvation',
  description:
    'Survived the treacherous final trail and reached Salvation. The end is near.',
  category: 'story',
  rarity: 'rare',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq8_final_trail',
    description: 'Complete "The Final Trail" quest',
  },
  rewards: [
    { type: 'xp', value: 250, description: '+250 XP' },
    { type: 'gold', value: 150, description: '+150 Gold' },
  ],
  hidden: false,
  icon: 'church_steeple',
  tags: ['story', 'act3', 'endgame'],
  points: 35,
  sortOrder: 7,
};

/** ACH_S08: Uncover Solomon's secret */
export const ACH_TruthRevealed: Achievement = {
  id: 'ach_truth_revealed',
  title: 'The Truth Revealed',
  description:
    "Discovered the dark secret beneath Salvation's church. Some truths are better left buried.",
  category: 'story',
  rarity: 'rare',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq9_salvations_secret',
    description: 'Complete "Salvation\'s Secret" quest',
  },
  rewards: [
    { type: 'xp', value: 300, description: '+300 XP' },
    { type: 'item', value: 'solomon_key', description: 'Item: Solomon\'s Key' },
  ],
  hidden: false,
  icon: 'key_ornate',
  tags: ['story', 'act3', 'revelation'],
  points: 40,
  sortOrder: 8,
};

/** ACH_S09: Defeat the final boss */
export const ACH_Reckoning: Achievement = {
  id: 'ach_reckoning',
  title: 'Reckoning',
  description:
    'Defeated the mastermind behind the conspiracy. The frontier is safe once more.',
  category: 'story',
  rarity: 'legendary',
  unlockCondition: {
    type: 'quest_complete',
    target: 'mq10_reckoning',
    description: 'Complete "Reckoning" - the final quest',
  },
  rewards: [
    { type: 'xp', value: 500, description: '+500 XP' },
    { type: 'gold', value: 500, description: '+500 Gold' },
    { type: 'title', value: 'Frontier Legend', description: 'Title: Frontier Legend' },
    { type: 'cosmetic', value: 'golden_revolver_skin', description: 'Cosmetic: Golden Revolver' },
  ],
  hidden: false,
  icon: 'star_gold',
  tags: ['story', 'finale', 'legendary', 'ending'],
  points: 100,
  sortOrder: 9,
};

/** ACH_S10: Achieve the best ending */
export const ACH_Redemption: Achievement = {
  id: 'ach_redemption',
  title: 'Redemption',
  description:
    'Achieved the best possible ending. Through darkness, light prevails.',
  category: 'story',
  rarity: 'legendary',
  unlockCondition: {
    type: 'special_action',
    target: 'best_ending',
    description: 'Complete the game with the best ending',
  },
  rewards: [
    { type: 'xp', value: 250, description: '+250 XP' },
    { type: 'title', value: 'Redeemer', description: 'Title: Redeemer' },
    { type: 'cosmetic', value: 'white_hat', description: 'Cosmetic: The White Hat' },
  ],
  hidden: true,
  icon: 'halo',
  tags: ['story', 'secret', 'ending', 'legendary'],
  points: 75,
  sortOrder: 10,
};

// ============================================================================
// COMBAT ACHIEVEMENTS (8)
// ============================================================================

/** ACH_C01: First kill */
export const ACH_FirstBlood: Achievement = {
  id: 'ach_first_blood',
  title: 'First Blood',
  description:
    'Claimed your first kill on the frontier. The first of many.',
  category: 'combat',
  rarity: 'common',
  unlockCondition: {
    type: 'kill_count',
    count: 1,
    description: 'Defeat your first enemy',
  },
  rewards: [{ type: 'xp', value: 25, description: '+25 XP' }],
  hidden: false,
  icon: 'blood_drop',
  tags: ['combat', 'first'],
  points: 5,
  sortOrder: 1,
};

/** ACH_C02: Kill 50 enemies */
export const ACH_BodyCount: Achievement = {
  id: 'ach_body_count',
  title: 'Body Count',
  description:
    'Defeated 50 enemies. Your reputation as a dangerous gunslinger grows.',
  category: 'combat',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'kill_count',
    count: 50,
    description: 'Defeat 50 enemies',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Gunslinger', description: 'Title: Gunslinger' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 50,
    displayFormat: '{current}/50 enemies defeated',
  },
  icon: 'skull_pile',
  tags: ['combat', 'grind'],
  points: 25,
  sortOrder: 2,
};

/** ACH_C03: Win a fight without taking damage */
export const ACH_Untouchable: Achievement = {
  id: 'ach_untouchable',
  title: 'Untouchable',
  description:
    "Won a combat encounter without taking a single hit. Quick draw, quicker reflexes.",
  category: 'combat',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'no_damage',
    description: 'Win a combat encounter without taking damage',
  },
  rewards: [
    { type: 'xp', value: 75, description: '+75 XP' },
    { type: 'gold', value: 50, description: '+50 Gold' },
  ],
  hidden: false,
  icon: 'shield_perfect',
  tags: ['combat', 'skill'],
  points: 30,
  sortOrder: 3,
};

/** ACH_C04: Defeat the Bandit King */
export const ACH_KingSlayer: Achievement = {
  id: 'ach_king_slayer',
  title: 'King Slayer',
  description:
    "Defeated the Bandit King. His reign of terror ends with you.",
  category: 'combat',
  rarity: 'rare',
  unlockCondition: {
    type: 'kill_specific',
    target: 'bandit_king',
    description: 'Defeat the Bandit King boss',
  },
  rewards: [
    { type: 'xp', value: 150, description: '+150 XP' },
    { type: 'gold', value: 200, description: '+200 Gold' },
    { type: 'item', value: 'bandit_king_crown', description: "Item: Bandit King's Crown" },
  ],
  hidden: false,
  icon: 'crown_broken',
  tags: ['combat', 'boss'],
  points: 35,
  sortOrder: 4,
};

/** ACH_C05: Defeat the Saboteur */
export const ACH_JusticeServed: Achievement = {
  id: 'ach_justice_served',
  title: 'Justice Served',
  description:
    'Brought the Saboteur to justice. The mines are safe once more.',
  category: 'combat',
  rarity: 'rare',
  unlockCondition: {
    type: 'kill_specific',
    target: 'the_saboteur',
    description: 'Defeat the Saboteur boss',
  },
  rewards: [
    { type: 'xp', value: 150, description: '+150 XP' },
    { type: 'gold', value: 150, description: '+150 Gold' },
  ],
  hidden: false,
  icon: 'gavel',
  tags: ['combat', 'boss', 'act1'],
  points: 35,
  sortOrder: 5,
};

/** ACH_C06: Defeat the Iron Tyrant */
export const ACH_SteelBreaker: Achievement = {
  id: 'ach_steel_breaker',
  title: 'Steel Breaker',
  description:
    'Destroyed the Iron Tyrant. Even machines fall before true grit.',
  category: 'combat',
  rarity: 'legendary',
  unlockCondition: {
    type: 'kill_specific',
    target: 'iron_tyrant',
    description: 'Defeat the Iron Tyrant boss',
  },
  rewards: [
    { type: 'xp', value: 300, description: '+300 XP' },
    { type: 'gold', value: 300, description: '+300 Gold' },
    { type: 'item', value: 'tyrant_core', description: "Item: Tyrant's Power Core" },
  ],
  hidden: false,
  icon: 'gear_shattered',
  tags: ['combat', 'boss', 'legendary'],
  points: 50,
  sortOrder: 6,
};

/** ACH_C07: Use every ability type at least once */
export const ACH_JackOfAllTrades: Achievement = {
  id: 'ach_jack_of_all_trades',
  title: 'Jack of All Trades',
  description:
    'Used every combat ability type. A true frontier survivor knows all the tricks.',
  category: 'combat',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'ability_use',
    target: 'all_types',
    description: 'Use every ability type in combat',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Versatile Fighter', description: 'Title: Versatile Fighter' },
  ],
  hidden: false,
  icon: 'cards_ability',
  tags: ['combat', 'variety'],
  points: 20,
  sortOrder: 7,
};

/** ACH_C08: Kill 100 enemies */
export const ACH_LegendaryGunman: Achievement = {
  id: 'ach_legendary_gunman',
  title: 'Legendary Gunman',
  description:
    'Defeated 100 enemies. Songs will be sung of your deadly prowess.',
  category: 'combat',
  rarity: 'rare',
  unlockCondition: {
    type: 'kill_count',
    count: 100,
    description: 'Defeat 100 enemies',
  },
  rewards: [
    { type: 'xp', value: 200, description: '+200 XP' },
    { type: 'gold', value: 200, description: '+200 Gold' },
    { type: 'cosmetic', value: 'legendary_holster', description: 'Cosmetic: Legendary Holster' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 100,
    displayFormat: '{current}/100 enemies defeated',
  },
  icon: 'revolver_smoking',
  tags: ['combat', 'grind', 'legendary'],
  points: 50,
  sortOrder: 8,
};

// ============================================================================
// EXPLORATION ACHIEVEMENTS (8)
// ============================================================================

/** ACH_E01: Visit all six towns */
export const ACH_Trailblazer: Achievement = {
  id: 'ach_trailblazer',
  title: 'Trailblazer',
  description:
    "Visited all six towns of the frontier. You've seen every corner of this wild land.",
  category: 'exploration',
  rarity: 'rare',
  unlockCondition: {
    type: 'visit_all',
    target: 'towns',
    count: 6,
    description: 'Visit all 6 towns',
  },
  rewards: [
    { type: 'xp', value: 150, description: '+150 XP' },
    { type: 'gold', value: 100, description: '+100 Gold' },
    { type: 'title', value: 'Trailblazer', description: 'Title: Trailblazer' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 6,
    displayFormat: '{current}/6 towns discovered',
  },
  icon: 'map_complete',
  tags: ['exploration', 'towns'],
  points: 40,
  sortOrder: 1,
};

/** ACH_E02: Travel all routes */
export const ACH_WellTraveled: Achievement = {
  id: 'ach_well_traveled',
  title: 'Well Traveled',
  description:
    "Walked every trail on the frontier. The roads know your boots.",
  category: 'exploration',
  rarity: 'rare',
  unlockCondition: {
    type: 'visit_all',
    target: 'routes',
    count: 5,
    description: 'Travel all 5 routes',
  },
  rewards: [
    { type: 'xp', value: 125, description: '+125 XP' },
    { type: 'item', value: 'travelers_boots', description: "Item: Traveler's Boots" },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 5,
    displayFormat: '{current}/5 routes traveled',
  },
  icon: 'boots_dusty',
  tags: ['exploration', 'routes'],
  points: 35,
  sortOrder: 2,
};

/** ACH_E03: Discover all lore entries */
export const ACH_Historian: Achievement = {
  id: 'ach_historian',
  title: 'Frontier Historian',
  description:
    "Discovered all lore entries. The history of this land lives through you now.",
  category: 'exploration',
  rarity: 'rare',
  unlockCondition: {
    type: 'lore_discovered',
    count: 20,
    description: 'Discover all 20 lore entries',
  },
  rewards: [
    { type: 'xp', value: 200, description: '+200 XP' },
    { type: 'title', value: 'Historian', description: 'Title: Frontier Historian' },
    { type: 'item', value: 'historians_journal', description: "Item: Historian's Journal" },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 20,
    displayFormat: '{current}/20 lore entries',
  },
  icon: 'book_old',
  tags: ['exploration', 'lore', 'collectible'],
  points: 45,
  sortOrder: 3,
};

/** ACH_E04: Find all hidden areas */
export const ACH_SecretSeeker: Achievement = {
  id: 'ach_secret_seeker',
  title: 'Secret Seeker',
  description:
    'Found all hidden areas on the frontier. Nothing escapes your keen eye.',
  category: 'exploration',
  rarity: 'rare',
  unlockCondition: {
    type: 'hidden_area',
    count: 8,
    description: 'Discover all 8 hidden areas',
  },
  rewards: [
    { type: 'xp', value: 175, description: '+175 XP' },
    { type: 'gold', value: 250, description: '+250 Gold' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 8,
    displayFormat: '{current}/8 hidden areas',
  },
  icon: 'eye_searching',
  tags: ['exploration', 'secret'],
  points: 40,
  sortOrder: 4,
};

/** ACH_E05: Travel 100 miles */
export const ACH_LongRider: Achievement = {
  id: 'ach_long_rider',
  title: 'Long Rider',
  description:
    "Traveled over 100 miles across the frontier. Your journey has been long and dusty.",
  category: 'exploration',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'travel_distance',
    count: 100,
    description: 'Travel 100 miles total',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Long Rider', description: 'Title: Long Rider' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 100,
    displayFormat: '{current}/100 miles traveled',
  },
  icon: 'horseshoe',
  tags: ['exploration', 'travel'],
  points: 25,
  sortOrder: 5,
};

/** ACH_E06: Visit Frontier's Edge */
export const ACH_FreshOffTheCoach: Achievement = {
  id: 'ach_fresh_off_coach',
  title: 'Fresh Off the Coach',
  description:
    "Arrived at Frontier's Edge. Your adventure begins here.",
  category: 'exploration',
  rarity: 'common',
  unlockCondition: {
    type: 'visit_location',
    target: 'frontiers_edge',
    description: "Visit Frontier's Edge",
  },
  rewards: [{ type: 'xp', value: 10, description: '+10 XP' }],
  hidden: false,
  icon: 'stagecoach',
  tags: ['exploration', 'tutorial'],
  points: 5,
  sortOrder: 6,
};

/** ACH_E07: Discover all landmarks */
export const ACH_Cartographer: Achievement = {
  id: 'ach_cartographer',
  title: 'Cartographer',
  description:
    'Discovered all route landmarks. You could draw a map of this land from memory.',
  category: 'exploration',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'visit_all',
    target: 'landmarks',
    count: 15,
    description: 'Discover all 15 landmarks',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'item', value: 'detailed_map', description: 'Item: Detailed Map' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 15,
    displayFormat: '{current}/15 landmarks',
  },
  icon: 'compass',
  tags: ['exploration', 'landmarks'],
  points: 30,
  sortOrder: 7,
};

/** ACH_E08: Reach Salvation */
export const ACH_JourneysEnd: Achievement = {
  id: 'ach_journeys_end',
  title: "Journey's End",
  description:
    'Reached the mysterious town of Salvation. What awaits at the end of the road?',
  category: 'exploration',
  rarity: 'rare',
  unlockCondition: {
    type: 'visit_location',
    target: 'salvation',
    description: 'Visit Salvation',
  },
  rewards: [
    { type: 'xp', value: 150, description: '+150 XP' },
    { type: 'gold', value: 100, description: '+100 Gold' },
  ],
  hidden: false,
  icon: 'church_distant',
  tags: ['exploration', 'endgame'],
  points: 35,
  sortOrder: 8,
};

// ============================================================================
// ECONOMIC ACHIEVEMENTS (6)
// ============================================================================

/** ACH_EC01: Earn 1000 gold */
export const ACH_StrikingItRich: Achievement = {
  id: 'ach_striking_it_rich',
  title: 'Striking It Rich',
  description:
    'Earned 1000 gold total. The frontier has been good to you.',
  category: 'economic',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'gold_earned',
    count: 1000,
    description: 'Earn 1000 gold total',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Prosperous', description: 'Title: Prosperous' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 1000,
    displayFormat: '{current}/1000 gold earned',
  },
  icon: 'gold_pile',
  tags: ['economic', 'wealth'],
  points: 25,
  sortOrder: 1,
};

/** ACH_EC02: Buy from every shop */
export const ACH_BigSpender: Achievement = {
  id: 'ach_big_spender',
  title: 'Big Spender',
  description:
    "Bought from every shop on the frontier. You're keeping the economy alive.",
  category: 'economic',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'shop_count',
    count: 15,
    description: 'Buy from all 15 shops',
  },
  rewards: [
    { type: 'xp', value: 75, description: '+75 XP' },
    { type: 'gold', value: 100, description: '+100 Gold (Loyalty Reward)' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 15,
    displayFormat: '{current}/15 shops visited',
  },
  icon: 'coin_bag',
  tags: ['economic', 'shops'],
  points: 25,
  sortOrder: 2,
};

/** ACH_EC03: Sell 50 items */
export const ACH_WilySalesman: Achievement = {
  id: 'ach_wily_salesman',
  title: 'Wily Salesman',
  description:
    "Sold 50 items to merchants. You've got a silver tongue and a keen eye for value.",
  category: 'economic',
  rarity: 'common',
  unlockCondition: {
    type: 'sell_count',
    count: 50,
    description: 'Sell 50 items',
  },
  rewards: [
    { type: 'xp', value: 50, description: '+50 XP' },
    { type: 'gold', value: 50, description: '+50 Gold' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 50,
    displayFormat: '{current}/50 items sold',
  },
  icon: 'scales',
  tags: ['economic', 'selling'],
  points: 15,
  sortOrder: 3,
};

/** ACH_EC04: Complete all bounties */
export const ACH_BountyHunter: Achievement = {
  id: 'ach_bounty_hunter',
  title: 'Bounty Hunter',
  description:
    'Completed all available bounties. Justice pays well on the frontier.',
  category: 'economic',
  rarity: 'rare',
  unlockCondition: {
    type: 'bounty_complete',
    count: 10,
    description: 'Complete all 10 bounties',
  },
  rewards: [
    { type: 'xp', value: 200, description: '+200 XP' },
    { type: 'gold', value: 300, description: '+300 Gold' },
    { type: 'title', value: 'Bounty Hunter', description: 'Title: Bounty Hunter' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 10,
    displayFormat: '{current}/10 bounties completed',
  },
  icon: 'wanted_poster',
  tags: ['economic', 'bounty'],
  points: 40,
  sortOrder: 4,
};

/** ACH_EC05: Earn 5000 gold */
export const ACH_FrontierTycoon: Achievement = {
  id: 'ach_frontier_tycoon',
  title: 'Frontier Tycoon',
  description:
    'Earned 5000 gold total. Your wealth rivals the railroad barons.',
  category: 'economic',
  rarity: 'rare',
  unlockCondition: {
    type: 'gold_earned',
    count: 5000,
    description: 'Earn 5000 gold total',
  },
  rewards: [
    { type: 'xp', value: 250, description: '+250 XP' },
    { type: 'title', value: 'Frontier Tycoon', description: 'Title: Frontier Tycoon' },
    { type: 'cosmetic', value: 'golden_pocket_watch', description: 'Cosmetic: Golden Pocket Watch' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 5000,
    displayFormat: '{current}/5000 gold earned',
  },
  icon: 'gold_bars',
  tags: ['economic', 'wealth', 'legendary'],
  points: 50,
  sortOrder: 5,
};

/** ACH_EC06: First purchase */
export const ACH_FirstPurchase: Achievement = {
  id: 'ach_first_purchase',
  title: 'Open for Business',
  description:
    'Made your first purchase. The frontier economy welcomes you.',
  category: 'economic',
  rarity: 'common',
  unlockCondition: {
    type: 'gold_spent',
    count: 1,
    description: 'Make your first purchase',
  },
  rewards: [{ type: 'xp', value: 10, description: '+10 XP' }],
  hidden: false,
  icon: 'coin_single',
  tags: ['economic', 'first'],
  points: 5,
  sortOrder: 6,
};

// ============================================================================
// SOCIAL ACHIEVEMENTS (8)
// ============================================================================

/** ACH_SO01: Talk to all unique NPCs */
export const ACH_PeoplePerson: Achievement = {
  id: 'ach_people_person',
  title: 'People Person',
  description:
    'Spoke with all unique NPCs on the frontier. Everyone knows your name.',
  category: 'social',
  rarity: 'rare',
  unlockCondition: {
    type: 'talk_all',
    target: 'npcs',
    count: 23,
    description: 'Talk to all 23 unique NPCs',
  },
  rewards: [
    { type: 'xp', value: 200, description: '+200 XP' },
    { type: 'title', value: 'Social Butterfly', description: 'Title: Social Butterfly' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 23,
    displayFormat: '{current}/23 NPCs met',
  },
  icon: 'speech_bubbles',
  tags: ['social', 'npcs'],
  points: 40,
  sortOrder: 1,
};

/** ACH_SO02: Max reputation with Law faction */
export const ACH_LawAbiding: Achievement = {
  id: 'ach_law_abiding',
  title: 'Law Abiding',
  description:
    'Reached maximum reputation with the Law faction. The badge shines bright on you.',
  category: 'social',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'reputation_max',
    target: 'law',
    description: 'Reach max reputation with Law',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Lawman', description: 'Title: Honorary Lawman' },
    { type: 'item', value: 'deputy_badge', description: 'Item: Deputy Badge' },
  ],
  hidden: false,
  icon: 'badge_star',
  tags: ['social', 'faction', 'law'],
  points: 30,
  sortOrder: 2,
};

/** ACH_SO03: Max reputation with Outlaws faction */
export const ACH_Outlaw: Achievement = {
  id: 'ach_outlaw',
  title: 'Outlaw',
  description:
    "Reached maximum reputation with the Outlaws. You're one of them now.",
  category: 'social',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'reputation_max',
    target: 'outlaws',
    description: 'Reach max reputation with Outlaws',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Desperado', description: 'Title: Desperado' },
    { type: 'item', value: 'outlaw_mark', description: "Item: Outlaw's Mark" },
  ],
  hidden: false,
  icon: 'bandana',
  tags: ['social', 'faction', 'outlaws'],
  points: 30,
  sortOrder: 3,
};

/** ACH_SO04: Complete all side quests */
export const ACH_GoodSamaritan: Achievement = {
  id: 'ach_good_samaritan',
  title: 'Good Samaritan',
  description:
    "Completed all side quests. You never pass by someone in need.",
  category: 'social',
  rarity: 'rare',
  unlockCondition: {
    type: 'side_quest_count',
    count: 9,
    description: 'Complete all 9 side quests',
  },
  rewards: [
    { type: 'xp', value: 300, description: '+300 XP' },
    { type: 'gold', value: 200, description: '+200 Gold' },
    { type: 'title', value: 'Good Samaritan', description: 'Title: Good Samaritan' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 9,
    displayFormat: '{current}/9 side quests completed',
  },
  icon: 'heart_helping',
  tags: ['social', 'quests'],
  points: 50,
  sortOrder: 4,
};

/** ACH_SO05: Make a moral choice */
export const ACH_Crossroads: Achievement = {
  id: 'ach_crossroads',
  title: 'At a Crossroads',
  description:
    'Made your first major moral choice. The frontier tests your character.',
  category: 'social',
  rarity: 'common',
  unlockCondition: {
    type: 'moral_choice',
    count: 1,
    description: 'Make a moral choice in a quest',
  },
  rewards: [{ type: 'xp', value: 50, description: '+50 XP' }],
  hidden: false,
  icon: 'fork_road',
  tags: ['social', 'choices'],
  points: 15,
  sortOrder: 5,
};

/** ACH_SO06: Make all moral choices */
export const ACH_PathChosen: Achievement = {
  id: 'ach_path_chosen',
  title: 'Path Chosen',
  description:
    'Faced every moral dilemma on the frontier. Your choices define you.',
  category: 'social',
  rarity: 'rare',
  unlockCondition: {
    type: 'moral_choice',
    count: 5,
    description: 'Make all 5 major moral choices',
  },
  rewards: [
    { type: 'xp', value: 150, description: '+150 XP' },
    { type: 'title', value: 'Decisive', description: 'Title: The Decisive' },
  ],
  hidden: false,
  progress: {
    enabled: true,
    current: 0,
    max: 5,
    displayFormat: '{current}/5 moral choices made',
  },
  icon: 'scales_justice',
  tags: ['social', 'choices'],
  points: 35,
  sortOrder: 6,
};

/** ACH_SO07: Max reputation with Miners faction */
export const ACH_FriendOfMiners: Achievement = {
  id: 'ach_friend_of_miners',
  title: 'Friend of the Miners',
  description:
    'Reached maximum reputation with the Miners. They share their pickaxe with you.',
  category: 'social',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'reputation_max',
    target: 'miners',
    description: 'Reach max reputation with Miners',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Miner\'s Friend', description: "Title: Miner's Friend" },
    { type: 'item', value: 'lucky_pickaxe', description: 'Item: Lucky Pickaxe' },
  ],
  hidden: false,
  icon: 'pickaxe',
  tags: ['social', 'faction', 'miners'],
  points: 30,
  sortOrder: 7,
};

/** ACH_SO08: Max reputation with Ranchers faction */
export const ACH_Cattlehand: Achievement = {
  id: 'ach_cattlehand',
  title: 'Honorary Cattlehand',
  description:
    "Reached maximum reputation with the Ranchers. You're family now.",
  category: 'social',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'reputation_max',
    target: 'ranchers',
    description: 'Reach max reputation with Ranchers',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Cattlehand', description: 'Title: Honorary Cattlehand' },
    { type: 'item', value: 'branding_iron', description: 'Item: Branding Iron' },
  ],
  hidden: false,
  icon: 'lasso',
  tags: ['social', 'faction', 'ranchers'],
  points: 30,
  sortOrder: 8,
};

// ============================================================================
// SECRET ACHIEVEMENTS (5)
// ============================================================================

/** ACH_SE01: Find the hidden automaton graveyard */
export const ACH_RustingDreams: Achievement = {
  id: 'ach_rusting_dreams',
  title: 'Rusting Dreams',
  description:
    'Discovered the hidden automaton graveyard. Where do machines go when they die?',
  category: 'secret',
  rarity: 'rare',
  unlockCondition: {
    type: 'hidden_area',
    target: 'automaton_graveyard',
    description: 'Find the hidden automaton graveyard',
  },
  rewards: [
    { type: 'xp', value: 150, description: '+150 XP' },
    { type: 'gold', value: 200, description: '+200 Gold' },
    { type: 'item', value: 'ancient_gear', description: 'Item: Ancient Gear' },
  ],
  hidden: true,
  icon: 'gear_rusted',
  tags: ['secret', 'exploration', 'steampunk'],
  points: 40,
  sortOrder: 1,
};

/** ACH_SE02: Pet a coyote without fighting it */
export const ACH_BestFriend: Achievement = {
  id: 'ach_best_friend',
  title: "Coyote's Best Friend",
  description:
    "Somehow befriended a wild coyote. It's a dog-eat-dog world, but not for you.",
  category: 'secret',
  rarity: 'rare',
  unlockCondition: {
    type: 'special_action',
    target: 'pet_coyote',
    description: 'Pet a coyote without fighting it',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'title', value: 'Animal Whisperer', description: 'Title: Animal Whisperer' },
    { type: 'cosmetic', value: 'coyote_companion', description: 'Cosmetic: Coyote Companion' },
  ],
  hidden: true,
  icon: 'coyote_happy',
  tags: ['secret', 'easter_egg', 'wholesome'],
  points: 35,
  sortOrder: 2,
};

/** ACH_SE03: Find all wanted posters */
export const ACH_CollectorOfBounties: Achievement = {
  id: 'ach_collector_bounties',
  title: 'Collector of Bounties',
  description:
    'Found every wanted poster in the frontier. You know every outlaw by face.',
  category: 'secret',
  rarity: 'uncommon',
  unlockCondition: {
    type: 'collect_count',
    target: 'wanted_poster',
    count: 12,
    description: 'Collect all 12 wanted posters',
  },
  rewards: [
    { type: 'xp', value: 100, description: '+100 XP' },
    { type: 'gold', value: 150, description: '+150 Gold' },
  ],
  hidden: true,
  progress: {
    enabled: true,
    current: 0,
    max: 12,
    displayFormat: '{current}/12 wanted posters',
  },
  icon: 'poster_collection',
  tags: ['secret', 'collectible'],
  points: 30,
  sortOrder: 3,
};

/** ACH_SE04: Play poker with The Wanderer */
export const ACH_HighStakes: Achievement = {
  id: 'ach_high_stakes',
  title: 'High Stakes',
  description:
    "Played a game of cards with The Wanderer. They say they've never lost...",
  category: 'secret',
  rarity: 'rare',
  unlockCondition: {
    type: 'special_action',
    target: 'poker_wanderer',
    description: 'Play poker with The Wanderer',
  },
  rewards: [
    { type: 'xp', value: 75, description: '+75 XP' },
    { type: 'gold', value: 100, description: '+100 Gold' },
    { type: 'item', value: 'lucky_card', description: 'Item: Lucky Card' },
  ],
  hidden: true,
  icon: 'cards_poker',
  tags: ['secret', 'easter_egg', 'gambling'],
  points: 25,
  sortOrder: 4,
};

/** ACH_SE05: Dance on a grave at midnight */
export const ACH_DancingWithTheDead: Achievement = {
  id: 'ach_dancing_dead',
  title: 'Dancing with the Dead',
  description:
    'Danced on a grave at midnight. The spirits are... amused?',
  category: 'secret',
  rarity: 'legendary',
  unlockCondition: {
    type: 'special_action',
    target: 'grave_dance_midnight',
    description: 'Dance on a grave at exactly midnight',
  },
  rewards: [
    { type: 'xp', value: 200, description: '+200 XP' },
    { type: 'title', value: 'Gravedigger', description: 'Title: The Gravedigger' },
    { type: 'cosmetic', value: 'ghost_trail', description: 'Cosmetic: Ghost Trail Effect' },
  ],
  hidden: true,
  icon: 'ghost',
  tags: ['secret', 'easter_egg', 'supernatural'],
  points: 50,
  sortOrder: 5,
};

// ============================================================================
// ALL ACHIEVEMENTS COMBINED
// ============================================================================

export const STORY_ACHIEVEMENTS: Achievement[] = [
  ACH_NewInTown,
  ACH_TrailOfGold,
  ACH_DeepInTheMine,
  ACH_HonorAmongThieves,
  ACH_HomeOnTheRange,
  ACH_PiecesOfThePuzzle,
  ACH_RoadToSalvation,
  ACH_TruthRevealed,
  ACH_Reckoning,
  ACH_Redemption,
];

export const COMBAT_ACHIEVEMENTS: Achievement[] = [
  ACH_FirstBlood,
  ACH_BodyCount,
  ACH_Untouchable,
  ACH_KingSlayer,
  ACH_JusticeServed,
  ACH_SteelBreaker,
  ACH_JackOfAllTrades,
  ACH_LegendaryGunman,
];

export const EXPLORATION_ACHIEVEMENTS: Achievement[] = [
  ACH_Trailblazer,
  ACH_WellTraveled,
  ACH_Historian,
  ACH_SecretSeeker,
  ACH_LongRider,
  ACH_FreshOffTheCoach,
  ACH_Cartographer,
  ACH_JourneysEnd,
];

export const ECONOMIC_ACHIEVEMENTS: Achievement[] = [
  ACH_StrikingItRich,
  ACH_BigSpender,
  ACH_WilySalesman,
  ACH_BountyHunter,
  ACH_FrontierTycoon,
  ACH_FirstPurchase,
];

export const SOCIAL_ACHIEVEMENTS: Achievement[] = [
  ACH_PeoplePerson,
  ACH_LawAbiding,
  ACH_Outlaw,
  ACH_GoodSamaritan,
  ACH_Crossroads,
  ACH_PathChosen,
  ACH_FriendOfMiners,
  ACH_Cattlehand,
];

export const SECRET_ACHIEVEMENTS: Achievement[] = [
  ACH_RustingDreams,
  ACH_BestFriend,
  ACH_CollectorOfBounties,
  ACH_HighStakes,
  ACH_DancingWithTheDead,
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  ...STORY_ACHIEVEMENTS,
  ...COMBAT_ACHIEVEMENTS,
  ...EXPLORATION_ACHIEVEMENTS,
  ...ECONOMIC_ACHIEVEMENTS,
  ...SOCIAL_ACHIEVEMENTS,
  ...SECRET_ACHIEVEMENTS,
];

/** Achievement library indexed by ID */
export const ACHIEVEMENTS_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ALL_ACHIEVEMENTS.map((ach) => [ach.id, ach])
);

/** Achievements grouped by category */
export const ACHIEVEMENTS_BY_CATEGORY: Record<AchievementCategory, Achievement[]> = {
  story: STORY_ACHIEVEMENTS,
  combat: COMBAT_ACHIEVEMENTS,
  exploration: EXPLORATION_ACHIEVEMENTS,
  economic: ECONOMIC_ACHIEVEMENTS,
  social: SOCIAL_ACHIEVEMENTS,
  secret: SECRET_ACHIEVEMENTS,
};

/** Achievements grouped by rarity */
export const ACHIEVEMENTS_BY_RARITY: Record<AchievementRarity, Achievement[]> = {
  common: ALL_ACHIEVEMENTS.filter((a) => a.rarity === 'common'),
  uncommon: ALL_ACHIEVEMENTS.filter((a) => a.rarity === 'uncommon'),
  rare: ALL_ACHIEVEMENTS.filter((a) => a.rarity === 'rare'),
  legendary: ALL_ACHIEVEMENTS.filter((a) => a.rarity === 'legendary'),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get achievement by ID.
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS_BY_ID[id];
}

/**
 * Get all achievements in a category.
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS_BY_CATEGORY[category];
}

/**
 * Get all achievements of a specific rarity.
 */
export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ACHIEVEMENTS_BY_RARITY[rarity];
}

/**
 * Get all visible (non-hidden) achievements.
 */
export function getVisibleAchievements(): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => !a.hidden);
}

/**
 * Get all hidden achievements.
 */
export function getHiddenAchievements(): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => a.hidden);
}

/**
 * Get achievements by tag.
 */
export function getAchievementsByTag(tag: string): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => a.tags.includes(tag));
}

/**
 * Get total points available across all achievements.
 */
export function getTotalAvailablePoints(): number {
  return ALL_ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);
}

/**
 * Get points for a specific category.
 */
export function getCategoryPoints(category: AchievementCategory): number {
  return ACHIEVEMENTS_BY_CATEGORY[category].reduce((sum, a) => sum + a.points, 0);
}

/**
 * Calculate player's achievement score from their unlock states.
 */
export function calculatePlayerScore(states: PlayerAchievementState[]): number {
  return states
    .filter((s) => s.unlocked)
    .reduce((sum, s) => {
      const achievement = ACHIEVEMENTS_BY_ID[s.achievementId];
      return sum + (achievement?.points ?? 0);
    }, 0);
}

/**
 * Get completion percentage for a category.
 */
export function getCategoryCompletion(
  category: AchievementCategory,
  states: PlayerAchievementState[]
): number {
  const categoryAchievements = ACHIEVEMENTS_BY_CATEGORY[category];
  const unlockedCount = states.filter(
    (s) => s.unlocked && categoryAchievements.some((a) => a.id === s.achievementId)
  ).length;
  return Math.round((unlockedCount / categoryAchievements.length) * 100);
}

/**
 * Get overall completion percentage.
 */
export function getOverallCompletion(states: PlayerAchievementState[]): number {
  const unlockedCount = states.filter((s) => s.unlocked).length;
  return Math.round((unlockedCount / ALL_ACHIEVEMENTS.length) * 100);
}

/**
 * Create a default player achievement state.
 */
export function createDefaultAchievementState(achievementId: string): PlayerAchievementState {
  return {
    achievementId,
    unlocked: false,
    progress: 0,
    notified: false,
  };
}

/**
 * Create all achievement states for a new player.
 */
export function createAllAchievementStates(): PlayerAchievementState[] {
  return ALL_ACHIEVEMENTS.map((a) => createDefaultAchievementState(a.id));
}

/**
 * Get the display color for achievement rarity.
 */
export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'legendary':
      return '#FFD700'; // gold
    case 'rare':
      return '#9B59B6'; // purple
    case 'uncommon':
      return '#27AE60'; // green
    default:
      return '#95A5A6'; // gray
  }
}

/**
 * Get a display-friendly category name.
 */
export function getCategoryDisplayName(category: AchievementCategory): string {
  const names: Record<AchievementCategory, string> = {
    story: 'Story',
    combat: 'Combat',
    exploration: 'Exploration',
    economic: 'Economic',
    social: 'Social',
    secret: 'Secret',
  };
  return names[category];
}

/**
 * Validate an achievement definition.
 */
export function validateAchievement(data: unknown): Achievement {
  return AchievementSchema.parse(data);
}

/**
 * Validate a player achievement state.
 */
export function validatePlayerAchievementState(data: unknown): PlayerAchievementState {
  return PlayerAchievementStateSchema.parse(data);
}

// ============================================================================
// STATISTICS
// ============================================================================

export const ACHIEVEMENT_STATS = {
  total: ALL_ACHIEVEMENTS.length,
  byCategory: {
    story: STORY_ACHIEVEMENTS.length,
    combat: COMBAT_ACHIEVEMENTS.length,
    exploration: EXPLORATION_ACHIEVEMENTS.length,
    economic: ECONOMIC_ACHIEVEMENTS.length,
    social: SOCIAL_ACHIEVEMENTS.length,
    secret: SECRET_ACHIEVEMENTS.length,
  },
  byRarity: {
    common: ACHIEVEMENTS_BY_RARITY.common.length,
    uncommon: ACHIEVEMENTS_BY_RARITY.uncommon.length,
    rare: ACHIEVEMENTS_BY_RARITY.rare.length,
    legendary: ACHIEVEMENTS_BY_RARITY.legendary.length,
  },
  totalPoints: getTotalAvailablePoints(),
  hidden: getHiddenAchievements().length,
  visible: getVisibleAchievements().length,
};

export const ACHIEVEMENT_SCHEMA_VERSION = '1.0.0';
