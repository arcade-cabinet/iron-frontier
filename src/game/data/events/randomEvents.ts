/**
 * Iron Frontier - Random Events System
 *
 * Rich event system for travel, town, and camp exploration.
 * Events trigger based on location type, time of day, and player state.
 *
 * Design principles:
 * - Events are data-driven and declarative
 * - Player choices have meaningful consequences
 * - Outcomes affect reputation, inventory, health, and quests
 * - Events can unlock new opportunities or create dangers
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Event categories determine when events can trigger
 */
export const EventCategorySchema = z.enum([
  'travel', // While traveling between locations
  'town', // While in a town
  'camp', // While camping/resting
]);
export type EventCategory = z.infer<typeof EventCategorySchema>;

/**
 * Event rarity affects spawn weights
 */
export const EventRaritySchema = z.enum([
  'common', // 50% of events
  'uncommon', // 30% of events
  'rare', // 15% of events
  'legendary', // 5% of events
]);
export type EventRarity = z.infer<typeof EventRaritySchema>;

/**
 * Time of day conditions
 */
export const TimeOfDaySchema = z.enum([
  'dawn', // 5am - 8am
  'morning', // 8am - 12pm
  'afternoon', // 12pm - 5pm
  'evening', // 5pm - 8pm
  'night', // 8pm - 5am
  'any', // No restriction
]);
export type TimeOfDay = z.infer<typeof TimeOfDaySchema>;

/**
 * Effect types that can occur from event choices
 */
export const EventEffectTypeSchema = z.enum([
  'give_gold', // Award gold
  'take_gold', // Lose gold
  'give_item', // Award item
  'take_item', // Lose item
  'heal', // Restore health
  'damage', // Take damage
  'change_reputation', // Modify faction reputation
  'start_quest', // Begin a quest
  'advance_quest', // Progress quest objective
  'set_flag', // Set a game flag
  'clear_flag', // Clear a game flag
  'unlock_location', // Discover a new location
  'trigger_combat', // Start a combat encounter
  'give_xp', // Award experience points
  'change_morale', // Affect party morale
  'add_companion', // Temporarily add a companion
  'reveal_lore', // Show lore entry
]);
export type EventEffectType = z.infer<typeof EventEffectTypeSchema>;

// ============================================================================
// EVENT CONDITION SCHEMA
// ============================================================================

/**
 * Conditions that must be met for an event to trigger
 */
export const EventConditionSchema = z.object({
  /** Required time of day */
  timeOfDay: z.array(TimeOfDaySchema).optional(),

  /** Minimum player level */
  minLevel: z.number().int().min(1).optional(),

  /** Maximum player level */
  maxLevel: z.number().int().min(1).optional(),

  /** Minimum gold required */
  minGold: z.number().int().min(0).optional(),

  /** Required items in inventory */
  requiredItems: z.array(z.string()).optional(),

  /** Required faction reputation (factionId -> min rep) */
  minReputation: z.record(z.string(), z.number().int()).optional(),

  /** Maximum faction reputation (factionId -> max rep) */
  maxReputation: z.record(z.string(), z.number().int()).optional(),

  /** Required game flags to be set */
  requiredFlags: z.array(z.string()).optional(),

  /** Game flags that must NOT be set */
  forbiddenFlags: z.array(z.string()).optional(),

  /** Required completed quests */
  completedQuests: z.array(z.string()).optional(),

  /** Required active quests */
  activeQuests: z.array(z.string()).optional(),

  /** Minimum health percentage (0-100) */
  minHealthPercent: z.number().min(0).max(100).optional(),

  /** Terrain types where event can occur */
  terrainTypes: z.array(z.string()).optional(),

  /** Region IDs where event can occur */
  regionIds: z.array(z.string()).optional(),

  /** Specific location IDs where event can occur */
  locationIds: z.array(z.string()).optional(),

  /** Weather conditions */
  weather: z.array(z.enum(['clear', 'cloudy', 'rain', 'storm', 'snow'])).optional(),
});
export type EventCondition = z.infer<typeof EventConditionSchema>;

// ============================================================================
// EVENT EFFECT SCHEMA
// ============================================================================

/**
 * An effect that occurs from a choice or event outcome
 */
export const EventEffectSchema = z.object({
  /** Effect type */
  type: EventEffectTypeSchema,

  /** Target (item ID, faction ID, quest ID, etc.) */
  target: z.string().optional(),

  /** Numeric value (amount of gold, damage, etc.) */
  value: z.number().optional(),

  /** Range for random value [min, max] */
  valueRange: z.tuple([z.number(), z.number()]).optional(),

  /** String value (flag name, lore text, etc.) */
  stringValue: z.string().optional(),

  /** Chance this effect occurs (0-1, default 1 if not specified) */
  chance: z.number().min(0).max(1).optional(),
});
export type EventEffect = z.infer<typeof EventEffectSchema>;

// ============================================================================
// EVENT CHOICE SCHEMA
// ============================================================================

/**
 * A player choice within an event
 */
export const EventChoiceSchema = z.object({
  /** Unique ID within the event */
  id: z.string(),

  /** Display text for this choice */
  text: z.string(),

  /** Detailed tooltip/preview of likely outcome */
  tooltip: z.string().optional(),

  /** Conditions to show this choice (hidden if not met) */
  conditions: EventConditionSchema.optional(),

  /** Effects that occur when this choice is selected (optional if using skillCheck) */
  effects: z.array(EventEffectSchema).optional(),

  /** Narrative result text shown after selection */
  resultText: z.string(),

  /** Does this choice require a skill check? */
  skillCheck: z
    .object({
      skill: z.enum(['combat', 'speech', 'survival', 'stealth', 'repair', 'medicine']),
      difficulty: z.number().int().min(1).max(100),
      successEffects: z.array(EventEffectSchema).optional(),
      failureEffects: z.array(EventEffectSchema).optional(),
      successText: z.string(),
      failureText: z.string(),
    })
    .optional(),

  /** Tags for analytics/categorization */
  tags: z.array(z.enum(['moral', 'aggressive', 'peaceful', 'greedy', 'generous', 'coward', 'brave'])).optional(),
});
export type EventChoice = z.infer<typeof EventChoiceSchema>;

// ============================================================================
// RANDOM EVENT SCHEMA
// ============================================================================

/**
 * A complete random event definition
 */
export const RandomEventSchema = z.object({
  /** Unique event identifier */
  id: z.string(),

  /** Event title */
  title: z.string(),

  /** Narrative description shown to player */
  description: z.string(),

  /** Event category (when it can trigger) */
  category: EventCategorySchema,

  /** Event rarity */
  rarity: EventRaritySchema,

  /** Spawn weight (higher = more common within rarity tier) */
  weight: z.number().min(0).default(1),

  /** Trigger conditions */
  conditions: EventConditionSchema.default({}),

  /** Available player choices */
  choices: z.array(EventChoiceSchema).min(1),

  /** Can this event repeat? */
  repeatable: z.boolean().default(true),

  /** Cooldown in game-hours before repeating (if repeatable) */
  cooldownHours: z.number().int().min(0).default(24),

  /** Tags for filtering/categorization */
  tags: z.array(z.string()).default([]),

  /** Associated image/illustration key */
  imageId: z.string().optional(),

  /** Sound effect to play */
  soundId: z.string().optional(),
});
export type RandomEvent = z.infer<typeof RandomEventSchema>;

// ============================================================================
// RARITY WEIGHTS
// ============================================================================

export const RARITY_WEIGHTS: Record<EventRarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 15,
  legendary: 5,
};

// ============================================================================
// TRAVEL EVENTS (12 events)
// ============================================================================

export const TRAVEL_EVENTS: RandomEvent[] = [
  // 1. Broken Wagon (Moral Choice)
  {
    id: 'travel_broken_wagon',
    title: 'Broken Wagon',
    description:
      "You come across a wagon with a broken wheel, blocking part of the trail. A weary family stands nearby - a man, woman, and two small children. The father waves you down. \"Please, stranger, we've been stuck here for hours. Bandits took our spare wheel and most of our supplies.\"",
    category: 'travel',
    rarity: 'common',
    weight: 1.2,
    conditions: {
      timeOfDay: ['morning', 'afternoon', 'evening'],
    },
    choices: [
      {
        id: 'help_repair',
        text: 'Help them repair the wagon (costs 1 hour)',
        tooltip: 'Spend time helping the family',
        resultText:
          "You spend an hour helping the family jury-rig a repair. The father shakes your hand warmly. \"God bless you, stranger. We don't have much, but please take this.\"",
        effects: [
          { type: 'give_gold', value: 15 },
          { type: 'change_reputation', target: 'townsfolk', value: 5 },
          { type: 'give_xp', value: 25 },
        ],
        tags: ['generous', 'moral'],
      },
      {
        id: 'give_supplies',
        text: 'Give them supplies and $20 for repairs',
        tooltip: 'Help them financially',
        conditions: { minGold: 20 },
        resultText:
          'The mother tears up as you hand over the money and some food. "We\'ll never forget your kindness. If you\'re ever in Dusty Springs, ask for the Hendersons."',
        effects: [
          { type: 'take_gold', value: 20 },
          { type: 'change_reputation', target: 'townsfolk', value: 10 },
          { type: 'set_flag', stringValue: 'helped_henderson_family' },
          { type: 'give_xp', value: 50 },
        ],
        tags: ['generous', 'moral'],
      },
      {
        id: 'ignore',
        text: "Continue on your way - it's not your problem",
        tooltip: 'Leave them to their fate',
        resultText: "You tip your hat and ride on. The father's disappointed calls fade behind you.",
        effects: [{ type: 'change_reputation', target: 'townsfolk', value: -3 }],
        tags: ['coward'],
      },
      {
        id: 'rob',
        text: 'Rob them of their remaining valuables',
        tooltip: 'Take advantage of their vulnerability',
        resultText:
          "They have little left, but you take what they have. The children cry as you ride away with their mother's wedding ring.",
        effects: [
          { type: 'give_gold', valueRange: [5, 15] },
          { type: 'give_item', target: 'wedding_ring' },
          { type: 'change_reputation', target: 'townsfolk', value: -15 },
          { type: 'change_reputation', target: 'copperhead', value: 3 },
        ],
        tags: ['aggressive', 'greedy'],
      },
    ],
    repeatable: true,
    cooldownHours: 72,
    tags: ['moral', 'family', 'aid'],
  },

  // 2. Bandit Ambush
  {
    id: 'travel_bandit_ambush',
    title: 'Bandit Ambush',
    description:
      'A whistle pierces the air and three masked men emerge from behind boulders, rifles trained on you. "Hold it right there, friend. This here\'s a toll road now. Hand over your valuables, and nobody gets hurt."',
    category: 'travel',
    rarity: 'common',
    weight: 1.5,
    conditions: {
      minGold: 10,
      forbiddenFlags: ['copperhead_ally'],
    },
    choices: [
      {
        id: 'pay_toll',
        text: 'Pay the "toll" ($30)',
        tooltip: 'Avoid confrontation by paying',
        conditions: { minGold: 30 },
        resultText:
          'You toss a pouch of coins at their feet. The lead bandit counts it and nods. "Smart choice. Get moving before we change our minds."',
        effects: [
          { type: 'take_gold', value: 30 },
          { type: 'set_flag', stringValue: 'paid_bandit_toll' },
        ],
        tags: ['peaceful', 'coward'],
      },
      {
        id: 'fight',
        text: 'Draw your weapon and fight',
        tooltip: 'Engage in combat',
        resultText: 'Your hand flashes to your holster. Time to see who\'s faster.',
        effects: [{ type: 'trigger_combat', target: 'bandit_ambush_3' }],
        tags: ['aggressive', 'brave'],
      },
      {
        id: 'bluff',
        text: '"I ride with the Copperheads. Step aside."',
        tooltip: 'Attempt to intimidate them',
        resultText: 'You fix them with a steely gaze and drop the gang\'s name.',
        skillCheck: {
          skill: 'speech',
          difficulty: 50,
          successText:
            'The bandits exchange nervous glances. "Sorry, didn\'t know you were connected. Go on through." They melt back into the rocks.',
          failureText:
            'The leader laughs. "Nice try, but you ain\'t got the look. Boys, teach this liar a lesson."',
          successEffects: [
            { type: 'give_xp', value: 50 },
            { type: 'change_reputation', target: 'copperhead', value: 2 },
          ],
          failureEffects: [{ type: 'trigger_combat', target: 'bandit_ambush_3' }],
        },
        tags: ['peaceful', 'brave'],
      },
      {
        id: 'flee',
        text: 'Spur your horse and make a run for it',
        tooltip: 'Try to escape',
        resultText: 'You kick your heels and bolt down the trail.',
        skillCheck: {
          skill: 'survival',
          difficulty: 40,
          successText:
            'Bullets whiz past but you ride hard and fast. Eventually the gunshots fade and you\'re in the clear, heart pounding.',
          failureText:
            'A bullet grazes your arm as you flee. You escape, but not unscathed.',
          successEffects: [{ type: 'give_xp', value: 30 }],
          failureEffects: [
            { type: 'damage', value: 15 },
            { type: 'give_xp', value: 15 },
          ],
        },
        tags: ['coward'],
      },
    ],
    repeatable: true,
    cooldownHours: 48,
    tags: ['combat', 'bandits', 'danger'],
  },

  // 3. Lost Traveler with Treasure Map
  {
    id: 'travel_treasure_map',
    title: 'The Wandering Prospector',
    description:
      "A grizzled old prospector sits by the roadside, muttering to himself. His clothes are tattered and he looks half-mad from the sun. He clutches a weathered piece of paper. \"You there! I've found it - the mother lode! But I'm too old, too weak. Take this map, stranger. Find the gold. Just... remember old Pete when you're rich.\"",
    category: 'travel',
    rarity: 'uncommon',
    weight: 0.8,
    conditions: {
      forbiddenFlags: ['has_petes_map'],
    },
    choices: [
      {
        id: 'take_map',
        text: 'Accept the map gratefully',
        tooltip: 'Take the treasure map',
        resultText:
          'You carefully take the yellowed paper. The map shows a location in the badlands, marked with an X. Old Pete grins toothlessly. "Find it for both of us."',
        effects: [
          { type: 'give_item', target: 'treasure_map_petes' },
          { type: 'set_flag', stringValue: 'has_petes_map' },
          { type: 'start_quest', target: 'side_petes_treasure' },
        ],
        tags: ['brave'],
      },
      {
        id: 'buy_map',
        text: 'Offer to buy the map for $50',
        tooltip: 'Pay for the map properly',
        conditions: { minGold: 50 },
        resultText:
          'Old Pete\'s eyes light up. "You\'re a good soul. This\'ll get me a room and a meal." He hands over the map with shaking hands.',
        effects: [
          { type: 'take_gold', value: 50 },
          { type: 'give_item', target: 'treasure_map_petes' },
          { type: 'set_flag', stringValue: 'has_petes_map' },
          { type: 'start_quest', target: 'side_petes_treasure' },
          { type: 'change_reputation', target: 'townsfolk', value: 5 },
        ],
        tags: ['generous', 'moral'],
      },
      {
        id: 'decline',
        text: '"Keep your map, old timer. I make my own luck."',
        tooltip: 'Refuse the offer',
        resultText:
          'You ride on, leaving the old man to his dreams of gold. Some things are better left buried.',
        effects: [],
        tags: ['peaceful'],
      },
      {
        id: 'steal_map',
        text: 'Snatch the map and ride off',
        tooltip: 'Take it by force',
        resultText:
          'You grab the paper from his feeble hands and spur your horse. His curses follow you down the trail.',
        effects: [
          { type: 'give_item', target: 'treasure_map_petes' },
          { type: 'set_flag', stringValue: 'has_petes_map' },
          { type: 'start_quest', target: 'side_petes_treasure' },
          { type: 'change_reputation', target: 'townsfolk', value: -10 },
        ],
        tags: ['aggressive', 'greedy'],
      },
    ],
    repeatable: false,
    cooldownHours: 0,
    tags: ['treasure', 'quest', 'prospector'],
  },

  // 4. IVRC Patrol Checkpoint
  {
    id: 'travel_ivrc_checkpoint',
    title: 'IVRC Checkpoint',
    description:
      'The road ahead is blocked by a makeshift barrier. Two uniformed IVRC guards approach, one with a clipboard, the other with a hand on his holster. "Halt. This is Iron Valley Railroad Company territory. State your business and submit to inspection."',
    category: 'travel',
    rarity: 'common',
    weight: 1.0,
    conditions: {
      regionIds: ['ivrc_territory', 'frontier_central'],
    },
    choices: [
      {
        id: 'cooperate',
        text: 'Cooperate fully with the inspection',
        tooltip: 'Let them search you',
        resultText:
          'They search your belongings thoroughly. Finding nothing illegal, they wave you through with a curt nod.',
        effects: [{ type: 'change_reputation', target: 'ivrc', value: 2 }],
        tags: ['peaceful'],
      },
      {
        id: 'bribe',
        text: 'Slip them $20 to skip the inspection',
        tooltip: 'Bribe your way through',
        conditions: { minGold: 20 },
        resultText:
          'The guard with the clipboard pockets your coins. "Everything checks out. Move along."',
        effects: [
          { type: 'take_gold', value: 20 },
          { type: 'change_reputation', target: 'ivrc', value: -1 },
        ],
        tags: ['greedy'],
      },
      {
        id: 'show_papers',
        text: 'Show IVRC transit papers',
        tooltip: 'Use official documentation',
        conditions: { requiredItems: ['ivrc_transit_papers'] },
        resultText:
          'They examine your papers and salute. "Sorry for the delay, sir. You\'re cleared to proceed."',
        effects: [{ type: 'change_reputation', target: 'ivrc', value: 3 }],
        tags: ['peaceful'],
      },
      {
        id: 'refuse',
        text: '"I don\'t answer to railroad thugs."',
        tooltip: 'Refuse to comply',
        resultText: 'The guards\' faces harden. "Then you can turn around, or we\'ll make you."',
        effects: [
          { type: 'change_reputation', target: 'ivrc', value: -10 },
          { type: 'set_flag', stringValue: 'ivrc_hostile_encounter' },
        ],
        tags: ['aggressive', 'brave'],
      },
    ],
    repeatable: true,
    cooldownHours: 24,
    tags: ['ivrc', 'authority', 'checkpoint'],
  },

  // 5. Wild Animal Attack
  {
    id: 'travel_animal_attack',
    title: 'Predator Strike',
    description:
      "A low growl freezes you in your tracks. From the brush, a pair of hungry coyotes emerge, teeth bared. They're thin and desperate - not typical behavior for wild animals. The drought has made them bold.",
    category: 'travel',
    rarity: 'common',
    weight: 1.3,
    conditions: {
      terrainTypes: ['desert', 'badlands', 'grassland'],
    },
    choices: [
      {
        id: 'fight',
        text: 'Stand your ground and fight',
        tooltip: 'Engage the predators',
        resultText: 'You draw your weapon as the coyotes lunge.',
        effects: [{ type: 'trigger_combat', target: 'coyote_pack_2' }],
        tags: ['aggressive', 'brave'],
      },
      {
        id: 'scare',
        text: 'Fire a warning shot to scare them off',
        tooltip: 'Try to frighten them away',
        conditions: { requiredItems: ['revolver', 'rifle', 'shotgun'] },
        resultText: 'You fire into the air.',
        skillCheck: {
          skill: 'survival',
          difficulty: 35,
          successText:
            'The gunshot echoes across the desert. The coyotes yelp and scatter into the brush, deciding you\'re not worth the risk.',
          failureText:
            'The shot only makes them angrier. Cornered and desperate, they attack.',
          successEffects: [{ type: 'give_xp', value: 20 }],
          failureEffects: [{ type: 'trigger_combat', target: 'coyote_pack_2' }],
        },
        tags: ['brave'],
      },
      {
        id: 'throw_food',
        text: 'Throw them some jerky as a distraction',
        tooltip: 'Use food to escape',
        conditions: { requiredItems: ['jerky'] },
        resultText:
          'You toss the dried meat and back away slowly. The coyotes pounce on the easy meal, giving you time to slip away.',
        effects: [
          { type: 'take_item', target: 'jerky' },
          { type: 'give_xp', value: 15 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'flee',
        text: 'Run for it',
        tooltip: 'Try to outrun them',
        resultText: 'You break into a sprint.',
        skillCheck: {
          skill: 'survival',
          difficulty: 45,
          successText: 'You outpace the malnourished animals and escape.',
          failureText: 'They catch up and drag you down. You\'ll have to fight.',
          successEffects: [{ type: 'give_xp', value: 20 }],
          failureEffects: [
            { type: 'damage', value: 10 },
            { type: 'trigger_combat', target: 'coyote_pack_2' },
          ],
        },
        tags: ['coward'],
      },
    ],
    repeatable: true,
    cooldownHours: 12,
    tags: ['wildlife', 'combat', 'survival'],
  },

  // 6. Mysterious Stranger with Cryptic Warning
  {
    id: 'travel_cryptic_stranger',
    title: 'The Hooded Figure',
    description:
      "A cloaked figure stands in the middle of the road, unmoving. As you approach, they raise a gnarled hand. \"Turn back, traveler. The path ahead holds only sorrow.\" Their voice is neither male nor female, old nor young. \"The iron serpent devours all in its path. Choose your allegiances wisely, for the reckoning approaches.\"",
    category: 'travel',
    rarity: 'rare',
    weight: 0.6,
    conditions: {
      timeOfDay: ['evening', 'night', 'dawn'],
    },
    choices: [
      {
        id: 'ask_meaning',
        text: '"What do you mean? Explain yourself."',
        tooltip: 'Seek clarification',
        resultText:
          'The figure tilts their head. "The railroad brings progress, but at what cost? The old ways die, and with them, the freedom of these lands. Watch the ones who profit from chaos." They step aside, gesturing you onward.',
        effects: [
          { type: 'reveal_lore', stringValue: 'lore_iron_serpent_prophecy' },
          { type: 'give_xp', value: 30 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'ignore',
        text: 'Push past the madman and continue',
        tooltip: 'Ignore the warning',
        resultText:
          'You brush past. When you glance back, the road is empty. The figure has vanished without a trace.',
        effects: [],
        tags: ['brave'],
      },
      {
        id: 'ask_about_factions',
        text: '"Which allegiances do you speak of?"',
        tooltip: 'Ask about the factions',
        resultText:
          '"The company men in their fine suits. The outlaws who call themselves free. The workers who dig their own graves. And those who remember the old machines..." The figure begins to fade like morning mist.',
        effects: [
          { type: 'reveal_lore', stringValue: 'lore_faction_prophecy' },
          { type: 'give_xp', value: 40 },
          { type: 'set_flag', stringValue: 'stranger_warning_received' },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'attack',
        text: 'Draw on the stranger - this could be a trap',
        tooltip: 'Attack preemptively',
        resultText:
          'Your bullet passes through empty air. The figure was never truly there - or perhaps was something more than human. An uneasy feeling settles in your gut.',
        effects: [{ type: 'change_morale', value: -10 }],
        tags: ['aggressive', 'coward'],
      },
    ],
    repeatable: false,
    cooldownHours: 0,
    tags: ['mysterious', 'lore', 'prophecy'],
  },

  // 7. Abandoned Camp with Supplies
  {
    id: 'travel_abandoned_camp',
    title: 'Abandoned Campsite',
    description:
      "Off the trail, you spot a hastily abandoned camp. A tent lies collapsed, bedrolls scattered. A cold fire pit holds the remains of a meal, and several crates sit unopened nearby. There's no sign of the occupants, but dark stains on the rocks tell a grim story.",
    category: 'travel',
    rarity: 'uncommon',
    weight: 1.0,
    conditions: {},
    choices: [
      {
        id: 'search_carefully',
        text: 'Search the camp thoroughly',
        tooltip: 'Look for useful supplies',
        resultText:
          'You pick through the abandoned gear. Whoever was here left in a hurry - or didn\'t leave at all.',
        effects: [
          { type: 'give_gold', valueRange: [10, 30] },
          { type: 'give_item', target: 'canned_food', chance: 0.7 },
          { type: 'give_item', target: 'bandages', chance: 0.5 },
          { type: 'give_item', target: 'pistol_ammo', chance: 0.6 },
          { type: 'give_xp', value: 15 },
        ],
        tags: ['greedy'],
      },
      {
        id: 'investigate_stains',
        text: 'Investigate the dark stains',
        tooltip: 'Try to determine what happened',
        resultText: 'You examine the scene with a tracker\'s eye.',
        skillCheck: {
          skill: 'survival',
          difficulty: 40,
          successText:
            'The signs are clear: a group was attacked by something - or someone. Drag marks lead toward the hills. You find a journal that might explain more.',
          failureText:
            'The signs are too degraded. Whatever happened here, the desert has already begun to erase it.',
          successEffects: [
            { type: 'give_item', target: 'mysterious_journal' },
            { type: 'give_xp', value: 35 },
            { type: 'start_quest', target: 'side_missing_prospectors' },
          ],
          failureEffects: [{ type: 'give_xp', value: 10 }],
        },
        tags: ['brave'],
      },
      {
        id: 'leave_alone',
        text: 'This feels wrong - leave it be',
        tooltip: 'Avoid potential trouble',
        resultText:
          'You trust your instincts and give the camp a wide berth. Sometimes the dead deserve their rest.',
        effects: [{ type: 'change_morale', value: 5 }],
        tags: ['peaceful', 'coward'],
      },
      {
        id: 'make_camp',
        text: 'Use the site to rest',
        tooltip: 'Take advantage of the shelter',
        resultText:
          'The camp provides shelter from the elements. You rest, though sleep comes uneasily in this place of death.',
        effects: [
          { type: 'heal', value: 20 },
          { type: 'change_morale', value: -5 },
        ],
        tags: ['peaceful'],
      },
    ],
    repeatable: true,
    cooldownHours: 96,
    tags: ['mystery', 'loot', 'danger'],
  },

  // 8. Storm Forces Shelter
  {
    id: 'travel_storm_shelter',
    title: 'Desert Storm',
    description:
      "The sky darkens rapidly as a massive dust storm rolls across the desert. The wind howls with fury, and visibility drops to nothing. You need shelter - now. Through the swirling sand, you spot a cave entrance and what might be an old mining shack.",
    category: 'travel',
    rarity: 'uncommon',
    weight: 0.9,
    conditions: {
      weather: ['storm'],
      terrainTypes: ['desert', 'badlands'],
    },
    choices: [
      {
        id: 'cave',
        text: 'Take shelter in the cave',
        tooltip: 'The cave looks natural',
        resultText: 'You push into the cave as the storm rages outside.',
        skillCheck: {
          skill: 'survival',
          difficulty: 30,
          successText:
            'The cave is empty and provides excellent shelter. You wait out the storm and even find some old mining equipment left behind.',
          failureText:
            'The cave is already occupied - a rattlesnake nest! You stumble back out into the storm.',
          successEffects: [
            { type: 'give_item', target: 'mining_pick', chance: 0.4 },
            { type: 'give_xp', value: 20 },
          ],
          failureEffects: [
            { type: 'damage', value: 15 },
            { type: 'give_xp', value: 10 },
          ],
        },
        tags: ['brave'],
      },
      {
        id: 'shack',
        text: 'Head for the mining shack',
        tooltip: 'Man-made structure',
        resultText: 'You fight through the wind to reach the shack.',
        skillCheck: {
          skill: 'survival',
          difficulty: 25,
          successText:
            'The shack is abandoned but sturdy. You ride out the storm in relative comfort, and find some supplies the previous occupant left behind.',
          failureText:
            'The shack collapses around you as the storm intensifies. You\'re buried briefly before digging yourself out.',
          successEffects: [
            { type: 'give_gold', valueRange: [5, 15] },
            { type: 'give_item', target: 'lantern', chance: 0.3 },
            { type: 'give_xp', value: 20 },
          ],
          failureEffects: [
            { type: 'damage', value: 10 },
            { type: 'give_xp', value: 10 },
          ],
        },
        tags: ['peaceful'],
      },
      {
        id: 'brave_storm',
        text: 'Push through the storm',
        tooltip: 'Try to outlast it',
        resultText: 'You lower your head and press on into the maelstrom.',
        skillCheck: {
          skill: 'survival',
          difficulty: 60,
          successText:
            'Hours of suffering later, you emerge on the other side. The experience has hardened you.',
          failureText:
            'The storm is too powerful. You\'re battered and disoriented, losing time and health.',
          successEffects: [{ type: 'give_xp', value: 50 }],
          failureEffects: [
            { type: 'damage', value: 25 },
            { type: 'take_gold', valueRange: [5, 15] },
          ],
        },
        tags: ['brave'],
      },
    ],
    repeatable: true,
    cooldownHours: 48,
    tags: ['weather', 'survival', 'shelter'],
  },

  // 9. Found Injured NPC
  {
    id: 'travel_injured_npc',
    title: 'Wounded Stranger',
    description:
      "Groans of pain lead you to a man slumped against a boulder, clutching his side. His shirt is soaked with blood. \"Copperheads...\" he gasps. \"Ambushed the payroll wagon. I was a guard. Others... didn't make it.\" He looks up with desperate eyes. \"Please... help me.\"",
    category: 'travel',
    rarity: 'uncommon',
    weight: 1.1,
    conditions: {
      minLevel: 2,
    },
    choices: [
      {
        id: 'use_medicine',
        text: 'Treat his wounds (use medical supplies)',
        tooltip: 'Heal him with your supplies',
        conditions: { requiredItems: ['bandages'] },
        resultText:
          'You patch him up as best you can. Color returns to his face. "I owe you my life. The wagon... it\'s not far. The Copperheads might still be there. Be careful."',
        effects: [
          { type: 'take_item', target: 'bandages' },
          { type: 'change_reputation', target: 'ivrc', value: 10 },
          { type: 'set_flag', stringValue: 'saved_payroll_guard' },
          { type: 'give_xp', value: 40 },
          { type: 'start_quest', target: 'side_payroll_robbery' },
        ],
        tags: ['generous', 'moral'],
      },
      {
        id: 'medicine_check',
        text: 'Try to treat him with improvised methods',
        tooltip: 'Use your medical knowledge',
        resultText: 'You assess his wounds and work with what you have.',
        skillCheck: {
          skill: 'medicine',
          difficulty: 45,
          successText:
            'Using desert plants and strips of cloth, you stabilize him. "You\'re good with your hands," he wheezes. "I\'ll tell the company about you."',
          failureText:
            'Despite your efforts, his wounds are too severe. He dies clutching your hand, whispering about the wagon location.',
          successEffects: [
            { type: 'change_reputation', target: 'ivrc', value: 15 },
            { type: 'give_xp', value: 50 },
            { type: 'set_flag', stringValue: 'saved_payroll_guard' },
            { type: 'start_quest', target: 'side_payroll_robbery' },
          ],
          failureEffects: [
            { type: 'change_reputation', target: 'ivrc', value: 5 },
            { type: 'give_xp', value: 20 },
            { type: 'start_quest', target: 'side_payroll_robbery' },
            { type: 'change_morale', value: -10 },
          ],
        },
        tags: ['moral', 'brave'],
      },
      {
        id: 'ask_about_gold',
        text: '"Where\'s the payroll gold?"',
        tooltip: 'Get information about the loot',
        resultText:
          'His eyes narrow. "You\'re just like them. The wagon\'s east, half a mile. Take it and choke on it." He spits blood and falls silent.',
        effects: [
          { type: 'unlock_location', target: 'payroll_wagon_site' },
          { type: 'change_reputation', target: 'ivrc', value: -5 },
        ],
        tags: ['greedy'],
      },
      {
        id: 'leave',
        text: 'Leave him - he\'s too far gone',
        tooltip: 'Abandon the wounded man',
        resultText:
          'You tell yourself there was nothing you could do. His curses follow you down the trail.',
        effects: [
          { type: 'change_reputation', target: 'ivrc', value: -3 },
          { type: 'change_morale', value: -5 },
        ],
        tags: ['coward'],
      },
    ],
    repeatable: false,
    cooldownHours: 0,
    tags: ['moral', 'ivrc', 'copperhead', 'quest'],
  },

  // 10. Copperhead Recruiter
  {
    id: 'travel_copperhead_recruiter',
    title: 'An Interesting Proposition',
    description:
      "A rider approaches, tin star conspicuously absent from his vest. He tips his hat. \"You've got the look of someone who knows which end of a gun does the talking. Name's Silas. I represent... certain interests opposed to the railroad's expansion. We're always looking for capable individuals. Pays well, if you're not squeamish.\"",
    category: 'travel',
    rarity: 'rare',
    weight: 0.7,
    conditions: {
      minLevel: 3,
      maxReputation: { ivrc: 20 },
      forbiddenFlags: ['copperhead_refused', 'ivrc_ally'],
    },
    choices: [
      {
        id: 'interested',
        text: '"I\'m listening. What kind of work?"',
        tooltip: 'Hear him out',
        resultText:
          'Silas grins. "Smart. We have operations across the territory. Disrupting the railroad, liberating their ill-gotten gains. Meet me at the Rusty Nail saloon in Coppertown if you want in."',
        effects: [
          { type: 'change_reputation', target: 'copperhead', value: 5 },
          { type: 'start_quest', target: 'side_copperhead_recruitment' },
          { type: 'unlock_location', target: 'coppertown' },
          { type: 'give_xp', value: 25 },
        ],
        tags: ['brave'],
      },
      {
        id: 'refuse_politely',
        text: '"Not interested, but I won\'t tell anyone we talked."',
        tooltip: 'Decline without making enemies',
        resultText:
          'Silas shrugs. "Suit yourself. But the offer stands if you change your mind. Times are changing out here." He rides off.',
        effects: [{ type: 'set_flag', stringValue: 'copperhead_contact_made' }],
        tags: ['peaceful'],
      },
      {
        id: 'refuse_hostile',
        text: '"I don\'t deal with outlaws. Ride on before I make you."',
        tooltip: 'Threaten him',
        resultText:
          'Silas\'s friendly demeanor vanishes. "That\'s a shame. We\'ll remember this." He rides off, but you feel eyes on you for the rest of the day.',
        effects: [
          { type: 'change_reputation', target: 'copperhead', value: -15 },
          { type: 'set_flag', stringValue: 'copperhead_refused' },
        ],
        tags: ['aggressive', 'moral'],
      },
      {
        id: 'report_to_ivrc',
        text: '"The IVRC would pay well for information about your \'interests.\'"',
        tooltip: 'Threaten to report him',
        resultText: 'Silas\'s hand moves to his holster. "Big mistake, friend."',
        effects: [
          { type: 'trigger_combat', target: 'copperhead_recruiter' },
          { type: 'change_reputation', target: 'copperhead', value: -20 },
          { type: 'change_reputation', target: 'ivrc', value: 5 },
        ],
        tags: ['aggressive', 'brave'],
      },
    ],
    repeatable: false,
    cooldownHours: 0,
    tags: ['copperhead', 'faction', 'recruitment'],
  },

  // 11. Freeminer Protest Blocking Road
  {
    id: 'travel_freeminer_protest',
    title: 'Blocked Road',
    description:
      "The road ahead is blocked by a crowd of rough-looking miners, pickaxes and signs in hand. \"NO MORE IVRC TYRANNY\" reads one banner. \"FAIR WAGES NOW\" reads another. A burly woman approaches. \"Road's closed, stranger. We're making a statement to the company. You can wait, go around, or...\" she sizes you up, \"...join us.\"",
    category: 'travel',
    rarity: 'uncommon',
    weight: 0.9,
    conditions: {
      regionIds: ['mining_district', 'frontier_central'],
    },
    choices: [
      {
        id: 'join_protest',
        text: 'Stand with the miners',
        tooltip: 'Support their cause',
        resultText:
          'You join the picket line. The miners welcome you with nods and shared water. When IVRC guards arrive, your presence helps defuse the situation.',
        effects: [
          { type: 'change_reputation', target: 'freeminer', value: 15 },
          { type: 'change_reputation', target: 'ivrc', value: -10 },
          { type: 'give_xp', value: 30 },
          { type: 'set_flag', stringValue: 'joined_miner_protest' },
        ],
        tags: ['moral', 'brave'],
      },
      {
        id: 'wait',
        text: 'Wait patiently for the protest to end',
        tooltip: 'Be neutral and patient',
        resultText:
          'You find shade and wait. After a few hours, the miners disperse peacefully. The woman tips her hat to you as they leave.',
        effects: [{ type: 'change_reputation', target: 'freeminer', value: 3 }],
        tags: ['peaceful'],
      },
      {
        id: 'go_around',
        text: 'Find another route',
        tooltip: 'Avoid the confrontation',
        resultText: 'You backtrack and find a longer path around. It costs time but avoids trouble.',
        effects: [],
        tags: ['coward'],
      },
      {
        id: 'force_through',
        text: 'Demand they let you pass',
        tooltip: 'Assert your right to travel',
        resultText: 'You push forward aggressively.',
        skillCheck: {
          skill: 'speech',
          difficulty: 55,
          successText:
            'Your forceful presence parts the crowd. They let you through with angry mutters.',
          failureText:
            'The miners don\'t take kindly to your attitude. A scuffle breaks out.',
          successEffects: [
            { type: 'change_reputation', target: 'freeminer', value: -5 },
            { type: 'give_xp', value: 15 },
          ],
          failureEffects: [
            { type: 'damage', value: 10 },
            { type: 'change_reputation', target: 'freeminer', value: -15 },
          ],
        },
        tags: ['aggressive'],
      },
      {
        id: 'report_to_ivrc',
        text: 'Offer to report the protest location to IVRC',
        tooltip: 'Side with the railroad',
        resultText:
          'The miners overhear and turn hostile. You\'ve made enemies here.',
        effects: [
          { type: 'change_reputation', target: 'freeminer', value: -25 },
          { type: 'change_reputation', target: 'ivrc', value: 10 },
          { type: 'trigger_combat', target: 'angry_miners_3' },
        ],
        tags: ['aggressive', 'greedy'],
      },
    ],
    repeatable: true,
    cooldownHours: 72,
    tags: ['freeminer', 'ivrc', 'politics', 'protest'],
  },

  // 12. Ghost Sighting at Night
  {
    id: 'travel_ghost_sighting',
    title: 'Spectral Encounter',
    description:
      "The night is dark, the moon hidden behind clouds. Then you see it - a pale, translucent figure drifting across the desert floor. It wears the clothes of a miner, circa twenty years past. It turns to face you, mouth moving silently, pointing toward a distant mesa before fading into nothing.",
    category: 'travel',
    rarity: 'rare',
    weight: 0.5,
    conditions: {
      timeOfDay: ['night'],
    },
    choices: [
      {
        id: 'follow_direction',
        text: 'Head toward where it was pointing',
        tooltip: 'Investigate the ghostly clue',
        resultText:
          'You ride through the night toward the mesa. Near dawn, you find the entrance to an old, forgotten mine - and signs that someone has been here recently.',
        effects: [
          { type: 'unlock_location', target: 'old_mesa_mine' },
          { type: 'give_xp', value: 45 },
          { type: 'reveal_lore', stringValue: 'lore_mesa_mine_massacre' },
          { type: 'set_flag', stringValue: 'ghost_miner_vision' },
        ],
        tags: ['brave'],
      },
      {
        id: 'investigate_spot',
        text: 'Search where the ghost was standing',
        tooltip: 'Look for physical evidence',
        resultText: 'You carefully examine the ground.',
        skillCheck: {
          skill: 'survival',
          difficulty: 45,
          successText:
            'Brushing away sand, you find a rusted locket with a faded photograph and a name: "Remember Sarah - J.M. 1862"',
          failureText: 'The desert sand reveals nothing. Perhaps it was only your imagination.',
          successEffects: [
            { type: 'give_item', target: 'old_locket' },
            { type: 'give_xp', value: 30 },
            { type: 'start_quest', target: 'side_ghost_miner' },
          ],
          failureEffects: [{ type: 'give_xp', value: 10 }],
        },
        tags: ['brave'],
      },
      {
        id: 'pray',
        text: 'Say a prayer for the restless spirit',
        tooltip: 'Offer spiritual comfort',
        resultText:
          'You bow your head and speak words of peace. The air grows still, and a sense of calm washes over you. Somewhere, you feel, something is grateful.',
        effects: [
          { type: 'change_morale', value: 15 },
          { type: 'give_xp', value: 20 },
        ],
        tags: ['moral', 'peaceful'],
      },
      {
        id: 'flee',
        text: 'Ride away as fast as possible',
        tooltip: 'Get away from the supernatural',
        resultText:
          'You dig in your spurs and don\'t stop until dawn. Your hands are still shaking when you make camp.',
        effects: [{ type: 'change_morale', value: -10 }],
        tags: ['coward'],
      },
    ],
    repeatable: false,
    cooldownHours: 0,
    tags: ['supernatural', 'mystery', 'lore'],
  },
];

// ============================================================================
// TOWN EVENTS (8 events)
// ============================================================================

export const TOWN_EVENTS: RandomEvent[] = [
  // 1. Bar Fight
  {
    id: 'town_bar_fight',
    title: 'Saloon Brawl',
    description:
      "The peaceful evening at the saloon erupts into chaos. A miner accuses a ranch hand of cheating at cards. Tables flip, bottles shatter, and suddenly everyone's throwing punches. A stray fist is heading your way.",
    category: 'town',
    rarity: 'common',
    weight: 1.2,
    conditions: {
      timeOfDay: ['evening', 'night'],
      locationIds: ['saloon', 'tavern'],
    },
    choices: [
      {
        id: 'join_brawl',
        text: 'Jump into the fray',
        tooltip: 'Fight!',
        resultText: 'You crack your knuckles and wade in.',
        skillCheck: {
          skill: 'combat',
          difficulty: 35,
          successText:
            'You emerge victorious, standing over a pile of groaning combatants. The bartender slides you a free drink.',
          failureText:
            'You take a chair to the back of the head. When you come to, your wallet is lighter.',
          successEffects: [
            { type: 'change_reputation', target: 'townsfolk', value: 3 },
            { type: 'give_xp', value: 25 },
          ],
          failureEffects: [
            { type: 'damage', value: 15 },
            { type: 'take_gold', valueRange: [5, 15] },
          ],
        },
        tags: ['aggressive', 'brave'],
      },
      {
        id: 'break_it_up',
        text: 'Try to stop the fight',
        tooltip: 'Be the peacemaker',
        resultText: 'You step between the combatants.',
        skillCheck: {
          skill: 'speech',
          difficulty: 45,
          successText:
            'Your commanding presence and calm words defuse the situation. The sheriff thanks you later.',
          failureText: 'Both sides turn on you for interfering. Bad move.',
          successEffects: [
            { type: 'change_reputation', target: 'townsfolk', value: 10 },
            { type: 'give_xp', value: 35 },
          ],
          failureEffects: [
            { type: 'damage', value: 20 },
            { type: 'change_reputation', target: 'townsfolk', value: -5 },
          ],
        },
        tags: ['moral', 'brave'],
      },
      {
        id: 'duck_out',
        text: 'Slip out the back door',
        tooltip: 'Avoid the trouble',
        resultText:
          'You grab your drink and slide toward the exit. Not your circus, not your monkeys.',
        effects: [{ type: 'give_xp', value: 5 }],
        tags: ['coward', 'peaceful'],
      },
      {
        id: 'rob_chaos',
        text: 'Use the chaos to lift some valuables',
        tooltip: 'Pickpocket in the confusion',
        resultText: 'In the chaos, your fingers get busy.',
        skillCheck: {
          skill: 'stealth',
          difficulty: 40,
          successText: 'You relieve several distracted patrons of their coin purses.',
          failureText: 'Someone catches you red-handed. "THIEF!" they shout.',
          successEffects: [
            { type: 'give_gold', valueRange: [20, 50] },
            { type: 'give_xp', value: 20 },
          ],
          failureEffects: [
            { type: 'change_reputation', target: 'townsfolk', value: -20 },
            { type: 'trigger_combat', target: 'angry_mob_2' },
          ],
        },
        tags: ['greedy'],
      },
    ],
    repeatable: true,
    cooldownHours: 48,
    tags: ['violence', 'saloon', 'social'],
  },

  // 2. Pickpocket Attempt
  {
    id: 'town_pickpocket',
    title: 'Light Fingers',
    description:
      "You feel a slight tug at your belt. Spinning around, you catch a young street urchin with their hand halfway into your pocket. The kid freezes, eyes wide with fear. \"Please, mister, I'm just hungry...\"",
    category: 'town',
    rarity: 'common',
    weight: 1.0,
    conditions: {
      minGold: 5,
    },
    choices: [
      {
        id: 'let_go',
        text: 'Let the kid go with a warning',
        tooltip: 'Show mercy',
        resultText:
          '"Get out of here and find honest work." The kid scampers off, relief evident on their face.',
        effects: [
          { type: 'change_reputation', target: 'townsfolk', value: 3 },
          { type: 'give_xp', value: 10 },
        ],
        tags: ['moral', 'generous'],
      },
      {
        id: 'give_money',
        text: 'Give them some money for food',
        tooltip: 'Help the hungry child',
        resultText:
          'You press a few coins into the grubby hand. "Buy food, not trouble." The kid runs off, clutching the money like treasure.',
        effects: [
          { type: 'take_gold', value: 5 },
          { type: 'change_reputation', target: 'townsfolk', value: 8 },
          { type: 'give_xp', value: 20 },
          { type: 'set_flag', stringValue: 'helped_street_urchin' },
        ],
        tags: ['generous', 'moral'],
      },
      {
        id: 'call_sheriff',
        text: 'Call for the sheriff',
        tooltip: 'Let the law handle it',
        resultText:
          'The deputy arrives and drags the crying child away. "Workhouse for this one," he grunts.',
        effects: [
          { type: 'change_reputation', target: 'townsfolk', value: -5 },
          { type: 'change_morale', value: -5 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'rough_up',
        text: 'Teach them a lesson they won\'t forget',
        tooltip: 'Physical punishment',
        resultText:
          'You grab the kid by the collar and deliver a hard slap. "Try that again and you\'ll lose the hand."',
        effects: [
          { type: 'change_reputation', target: 'townsfolk', value: -10 },
          { type: 'set_flag', stringValue: 'harsh_to_children' },
        ],
        tags: ['aggressive'],
      },
    ],
    repeatable: true,
    cooldownHours: 24,
    tags: ['crime', 'moral', 'children'],
  },

  // 3. Street Preacher
  {
    id: 'town_street_preacher',
    title: 'Fire and Brimstone',
    description:
      "A wild-eyed man in a dusty black coat stands on an overturned crate, Bible in hand. \"REPENT! The iron snake brings doom! The machines of man will rise against us! I have SEEN it!\" A crowd has gathered - some jeering, others genuinely troubled.",
    category: 'town',
    rarity: 'uncommon',
    weight: 0.8,
    conditions: {},
    choices: [
      {
        id: 'listen',
        text: 'Listen to his sermon',
        tooltip: 'Hear what he has to say',
        resultText:
          'You settle in to listen. Beneath the religious fervor, there are fragments of something else - warnings about the Remnant, about old machines waking up.',
        effects: [
          { type: 'reveal_lore', stringValue: 'lore_preacher_prophecy' },
          { type: 'give_xp', value: 15 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'donate',
        text: 'Drop a coin in his collection plate',
        tooltip: 'Support his mission',
        resultText:
          'The preacher catches your eye and nods knowingly. "You understand, don\'t you? The truth is coming."',
        effects: [
          { type: 'take_gold', value: 2 },
          { type: 'reveal_lore', stringValue: 'lore_preacher_prophecy' },
          { type: 'give_xp', value: 20 },
          { type: 'set_flag', stringValue: 'supported_preacher' },
        ],
        tags: ['generous'],
      },
      {
        id: 'heckle',
        text: 'Heckle the lunatic',
        tooltip: 'Mock his ravings',
        resultText:
          'You shout some choice words about his mental state. The crowd laughs, but the preacher fixes you with an unsettling stare. "You\'ll see. You\'ll ALL see."',
        effects: [
          { type: 'change_reputation', target: 'townsfolk', value: 2 },
          { type: 'set_flag', stringValue: 'mocked_preacher' },
        ],
        tags: ['aggressive'],
      },
      {
        id: 'move_on',
        text: 'Keep walking',
        tooltip: 'Ignore the spectacle',
        resultText: 'You have better things to do than listen to doomsayers.',
        effects: [],
        tags: ['peaceful'],
      },
    ],
    repeatable: true,
    cooldownHours: 72,
    tags: ['religion', 'lore', 'prophecy'],
  },

  // 4. IVRC Announcement
  {
    id: 'town_ivrc_announcement',
    title: 'Company Proclamation',
    description:
      "A crowd has gathered in the town square. An IVRC official in a fine suit reads from a scroll: \"By order of the Iron Valley Railroad Company, all mining claims within five miles of the new rail line are hereby subject to eminent domain. Affected parties have thirty days to vacate...\" The crowd's murmur turns to angry shouts.",
    category: 'town',
    rarity: 'uncommon',
    weight: 0.9,
    conditions: {},
    choices: [
      {
        id: 'protest',
        text: 'Join the angry crowd',
        tooltip: 'Side with the people',
        resultText:
          'You add your voice to the chorus of dissent. The official retreats hastily, guards covering his escape.',
        effects: [
          { type: 'change_reputation', target: 'freeminer', value: 10 },
          { type: 'change_reputation', target: 'ivrc', value: -10 },
          { type: 'give_xp', value: 20 },
        ],
        tags: ['moral', 'brave'],
      },
      {
        id: 'observe',
        text: 'Watch from a safe distance',
        tooltip: 'Stay neutral',
        resultText:
          'You observe the confrontation unfold. Good information to have about the current political climate.',
        effects: [{ type: 'give_xp', value: 10 }],
        tags: ['peaceful'],
      },
      {
        id: 'support_ivrc',
        text: '"Progress demands sacrifice!"',
        tooltip: 'Support the company',
        resultText:
          'Your words draw hostile glares from the crowd but a grateful nod from the official.',
        effects: [
          { type: 'change_reputation', target: 'ivrc', value: 10 },
          { type: 'change_reputation', target: 'freeminer', value: -15 },
          { type: 'change_reputation', target: 'townsfolk', value: -10 },
        ],
        tags: ['aggressive'],
      },
      {
        id: 'pickpocket_crowd',
        text: 'Work the distracted crowd',
        tooltip: 'Use the chaos for profit',
        resultText: 'With everyone focused on the announcement, pockets are easy pickings.',
        skillCheck: {
          skill: 'stealth',
          difficulty: 35,
          successText: 'You come away with a nice haul.',
          failureText: 'A miner catches you and sounds the alarm.',
          successEffects: [{ type: 'give_gold', valueRange: [15, 40] }],
          failureEffects: [
            { type: 'change_reputation', target: 'townsfolk', value: -15 },
            { type: 'trigger_combat', target: 'angry_mob_2' },
          ],
        },
        tags: ['greedy'],
      },
    ],
    repeatable: true,
    cooldownHours: 96,
    tags: ['ivrc', 'politics', 'conflict'],
  },

  // 5. Public Execution
  {
    id: 'town_execution',
    title: 'Justice Served',
    description:
      "A gallows has been erected in the town square. A condemned man stands with a noose around his neck - a Copperhead outlaw, according to the sign. The sheriff addresses the crowd: \"For the crimes of robbery, assault, and murder, this man is sentenced to hang. Any last words, Jeb?\"",
    category: 'town',
    rarity: 'rare',
    weight: 0.5,
    conditions: {
      forbiddenFlags: ['copperhead_ally'],
    },
    choices: [
      {
        id: 'watch',
        text: 'Watch the execution',
        tooltip: 'Witness justice',
        resultText:
          'The trapdoor opens with a bang. The crowd watches in grim silence as the outlaw meets his end.',
        effects: [
          { type: 'change_morale', value: -5 },
          { type: 'give_xp', value: 10 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'call_mercy',
        text: 'Call for mercy',
        tooltip: 'Plead for his life',
        resultText:
          'Your shout is drowned out by the crowd. The sheriff doesn\'t even look your way. The execution proceeds.',
        effects: [
          { type: 'change_reputation', target: 'copperhead', value: 5 },
          { type: 'change_reputation', target: 'townsfolk', value: -3 },
        ],
        tags: ['moral'],
      },
      {
        id: 'intervene',
        text: 'Attempt to stop the execution',
        tooltip: 'Take dramatic action',
        resultText: 'You shout "STOP!" and push through the crowd.',
        skillCheck: {
          skill: 'speech',
          difficulty: 70,
          successText:
            'Your impassioned plea about due process and evidence sows doubt. The execution is delayed pending review.',
          failureText:
            'The sheriff\'s deputies grab you. "Cool off in a cell, troublemaker."',
          successEffects: [
            { type: 'change_reputation', target: 'copperhead', value: 20 },
            { type: 'change_reputation', target: 'townsfolk', value: -10 },
            { type: 'give_xp', value: 50 },
            { type: 'set_flag', stringValue: 'stopped_execution' },
          ],
          failureEffects: [
            { type: 'take_gold', valueRange: [20, 50] },
            { type: 'change_reputation', target: 'townsfolk', value: -5 },
          ],
        },
        tags: ['moral', 'brave'],
      },
      {
        id: 'leave',
        text: 'Leave - you\'ve seen enough hangings',
        tooltip: 'Walk away',
        resultText: 'You turn your back on the spectacle. Some things don\'t need witnessing.',
        effects: [],
        tags: ['peaceful'],
      },
    ],
    repeatable: true,
    cooldownHours: 168,
    tags: ['death', 'law', 'copperhead'],
  },

  // 6. Carnival/Celebration
  {
    id: 'town_carnival',
    title: 'Frontier Festival',
    description:
      "The town is alive with celebration! Colorful banners hang between buildings, a fiddler plays lively tunes, and the smell of roasting meat fills the air. Games of skill line the streets, and laughter echoes everywhere. A sign proclaims: \"ANNUAL FOUNDER'S DAY FESTIVAL\"",
    category: 'town',
    rarity: 'rare',
    weight: 0.6,
    conditions: {},
    choices: [
      {
        id: 'shooting_contest',
        text: 'Enter the shooting contest ($5 entry)',
        tooltip: 'Test your marksmanship',
        conditions: { minGold: 5 },
        resultText: 'You line up at the shooting gallery.',
        skillCheck: {
          skill: 'combat',
          difficulty: 50,
          successText:
            'Your shots ring true! The crowd cheers as you claim the prize.',
          failureText: 'Close, but not quite good enough. Better luck next year.',
          successEffects: [
            { type: 'take_gold', value: 5 },
            { type: 'give_gold', value: 50 },
            { type: 'give_item', target: 'marksman_medal' },
            { type: 'change_reputation', target: 'townsfolk', value: 5 },
            { type: 'give_xp', value: 35 },
          ],
          failureEffects: [
            { type: 'take_gold', value: 5 },
            { type: 'give_xp', value: 10 },
          ],
        },
        tags: ['brave'],
      },
      {
        id: 'arm_wrestling',
        text: 'Enter the arm wrestling tournament ($3 entry)',
        tooltip: 'Test your strength',
        conditions: { minGold: 3 },
        resultText: 'You roll up your sleeves and sit down at the table.',
        skillCheck: {
          skill: 'combat',
          difficulty: 40,
          successText: 'You slam opponent after opponent! The crowd chants your name.',
          failureText: 'A burly rancher puts you down hard. Your arm aches for days.',
          successEffects: [
            { type: 'take_gold', value: 3 },
            { type: 'give_gold', value: 25 },
            { type: 'change_reputation', target: 'townsfolk', value: 5 },
            { type: 'give_xp', value: 25 },
          ],
          failureEffects: [
            { type: 'take_gold', value: 3 },
            { type: 'give_xp', value: 10 },
          ],
        },
        tags: ['brave'],
      },
      {
        id: 'enjoy_festival',
        text: 'Just enjoy the festivities',
        tooltip: 'Relax and have fun',
        resultText:
          'You spend a pleasant day eating good food, listening to music, and mingling with townsfolk. It\'s nice to remember why life is worth living.',
        effects: [
          { type: 'heal', value: 10 },
          { type: 'change_morale', value: 20 },
          { type: 'change_reputation', target: 'townsfolk', value: 3 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'work_crowd',
        text: 'Work the distracted festival crowd',
        tooltip: 'Pickpocket the celebrants',
        resultText: 'Drunk and happy people make easy marks.',
        skillCheck: {
          skill: 'stealth',
          difficulty: 30,
          successText: 'You make a nice profit without anyone noticing.',
          failureText: 'A sharp-eyed deputy catches you in the act.',
          successEffects: [{ type: 'give_gold', valueRange: [25, 60] }],
          failureEffects: [
            { type: 'take_gold', valueRange: [10, 30] },
            { type: 'change_reputation', target: 'townsfolk', value: -20 },
          ],
        },
        tags: ['greedy'],
      },
    ],
    repeatable: true,
    cooldownHours: 168,
    tags: ['celebration', 'games', 'social'],
  },

  // 7. Mine Accident News
  {
    id: 'town_mine_accident',
    title: 'Tragedy at the Mines',
    description:
      "Grim-faced miners stumble into town, covered in dust and blood. Word spreads quickly: a tunnel collapse at the local mine. Dozens are trapped, maybe dead. Families rush toward the mine entrance. The mayor calls for volunteers.",
    category: 'town',
    rarity: 'uncommon',
    weight: 0.7,
    conditions: {
      regionIds: ['mining_district', 'frontier_central'],
    },
    choices: [
      {
        id: 'volunteer',
        text: 'Volunteer for the rescue effort',
        tooltip: 'Help dig out survivors',
        resultText: 'You grab a pickaxe and join the rescue team.',
        skillCheck: {
          skill: 'survival',
          difficulty: 45,
          successText:
            'Hours of backbreaking work pay off - you help pull three survivors from the rubble. The town hails you as a hero.',
          failureText:
            'You work until exhaustion, but find only the dead. The experience haunts you.',
          successEffects: [
            { type: 'change_reputation', target: 'townsfolk', value: 20 },
            { type: 'change_reputation', target: 'freeminer', value: 15 },
            { type: 'give_xp', value: 60 },
            { type: 'damage', value: 10 },
          ],
          failureEffects: [
            { type: 'change_reputation', target: 'townsfolk', value: 10 },
            { type: 'change_reputation', target: 'freeminer', value: 10 },
            { type: 'give_xp', value: 30 },
            { type: 'damage', value: 15 },
            { type: 'change_morale', value: -15 },
          ],
        },
        tags: ['brave', 'moral'],
      },
      {
        id: 'donate',
        text: 'Donate money to the relief fund ($25)',
        tooltip: 'Help financially',
        conditions: { minGold: 25 },
        resultText:
          'You contribute to the fund for miners\' families. Your name is added to the donors\' list.',
        effects: [
          { type: 'take_gold', value: 25 },
          { type: 'change_reputation', target: 'townsfolk', value: 10 },
          { type: 'change_reputation', target: 'freeminer', value: 10 },
          { type: 'give_xp', value: 25 },
        ],
        tags: ['generous', 'moral'],
      },
      {
        id: 'investigate',
        text: 'Investigate the cause of the collapse',
        tooltip: 'Look into what happened',
        resultText: 'You examine the site and talk to survivors.',
        skillCheck: {
          skill: 'survival',
          difficulty: 50,
          successText:
            'Your investigation reveals the support beams were substandard - IVRC cost-cutting. This information could be valuable.',
          failureText: 'The chaos makes investigation impossible. Too much going on.',
          successEffects: [
            { type: 'give_item', target: 'evidence_mine_negligence' },
            { type: 'give_xp', value: 45 },
            { type: 'start_quest', target: 'side_mine_scandal' },
          ],
          failureEffects: [{ type: 'give_xp', value: 15 }],
        },
        tags: ['brave'],
      },
      {
        id: 'move_on',
        text: 'It\'s tragic, but not your concern',
        tooltip: 'Continue with your business',
        resultText: 'Death is common out here. You\'ve learned not to get attached.',
        effects: [{ type: 'change_morale', value: -5 }],
        tags: ['coward'],
      },
    ],
    repeatable: false,
    cooldownHours: 0,
    tags: ['tragedy', 'mining', 'ivrc', 'quest'],
  },

  // 8. Stranger Challenges to Duel
  {
    id: 'town_duel_challenge',
    title: 'High Noon',
    description:
      "A hush falls over the street. A man in black stands in the middle of the road, hands hovering over his holsters. \"You. Yeah, you. Word is you think you're fast. I'm here to test that theory. Draw, or be known as a coward.\" The townsfolk scatter for cover.",
    category: 'town',
    rarity: 'rare',
    weight: 0.4,
    conditions: {
      minLevel: 3,
    },
    choices: [
      {
        id: 'accept_duel',
        text: 'Accept the challenge',
        tooltip: 'Face him down',
        resultText:
          'You take your position. The clock tower begins to chime. At the last bell...',
        skillCheck: {
          skill: 'combat',
          difficulty: 55,
          successText:
            'Your draw is lightning. His gun hasn\'t cleared the holster when your bullet finds its mark. The legend of the fast stranger grows.',
          failureText:
            'He\'s faster. The bullet tears through your shoulder, spinning you to the ground. He walks away, leaving you alive but humiliated.',
          successEffects: [
            { type: 'change_reputation', target: 'townsfolk', value: 15 },
            { type: 'give_gold', valueRange: [30, 60] },
            { type: 'give_xp', value: 75 },
            { type: 'set_flag', stringValue: 'won_duel' },
          ],
          failureEffects: [
            { type: 'damage', value: 30 },
            { type: 'change_reputation', target: 'townsfolk', value: -5 },
            { type: 'give_xp', value: 25 },
          ],
        },
        tags: ['aggressive', 'brave'],
      },
      {
        id: 'talk_down',
        text: '"I\'ve got no quarrel with you, friend."',
        tooltip: 'Try to defuse the situation',
        resultText: 'You keep your hands visible and speak calmly.',
        skillCheck: {
          skill: 'speech',
          difficulty: 60,
          successText:
            'Something in your eyes - or your words - gives him pause. "Maybe you ain\'t worth the bullet." He walks away.',
          failureText: 'He laughs. "Coward talk. Now draw, or I\'ll shoot you where you stand."',
          successEffects: [
            { type: 'give_xp', value: 40 },
            { type: 'change_reputation', target: 'townsfolk', value: 5 },
          ],
          failureEffects: [{ type: 'trigger_combat', target: 'gunslinger_duel' }],
        },
        tags: ['peaceful', 'brave'],
      },
      {
        id: 'walk_away',
        text: 'Turn your back and walk away',
        tooltip: 'Refuse to participate',
        resultText:
          'You turn and walk. A bullet kicks up dust at your feet. "That\'s a warning. Next one won\'t miss. Get out of this town, coward."',
        effects: [
          { type: 'change_reputation', target: 'townsfolk', value: -15 },
          { type: 'set_flag', stringValue: 'branded_coward' },
        ],
        tags: ['coward'],
      },
      {
        id: 'dirty_trick',
        text: 'Throw sand in his eyes and draw',
        tooltip: 'Fight dirty',
        resultText: 'You scoop a handful of dust and hurl it at his face.',
        effects: [
          { type: 'trigger_combat', target: 'gunslinger_duel' },
          { type: 'set_flag', stringValue: 'dirty_fighter' },
          { type: 'change_reputation', target: 'townsfolk', value: -5 },
        ],
        tags: ['aggressive', 'coward'],
      },
    ],
    repeatable: true,
    cooldownHours: 120,
    tags: ['duel', 'combat', 'reputation'],
  },
];

// ============================================================================
// CAMP EVENTS (6 events)
// ============================================================================

export const CAMP_EVENTS: RandomEvent[] = [
  // 1. Creature Prowling Nearby
  {
    id: 'camp_prowler',
    title: 'Night Visitor',
    description:
      "You wake to the sound of something circling your camp. In the firelight's edge, you catch glimpses of eyes - too many eyes, reflecting the flames. Something is out there, and it's getting closer.",
    category: 'camp',
    rarity: 'common',
    weight: 1.2,
    conditions: {
      timeOfDay: ['night'],
    },
    choices: [
      {
        id: 'fire_warning',
        text: 'Build up the fire and make noise',
        tooltip: 'Try to scare it off',
        resultText: 'You throw more wood on the fire and bang your cookware together.',
        skillCheck: {
          skill: 'survival',
          difficulty: 35,
          successText:
            'The increased light and noise drive the creature away. You hear it retreating into the darkness.',
          failureText:
            'It\'s not deterred. The creature lunges from the shadows.',
          successEffects: [{ type: 'give_xp', value: 20 }],
          failureEffects: [{ type: 'trigger_combat', target: 'night_stalker' }],
        },
        tags: ['brave'],
      },
      {
        id: 'wait_armed',
        text: 'Draw your weapon and wait',
        tooltip: 'Prepare for a fight',
        resultText:
          'You aim into the darkness and wait. After a tense hour, the creature decides you\'re not worth the risk and leaves.',
        effects: [
          { type: 'give_xp', value: 15 },
          { type: 'change_morale', value: -5 },
        ],
        tags: ['brave'],
      },
      {
        id: 'offer_food',
        text: 'Throw it some of your rations',
        tooltip: 'Bribe it with food',
        conditions: { requiredItems: ['jerky', 'canned_food'] },
        resultText:
          'You toss some food toward the eyes. The creature grabs it and retreats, satisfied.',
        effects: [
          { type: 'take_item', target: 'jerky' },
          { type: 'give_xp', value: 10 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'investigate',
        text: 'Grab a torch and investigate',
        tooltip: 'Face it directly',
        resultText: 'You light a branch and stride toward the eyes.',
        skillCheck: {
          skill: 'survival',
          difficulty: 45,
          successText:
            'It\'s just a curious coyote, drawn by the smell of your food. It flees when you approach.',
          failureText:
            'It\'s not alone. Several shapes lunge at you from different directions.',
          successEffects: [{ type: 'give_xp', value: 25 }],
          failureEffects: [
            { type: 'trigger_combat', target: 'coyote_pack_3' },
            { type: 'damage', value: 10 },
          ],
        },
        tags: ['brave'],
      },
    ],
    repeatable: true,
    cooldownHours: 24,
    tags: ['wildlife', 'night', 'danger'],
  },

  // 2. Traveler Asks to Share Fire
  {
    id: 'camp_traveler_request',
    title: 'Company in the Night',
    description:
      "\"Hello the camp!\" A voice calls from the darkness. A figure approaches, hands raised. \"Don't shoot - I'm friendly. Name's Del. Saw your fire and hoped I might share it. Desert gets cold at night.\" The stranger looks worn but harmless.",
    category: 'camp',
    rarity: 'common',
    weight: 1.0,
    conditions: {
      timeOfDay: ['night'],
    },
    choices: [
      {
        id: 'welcome',
        text: 'Welcome them to your fire',
        tooltip: 'Share your camp',
        resultText:
          'Del settles in gratefully. Over coffee, they share stories of the trail - and a useful tip about a shortcut through the hills.',
        effects: [
          { type: 'unlock_location', target: 'hidden_trail' },
          { type: 'give_xp', value: 25 },
          { type: 'change_morale', value: 10 },
        ],
        tags: ['generous', 'peaceful'],
      },
      {
        id: 'share_meal',
        text: 'Offer food as well as warmth',
        tooltip: 'Be extra hospitable',
        conditions: { requiredItems: ['canned_food', 'jerky'] },
        resultText:
          'Del is moved by your generosity. "I won\'t forget this kindness. Here - take this. Found it in an old mine, never knew what to do with it."',
        effects: [
          { type: 'take_item', target: 'canned_food' },
          { type: 'give_item', target: 'uncut_gem' },
          { type: 'give_xp', value: 35 },
          { type: 'change_morale', value: 15 },
          { type: 'set_flag', stringValue: 'friend_of_del' },
        ],
        tags: ['generous', 'moral'],
      },
      {
        id: 'suspicious',
        text: 'Keep your hand on your gun and watch them closely',
        tooltip: 'Stay alert for trouble',
        resultText:
          'Del notices your wariness but doesn\'t comment. The night passes uneventfully, and they leave at dawn with a brief nod.',
        effects: [{ type: 'give_xp', value: 10 }],
        tags: ['coward'],
      },
      {
        id: 'turn_away',
        text: '"Find your own fire, stranger."',
        tooltip: 'Refuse their request',
        resultText:
          'Del\'s face falls. "Suit yourself." They disappear into the darkness. You hope they make it through the night.',
        effects: [{ type: 'change_morale', value: -5 }],
        tags: ['aggressive'],
      },
      {
        id: 'rob',
        text: 'Invite them in, then rob them',
        tooltip: 'Take advantage',
        resultText: 'You smile and beckon them closer...',
        skillCheck: {
          skill: 'stealth',
          difficulty: 40,
          successText: 'Once they\'re relaxed, you relieve them of their valuables at gunpoint.',
          failureText: 'Del is more alert than they seemed. They draw faster.',
          successEffects: [
            { type: 'give_gold', valueRange: [10, 30] },
            { type: 'give_item', target: 'pocket_watch', chance: 0.5 },
            { type: 'change_morale', value: -10 },
          ],
          failureEffects: [{ type: 'trigger_combat', target: 'armed_traveler' }],
        },
        tags: ['aggressive', 'greedy'],
      },
    ],
    repeatable: true,
    cooldownHours: 48,
    tags: ['social', 'stranger', 'night'],
  },

  // 3. Dream/Nightmare (Lore Reveal)
  {
    id: 'camp_dream',
    title: 'Troubled Sleep',
    description:
      "Sleep comes fitfully. In your dreams, you walk through a ruined town, buildings twisted into impossible shapes. Metal creatures patrol the streets, their eyes glowing with cold intelligence. A voice echoes: \"The sleepers wake. The old machines remember.\" You jolt awake, drenched in sweat.",
    category: 'camp',
    rarity: 'uncommon',
    weight: 0.7,
    conditions: {},
    choices: [
      {
        id: 'interpret',
        text: 'Try to interpret the dream\'s meaning',
        tooltip: 'Analyze the vision',
        resultText:
          'You sit in the darkness, piecing together fragments of the vision. The ruined town... it looked familiar. Like the old mining settlement to the north.',
        effects: [
          { type: 'reveal_lore', stringValue: 'lore_remnant_awakening' },
          { type: 'give_xp', value: 30 },
          { type: 'unlock_location', target: 'old_settlement_ruins' },
        ],
        tags: ['brave'],
      },
      {
        id: 'write_down',
        text: 'Write down the details before you forget',
        tooltip: 'Record the vision',
        resultText:
          'You sketch the metal creatures, noting every detail. The drawings might prove useful later.',
        effects: [
          { type: 'give_item', target: 'dream_journal_entry' },
          { type: 'give_xp', value: 20 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'shake_off',
        text: 'Shake it off - just a nightmare',
        tooltip: 'Dismiss the dream',
        resultText: 'You splash water on your face and try to forget. But the images linger...',
        effects: [{ type: 'change_morale', value: -5 }],
        tags: ['coward'],
      },
      {
        id: 'stay_awake',
        text: 'Stay awake - you won\'t risk dreaming again',
        tooltip: 'Refuse to sleep',
        resultText: 'You spend the rest of the night staring at the fire. Dawn finds you exhausted.',
        effects: [
          { type: 'damage', value: 5 },
          { type: 'change_morale', value: -10 },
        ],
        tags: ['coward'],
      },
    ],
    repeatable: false,
    cooldownHours: 0,
    tags: ['supernatural', 'lore', 'remnant'],
  },

  // 4. Supplies Stolen Overnight
  {
    id: 'camp_theft',
    title: 'Rude Awakening',
    description:
      "Dawn reveals an unpleasant surprise: your supplies have been ransacked while you slept. Food is scattered, your saddlebags rifled through. Small footprints in the dust lead toward the hills - human, but small. Children? Bandits? The thieves are long gone.",
    category: 'camp',
    rarity: 'uncommon',
    weight: 0.8,
    conditions: {
      minGold: 10,
    },
    choices: [
      {
        id: 'track',
        text: 'Follow the tracks',
        tooltip: 'Chase down the thieves',
        resultText: 'You gather your remaining gear and follow the trail.',
        skillCheck: {
          skill: 'survival',
          difficulty: 50,
          successText:
            'The tracks lead to a hidden camp of desperate refugees - families fleeing IVRC displacement. You recover your goods but see their children\'s hungry faces.',
          failureText:
            'The trail goes cold in rocky terrain. Your supplies are gone.',
          successEffects: [
            { type: 'give_gold', valueRange: [15, 30] },
            { type: 'give_xp', value: 35 },
            { type: 'set_flag', stringValue: 'found_refugee_camp' },
          ],
          failureEffects: [
            { type: 'take_gold', valueRange: [10, 25] },
            { type: 'give_xp', value: 15 },
          ],
        },
        tags: ['brave'],
      },
      {
        id: 'assess_loss',
        text: 'Take inventory of what\'s missing',
        tooltip: 'Figure out the damage',
        resultText:
          'You count your losses. Could be worse - they missed your hidden coin pouch.',
        effects: [
          { type: 'take_gold', valueRange: [5, 15] },
          { type: 'take_item', target: 'canned_food', chance: 0.5 },
          { type: 'give_xp', value: 10 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'let_go',
        text: 'They clearly needed it more than you',
        tooltip: 'Accept the loss gracefully',
        resultText:
          'You sigh and pack up what remains. The frontier makes desperate people of us all.',
        effects: [
          { type: 'take_gold', valueRange: [10, 25] },
          { type: 'change_morale', value: 5 },
          { type: 'give_xp', value: 15 },
        ],
        tags: ['generous', 'moral'],
      },
    ],
    repeatable: true,
    cooldownHours: 72,
    tags: ['theft', 'loss', 'survival'],
  },

  // 5. Beautiful Sunrise (Morale Boost)
  {
    id: 'camp_sunrise',
    title: 'Dawn on the Frontier',
    description:
      "You wake to a sight that takes your breath away. The sun rises over the desert, painting the sky in brilliant oranges, pinks, and golds. The harsh land is transformed into something almost magical. For a moment, all your troubles seem small against the vastness of this beautiful, wild country.",
    category: 'camp',
    rarity: 'uncommon',
    weight: 0.9,
    conditions: {
      timeOfDay: ['dawn'],
    },
    choices: [
      {
        id: 'appreciate',
        text: 'Take time to appreciate the view',
        tooltip: 'Savor the moment',
        resultText:
          'You sit in silence, watching the colors shift and change. When you finally pack up camp, you feel renewed.',
        effects: [
          { type: 'change_morale', value: 25 },
          { type: 'heal', value: 5 },
          { type: 'give_xp', value: 10 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'sketch',
        text: 'Try to capture it in a sketch',
        tooltip: 'Document the beauty',
        resultText:
          'Your amateur drawing doesn\'t do it justice, but the act of creation brings its own peace.',
        effects: [
          { type: 'change_morale', value: 20 },
          { type: 'give_item', target: 'sunrise_sketch' },
          { type: 'give_xp', value: 15 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'share_moment',
        text: 'Think of someone who would love this',
        tooltip: 'Remember loved ones',
        resultText:
          'You think of home, of people you\'ve left behind. The beauty is bittersweet, but also a reminder of why you\'re out here.',
        effects: [
          { type: 'change_morale', value: 15 },
          { type: 'give_xp', value: 10 },
        ],
        tags: ['peaceful', 'moral'],
      },
      {
        id: 'hurry',
        text: 'No time for sunsets - you have places to be',
        tooltip: 'Get moving',
        resultText: 'You break camp quickly and hit the trail. The moment passes, unappreciated.',
        effects: [],
        tags: ['aggressive'],
      },
    ],
    repeatable: true,
    cooldownHours: 72,
    tags: ['beauty', 'nature', 'morale'],
  },

  // 6. Strange Lights in Distance
  {
    id: 'camp_strange_lights',
    title: 'Lights in the Darkness',
    description:
      "In the deep of night, you notice strange lights on the horizon - too bright to be campfires, too steady to be torches. They pulse with an unnatural blue-white glow, flickering in patterns that seem almost deliberate. The lights come from the direction of the old abandoned mines.",
    category: 'camp',
    rarity: 'rare',
    weight: 0.5,
    conditions: {
      timeOfDay: ['night'],
    },
    choices: [
      {
        id: 'investigate_now',
        text: 'Break camp and investigate immediately',
        tooltip: 'Seek the source',
        resultText: 'You pack quickly and ride toward the lights.',
        skillCheck: {
          skill: 'survival',
          difficulty: 55,
          successText:
            'You navigate the darkness safely and find an entrance to an old mine. The lights come from deep within - and you hear mechanical sounds.',
          failureText:
            'In the darkness, you take a wrong turn and nearly ride off a cliff. The lights fade before you can reach them.',
          successEffects: [
            { type: 'unlock_location', target: 'glowing_mine_entrance' },
            { type: 'give_xp', value: 50 },
            { type: 'reveal_lore', stringValue: 'lore_remnant_activity' },
            { type: 'start_quest', target: 'side_investigate_lights' },
          ],
          failureEffects: [
            { type: 'damage', value: 10 },
            { type: 'give_xp', value: 20 },
          ],
        },
        tags: ['brave'],
      },
      {
        id: 'mark_location',
        text: 'Mark the direction and investigate by daylight',
        tooltip: 'Plan carefully',
        resultText:
          'You note the bearing carefully, planning to explore when you can see what you\'re doing.',
        effects: [
          { type: 'set_flag', stringValue: 'noted_strange_lights' },
          { type: 'give_xp', value: 20 },
        ],
        tags: ['peaceful'],
      },
      {
        id: 'watch',
        text: 'Watch the lights until dawn',
        tooltip: 'Observe from safety',
        resultText:
          'You watch for hours, noting the patterns. The lights pulse in a rhythm - like breathing, or perhaps like machinery coming to life.',
        effects: [
          { type: 'reveal_lore', stringValue: 'lore_light_patterns' },
          { type: 'give_xp', value: 30 },
          { type: 'change_morale', value: -5 },
        ],
        tags: ['brave'],
      },
      {
        id: 'ignore',
        text: 'None of your business - go back to sleep',
        tooltip: 'Mind your own affairs',
        resultText:
          'You pull your blanket over your head. Whatever it is, it can wait for someone else to deal with.',
        effects: [],
        tags: ['coward'],
      },
    ],
    repeatable: false,
    cooldownHours: 0,
    tags: ['mystery', 'remnant', 'supernatural'],
  },
];

// ============================================================================
// ALL EVENTS COMBINED
// ============================================================================

export const ALL_RANDOM_EVENTS: RandomEvent[] = [...TRAVEL_EVENTS, ...TOWN_EVENTS, ...CAMP_EVENTS];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get events filtered by category
 */
export function getEventsByCategory(category: EventCategory): RandomEvent[] {
  return ALL_RANDOM_EVENTS.filter((event) => event.category === category);
}

/**
 * Get events filtered by rarity
 */
export function getEventsByRarity(rarity: EventRarity): RandomEvent[] {
  return ALL_RANDOM_EVENTS.filter((event) => event.rarity === rarity);
}

/**
 * Get event by ID
 */
export function getEventById(id: string): RandomEvent | undefined {
  return ALL_RANDOM_EVENTS.find((event) => event.id === id);
}

/**
 * Check if event conditions are met
 */
export function checkEventConditions(
  event: RandomEvent,
  context: {
    timeOfDay: TimeOfDay;
    playerLevel: number;
    playerGold: number;
    playerHealthPercent: number;
    inventory: string[];
    factionReputation: Record<string, number>;
    gameFlags: Set<string>;
    completedQuests: string[];
    activeQuests: string[];
    currentLocationId?: string;
    currentRegionId?: string;
    currentTerrain?: string;
    weather?: string;
  }
): boolean {
  const cond = event.conditions;

  // Time of day check
  if (cond.timeOfDay && !cond.timeOfDay.includes(context.timeOfDay) && !cond.timeOfDay.includes('any')) {
    return false;
  }

  // Level checks
  if (cond.minLevel && context.playerLevel < cond.minLevel) return false;
  if (cond.maxLevel && context.playerLevel > cond.maxLevel) return false;

  // Gold check
  if (cond.minGold && context.playerGold < cond.minGold) return false;

  // Health check
  if (cond.minHealthPercent && context.playerHealthPercent < cond.minHealthPercent) return false;

  // Required items check
  if (cond.requiredItems && !cond.requiredItems.every((item) => context.inventory.includes(item))) {
    return false;
  }

  // Reputation checks
  if (cond.minReputation) {
    for (const [faction, minRep] of Object.entries(cond.minReputation)) {
      if ((context.factionReputation[faction] ?? 0) < minRep) return false;
    }
  }
  if (cond.maxReputation) {
    for (const [faction, maxRep] of Object.entries(cond.maxReputation)) {
      if ((context.factionReputation[faction] ?? 0) > maxRep) return false;
    }
  }

  // Flag checks
  if (cond.requiredFlags && !cond.requiredFlags.every((flag) => context.gameFlags.has(flag))) {
    return false;
  }
  if (cond.forbiddenFlags && cond.forbiddenFlags.some((flag) => context.gameFlags.has(flag))) {
    return false;
  }

  // Quest checks
  if (cond.completedQuests && !cond.completedQuests.every((q) => context.completedQuests.includes(q))) {
    return false;
  }
  if (cond.activeQuests && !cond.activeQuests.every((q) => context.activeQuests.includes(q))) {
    return false;
  }

  // Location/region checks
  if (cond.locationIds && context.currentLocationId && !cond.locationIds.includes(context.currentLocationId)) {
    return false;
  }
  if (cond.regionIds && context.currentRegionId && !cond.regionIds.includes(context.currentRegionId)) {
    return false;
  }

  // Terrain check
  if (cond.terrainTypes && context.currentTerrain && !cond.terrainTypes.includes(context.currentTerrain)) {
    return false;
  }

  // Weather check
  if (cond.weather && context.weather && !cond.weather.includes(context.weather as any)) {
    return false;
  }

  return true;
}

/**
 * Select a random event from available options using weighted random
 */
export function selectRandomEvent(
  category: EventCategory,
  context: {
    timeOfDay: TimeOfDay;
    playerLevel: number;
    playerGold: number;
    playerHealthPercent: number;
    inventory: string[];
    factionReputation: Record<string, number>;
    gameFlags: Set<string>;
    completedQuests: string[];
    activeQuests: string[];
    currentLocationId?: string;
    currentRegionId?: string;
    currentTerrain?: string;
    weather?: string;
    triggeredEventIds: Set<string>;
    eventCooldowns: Map<string, number>;
    currentTime: number;
  },
  random: () => number = Math.random
): RandomEvent | null {
  // Get events for this category that pass conditions
  const eligibleEvents = getEventsByCategory(category).filter((event) => {
    // Check basic conditions
    if (!checkEventConditions(event, context)) return false;

    // Check if non-repeatable event was already triggered
    if (!event.repeatable && context.triggeredEventIds.has(event.id)) return false;

    // Check cooldown
    const lastTriggered = context.eventCooldowns.get(event.id);
    if (lastTriggered) {
      const cooldownMs = event.cooldownHours * 60 * 60 * 1000;
      if (context.currentTime - lastTriggered < cooldownMs) return false;
    }

    return true;
  });

  if (eligibleEvents.length === 0) return null;

  // Calculate total weight
  const totalWeight = eligibleEvents.reduce((sum, event) => {
    return sum + RARITY_WEIGHTS[event.rarity] * event.weight;
  }, 0);

  // Select random event based on weight
  let roll = random() * totalWeight;
  for (const event of eligibleEvents) {
    const weight = RARITY_WEIGHTS[event.rarity] * event.weight;
    roll -= weight;
    if (roll <= 0) return event;
  }

  // Fallback to last event (shouldn't happen)
  return eligibleEvents[eligibleEvents.length - 1];
}

/**
 * Get available choices for an event based on player state
 */
export function getAvailableChoices(
  event: RandomEvent,
  context: {
    playerGold: number;
    inventory: string[];
    factionReputation: Record<string, number>;
    gameFlags: Set<string>;
  }
): EventChoice[] {
  return event.choices.filter((choice) => {
    if (!choice.conditions) return true;

    const cond = choice.conditions;

    if (cond.minGold && context.playerGold < cond.minGold) return false;
    if (cond.requiredItems && !cond.requiredItems.every((item) => context.inventory.includes(item))) {
      return false;
    }
    if (cond.requiredFlags && !cond.requiredFlags.every((flag) => context.gameFlags.has(flag))) {
      return false;
    }
    if (cond.forbiddenFlags && cond.forbiddenFlags.some((flag) => context.gameFlags.has(flag))) {
      return false;
    }
    if (cond.minReputation) {
      for (const [faction, minRep] of Object.entries(cond.minReputation)) {
        if ((context.factionReputation[faction] ?? 0) < minRep) return false;
      }
    }

    return true;
  });
}

/**
 * Calculate effect value, handling random ranges
 */
export function calculateEffectValue(effect: EventEffect, random: () => number = Math.random): number {
  if (effect.valueRange) {
    const [min, max] = effect.valueRange;
    return Math.floor(min + random() * (max - min + 1));
  }
  return effect.value ?? 0;
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateRandomEvent(data: unknown): RandomEvent {
  return RandomEventSchema.parse(data);
}

export function validateEventChoice(data: unknown): EventChoice {
  return EventChoiceSchema.parse(data);
}

export function validateEventEffect(data: unknown): EventEffect {
  return EventEffectSchema.parse(data);
}

export const RANDOM_EVENTS_SCHEMA_VERSION = '1.0.0';
