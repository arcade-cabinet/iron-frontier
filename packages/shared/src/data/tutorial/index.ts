/**
 * Iron Frontier - Tutorial & Onboarding System
 *
 * Comprehensive tutorial system for new players including:
 * - Opening cinematic text (story hook)
 * - Step-by-step tutorial progression
 * - Tutorial quest with NPC mentor
 * - Contextual help tips
 * - Loading screen tips
 *
 * Design Philosophy:
 * - Immersive and in-character (not meta/game-y)
 * - Narrative-driven, not just mechanical instructions
 * - Respects player agency with skip option
 */

import { z } from 'zod';

// ============================================================================
// SCHEMAS
// ============================================================================

/**
 * Tutorial step trigger conditions
 */
export const TutorialTriggerSchema = z.enum([
  'game_start', // When game first loads
  'first_move', // First player movement input
  'first_npc_nearby', // When player approaches an NPC
  'inventory_opened', // When inventory is first opened
  'first_item_pickup', // When player picks up first item
  'first_combat', // When combat begins
  'first_damage', // When player takes damage
  'first_quest', // When first quest is accepted
  'first_quest_complete', // When any quest objective completes
  'first_level_up', // When player levels up
  'first_shop', // When player opens a shop
  'map_opened', // When map/travel menu opens
  'low_health', // When health drops below 25%
  'manual', // Triggered by game logic
]);
export type TutorialTrigger = z.infer<typeof TutorialTriggerSchema>;

/**
 * A single tutorial step definition
 */
export const TutorialStepSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display title (in-world phrasing) */
  title: z.string(),

  /** Main instruction text (narrative style) */
  text: z.string(),

  /** What triggers this step to show */
  trigger: TutorialTriggerSchema,

  /** Order within the tutorial sequence (lower = earlier) */
  order: z.number().int().min(0),

  /** Whether this step is required to complete tutorial */
  required: z.boolean().default(true),

  /** Whether to pause game while showing */
  pauseGame: z.boolean().default(false),

  /** Highlight UI element (CSS selector or element ID) */
  highlightElement: z.string().optional(),

  /** Position hint for the tutorial popup */
  position: z.enum(['top', 'bottom', 'left', 'right', 'center']).default('bottom'),

  /** Action to complete this step (optional - some auto-complete) */
  completionAction: z.string().optional(),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type TutorialStep = z.infer<typeof TutorialStepSchema>;

/**
 * Tutorial quest definition (extends normal quest with tutorial metadata)
 */
export const TutorialQuestSchema = z.object({
  /** Quest ID reference */
  questId: z.string(),

  /** NPC mentor who guides the player */
  mentorNpcId: z.string(),

  /** Mentor dialogue snippets keyed by tutorial step */
  mentorDialogue: z.record(z.string(), z.string()),

  /** Items rewarded at the end */
  rewards: z.object({
    gold: z.number().int().min(0).default(0),
    xp: z.number().int().min(0).default(0),
    items: z
      .array(
        z.object({
          itemId: z.string(),
          quantity: z.number().int().min(1).default(1),
        })
      )
      .default([]),
  }),

  /** Whether completing this unlocks the full game */
  unlocksGame: z.boolean().default(true),
});
export type TutorialQuest = z.infer<typeof TutorialQuestSchema>;

/**
 * Help tip trigger context
 */
export const HelpTipContextSchema = z.enum([
  'combat_start', // When combat begins
  'low_health', // Health below threshold
  'level_up', // Player leveled up
  'quest_complete', // Quest objective done
  'first_kill', // First enemy defeated
  'first_purchase', // First shop purchase
  'inventory_full', // Inventory at capacity
  'encumbered', // Carrying too much weight
  'night_time', // When night falls
  'weather_change', // Weather shifts
  'new_area', // Entering new location
  'rare_item', // Found rare item
  'npc_hostile', // NPC becomes hostile
  'quest_failed', // Quest failed
  'death', // Player died
  'stamina_low', // Stamina depleted
  'ammo_low', // Low on ammunition
  'weapon_broken', // Weapon condition critical
  'faction_change', // Reputation changed
  'secret_found', // Secret discovered
]);
export type HelpTipContext = z.infer<typeof HelpTipContextSchema>;

/**
 * A contextual help tip shown during gameplay
 */
export const HelpTipSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Context that triggers this tip */
  context: HelpTipContextSchema,

  /** Tip text (in-character, from narrator perspective) */
  text: z.string(),

  /** Priority (higher = shown first if multiple trigger) */
  priority: z.number().int().min(0).default(0),

  /** How many times to show this tip (0 = unlimited) */
  maxShows: z.number().int().min(0).default(1),

  /** Minimum player level to show (0 = any) */
  minLevel: z.number().int().min(0).default(0),

  /** Maximum player level to show (0 = any) */
  maxLevel: z.number().int().min(0).default(0),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type HelpTip = z.infer<typeof HelpTipSchema>;

/**
 * Loading screen tip definition
 */
export const LoadingTipSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Tip text (narrative style) */
  text: z.string(),

  /** Category for theming */
  category: z.enum(['gameplay', 'lore', 'strategy', 'survival', 'exploration']),

  /** Weight for random selection (higher = more likely) */
  weight: z.number().min(0).default(1),

  /** Minimum progress through game to show (0-1) */
  minProgress: z.number().min(0).max(1).default(0),

  /** Maximum progress through game to show (0-1, 0 = any) */
  maxProgress: z.number().min(0).max(1).default(0),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type LoadingTip = z.infer<typeof LoadingTipSchema>;

/**
 * Tutorial state tracking (persisted in game state)
 */
export const TutorialStateSchema = z.object({
  /** Whether tutorial is active */
  isActive: z.boolean().default(true),

  /** Whether tutorial was skipped */
  wasSkipped: z.boolean().default(false),

  /** Completed tutorial step IDs */
  completedSteps: z.array(z.string()).default([]),

  /** Current step ID (null if not in a step) */
  currentStepId: z.string().nullable().default(null),

  /** Help tips that have been shown (id -> show count) */
  shownTips: z.record(z.string(), z.number().int()).default({}),

  /** Whether opening cinematic has been viewed */
  cinematicViewed: z.boolean().default(false),

  /** Timestamp when tutorial started */
  startedAt: z.number().int().default(0),

  /** Timestamp when tutorial completed */
  completedAt: z.number().int().nullable().default(null),
});
export type TutorialState = z.infer<typeof TutorialStateSchema>;

// ============================================================================
// OPENING CINEMATIC TEXT
// ============================================================================

/**
 * Opening cinematic text - the story hook for new players.
 * Each paragraph is displayed sequentially with dramatic pacing.
 */
export const OPENING_CINEMATIC = {
  id: 'opening_cinematic',
  title: 'The Letter',
  paragraphs: [
    `The letter arrived three weeks ago, crumpled and stained from its journey across the territories. You recognized the handwriting before you even broke the seal - your uncle Ezekiel, a man you hadn't seen since childhood. A man your family never spoke of, except in hushed tones and half-finished sentences.`,

    `"Come West," he wrote. "I've found something in these mountains - something that could change everything. The claim is yours now. I'm leaving it all to you." The rest of the letter was illegible, water-damaged beyond recognition. But attached was a deed, a map, and a one-way ticket to a place called Frontier's Edge.`,

    `That was before you learned Ezekiel had been dead for two months when the letter finally reached you. Before you discovered that half the frontier was looking for whatever he'd found. Before you realized that some secrets in this land are worth killing for - and some folks reckon you might know more than you're letting on.`,

    `Now the stagecoach rattles to a stop at the edge of a dusty town, and the driver doesn't even look back as he tosses your bag into the dirt. The wind carries the scent of sage and gunpowder. Somewhere in the distance, a church bell tolls. This is Frontier's Edge - the end of the line, and the beginning of everything else. Whatever Ezekiel found, whatever brought you here... it's time to find out.`,
  ],
  epilogue: `Welcome to the Iron Frontier.`,
} as const;

// ============================================================================
// TUTORIAL STEPS (10 Steps)
// ============================================================================

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'step_movement',
    title: 'Finding Your Footing',
    text: `The ground is solid beneath your boots, but unfamiliar. Take a moment to get your bearings - this frontier won't wait for those who stand still. Move with purpose, stranger. Walk the dusty streets and learn their paths.`,
    trigger: 'game_start',
    order: 1,
    required: true,
    pauseGame: false,
    position: 'bottom',
    completionAction: 'player_moved',
    tags: ['movement', 'basic'],
  },
  {
    id: 'step_npc_interaction',
    title: 'Making Acquaintances',
    text: `Folk out here size you up quick. That person ahead might have information, goods, or trouble - only one way to find out. Approach them and strike up a conversation. In the frontier, your reputation is built one encounter at a time.`,
    trigger: 'first_npc_nearby',
    order: 2,
    required: true,
    pauseGame: false,
    highlightElement: 'npc-interaction-prompt',
    position: 'top',
    completionAction: 'npc_talked',
    tags: ['npc', 'dialogue', 'basic'],
  },
  {
    id: 'step_inventory',
    title: 'Taking Stock',
    text: `A wise traveler knows what they're carrying. Your satchel holds your worldly possessions - supplies, tools, maybe a keepsake or two. Open it up and see what you've got to work with. Every item might be the difference between life and death out here.`,
    trigger: 'first_item_pickup',
    order: 3,
    required: true,
    pauseGame: false,
    highlightElement: 'inventory-button',
    position: 'right',
    completionAction: 'inventory_opened',
    tags: ['inventory', 'ui', 'basic'],
  },
  {
    id: 'step_using_items',
    title: 'Frontier Medicine',
    text: `That tincture in your pack? Could save your life someday. Supplies are meant to be used, not hoarded. Select an item and put it to work when the time is right - whether that's a healing salve for your wounds or a stick of dynamite for your problems.`,
    trigger: 'inventory_opened',
    order: 4,
    required: true,
    pauseGame: false,
    position: 'center',
    completionAction: 'item_used',
    tags: ['inventory', 'items', 'basic'],
  },
  {
    id: 'step_equipment',
    title: 'Armed and Ready',
    text: `A six-shooter on your hip means something in these parts. Gear yourself proper - equip your weapons and armor from your inventory. The frontier doesn't care about fair fights, only survivors. Make sure you're prepared for whatever comes your way.`,
    trigger: 'manual',
    order: 5,
    required: true,
    pauseGame: false,
    highlightElement: 'equipment-panel',
    position: 'left',
    completionAction: 'item_equipped',
    tags: ['equipment', 'combat', 'basic'],
  },
  {
    id: 'step_combat_basics',
    title: 'When Words Fail',
    text: `Some disputes can't be settled with talk. When lead starts flying, keep your wits about you. Take aim, find cover, and make every shot count. Combat is turn-based out here - think before you act, and don't waste your action points on foolishness.`,
    trigger: 'first_combat',
    order: 6,
    required: true,
    pauseGame: true,
    position: 'top',
    completionAction: 'combat_won',
    tags: ['combat', 'essential'],
  },
  {
    id: 'step_quest_log',
    title: 'Keeping Track',
    text: `The frontier is full of folks who need help and problems that need solving. Your journal keeps track of what you've promised and what still needs doing. Check it often - opportunities have a way of slipping through your fingers if you're not paying attention.`,
    trigger: 'first_quest',
    order: 7,
    required: true,
    pauseGame: false,
    highlightElement: 'quest-log-button',
    position: 'right',
    completionAction: 'quest_log_opened',
    tags: ['quests', 'ui', 'basic'],
  },
  {
    id: 'step_map_navigation',
    title: 'Reading the Land',
    text: `The territory stretches far beyond this town. Your map shows the roads and trails connecting settlements across the frontier. Study it well - knowing where you're going is half the battle. Some paths are safer than others, and the wilderness holds dangers for the unprepared.`,
    trigger: 'map_opened',
    order: 8,
    required: true,
    pauseGame: false,
    highlightElement: 'world-map',
    position: 'center',
    completionAction: 'map_studied',
    tags: ['navigation', 'travel', 'basic'],
  },
  {
    id: 'step_saving',
    title: 'Recording Your Journey',
    text: `The frontier is unforgiving. Your progress is preserved as you travel, but it's wise to rest at safe locations when you can. Your story writes itself as you live it - but even the best tales have chapters worth revisiting.`,
    trigger: 'manual',
    order: 9,
    required: false,
    pauseGame: false,
    position: 'bottom',
    completionAction: 'game_saved',
    tags: ['saving', 'system'],
  },
  {
    id: 'step_shop_interaction',
    title: 'Commerce on the Frontier',
    text: `Gold talks louder than guns sometimes. The merchants here deal in goods honest and otherwise. Browse their wares, haggle if you dare, and remember - a fair trade benefits both parties. What you sell today might be what saves you tomorrow.`,
    trigger: 'first_shop',
    order: 10,
    required: true,
    pauseGame: false,
    highlightElement: 'shop-panel',
    position: 'center',
    completionAction: 'shop_transaction',
    tags: ['shops', 'economy', 'basic'],
  },
];

// ============================================================================
// TUTORIAL QUEST: "First Steps"
// ============================================================================

/**
 * Tutorial quest definition.
 * This quest guides players through the basics while establishing
 * the game's narrative tone.
 */
export const TUTORIAL_QUEST: TutorialQuest = {
  questId: 'quest_first_steps',
  mentorNpcId: 'npc_stable_hand_eli',
  mentorDialogue: {
    greeting: `Well now, ain't every day we get newcomers 'round here. Name's Eli - I tend the horses and keep my ears open. You look a mite lost, friend. Just stepped off the stage, didn't ya?`,
    step_movement: `That's it, get a feel for the place. Town ain't big, but there's more here than meets the eye. Walk around, see what catches your attention.`,
    step_npc: `Folks here are friendly enough, long as you don't give 'em reason not to be. Sheriff Cole keeps the peace. Martha runs the general store - fair prices, mostly. Talk to 'em, learn what's what.`,
    step_inventory: `Always good to know what you're carrying. Check your belongings regular-like. Never know when something useful might save your hide.`,
    step_equipment: `You'll want to be armed out here. Not saying there's trouble, but... well, there's always trouble somewhere. Get yourself properly outfitted.`,
    step_quest: `Sheriff's always looking for capable folk. Might have some work for you if you're willing. Check with him when you've got your bearings.`,
    step_complete: `You're getting the hang of this place. Reckon you'll do fine out here, long as you keep your wits about you. Good luck, stranger. And... be careful what you dig up. Some things are buried for a reason.`,
  },
  rewards: {
    gold: 25,
    xp: 50,
    items: [
      { itemId: 'basic_revolver', quantity: 1 },
      { itemId: 'leather_vest', quantity: 1 },
      { itemId: 'health_tonic', quantity: 3 },
      { itemId: 'trail_rations', quantity: 5 },
    ],
  },
  unlocksGame: true,
};

/**
 * Mentor NPC definition for tutorial
 */
export const TUTORIAL_MENTOR_NPC = {
  id: 'npc_stable_hand_eli',
  name: 'Eli Tucker',
  title: 'Stable Hand',
  description: `A weathered man in his fifties with kind eyes and calloused hands. He moves with the careful patience of someone who's spent a lifetime around horses and hard work.`,
  location: 'frontiers_edge_stable',
  dialogueTreeId: 'dialogue_eli_tutorial',
};

// ============================================================================
// CONTEXTUAL HELP TIPS (20 Tips)
// ============================================================================

export const HELP_TIPS: HelpTip[] = [
  // Combat Tips
  {
    id: 'tip_first_combat',
    context: 'combat_start',
    text: `Steady your nerves. Combat here is methodical - each action costs points, and rushing leads to mistakes. Survey the field, plan your moves, and strike when the moment's right.`,
    priority: 10,
    maxShows: 1,
    minLevel: 0,
    maxLevel: 2,
    tags: ['combat', 'beginner'],
  },
  {
    id: 'tip_low_health_warning',
    context: 'low_health',
    text: `You're bleeding bad, partner. Find cover, use a healing item, or consider a tactical retreat. Dead heroes don't finish their quests.`,
    priority: 9,
    maxShows: 3,
    minLevel: 0,
    maxLevel: 0,
    tags: ['combat', 'survival'],
  },
  {
    id: 'tip_first_kill',
    context: 'first_kill',
    text: `Enemy down. Search the body - folks in the frontier often carry valuables, ammunition, or clues worth finding. Don't let sentiment slow you.`,
    priority: 7,
    maxShows: 1,
    minLevel: 0,
    maxLevel: 3,
    tags: ['combat', 'loot'],
  },

  // Level & Progression Tips
  {
    id: 'tip_level_up',
    context: 'level_up',
    text: `Experience has made you stronger. You've earned the right to improve yourself - your health increases, and new opportunities may open. The frontier rewards those who survive it.`,
    priority: 8,
    maxShows: 1,
    minLevel: 1,
    maxLevel: 2,
    tags: ['progression', 'milestone'],
  },
  {
    id: 'tip_quest_complete',
    context: 'quest_complete',
    text: `Objective accomplished. Your journal updates with your progress. Completing tasks builds your reputation - and reputation opens doors in these parts.`,
    priority: 6,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 3,
    tags: ['quests', 'progression'],
  },

  // Economy Tips
  {
    id: 'tip_first_purchase',
    context: 'first_purchase',
    text: `Smart purchase. Merchants remember their customers - treat them fair and they'll return the favor. Build relationships with traders and you'll find better deals down the road.`,
    priority: 5,
    maxShows: 1,
    minLevel: 0,
    maxLevel: 0,
    tags: ['economy', 'shops'],
  },
  {
    id: 'tip_inventory_full',
    context: 'inventory_full',
    text: `Your pack's bursting at the seams. Time to decide what's worth keeping. Sell what you don't need, drop what's worthless, or find storage. A burdened traveler is a slow target.`,
    priority: 7,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 0,
    tags: ['inventory', 'management'],
  },
  {
    id: 'tip_encumbered',
    context: 'encumbered',
    text: `That weight's slowing you down. You're carrying more than advisable - your movement will suffer, and running from trouble becomes harder. Lighten your load or pay the price.`,
    priority: 8,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 0,
    tags: ['inventory', 'movement'],
  },

  // World & Exploration Tips
  {
    id: 'tip_night_time',
    context: 'night_time',
    text: `Darkness falls on the frontier. Night brings different dangers - predators hunt, outlaws move, and the unwary become prey. Consider finding shelter or preparing for what lurks in shadow.`,
    priority: 4,
    maxShows: 1,
    minLevel: 0,
    maxLevel: 0,
    tags: ['world', 'time'],
  },
  {
    id: 'tip_weather_change',
    context: 'weather_change',
    text: `Weather's turning. The frontier's moods are fickle - storms can reduce visibility, dust clouds obscure threats, and rain turns trails to mud. Adapt or suffer.`,
    priority: 3,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 0,
    tags: ['world', 'weather'],
  },
  {
    id: 'tip_new_area',
    context: 'new_area',
    text: `New territory. Every location has its secrets - talk to locals, explore thoroughly, and keep your eyes open. First impressions matter, but so does what's hidden beneath them.`,
    priority: 4,
    maxShows: 3,
    minLevel: 0,
    maxLevel: 0,
    tags: ['exploration', 'discovery'],
  },
  {
    id: 'tip_rare_item',
    context: 'rare_item',
    text: `That's no common find. Rare items are exactly that - rare. Consider carefully whether to use it, sell it, or save it. Some treasures are worth more than their weight in gold.`,
    priority: 6,
    maxShows: 3,
    minLevel: 0,
    maxLevel: 0,
    tags: ['items', 'loot'],
  },

  // Danger Tips
  {
    id: 'tip_npc_hostile',
    context: 'npc_hostile',
    text: `You've made an enemy. Some bridges, once burned, stay burned. Watch your back - grudges last long in the frontier, and not everyone settles scores with words.`,
    priority: 7,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 0,
    tags: ['social', 'danger'],
  },
  {
    id: 'tip_quest_failed',
    context: 'quest_failed',
    text: `That opportunity's closed now. Not every path leads where you hoped. Learn from the failure and move forward - the frontier has no shortage of second chances for those willing to take them.`,
    priority: 5,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 0,
    tags: ['quests', 'failure'],
  },
  {
    id: 'tip_death',
    context: 'death',
    text: `The frontier claimed another. But death isn't the end of your story - not yet. Rise again, learn from your mistakes, and remember: the wise learn from failure, the foolish repeat it.`,
    priority: 10,
    maxShows: 0,
    minLevel: 0,
    maxLevel: 0,
    tags: ['death', 'important'],
  },

  // Resource Tips
  {
    id: 'tip_stamina_low',
    context: 'stamina_low',
    text: `You're running on fumes. Rest when you can, eat to restore your strength. A tired body makes poor decisions, and the frontier punishes weakness.`,
    priority: 6,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 0,
    tags: ['survival', 'stamina'],
  },
  {
    id: 'tip_ammo_low',
    context: 'ammo_low',
    text: `Ammunition's running low. Make every shot count, or consider a tactical withdrawal. A gun without bullets is just an expensive club.`,
    priority: 7,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 0,
    tags: ['combat', 'resources'],
  },
  {
    id: 'tip_weapon_broken',
    context: 'weapon_broken',
    text: `That weapon's seen better days. Equipment degrades with use - find a blacksmith or gunsmith to repair it before it fails you at the worst moment.`,
    priority: 8,
    maxShows: 2,
    minLevel: 0,
    maxLevel: 0,
    tags: ['equipment', 'maintenance'],
  },

  // Social Tips
  {
    id: 'tip_faction_change',
    context: 'faction_change',
    text: `Your standing has shifted. Actions have consequences out here - helping one group might anger another. Choose your allies carefully; not everyone can be satisfied.`,
    priority: 5,
    maxShows: 3,
    minLevel: 0,
    maxLevel: 0,
    tags: ['factions', 'social'],
  },
  {
    id: 'tip_secret_found',
    context: 'secret_found',
    text: `You've uncovered something hidden. The frontier is full of buried truths - some profitable, some dangerous, most a bit of both. Decide wisely what to do with your discovery.`,
    priority: 4,
    maxShows: 5,
    minLevel: 0,
    maxLevel: 0,
    tags: ['exploration', 'secrets'],
  },
];

// ============================================================================
// LOADING SCREEN TIPS (15 Tips)
// ============================================================================

export const LOADING_TIPS: LoadingTip[] = [
  // Gameplay Tips
  {
    id: 'load_combat_cover',
    text: `In a firefight, a rock between you and the bullet is worth more than a fancy gun. Use the terrain to your advantage.`,
    category: 'gameplay',
    weight: 1,
    minProgress: 0,
    maxProgress: 0,
    tags: ['combat'],
  },
  {
    id: 'load_save_resources',
    text: `The frontier doesn't replenish itself. Ammunition, medicine, and food are precious - use them wisely, and always keep reserves for emergencies.`,
    category: 'strategy',
    weight: 1,
    minProgress: 0,
    maxProgress: 0.5,
    tags: ['resources'],
  },
  {
    id: 'load_reputation_matters',
    text: `How folk see you shapes how they treat you. Your reputation precedes you - make sure it opens doors rather than closing them.`,
    category: 'gameplay',
    weight: 1,
    minProgress: 0,
    maxProgress: 0,
    tags: ['social'],
  },

  // Lore Tips
  {
    id: 'load_ivrc_history',
    text: `The Iron Valley Rail Company built this territory - their tracks connect everything, and their influence runs deeper than the iron rails themselves.`,
    category: 'lore',
    weight: 1,
    minProgress: 0.1,
    maxProgress: 0,
    tags: ['history', 'faction'],
  },
  {
    id: 'load_old_ones',
    text: `The natives spoke of old things sleeping beneath these mountains, long before the prospectors came. Some say they weren't speaking in metaphor.`,
    category: 'lore',
    weight: 0.8,
    minProgress: 0.3,
    maxProgress: 0,
    tags: ['mystery', 'history'],
  },
  {
    id: 'load_frontier_saying',
    text: `"Trust is earned, bullets are cheap, and the desert keeps its secrets." - Old frontier saying`,
    category: 'lore',
    weight: 1,
    minProgress: 0,
    maxProgress: 0,
    tags: ['flavor'],
  },

  // Strategy Tips
  {
    id: 'load_know_enemies',
    text: `Study your enemies. Bandits fight different from wildlife, and automatons different still. What works against one may fail against another.`,
    category: 'strategy',
    weight: 1,
    minProgress: 0.1,
    maxProgress: 0,
    tags: ['combat', 'enemies'],
  },
  {
    id: 'load_multiple_paths',
    text: `Most problems have more than one solution. Violence is quick but costly; diplomacy is slow but preserving. Choose the approach that fits your situation.`,
    category: 'strategy',
    weight: 1,
    minProgress: 0.2,
    maxProgress: 0,
    tags: ['choices'],
  },
  {
    id: 'load_preparation',
    text: `A successful journey begins before you leave. Stock up on supplies, repair your equipment, and gather information about your destination.`,
    category: 'strategy',
    weight: 1,
    minProgress: 0,
    maxProgress: 0.7,
    tags: ['travel', 'preparation'],
  },

  // Survival Tips
  {
    id: 'load_weather_survival',
    text: `The frontier's weather can kill as surely as any bullet. Dust storms blind, cold saps strength, and heat exhausts. Dress appropriately and seek shelter when needed.`,
    category: 'survival',
    weight: 1,
    minProgress: 0,
    maxProgress: 0,
    tags: ['weather', 'environment'],
  },
  {
    id: 'load_night_dangers',
    text: `Night brings out different threats. Predators hunt in darkness, and outlaws prefer to work unseen. Travel by day when you can, or carry light and stay alert.`,
    category: 'survival',
    weight: 1,
    minProgress: 0,
    maxProgress: 0,
    tags: ['time', 'danger'],
  },
  {
    id: 'load_food_water',
    text: `An empty belly clouds judgment. Keep trail rations handy, and never pass a water source without filling your canteen.`,
    category: 'survival',
    weight: 1,
    minProgress: 0,
    maxProgress: 0.5,
    tags: ['resources', 'food'],
  },

  // Exploration Tips
  {
    id: 'load_off_beaten_path',
    text: `The main trails are safe but well-traveled. Venture off the beaten path and you might find treasure - or trouble. Often both.`,
    category: 'exploration',
    weight: 1,
    minProgress: 0.1,
    maxProgress: 0,
    tags: ['exploration', 'risk'],
  },
  {
    id: 'load_talk_to_everyone',
    text: `Every person has a story, and every story might contain a clue. The quiet drunk in the corner might know more than the loudest braggart at the bar.`,
    category: 'exploration',
    weight: 1,
    minProgress: 0,
    maxProgress: 0,
    tags: ['npcs', 'information'],
  },
  {
    id: 'load_return_visits',
    text: `Settlements change over time. New faces arrive, old ones depart, and circumstances shift. Return to places you've been - there may be new opportunities waiting.`,
    category: 'exploration',
    weight: 1,
    minProgress: 0.3,
    maxProgress: 0,
    tags: ['exploration', 'towns'],
  },
];

// ============================================================================
// STATE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Create initial tutorial state
 */
export function createTutorialState(): TutorialState {
  return {
    isActive: true,
    wasSkipped: false,
    completedSteps: [],
    currentStepId: null,
    shownTips: {},
    cinematicViewed: false,
    startedAt: Date.now(),
    completedAt: null,
  };
}

/**
 * Check if a tutorial step is completed
 */
export function isStepCompleted(state: TutorialState, stepId: string): boolean {
  return state.completedSteps.includes(stepId);
}

/**
 * Check if all required tutorial steps are completed
 */
export function isTutorialComplete(state: TutorialState): boolean {
  if (state.wasSkipped) return true;

  const requiredSteps = TUTORIAL_STEPS.filter((s) => s.required);
  return requiredSteps.every((step) => state.completedSteps.includes(step.id));
}

/**
 * Get the next uncompleted tutorial step
 */
export function getNextTutorialStep(state: TutorialState): TutorialStep | null {
  if (!state.isActive || state.wasSkipped) return null;

  const sortedSteps = [...TUTORIAL_STEPS].sort((a, b) => a.order - b.order);
  return sortedSteps.find((step) => !state.completedSteps.includes(step.id)) ?? null;
}

/**
 * Get a tutorial step that matches a trigger
 */
export function getTutorialStepByTrigger(
  state: TutorialState,
  trigger: TutorialTrigger
): TutorialStep | null {
  if (!state.isActive || state.wasSkipped) return null;

  return (
    TUTORIAL_STEPS.find(
      (step) => step.trigger === trigger && !state.completedSteps.includes(step.id)
    ) ?? null
  );
}

/**
 * Complete a tutorial step
 */
export function completeTutorialStep(state: TutorialState, stepId: string): TutorialState {
  if (state.completedSteps.includes(stepId)) return state;

  const newState = {
    ...state,
    completedSteps: [...state.completedSteps, stepId],
    currentStepId: null,
  };

  // Check if tutorial is now complete
  if (isTutorialComplete(newState)) {
    newState.completedAt = Date.now();
    newState.isActive = false;
  }

  return newState;
}

/**
 * Skip the tutorial entirely
 */
export function skipTutorial(state: TutorialState): TutorialState {
  return {
    ...state,
    wasSkipped: true,
    isActive: false,
    completedAt: Date.now(),
  };
}

/**
 * Mark cinematic as viewed
 */
export function markCinematicViewed(state: TutorialState): TutorialState {
  return {
    ...state,
    cinematicViewed: true,
  };
}

/**
 * Check if a help tip should be shown
 */
export function shouldShowHelpTip(
  state: TutorialState,
  tip: HelpTip,
  playerLevel: number
): boolean {
  // Check max show count
  const showCount = state.shownTips[tip.id] ?? 0;
  if (tip.maxShows > 0 && showCount >= tip.maxShows) {
    return false;
  }

  // Check level requirements
  if (tip.minLevel > 0 && playerLevel < tip.minLevel) {
    return false;
  }
  if (tip.maxLevel > 0 && playerLevel > tip.maxLevel) {
    return false;
  }

  return true;
}

/**
 * Get help tip for a context
 */
export function getHelpTipForContext(
  state: TutorialState,
  context: HelpTipContext,
  playerLevel: number
): HelpTip | null {
  const eligibleTips = HELP_TIPS.filter(
    (tip) => tip.context === context && shouldShowHelpTip(state, tip, playerLevel)
  ).sort((a, b) => b.priority - a.priority);

  return eligibleTips[0] ?? null;
}

/**
 * Mark a help tip as shown
 */
export function markHelpTipShown(state: TutorialState, tipId: string): TutorialState {
  return {
    ...state,
    shownTips: {
      ...state.shownTips,
      [tipId]: (state.shownTips[tipId] ?? 0) + 1,
    },
  };
}

/**
 * Get a random loading tip based on game progress
 */
export function getRandomLoadingTip(progress: number = 0, seed?: number): LoadingTip {
  // Filter tips by progress range
  const eligibleTips = LOADING_TIPS.filter((tip) => {
    if (tip.minProgress > progress) return false;
    if (tip.maxProgress > 0 && progress > tip.maxProgress) return false;
    return true;
  });

  if (eligibleTips.length === 0) {
    // Fallback to any tip
    return LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
  }

  // Weighted random selection
  const totalWeight = eligibleTips.reduce((sum, tip) => sum + tip.weight, 0);
  let random = seed !== undefined ? (seed % 1000) / 1000 : Math.random();
  random *= totalWeight;

  let cumulative = 0;
  for (const tip of eligibleTips) {
    cumulative += tip.weight;
    if (random <= cumulative) {
      return tip;
    }
  }

  return eligibleTips[eligibleTips.length - 1];
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateTutorialStep(data: unknown): TutorialStep {
  return TutorialStepSchema.parse(data);
}

export function validateHelpTip(data: unknown): HelpTip {
  return HelpTipSchema.parse(data);
}

export function validateLoadingTip(data: unknown): LoadingTip {
  return LoadingTipSchema.parse(data);
}

export function validateTutorialState(data: unknown): TutorialState {
  return TutorialStateSchema.parse(data);
}

// ============================================================================
// REGISTRY & LOOKUP
// ============================================================================

export const TUTORIAL_STEPS_BY_ID: Record<string, TutorialStep> = Object.fromEntries(
  TUTORIAL_STEPS.map((step) => [step.id, step])
);

export const HELP_TIPS_BY_ID: Record<string, HelpTip> = Object.fromEntries(
  HELP_TIPS.map((tip) => [tip.id, tip])
);

export const HELP_TIPS_BY_CONTEXT: Record<HelpTipContext, HelpTip[]> = HELP_TIPS.reduce(
  (acc, tip) => {
    if (!acc[tip.context]) acc[tip.context] = [];
    acc[tip.context].push(tip);
    return acc;
  },
  {} as Record<HelpTipContext, HelpTip[]>
);

export const LOADING_TIPS_BY_ID: Record<string, LoadingTip> = Object.fromEntries(
  LOADING_TIPS.map((tip) => [tip.id, tip])
);

export const LOADING_TIPS_BY_CATEGORY: Record<string, LoadingTip[]> = LOADING_TIPS.reduce(
  (acc, tip) => {
    if (!acc[tip.category]) acc[tip.category] = [];
    acc[tip.category].push(tip);
    return acc;
  },
  {} as Record<string, LoadingTip[]>
);

export function getTutorialStepById(id: string): TutorialStep | undefined {
  return TUTORIAL_STEPS_BY_ID[id];
}

export function getHelpTipById(id: string): HelpTip | undefined {
  return HELP_TIPS_BY_ID[id];
}

export function getLoadingTipById(id: string): LoadingTip | undefined {
  return LOADING_TIPS_BY_ID[id];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TUTORIAL_SCHEMA_VERSION = '1.0.0';

export const TUTORIAL_CONSTANTS = {
  /** Time in ms to display each cinematic paragraph */
  CINEMATIC_PARAGRAPH_DURATION: 6000,

  /** Time in ms before auto-advancing tutorial step (0 = manual only) */
  STEP_AUTO_ADVANCE_DELAY: 0,

  /** Time in ms to display help tips */
  HELP_TIP_DURATION: 5000,

  /** Time in ms to display loading tips */
  LOADING_TIP_DURATION: 8000,

  /** Minimum player health percentage to trigger low health warning */
  LOW_HEALTH_THRESHOLD: 0.25,

  /** Minimum stamina percentage to trigger low stamina warning */
  LOW_STAMINA_THRESHOLD: 0.2,
} as const;
