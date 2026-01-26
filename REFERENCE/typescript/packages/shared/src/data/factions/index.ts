/**
 * Iron Frontier - Faction Reputation System
 *
 * Complete faction definitions for the five major factions:
 * 1. IVRC (Iron Valley Railroad Company) - Corporate control
 * 2. Copperheads - Violent outlaw resistance
 * 3. Freeminers - Peaceful worker resistance
 * 4. The Law - Sheriff and deputies
 * 5. Townsfolk - General population
 *
 * Each faction has:
 * - Full reputation tier effects (-100 to +100)
 * - 20+ actions affecting reputation
 * - Relationships with other factions
 * - Decay mechanics toward neutral
 */

import type {
  FactionDefinition,
  FactionAction,
  FactionTierEffects,
  FactionRelationship,
  PlayerFactionStanding,
  PlayerFactionState,
  ReputationTier,
} from '../schemas/faction';

import {
  getReputationTier,
  applyReputationDecay,
  calculateReputationChange,
  REPUTATION_TIER_BOUNDARIES,
} from '../schemas/faction';

// ============================================================================
// IVRC - IRON VALLEY RAILROAD COMPANY
// ============================================================================

const ivrcTierEffects: FactionTierEffects[] = [
  {
    tier: 'hated',
    priceModifier: 2.0,
    questAvailability: 0,
    areaAccess: false,
    attackOnSight: true,
    canTrade: false,
    greetingSnippets: [
      'greeting_ivrc_hated_1',
      'greeting_ivrc_hated_2',
      'greeting_ivrc_hated_3',
    ],
    perks: [],
    description:
      'IVRC has placed a bounty on your head. Company guards attack on sight, and you are banned from all IVRC facilities.',
  },
  {
    tier: 'hostile',
    priceModifier: 1.75,
    questAvailability: 0,
    areaAccess: false,
    attackOnSight: false,
    canTrade: false,
    greetingSnippets: [
      'greeting_ivrc_hostile_1',
      'greeting_ivrc_hostile_2',
    ],
    perks: [],
    description:
      'You are considered an enemy of the company. Guards will arrest you on sight, and no IVRC employee will deal with you.',
  },
  {
    tier: 'unfriendly',
    priceModifier: 1.4,
    questAvailability: 0.1,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_ivrc_unfriendly_1',
      'greeting_ivrc_unfriendly_2',
    ],
    perks: [],
    description:
      'IVRC views you with suspicion. Prices are inflated and job opportunities are scarce.',
  },
  {
    tier: 'neutral',
    priceModifier: 1.15,
    questAvailability: 0.4,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_ivrc_neutral_1',
      'greeting_ivrc_neutral_2',
    ],
    perks: [],
    description:
      'You are just another face in the crowd to IVRC. Standard company rates and policies apply.',
  },
  {
    tier: 'friendly',
    priceModifier: 0.95,
    questAvailability: 0.65,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_ivrc_friendly_1',
      'greeting_ivrc_friendly_2',
    ],
    perks: ['ivrc_employee_discount'],
    description:
      'IVRC sees you as a reliable contractor. You receive small discounts and access to entry-level jobs.',
  },
  {
    tier: 'honored',
    priceModifier: 0.8,
    questAvailability: 0.85,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_ivrc_honored_1',
      'greeting_ivrc_honored_2',
    ],
    perks: ['ivrc_employee_discount', 'ivrc_vip_access', 'ivrc_free_travel'],
    description:
      'You are a valued company associate. Significant discounts, VIP area access, and free train travel.',
  },
  {
    tier: 'revered',
    priceModifier: 0.65,
    questAvailability: 1.0,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_ivrc_revered_1',
      'greeting_ivrc_revered_2',
    ],
    perks: [
      'ivrc_employee_discount',
      'ivrc_vip_access',
      'ivrc_free_travel',
      'ivrc_company_protection',
      'ivrc_executive_suite',
    ],
    description:
      'You are practically IVRC royalty. Maximum discounts, personal company protection, executive accommodations.',
  },
];

const ivrcActions: FactionAction[] = [
  // Quest Actions
  { id: 'ivrc_quest_main', name: 'Complete IVRC main storyline quest', description: 'Complete a main storyline quest for IVRC', category: 'quest', reputationDelta: 15, oneTime: true, tags: ['main'] },
  { id: 'ivrc_quest_delivery', name: 'Complete delivery contract', description: 'Deliver goods or documents for IVRC', category: 'quest', reputationDelta: 5, tags: ['delivery'] },
  { id: 'ivrc_quest_security', name: 'Complete security job', description: 'Protect IVRC assets or personnel', category: 'quest', reputationDelta: 8, tags: ['security'] },
  { id: 'ivrc_quest_investigation', name: 'Investigate theft', description: 'Investigate theft of IVRC property', category: 'quest', reputationDelta: 10, oneTime: true, tags: ['investigation'] },
  { id: 'ivrc_quest_sabotage_enemy', name: 'Sabotage Copperheads', description: 'Sabotage Copperhead operations for IVRC', category: 'quest', reputationDelta: 12, tags: ['sabotage'] },

  // Combat Actions
  { id: 'ivrc_kill_guard', name: 'Kill IVRC guard', description: 'Kill a company guard or enforcer', category: 'combat', reputationDelta: -15, tags: ['murder'] },
  { id: 'ivrc_kill_executive', name: 'Kill IVRC executive', description: 'Kill a company executive or manager', category: 'combat', reputationDelta: -25, oneTime: false, tags: ['murder', 'vip'] },
  { id: 'ivrc_defend_train', name: 'Defend train from bandits', description: 'Help defend an IVRC train from raiders', category: 'combat', reputationDelta: 10, tags: ['defense'] },
  { id: 'ivrc_capture_outlaw', name: 'Capture wanted outlaw for IVRC', description: 'Capture an outlaw with IVRC bounty', category: 'combat', reputationDelta: 8, tags: ['bounty'] },

  // Trade Actions
  { id: 'ivrc_large_purchase', name: 'Make large purchase', description: 'Spend 100+ gold at IVRC store', category: 'trade', reputationDelta: 2, cooldownHours: 24, tags: ['trade'] },
  { id: 'ivrc_sell_ore', name: 'Sell ore to IVRC', description: 'Sell valuable ore to company buyers', category: 'trade', reputationDelta: 1, cooldownHours: 12, tags: ['trade', 'mining'] },
  { id: 'ivrc_exclusive_contract', name: 'Sign exclusive trading contract', description: 'Agree to sell only to IVRC', category: 'trade', reputationDelta: 10, oneTime: true, tags: ['trade', 'exclusive'] },

  // Dialogue Actions
  { id: 'ivrc_report_copperheads', name: 'Report Copperhead activity', description: 'Inform IVRC about Copperhead locations or plans', category: 'dialogue', reputationDelta: 5, cooldownHours: 48, tags: ['intel'] },
  { id: 'ivrc_praise_company', name: 'Publicly support IVRC', description: 'Speak in favor of company policies', category: 'dialogue', reputationDelta: 2, cooldownHours: 24, tags: ['speech'] },
  { id: 'ivrc_criticize_company', name: 'Publicly criticize IVRC', description: 'Speak against company policies', category: 'dialogue', reputationDelta: -5, cooldownHours: 24, tags: ['speech'] },

  // Crime Actions
  { id: 'ivrc_theft_small', name: 'Steal from IVRC (minor)', description: 'Steal items worth less than 10 gold', category: 'crime', reputationDelta: -8, tags: ['theft'] },
  { id: 'ivrc_theft_large', name: 'Steal from IVRC (major)', description: 'Steal items worth 10+ gold', category: 'crime', reputationDelta: -15, tags: ['theft'] },
  { id: 'ivrc_trespass', name: 'Trespass in restricted area', description: 'Enter IVRC restricted area without permission', category: 'crime', reputationDelta: -5, tags: ['trespass'] },
  { id: 'ivrc_assault_worker', name: 'Assault IVRC worker', description: 'Attack but not kill an IVRC employee', category: 'crime', reputationDelta: -10, tags: ['assault'] },

  // Assistance Actions
  { id: 'ivrc_rescue_worker', name: 'Rescue trapped worker', description: 'Save an IVRC worker from danger', category: 'assistance', reputationDelta: 8, tags: ['rescue'] },
  { id: 'ivrc_repair_equipment', name: 'Repair IVRC equipment', description: 'Fix broken company machinery', category: 'assistance', reputationDelta: 4, cooldownHours: 24, tags: ['repair'] },
  { id: 'ivrc_provide_intel', name: 'Provide valuable intelligence', description: 'Share important information with IVRC', category: 'assistance', reputationDelta: 6, cooldownHours: 48, tags: ['intel'] },

  // Betrayal Actions
  { id: 'ivrc_leak_secrets', name: 'Leak company secrets', description: 'Share IVRC secrets with rivals', category: 'betrayal', reputationDelta: -20, oneTime: false, tags: ['espionage'] },
  { id: 'ivrc_break_contract', name: 'Break IVRC contract', description: 'Fail to fulfill an agreed contract', category: 'betrayal', reputationDelta: -12, tags: ['contract'] },

  // Donation Actions
  { id: 'ivrc_invest', name: 'Invest in IVRC', description: 'Purchase company bonds or shares', category: 'donation', reputationDelta: 8, oneTime: true, tags: ['investment'] },

  // Discovery Actions
  { id: 'ivrc_find_ore_vein', name: 'Discover ore vein', description: 'Report a new ore deposit to IVRC', category: 'discovery', reputationDelta: 10, oneTime: false, tags: ['discovery', 'mining'] },
  { id: 'ivrc_find_saboteur', name: 'Identify saboteur', description: 'Identify someone sabotaging IVRC operations', category: 'discovery', reputationDelta: 12, oneTime: false, tags: ['investigation'] },

  // Sabotage Actions
  { id: 'ivrc_sabotage_tracks', name: 'Sabotage railroad tracks', description: 'Damage IVRC railroad infrastructure', category: 'sabotage', reputationDelta: -20, tags: ['sabotage'] },
  { id: 'ivrc_sabotage_mine', name: 'Sabotage IVRC mine', description: 'Damage IVRC mining operations', category: 'sabotage', reputationDelta: -18, tags: ['sabotage'] },
  { id: 'ivrc_free_workers', name: 'Free indentured workers', description: 'Help debt-bonded workers escape', category: 'sabotage', reputationDelta: -15, tags: ['liberation'] },
];

const ivrcRelationships: FactionRelationship[] = [
  { factionId: 'copperheads', relationship: 'hostile', rippleMultiplier: -0.6, notes: 'Sworn enemies - Copperheads exist to destroy IVRC' },
  { factionId: 'freeminers', relationship: 'rival', rippleMultiplier: -0.3, notes: 'Economic rivals - Freeminers resist IVRC monopoly' },
  { factionId: 'law', relationship: 'allied', rippleMultiplier: 0.4, notes: 'IVRC funds local law enforcement' },
  { factionId: 'townsfolk', relationship: 'neutral', rippleMultiplier: 0.1, notes: 'IVRC provides jobs but also exploits workers' },
];

export const IVRC_FACTION: FactionDefinition = {
  id: 'ivrc',
  name: 'IVRC',
  fullName: 'Iron Valley Railroad Company',
  description: 'The powerful corporation controlling the region\'s railroads and mines.',
  lore: `The Iron Valley Railroad Company arrived in the territory twenty years ago with promises of prosperity and progress. They built the rails that connect the frontier to civilization, established mines that extract the region's wealth, and created company towns where thousands now live and work.

But progress has a price. IVRC's monopoly on transportation means they control what moves in and out of the valley. Their company stores charge inflated prices to workers paid in company scrip. Miners who can't pay their debts become indentured laborers, little better than slaves.

The company's board sits in distant cities, caring only for profits. Local managers enforce their will through hired guards and Pinkerton agents. Those who resist find themselves blacklisted, evicted, or worse.

Yet for all their sins, IVRC is the only reliable employer in the region. They keep the trains running, the mines operating, and the settlements connected to the outside world. Many see them as a necessary evil; others as the only path to a better life.`,
  type: 'corporation',
  primaryColor: '#8B4513',
  secondaryColor: '#D4AF37',
  iconId: 'icon_ivrc',
  headquartersId: 'iron_gulch',
  controlledLocations: ['iron_gulch', 'copper_mine', 'ivrc_rail_depot'],
  keyNpcIds: ['superintendent_hayes', 'foreman_kruger', 'clerk_williams'],
  defaultReputation: 0,
  tierEffects: ivrcTierEffects,
  relationships: ivrcRelationships,
  actions: ivrcActions,
  decayRatePerDay: 1,
  decayThreshold: 5,
  tags: ['corporate', 'employer', 'railroad', 'mining'],
};

// ============================================================================
// COPPERHEADS - OUTLAW GANG
// ============================================================================

const copperheadsTierEffects: FactionTierEffects[] = [
  {
    tier: 'hated',
    priceModifier: 2.0,
    questAvailability: 0,
    areaAccess: false,
    attackOnSight: true,
    canTrade: false,
    greetingSnippets: [
      'greeting_copperheads_hated_1',
      'greeting_copperheads_hated_2',
    ],
    perks: [],
    description:
      'The Copperheads have marked you for death. Their assassins will hunt you, and entering their territory means certain combat.',
  },
  {
    tier: 'hostile',
    priceModifier: 1.8,
    questAvailability: 0,
    areaAccess: false,
    attackOnSight: true,
    canTrade: false,
    greetingSnippets: [
      'greeting_copperheads_hostile_1',
    ],
    perks: [],
    description:
      'You are an enemy of the Copperheads. They will attack you on sight in their territory.',
  },
  {
    tier: 'unfriendly',
    priceModifier: 1.5,
    questAvailability: 0.1,
    areaAccess: false,
    attackOnSight: false,
    canTrade: false,
    greetingSnippets: [
      'greeting_copperheads_unfriendly_1',
    ],
    perks: [],
    description:
      'The Copperheads don\'t trust you. They won\'t trade with you and may become aggressive.',
  },
  {
    tier: 'neutral',
    priceModifier: 1.2,
    questAvailability: 0.3,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_copperheads_neutral_1',
      'greeting_copperheads_neutral_2',
    ],
    perks: [],
    description:
      'The Copperheads are watching you. Safe passage is granted, but trust must be earned.',
  },
  {
    tier: 'friendly',
    priceModifier: 0.9,
    questAvailability: 0.6,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_copperheads_friendly_1',
      'greeting_copperheads_friendly_2',
    ],
    perks: ['copperheads_safe_passage', 'copperheads_black_market_access'],
    description:
      'The Copperheads consider you a friend. Access to their black market and safe passage through their territory.',
  },
  {
    tier: 'honored',
    priceModifier: 0.75,
    questAvailability: 0.85,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_copperheads_honored_1',
    ],
    perks: [
      'copperheads_safe_passage',
      'copperheads_black_market_access',
      'copperheads_hideout_access',
      'copperheads_special_equipment',
    ],
    description:
      'You are a trusted ally of the Copperheads. Access to their hideouts and special outlaw equipment.',
  },
  {
    tier: 'revered',
    priceModifier: 0.6,
    questAvailability: 1.0,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_copperheads_revered_1',
    ],
    perks: [
      'copperheads_safe_passage',
      'copperheads_black_market_access',
      'copperheads_hideout_access',
      'copperheads_special_equipment',
      'copperheads_gang_backup',
      'copperheads_bounty_immunity',
    ],
    description:
      'You are legendary among the Copperheads. Gang members will fight alongside you, and other outlaws respect your reputation.',
  },
];

const copperheadsActions: FactionAction[] = [
  // Quest Actions
  { id: 'copperheads_quest_heist', name: 'Complete heist job', description: 'Participate in a Copperhead heist', category: 'quest', reputationDelta: 12, tags: ['heist'] },
  { id: 'copperheads_quest_ambush', name: 'Complete ambush mission', description: 'Help ambush an IVRC convoy', category: 'quest', reputationDelta: 10, tags: ['combat'] },
  { id: 'copperheads_quest_sabotage', name: 'Complete sabotage mission', description: 'Sabotage IVRC operations', category: 'quest', reputationDelta: 8, tags: ['sabotage'] },
  { id: 'copperheads_quest_rescue', name: 'Rescue captured member', description: 'Break a Copperhead out of jail', category: 'quest', reputationDelta: 15, oneTime: false, tags: ['rescue'] },
  { id: 'copperheads_quest_smuggle', name: 'Complete smuggling run', description: 'Smuggle goods past IVRC checkpoints', category: 'quest', reputationDelta: 6, tags: ['smuggling'] },

  // Combat Actions
  { id: 'copperheads_kill_member', name: 'Kill Copperhead member', description: 'Kill a gang member', category: 'combat', reputationDelta: -20, tags: ['murder'] },
  { id: 'copperheads_kill_leader', name: 'Kill Copperhead lieutenant', description: 'Kill a gang lieutenant', category: 'combat', reputationDelta: -30, tags: ['murder', 'vip'] },
  { id: 'copperheads_kill_ivrc', name: 'Kill IVRC enforcer', description: 'Kill an IVRC guard or Pinkerton', category: 'combat', reputationDelta: 5, tags: ['combat'] },
  { id: 'copperheads_rob_train', name: 'Rob IVRC train', description: 'Successfully rob an IVRC train', category: 'combat', reputationDelta: 10, tags: ['robbery'] },
  { id: 'copperheads_defend_hideout', name: 'Defend hideout', description: 'Help defend a Copperhead hideout from law', category: 'combat', reputationDelta: 12, tags: ['defense'] },

  // Trade Actions
  { id: 'copperheads_buy_contraband', name: 'Buy contraband', description: 'Purchase illegal goods from Copperheads', category: 'trade', reputationDelta: 2, cooldownHours: 24, tags: ['trade'] },
  { id: 'copperheads_sell_stolen', name: 'Sell stolen goods', description: 'Fence stolen items through Copperheads', category: 'trade', reputationDelta: 1, cooldownHours: 12, tags: ['trade', 'fence'] },
  { id: 'copperheads_supply_weapons', name: 'Supply weapons', description: 'Sell weapons to the gang', category: 'trade', reputationDelta: 4, cooldownHours: 48, tags: ['trade', 'weapons'] },

  // Dialogue Actions
  { id: 'copperheads_refuse_bounty', name: 'Refuse bounty on Copperhead', description: 'Decline to hunt a wanted Copperhead', category: 'dialogue', reputationDelta: 3, cooldownHours: 24, tags: ['loyalty'] },
  { id: 'copperheads_share_intel', name: 'Share IVRC intel', description: 'Provide information about IVRC movements', category: 'dialogue', reputationDelta: 5, cooldownHours: 48, tags: ['intel'] },
  { id: 'copperheads_denounce_gang', name: 'Denounce the gang', description: 'Publicly speak against the Copperheads', category: 'dialogue', reputationDelta: -8, cooldownHours: 24, tags: ['speech'] },

  // Crime Actions (from their perspective)
  { id: 'copperheads_steal_from_gang', name: 'Steal from Copperheads', description: 'Steal money or goods from the gang', category: 'crime', reputationDelta: -15, tags: ['theft'] },
  { id: 'copperheads_betray_location', name: 'Reveal hideout location', description: 'Tell law where hideout is', category: 'crime', reputationDelta: -25, oneTime: false, tags: ['betrayal'] },
  { id: 'copperheads_work_with_law', name: 'Work with law against gang', description: 'Help law enforcement catch Copperheads', category: 'crime', reputationDelta: -12, tags: ['betrayal'] },

  // Assistance Actions
  { id: 'copperheads_hide_fugitive', name: 'Hide a fugitive', description: 'Help a Copperhead evade the law', category: 'assistance', reputationDelta: 6, tags: ['shelter'] },
  { id: 'copperheads_provide_alibi', name: 'Provide alibi', description: 'Lie to law about Copperhead whereabouts', category: 'assistance', reputationDelta: 4, cooldownHours: 24, tags: ['alibi'] },
  { id: 'copperheads_patch_up_wounded', name: 'Treat wounded member', description: 'Provide medical care to injured gang member', category: 'assistance', reputationDelta: 5, tags: ['medical'] },

  // Betrayal Actions
  { id: 'copperheads_turn_in_bounty', name: 'Turn in gang member', description: 'Collect bounty on a Copperhead', category: 'betrayal', reputationDelta: -18, tags: ['bounty'] },
  { id: 'copperheads_lead_ambush', name: 'Lead law to gang', description: 'Help set up an ambush against Copperheads', category: 'betrayal', reputationDelta: -25, tags: ['ambush'] },

  // Donation Actions
  { id: 'copperheads_donate_gold', name: 'Donate to gang fund', description: 'Give money to support the gang', category: 'donation', reputationDelta: 3, cooldownHours: 72, tags: ['donation'] },
  { id: 'copperheads_donate_supplies', name: 'Donate supplies', description: 'Provide food, medicine, or ammo', category: 'donation', reputationDelta: 4, cooldownHours: 48, tags: ['donation'] },

  // Discovery Actions
  { id: 'copperheads_find_safe_route', name: 'Discover smuggling route', description: 'Find a new safe passage for contraband', category: 'discovery', reputationDelta: 8, oneTime: false, tags: ['discovery'] },
  { id: 'copperheads_identify_informant', name: 'Identify informant', description: 'Expose someone spying for IVRC or law', category: 'discovery', reputationDelta: 12, tags: ['investigation'] },

  // Sabotage Actions (helping them)
  { id: 'copperheads_sabotage_ivrc', name: 'Sabotage IVRC for gang', description: 'Damage IVRC property on gang orders', category: 'sabotage', reputationDelta: 8, tags: ['sabotage'] },
  { id: 'copperheads_plant_dynamite', name: 'Plant explosives', description: 'Help with a bombing operation', category: 'sabotage', reputationDelta: 10, oneTime: false, tags: ['sabotage', 'explosives'] },
];

const copperheadsRelationships: FactionRelationship[] = [
  { factionId: 'ivrc', relationship: 'hostile', rippleMultiplier: -0.7, notes: 'Sworn enemies - gang exists to destroy IVRC' },
  { factionId: 'freeminers', relationship: 'friendly', rippleMultiplier: 0.3, notes: 'Sympathetic to worker cause but disagree on methods' },
  { factionId: 'law', relationship: 'hostile', rippleMultiplier: -0.6, notes: 'Outlaws versus law enforcement' },
  { factionId: 'townsfolk', relationship: 'rival', rippleMultiplier: -0.2, notes: 'Townsfolk fear gang violence' },
];

export const COPPERHEADS_FACTION: FactionDefinition = {
  id: 'copperheads',
  name: 'Copperheads',
  fullName: 'The Copperhead Gang',
  description: 'A violent outlaw gang dedicated to destroying IVRC through any means necessary.',
  lore: `The Copperheads take their name from the venomous snakes of the region, and like their namesake, they strike without warning. Founded by former IVRC miners who watched their friends die in preventable accidents, the gang has grown into a formidable force of outlaws, revolutionaries, and common criminals.

Their leader, the legendary "Diamondback," was once a mine foreman who organized workers to demand better conditions. When IVRC responded by having strikers beaten and their families evicted, Diamondback took up arms. Now the Copperheads wage a guerrilla war against the company, robbing trains, sabotaging equipment, and assassinating executives.

Not all Copperheads joined for the cause. The gang has attracted its share of murderers, thieves, and psychopaths who use the revolution as an excuse for violence. This has alienated potential allies and turned public opinion against them.

The Copperheads operate from hidden camps in Rattlesnake Canyon, where the rough terrain makes them nearly impossible to root out. They have contacts in every town, a network of informants, and access to black market goods unavailable elsewhere.

Some see them as freedom fighters. Others as terrorists. Either way, crossing them is extremely dangerous.`,
  type: 'outlaw',
  primaryColor: '#8B0000',
  secondaryColor: '#CD853F',
  iconId: 'icon_copperheads',
  headquartersId: 'rattlesnake_canyon',
  controlledLocations: ['rattlesnake_canyon', 'copperhead_hideout'],
  keyNpcIds: ['diamondback', 'snake_eyes_sal', 'mad_dog_murphy'],
  defaultReputation: -10,
  tierEffects: copperheadsTierEffects,
  relationships: copperheadsRelationships,
  actions: copperheadsActions,
  decayRatePerDay: 0.5,
  decayThreshold: 10,
  tags: ['outlaw', 'gang', 'revolutionary', 'violent'],
};

// ============================================================================
// FREEMINERS - PEACEFUL RESISTANCE
// ============================================================================

const freeminersTierEffects: FactionTierEffects[] = [
  {
    tier: 'hated',
    priceModifier: 1.8,
    questAvailability: 0,
    areaAccess: false,
    attackOnSight: false,
    canTrade: false,
    greetingSnippets: [
      'greeting_freeminers_hated_1',
    ],
    perks: [],
    description:
      'The Freeminers consider you a traitor to working people. They refuse all contact and may report your movements to others.',
  },
  {
    tier: 'hostile',
    priceModifier: 1.5,
    questAvailability: 0,
    areaAccess: false,
    attackOnSight: false,
    canTrade: false,
    greetingSnippets: [
      'greeting_freeminers_hostile_1',
    ],
    perks: [],
    description:
      'The Freeminers deeply distrust you. They won\'t share information or resources.',
  },
  {
    tier: 'unfriendly',
    priceModifier: 1.2,
    questAvailability: 0.2,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_freeminers_unfriendly_1',
    ],
    perks: [],
    description:
      'The Freeminers are wary of you. Basic trade only, no special assistance.',
  },
  {
    tier: 'neutral',
    priceModifier: 1.0,
    questAvailability: 0.4,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_freeminers_neutral_1',
      'greeting_freeminers_neutral_2',
    ],
    perks: [],
    description:
      'The Freeminers treat you fairly. Standard access to their community.',
  },
  {
    tier: 'friendly',
    priceModifier: 0.85,
    questAvailability: 0.65,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_freeminers_friendly_1',
      'greeting_freeminers_friendly_2',
    ],
    perks: ['freeminers_discount', 'freeminers_safe_house'],
    description:
      'The Freeminers consider you a friend. Discounts and access to safe houses.',
  },
  {
    tier: 'honored',
    priceModifier: 0.7,
    questAvailability: 0.85,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_freeminers_honored_1',
    ],
    perks: [
      'freeminers_discount',
      'freeminers_safe_house',
      'freeminers_worker_assistance',
      'freeminers_intelligence_network',
    ],
    description:
      'You are a trusted ally. Workers will assist you, and you have access to their information network.',
  },
  {
    tier: 'revered',
    priceModifier: 0.55,
    questAvailability: 1.0,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_freeminers_revered_1',
    ],
    perks: [
      'freeminers_discount',
      'freeminers_safe_house',
      'freeminers_worker_assistance',
      'freeminers_intelligence_network',
      'freeminers_strike_support',
      'freeminers_community_hero',
    ],
    description:
      'You are a hero to the working people. Maximum discounts, workers will go on strike to help you, community-wide support.',
  },
];

const freeminersActions: FactionAction[] = [
  // Quest Actions
  { id: 'freeminers_quest_organize', name: 'Help organize workers', description: 'Assist in unionizing a workplace', category: 'quest', reputationDelta: 10, oneTime: false, tags: ['organizing'] },
  { id: 'freeminers_quest_supply', name: 'Deliver supplies to strikers', description: 'Bring food and medicine to striking workers', category: 'quest', reputationDelta: 6, tags: ['delivery'] },
  { id: 'freeminers_quest_document', name: 'Document IVRC abuses', description: 'Gather evidence of company wrongdoing', category: 'quest', reputationDelta: 8, oneTime: false, tags: ['investigation'] },
  { id: 'freeminers_quest_rescue_family', name: 'Rescue evicted family', description: 'Help a family displaced by IVRC', category: 'quest', reputationDelta: 10, tags: ['rescue'] },
  { id: 'freeminers_quest_smuggle_message', name: 'Smuggle message', description: 'Carry secret messages between organizers', category: 'quest', reputationDelta: 5, tags: ['smuggling'] },

  // Combat Actions
  { id: 'freeminers_kill_member', name: 'Kill Freeminer', description: 'Kill a Freeminer member', category: 'combat', reputationDelta: -15, tags: ['murder'] },
  { id: 'freeminers_kill_leader', name: 'Kill Freeminer leader', description: 'Kill a movement leader', category: 'combat', reputationDelta: -25, tags: ['murder', 'vip'] },
  { id: 'freeminers_defend_strikers', name: 'Defend strikers', description: 'Protect striking workers from violence', category: 'combat', reputationDelta: 10, tags: ['defense'] },
  { id: 'freeminers_disarm_enforcer', name: 'Disarm IVRC enforcer', description: 'Non-lethally stop IVRC violence', category: 'combat', reputationDelta: 6, tags: ['defense', 'nonlethal'] },

  // Trade Actions
  { id: 'freeminers_buy_coop', name: 'Buy from cooperative', description: 'Purchase goods from Freeminer cooperative', category: 'trade', reputationDelta: 2, cooldownHours: 24, tags: ['trade'] },
  { id: 'freeminers_sell_fair', name: 'Sell at fair prices', description: 'Sell goods without gouging', category: 'trade', reputationDelta: 1, cooldownHours: 12, tags: ['trade'] },
  { id: 'freeminers_refuse_scab', name: 'Refuse to be scab', description: 'Turn down job replacing striker', category: 'trade', reputationDelta: 5, oneTime: false, tags: ['solidarity'] },

  // Dialogue Actions
  { id: 'freeminers_spread_word', name: 'Spread the word', description: 'Tell others about worker rights', category: 'dialogue', reputationDelta: 2, cooldownHours: 24, tags: ['speech'] },
  { id: 'freeminers_stand_testimony', name: 'Give testimony', description: 'Publicly testify about IVRC abuses', category: 'dialogue', reputationDelta: 8, oneTime: true, tags: ['testimony'] },
  { id: 'freeminers_denounce_union', name: 'Denounce union', description: 'Publicly speak against workers', category: 'dialogue', reputationDelta: -10, cooldownHours: 24, tags: ['speech'] },
  { id: 'freeminers_share_information', name: 'Share information', description: 'Provide useful intel about IVRC or law', category: 'dialogue', reputationDelta: 4, cooldownHours: 48, tags: ['intel'] },

  // Crime Actions (from their perspective)
  { id: 'freeminers_steal_supplies', name: 'Steal union supplies', description: 'Take supplies meant for strikers', category: 'crime', reputationDelta: -12, tags: ['theft'] },
  { id: 'freeminers_inform_ivrc', name: 'Inform to IVRC', description: 'Report organizers to company', category: 'crime', reputationDelta: -20, tags: ['informant'] },
  { id: 'freeminers_work_as_scab', name: 'Work as scab', description: 'Take a striker\'s job', category: 'crime', reputationDelta: -15, tags: ['scab'] },

  // Assistance Actions
  { id: 'freeminers_donate_food', name: 'Donate food', description: 'Give food to hungry workers', category: 'assistance', reputationDelta: 3, cooldownHours: 24, tags: ['donation'] },
  { id: 'freeminers_hide_organizer', name: 'Hide organizer', description: 'Shelter a wanted organizer', category: 'assistance', reputationDelta: 8, tags: ['shelter'] },
  { id: 'freeminers_tend_wounded', name: 'Tend wounded', description: 'Treat injured workers', category: 'assistance', reputationDelta: 5, tags: ['medical'] },
  { id: 'freeminers_teach_reading', name: 'Teach reading', description: 'Help educate workers', category: 'assistance', reputationDelta: 4, cooldownHours: 48, tags: ['education'] },

  // Betrayal Actions
  { id: 'freeminers_expose_network', name: 'Expose safe house network', description: 'Reveal locations of safe houses', category: 'betrayal', reputationDelta: -25, tags: ['betrayal'] },
  { id: 'freeminers_identify_leaders', name: 'Identify leaders', description: 'Give names of organizers to IVRC', category: 'betrayal', reputationDelta: -20, tags: ['betrayal'] },

  // Donation Actions
  { id: 'freeminers_donate_gold', name: 'Donate to strike fund', description: 'Give money to support striking families', category: 'donation', reputationDelta: 4, cooldownHours: 72, tags: ['donation'] },
  { id: 'freeminers_donate_medicine', name: 'Donate medicine', description: 'Provide medical supplies', category: 'donation', reputationDelta: 5, cooldownHours: 48, tags: ['donation'] },

  // Discovery Actions
  { id: 'freeminers_find_evidence', name: 'Find evidence', description: 'Discover proof of IVRC crimes', category: 'discovery', reputationDelta: 10, oneTime: false, tags: ['investigation'] },
  { id: 'freeminers_find_safe_location', name: 'Find safe location', description: 'Discover new meeting spot', category: 'discovery', reputationDelta: 6, tags: ['discovery'] },

  // Sabotage Actions
  { id: 'freeminers_slow_work', name: 'Participate in work slowdown', description: 'Join workers in reducing output', category: 'sabotage', reputationDelta: 4, tags: ['protest'] },
  { id: 'freeminers_damage_scab_equipment', name: 'Sabotage scab equipment', description: 'Damage tools used by strikebreakers', category: 'sabotage', reputationDelta: 3, tags: ['sabotage'] },
];

const freeminersRelationships: FactionRelationship[] = [
  { factionId: 'ivrc', relationship: 'rival', rippleMultiplier: -0.4, notes: 'Economic and ideological opponents' },
  { factionId: 'copperheads', relationship: 'friendly', rippleMultiplier: 0.2, notes: 'Share enemy but not methods' },
  { factionId: 'law', relationship: 'neutral', rippleMultiplier: -0.1, notes: 'Law often sides with IVRC' },
  { factionId: 'townsfolk', relationship: 'allied', rippleMultiplier: 0.5, notes: 'Many townsfolk are workers or families' },
];

export const FREEMINERS_FACTION: FactionDefinition = {
  id: 'freeminers',
  name: 'Freeminers',
  fullName: 'The Freeminer Coalition',
  description: 'A peaceful workers\' movement seeking fair treatment through solidarity and nonviolent resistance.',
  lore: `The Freeminer Coalition grew from the ashes of failed violent uprisings. When direct action against IVRC led only to bloodshed and crackdowns, a new generation of leaders emerged with a different vision: organized, nonviolent resistance.

Led by figures like Ma Jennings, a widow who lost her husband to mine collapse, the Freeminers operate in the open where possible. They publish newspapers documenting IVRC abuses, organize strikes and work slowdowns, establish cooperative stores selling goods at fair prices, and maintain a network of safe houses for those fleeing company justice.

The Freeminers believe that lasting change comes not from the barrel of a gun, but from unified workers refusing to be exploited. They've had successes: shorter shifts in some mines, modest wage increases, even the rare firing of abusive foremen. But progress is slow, and many workers grow impatient.

The movement walks a careful line. Too aggressive, and they'll be crushed like the Copperheads' early supporters. Too passive, and nothing changes. Some members secretly sympathize with the Copperheads' more direct approach, while others believe violence only hurts the cause.

What the Freeminers lack in firepower, they make up for in numbers, organization, and an extensive intelligence network. A friend to the workers has friends everywhere.`,
  type: 'resistance',
  primaryColor: '#228B22',
  secondaryColor: '#F4A460',
  iconId: 'icon_freeminers',
  headquartersId: 'freeminer_hollow',
  controlledLocations: ['freeminer_hollow', 'miners_cooperative'],
  keyNpcIds: ['ma_jennings', 'preacher_elijah', 'young_tommy'],
  defaultReputation: 5,
  tierEffects: freeminersTierEffects,
  relationships: freeminersRelationships,
  actions: freeminersActions,
  decayRatePerDay: 0.5,
  decayThreshold: 5,
  tags: ['workers', 'union', 'peaceful', 'resistance'],
};

// ============================================================================
// THE LAW - SHERIFF AND DEPUTIES
// ============================================================================

const lawTierEffects: FactionTierEffects[] = [
  {
    tier: 'hated',
    priceModifier: 1.5,
    questAvailability: 0,
    areaAccess: false,
    attackOnSight: true,
    canTrade: false,
    greetingSnippets: [
      'greeting_law_hated_1',
      'greeting_law_hated_2',
    ],
    perks: [],
    description:
      'You are a notorious criminal with a major bounty. Deputies will shoot on sight, and staying in town risks immediate arrest.',
  },
  {
    tier: 'hostile',
    priceModifier: 1.3,
    questAvailability: 0,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_law_hostile_1',
    ],
    perks: [],
    description:
      'You have a bounty on your head. Deputies will attempt arrest, and crimes are punished harshly.',
  },
  {
    tier: 'unfriendly',
    priceModifier: 1.15,
    questAvailability: 0.1,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_law_unfriendly_1',
    ],
    perks: [],
    description:
      'The law keeps a close eye on you. Minor crimes will result in warnings, major crimes in immediate arrest.',
  },
  {
    tier: 'neutral',
    priceModifier: 1.0,
    questAvailability: 0.4,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_law_neutral_1',
      'greeting_law_neutral_2',
    ],
    perks: [],
    description:
      'You are a regular citizen in the eyes of the law. Normal treatment and consequences.',
  },
  {
    tier: 'friendly',
    priceModifier: 0.95,
    questAvailability: 0.6,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_law_friendly_1',
      'greeting_law_friendly_2',
    ],
    perks: ['law_warning_first', 'law_bounty_access'],
    description:
      'The sheriff trusts you. Minor crimes may be overlooked, and you can access the bounty board.',
  },
  {
    tier: 'honored',
    priceModifier: 0.85,
    questAvailability: 0.85,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_law_honored_1',
    ],
    perks: [
      'law_warning_first',
      'law_bounty_access',
      'law_deputy_assistance',
      'law_crime_forgiveness',
    ],
    description:
      'You are highly respected by the law. Deputies will assist you, and past minor crimes may be forgiven.',
  },
  {
    tier: 'revered',
    priceModifier: 0.75,
    questAvailability: 1.0,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_law_revered_1',
    ],
    perks: [
      'law_warning_first',
      'law_bounty_access',
      'law_deputy_assistance',
      'law_crime_forgiveness',
      'law_honorary_deputy',
      'law_full_pardon',
    ],
    description:
      'You are an honorary deputy. Full legal authority to make arrests, immunity from minor crimes, deputies fight alongside you.',
  },
];

const lawActions: FactionAction[] = [
  // Quest Actions
  { id: 'law_quest_bounty', name: 'Complete bounty', description: 'Bring in a wanted criminal', category: 'quest', reputationDelta: 8, tags: ['bounty'] },
  { id: 'law_quest_investigate', name: 'Complete investigation', description: 'Help solve a crime', category: 'quest', reputationDelta: 10, tags: ['investigation'] },
  { id: 'law_quest_patrol', name: 'Complete patrol duty', description: 'Help patrol dangerous areas', category: 'quest', reputationDelta: 5, tags: ['patrol'] },
  { id: 'law_quest_protect', name: 'Protect witness', description: 'Guard an important witness', category: 'quest', reputationDelta: 12, oneTime: false, tags: ['protection'] },
  { id: 'law_quest_major_bounty', name: 'Bring in major criminal', description: 'Capture a high-profile outlaw', category: 'quest', reputationDelta: 20, oneTime: false, tags: ['bounty', 'major'] },

  // Combat Actions
  { id: 'law_kill_deputy', name: 'Kill deputy', description: 'Murder a law officer', category: 'combat', reputationDelta: -25, tags: ['murder', 'cop_killer'] },
  { id: 'law_kill_sheriff', name: 'Kill sheriff', description: 'Murder the sheriff', category: 'combat', reputationDelta: -40, oneTime: true, tags: ['murder', 'cop_killer', 'vip'] },
  { id: 'law_assist_arrest', name: 'Assist in arrest', description: 'Help deputies capture criminal', category: 'combat', reputationDelta: 6, tags: ['arrest'] },
  { id: 'law_defend_town', name: 'Defend town', description: 'Help repel attack on town', category: 'combat', reputationDelta: 15, tags: ['defense'] },
  { id: 'law_stop_robbery', name: 'Stop robbery', description: 'Intervene in robbery in progress', category: 'combat', reputationDelta: 8, tags: ['intervention'] },

  // Trade Actions
  { id: 'law_pay_fine', name: 'Pay fine', description: 'Pay outstanding fine or bounty', category: 'trade', reputationDelta: 5, tags: ['fine'] },
  { id: 'law_donate_equipment', name: 'Donate equipment', description: 'Give weapons or supplies to sheriff office', category: 'trade', reputationDelta: 3, cooldownHours: 48, tags: ['donation'] },

  // Dialogue Actions
  { id: 'law_report_crime', name: 'Report crime', description: 'Inform law about criminal activity', category: 'dialogue', reputationDelta: 4, cooldownHours: 24, tags: ['report'] },
  { id: 'law_testimony', name: 'Provide testimony', description: 'Testify in legal proceedings', category: 'dialogue', reputationDelta: 6, oneTime: false, tags: ['testimony'] },
  { id: 'law_refuse_cooperate', name: 'Refuse to cooperate', description: 'Refuse to answer questions or provide info', category: 'dialogue', reputationDelta: -5, cooldownHours: 24, tags: ['obstruction'] },
  { id: 'law_lie_to_law', name: 'Lie to law', description: 'Provide false information to deputies', category: 'dialogue', reputationDelta: -8, tags: ['perjury'] },

  // Crime Actions
  { id: 'law_theft_minor', name: 'Commit minor theft', description: 'Steal items worth less than 5 gold', category: 'crime', reputationDelta: -5, tags: ['theft'] },
  { id: 'law_theft_major', name: 'Commit major theft', description: 'Steal items worth 5+ gold', category: 'crime', reputationDelta: -10, tags: ['theft'] },
  { id: 'law_assault', name: 'Commit assault', description: 'Attack someone without killing', category: 'crime', reputationDelta: -12, tags: ['assault'] },
  { id: 'law_murder', name: 'Commit murder', description: 'Kill an innocent person', category: 'crime', reputationDelta: -20, tags: ['murder'] },
  { id: 'law_trespass', name: 'Commit trespass', description: 'Enter restricted area illegally', category: 'crime', reputationDelta: -3, tags: ['trespass'] },
  { id: 'law_public_disturbance', name: 'Cause disturbance', description: 'Start fight or cause public nuisance', category: 'crime', reputationDelta: -4, tags: ['disturbance'] },
  { id: 'law_escape_jail', name: 'Escape from jail', description: 'Break out of custody', category: 'crime', reputationDelta: -15, tags: ['escape'] },
  { id: 'law_resist_arrest', name: 'Resist arrest', description: 'Fight or flee from lawful arrest', category: 'crime', reputationDelta: -8, tags: ['resist'] },

  // Assistance Actions
  { id: 'law_rescue_deputy', name: 'Rescue deputy', description: 'Save a deputy from danger', category: 'assistance', reputationDelta: 12, tags: ['rescue'] },
  { id: 'law_turn_self_in', name: 'Turn yourself in', description: 'Surrender for past crimes', category: 'assistance', reputationDelta: 10, oneTime: false, tags: ['surrender'] },
  { id: 'law_first_aid_deputy', name: 'Treat wounded deputy', description: 'Provide medical aid to injured officer', category: 'assistance', reputationDelta: 6, tags: ['medical'] },

  // Betrayal Actions
  { id: 'law_help_escape', name: 'Help prisoner escape', description: 'Assist in jailbreak', category: 'betrayal', reputationDelta: -18, tags: ['jailbreak'] },
  { id: 'law_bribe_deputy', name: 'Bribe deputy', description: 'Attempt to corrupt officer', category: 'betrayal', reputationDelta: -10, tags: ['bribery'] },

  // Discovery Actions
  { id: 'law_find_evidence', name: 'Find evidence', description: 'Discover evidence of crime', category: 'discovery', reputationDelta: 5, tags: ['evidence'] },
  { id: 'law_identify_criminal', name: 'Identify criminal', description: 'Recognize and report wanted person', category: 'discovery', reputationDelta: 6, tags: ['identification'] },
  { id: 'law_find_hideout', name: 'Find outlaw hideout', description: 'Discover criminal hideout location', category: 'discovery', reputationDelta: 10, oneTime: false, tags: ['discovery'] },

  // Sabotage Actions
  { id: 'law_destroy_evidence', name: 'Destroy evidence', description: 'Tamper with or destroy evidence', category: 'sabotage', reputationDelta: -12, tags: ['obstruction'] },
  { id: 'law_sabotage_jail', name: 'Sabotage jail', description: 'Damage jail facilities', category: 'sabotage', reputationDelta: -15, tags: ['sabotage'] },
];

const lawRelationships: FactionRelationship[] = [
  { factionId: 'ivrc', relationship: 'friendly', rippleMultiplier: 0.3, notes: 'IVRC funds law enforcement' },
  { factionId: 'copperheads', relationship: 'hostile', rippleMultiplier: -0.5, notes: 'Outlaws are natural enemies' },
  { factionId: 'freeminers', relationship: 'neutral', rippleMultiplier: 0.1, notes: 'Peaceful protesters mostly tolerated' },
  { factionId: 'townsfolk', relationship: 'allied', rippleMultiplier: 0.4, notes: 'Law protects the town' },
];

export const LAW_FACTION: FactionDefinition = {
  id: 'law',
  name: 'The Law',
  fullName: 'Iron Valley Sheriff Department',
  description: 'The sheriff and deputies maintaining order in the frontier.',
  lore: `Sheriff Cole came to Iron Valley fifteen years ago, a former Texas Ranger looking for a quieter life. He found anything but. The valley was lawless then, ruled by whoever had the most guns. Cole built the law from nothing, deputizing honest men and slowly imposing order on the chaos.

Today, the sheriff's office stands as a symbol of civilization in the wilderness. Cole and his deputies patrol the towns, investigate crimes, and pursue bounties on dangerous outlaws. They're not many, they're not well-equipped, but they're dedicated.

The law's relationship with IVRC is complicated. Company money pays for much of their operation, and company men sometimes expect special treatment. Cole walks a careful line between accepting necessary support and maintaining independence. Some say he's sold out; others know he's the only thing standing between the townsfolk and total corporate control.

The Copperheads and other outlaws are the law's primary concern. Every week brings new reports of robbery, sabotage, or murder. Cole has seen too many good deputies buried to have any sympathy for those who choose the outlaw path.

For regular folks, the law offers protection and justice, imperfect as it may be. Help the sheriff, and you'll find friends in high places. Cross him, and you'll discover the frontier has a long memory for those who break its peace.`,
  type: 'authority',
  primaryColor: '#4169E1',
  secondaryColor: '#C0C0C0',
  iconId: 'icon_law',
  headquartersId: 'dusty_springs',
  controlledLocations: ['dusty_springs_jail', 'signal_rock_outpost'],
  keyNpcIds: ['sheriff_cole', 'deputy_jones', 'deputy_maria'],
  defaultReputation: 0,
  tierEffects: lawTierEffects,
  relationships: lawRelationships,
  actions: lawActions,
  decayRatePerDay: 1.5,
  decayThreshold: 5,
  tags: ['authority', 'law', 'order', 'justice'],
};

// ============================================================================
// TOWNSFOLK - GENERAL POPULATION
// ============================================================================

const townsfolkTierEffects: FactionTierEffects[] = [
  {
    tier: 'hated',
    priceModifier: 1.6,
    questAvailability: 0,
    areaAccess: true,
    attackOnSight: false,
    canTrade: false,
    greetingSnippets: [
      'greeting_townsfolk_hated_1',
    ],
    perks: [],
    description:
      'The townspeople despise you. Shops refuse your business, and people actively avoid you or report your presence.',
  },
  {
    tier: 'hostile',
    priceModifier: 1.4,
    questAvailability: 0,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_townsfolk_hostile_1',
    ],
    perks: [],
    description:
      'The townspeople distrust you deeply. Prices are inflated, and no one shares information with you.',
  },
  {
    tier: 'unfriendly',
    priceModifier: 1.2,
    questAvailability: 0.2,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_townsfolk_unfriendly_1',
    ],
    perks: [],
    description:
      'The townspeople are wary of you. Basic services only, no special treatment.',
  },
  {
    tier: 'neutral',
    priceModifier: 1.0,
    questAvailability: 0.4,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_townsfolk_neutral_1',
      'greeting_townsfolk_neutral_2',
    ],
    perks: [],
    description:
      'You are just another stranger passing through. Normal prices and basic courtesy.',
  },
  {
    tier: 'friendly',
    priceModifier: 0.9,
    questAvailability: 0.6,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_townsfolk_friendly_1',
      'greeting_townsfolk_friendly_2',
    ],
    perks: ['townsfolk_discount', 'townsfolk_gossip'],
    description:
      'The townspeople like you. Small discounts and people share local gossip.',
  },
  {
    tier: 'honored',
    priceModifier: 0.8,
    questAvailability: 0.8,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_townsfolk_honored_1',
    ],
    perks: [
      'townsfolk_discount',
      'townsfolk_gossip',
      'townsfolk_gifts',
      'townsfolk_home_hospitality',
    ],
    description:
      'You are well-respected in town. Good discounts, people share tips about opportunities, occasional gifts.',
  },
  {
    tier: 'revered',
    priceModifier: 0.7,
    questAvailability: 1.0,
    areaAccess: true,
    attackOnSight: false,
    canTrade: true,
    greetingSnippets: [
      'greeting_townsfolk_revered_1',
    ],
    perks: [
      'townsfolk_discount',
      'townsfolk_gossip',
      'townsfolk_gifts',
      'townsfolk_home_hospitality',
      'townsfolk_hero_status',
      'townsfolk_named_landmark',
    ],
    description:
      'You are a local hero. Best prices, frequent gifts, free room and board, people name things after you.',
  },
];

const townsfolkActions: FactionAction[] = [
  // Quest Actions
  { id: 'townsfolk_quest_help', name: 'Help townsperson', description: 'Complete a favor for a local', category: 'quest', reputationDelta: 5, tags: ['help'] },
  { id: 'townsfolk_quest_find_lost', name: 'Find lost person/item', description: 'Locate something missing', category: 'quest', reputationDelta: 8, tags: ['search'] },
  { id: 'townsfolk_quest_defend', name: 'Defend the town', description: 'Help protect town from threats', category: 'quest', reputationDelta: 15, oneTime: false, tags: ['defense'] },
  { id: 'townsfolk_quest_deliver', name: 'Make delivery', description: 'Deliver package between townsfolk', category: 'quest', reputationDelta: 3, tags: ['delivery'] },
  { id: 'townsfolk_quest_gather', name: 'Gather resources', description: 'Collect needed supplies', category: 'quest', reputationDelta: 4, tags: ['gathering'] },

  // Combat Actions
  { id: 'townsfolk_kill_innocent', name: 'Kill townsperson', description: 'Murder an innocent civilian', category: 'combat', reputationDelta: -30, tags: ['murder'] },
  { id: 'townsfolk_protect_from_danger', name: 'Protect from danger', description: 'Save townsperson from harm', category: 'combat', reputationDelta: 10, tags: ['protection'] },
  { id: 'townsfolk_stop_crime', name: 'Stop crime in progress', description: 'Intervene in crime against townsfolk', category: 'combat', reputationDelta: 8, tags: ['intervention'] },
  { id: 'townsfolk_brawl', name: 'Start brawl', description: 'Get into fight with townsperson', category: 'combat', reputationDelta: -6, tags: ['brawl'] },

  // Trade Actions
  { id: 'townsfolk_fair_trade', name: 'Trade fairly', description: 'Complete trade at fair prices', category: 'trade', reputationDelta: 1, cooldownHours: 24, tags: ['trade'] },
  { id: 'townsfolk_generous_trade', name: 'Trade generously', description: 'Accept less or pay more than needed', category: 'trade', reputationDelta: 3, cooldownHours: 24, tags: ['trade', 'generous'] },
  { id: 'townsfolk_cheat_trade', name: 'Cheat in trade', description: 'Swindle or shortchange townsperson', category: 'trade', reputationDelta: -6, tags: ['fraud'] },
  { id: 'townsfolk_price_gouge', name: 'Price gouge', description: 'Sell essential goods at inflated prices', category: 'trade', reputationDelta: -8, tags: ['exploitation'] },

  // Dialogue Actions
  { id: 'townsfolk_friendly_chat', name: 'Friendly conversation', description: 'Take time to chat with locals', category: 'dialogue', reputationDelta: 1, cooldownHours: 12, tags: ['social'] },
  { id: 'townsfolk_share_news', name: 'Share news', description: 'Tell townspeople about events elsewhere', category: 'dialogue', reputationDelta: 2, cooldownHours: 24, tags: ['social'] },
  { id: 'townsfolk_insult', name: 'Insult townsperson', description: 'Be rude or insulting to local', category: 'dialogue', reputationDelta: -3, cooldownHours: 12, tags: ['rude'] },
  { id: 'townsfolk_spread_rumors', name: 'Spread false rumors', description: 'Spread lies about townspeople', category: 'dialogue', reputationDelta: -5, tags: ['gossip'] },

  // Crime Actions
  { id: 'townsfolk_theft_minor', name: 'Steal from townsperson', description: 'Take something belonging to local', category: 'crime', reputationDelta: -8, tags: ['theft'] },
  { id: 'townsfolk_vandalism', name: 'Vandalize property', description: 'Damage property belonging to townsfolk', category: 'crime', reputationDelta: -6, tags: ['vandalism'] },
  { id: 'townsfolk_public_nuisance', name: 'Cause public nuisance', description: 'Disrupt public peace', category: 'crime', reputationDelta: -4, tags: ['disturbance'] },
  { id: 'townsfolk_break_promise', name: 'Break promise', description: 'Fail to keep your word to local', category: 'crime', reputationDelta: -5, tags: ['dishonesty'] },

  // Assistance Actions
  { id: 'townsfolk_help_chores', name: 'Help with chores', description: 'Assist with daily tasks', category: 'assistance', reputationDelta: 2, cooldownHours: 24, tags: ['help'] },
  { id: 'townsfolk_give_food', name: 'Give food to hungry', description: 'Feed someone in need', category: 'assistance', reputationDelta: 3, cooldownHours: 24, tags: ['charity'] },
  { id: 'townsfolk_give_money', name: 'Give money to needy', description: 'Donate gold to poor family', category: 'assistance', reputationDelta: 4, cooldownHours: 48, tags: ['charity'] },
  { id: 'townsfolk_rescue', name: 'Rescue someone', description: 'Save townsperson from danger', category: 'assistance', reputationDelta: 10, tags: ['rescue'] },
  { id: 'townsfolk_medical_aid', name: 'Provide medical aid', description: 'Treat sick or injured townsperson', category: 'assistance', reputationDelta: 6, tags: ['medical'] },

  // Betrayal Actions
  { id: 'townsfolk_betray_trust', name: 'Betray trust', description: 'Use shared secrets against someone', category: 'betrayal', reputationDelta: -12, tags: ['betrayal'] },
  { id: 'townsfolk_abandon_danger', name: 'Abandon in danger', description: 'Leave townsperson to face danger alone', category: 'betrayal', reputationDelta: -10, tags: ['abandonment'] },

  // Donation Actions
  { id: 'townsfolk_donate_church', name: 'Donate to church', description: 'Give to local church or charity', category: 'donation', reputationDelta: 3, cooldownHours: 72, tags: ['charity'] },
  { id: 'townsfolk_fund_improvement', name: 'Fund town improvement', description: 'Pay for public improvement', category: 'donation', reputationDelta: 8, oneTime: false, tags: ['civic'] },
  { id: 'townsfolk_sponsor_event', name: 'Sponsor town event', description: 'Fund a community celebration', category: 'donation', reputationDelta: 6, cooldownHours: 168, tags: ['social'] },

  // Discovery Actions
  { id: 'townsfolk_find_lost_child', name: 'Find lost child', description: 'Return missing child to parents', category: 'discovery', reputationDelta: 15, tags: ['rescue'] },
  { id: 'townsfolk_discover_threat', name: 'Warn of danger', description: 'Alert town to incoming threat', category: 'discovery', reputationDelta: 8, tags: ['warning'] },
  { id: 'townsfolk_find_water', name: 'Find water source', description: 'Discover new water supply', category: 'discovery', reputationDelta: 12, oneTime: true, tags: ['discovery'] },

  // Sabotage Actions
  { id: 'townsfolk_poison_well', name: 'Poison well', description: 'Contaminate town water supply', category: 'sabotage', reputationDelta: -35, oneTime: true, tags: ['terrorism'] },
  { id: 'townsfolk_burn_building', name: 'Commit arson', description: 'Burn down building', category: 'sabotage', reputationDelta: -25, tags: ['arson'] },
  { id: 'townsfolk_destroy_crops', name: 'Destroy crops', description: 'Ruin farmer\'s harvest', category: 'sabotage', reputationDelta: -15, tags: ['sabotage'] },
];

const townsfolkRelationships: FactionRelationship[] = [
  { factionId: 'ivrc', relationship: 'neutral', rippleMultiplier: 0.1, notes: 'IVRC is employer but also exploiter' },
  { factionId: 'copperheads', relationship: 'rival', rippleMultiplier: -0.2, notes: 'Fear outlaw violence' },
  { factionId: 'freeminers', relationship: 'allied', rippleMultiplier: 0.4, notes: 'Many townsfolk are workers' },
  { factionId: 'law', relationship: 'allied', rippleMultiplier: 0.3, notes: 'Law protects the community' },
];

export const TOWNSFOLK_FACTION: FactionDefinition = {
  id: 'townsfolk',
  name: 'Townsfolk',
  fullName: 'The People of Iron Valley',
  description: 'The ordinary citizens trying to make a life on the frontier.',
  lore: `They came from everywhere: failed farmers fleeing drought, immigrants seeking opportunity, veterans with nowhere else to go, families escaping troubles back east. They built the towns, work the shops, raise the children, and bury the dead.

The townsfolk of Iron Valley are neither heroes nor villains, just people trying to survive. They work hard, pray on Sundays, and hope tomorrow will be better than today. Some work for IVRC, some for themselves, most for whoever will pay.

They've learned to keep their heads down when the powerful fight. When IVRC guards and Copperhead outlaws clash, regular folks lock their doors and pray the bullets miss their homes. They smile at company men and outlaws alike, never knowing which might bring trouble.

But don't mistake survival instinct for cowardice. Threaten their families, steal from their stores, or bring violence to their streets, and you'll find the frontier breeds tough people. Many of these shopkeepers and farmers have fought off bandits, survived blizzards, and buried friends. They remember those who help them, and they never forget those who harm them.

The goodwill of common folk might seem like small thing, but in a hard land, having friends who will share food, shelter information, or look the other way can mean the difference between life and death.`,
  type: 'civilian',
  primaryColor: '#D2691E',
  secondaryColor: '#F5F5DC',
  iconId: 'icon_townsfolk',
  headquartersId: undefined,
  controlledLocations: [],
  keyNpcIds: ['bartender_jake', 'shop_keeper', 'preacher_thomas'],
  defaultReputation: 0,
  tierEffects: townsfolkTierEffects,
  relationships: townsfolkRelationships,
  actions: townsfolkActions,
  decayRatePerDay: 2,
  decayThreshold: 5,
  tags: ['civilian', 'community', 'neutral'],
};

// ============================================================================
// FACTION REGISTRY
// ============================================================================

export const ALL_FACTIONS: FactionDefinition[] = [
  IVRC_FACTION,
  COPPERHEADS_FACTION,
  FREEMINERS_FACTION,
  LAW_FACTION,
  TOWNSFOLK_FACTION,
];

export const FACTIONS_BY_ID: Record<string, FactionDefinition> = Object.fromEntries(
  ALL_FACTIONS.map((faction) => [faction.id, faction])
);

// ============================================================================
// FACTION SYSTEM FUNCTIONS
// ============================================================================

/**
 * Get a faction by ID
 */
export function getFaction(factionId: string): FactionDefinition | undefined {
  return FACTIONS_BY_ID[factionId];
}

/**
 * Get all faction IDs
 */
export function getAllFactionIds(): string[] {
  return ALL_FACTIONS.map((f) => f.id);
}

/**
 * Get tier effects for a faction at a given reputation
 */
export function getFactionTierEffects(
  factionId: string,
  reputation: number
): FactionTierEffects | undefined {
  const faction = FACTIONS_BY_ID[factionId];
  if (!faction) return undefined;

  const tier = getReputationTier(reputation);
  return faction.tierEffects.find((te) => te.tier === tier);
}

/**
 * Get an action by ID for a faction
 */
export function getFactionAction(
  factionId: string,
  actionId: string
): FactionAction | undefined {
  const faction = FACTIONS_BY_ID[factionId];
  if (!faction) return undefined;

  return faction.actions.find((a) => a.id === actionId);
}

/**
 * Calculate reputation changes for an action across all factions
 */
export function calculateActionReputationChanges(
  primaryFactionId: string,
  actionId: string,
  currentStandings: Record<string, number>
): Record<string, number> {
  const faction = FACTIONS_BY_ID[primaryFactionId];
  if (!faction) return {};

  const action = faction.actions.find((a) => a.id === actionId);
  if (!action) return {};

  const changes: Record<string, number> = {};

  // Primary faction change
  const primaryChange = calculateReputationChange(
    action.reputationDelta,
    currentStandings[primaryFactionId] ?? faction.defaultReputation
  );
  changes[primaryFactionId] = primaryChange;

  // Ripple effects to related factions
  for (const relationship of faction.relationships) {
    if (relationship.rippleMultiplier !== 0) {
      const relatedFaction = FACTIONS_BY_ID[relationship.factionId];
      if (relatedFaction) {
        const rippleDelta = Math.round(action.reputationDelta * relationship.rippleMultiplier);
        if (rippleDelta !== 0) {
          const rippleChange = calculateReputationChange(
            rippleDelta,
            currentStandings[relationship.factionId] ?? relatedFaction.defaultReputation
          );
          changes[relationship.factionId] = rippleChange;
        }
      }
    }
  }

  return changes;
}

/**
 * Apply reputation decay to all factions
 */
export function applyFactionDecay(
  standings: Record<string, PlayerFactionStanding>,
  currentGameHour: number
): Record<string, PlayerFactionStanding> {
  const updated: Record<string, PlayerFactionStanding> = {};

  for (const [factionId, standing] of Object.entries(standings)) {
    const faction = FACTIONS_BY_ID[factionId];
    if (!faction) {
      updated[factionId] = standing;
      continue;
    }

    const hoursElapsed = currentGameHour - standing.lastDecayHour;
    if (hoursElapsed <= 0) {
      updated[factionId] = standing;
      continue;
    }

    const newReputation = applyReputationDecay(
      standing.reputation,
      faction.decayRatePerDay,
      faction.decayThreshold,
      hoursElapsed
    );

    updated[factionId] = {
      ...standing,
      reputation: newReputation,
      currentTier: getReputationTier(newReputation),
      lastDecayHour: currentGameHour,
    };
  }

  return updated;
}

/**
 * Create initial player faction state
 */
export function createInitialFactionState(): PlayerFactionState {
  const standings: Record<string, PlayerFactionStanding> = {};

  for (const faction of ALL_FACTIONS) {
    standings[faction.id] = {
      factionId: faction.id,
      reputation: faction.defaultReputation,
      currentTier: getReputationTier(faction.defaultReputation),
      completedActionIds: [],
      actionCooldowns: {},
      lastDecayHour: 0,
      peakReputation: faction.defaultReputation,
      lowestReputation: faction.defaultReputation,
    };
  }

  return {
    standings,
    totalReputationChanges: 0,
    lastUpdated: Date.now(),
  };
}

/**
 * Check if player can perform an action
 */
export function canPerformAction(
  factionId: string,
  actionId: string,
  standing: PlayerFactionStanding,
  currentGameHour: number
): { canPerform: boolean; reason?: string } {
  const action = getFactionAction(factionId, actionId);
  if (!action) {
    return { canPerform: false, reason: 'Action not found' };
  }

  // Check one-time actions
  if (action.oneTime && standing.completedActionIds.includes(actionId)) {
    return { canPerform: false, reason: 'This action can only be performed once' };
  }

  // Check cooldown
  const cooldownEnd = standing.actionCooldowns[actionId];
  if (cooldownEnd && currentGameHour < cooldownEnd) {
    const hoursRemaining = Math.ceil(cooldownEnd - currentGameHour);
    return {
      canPerform: false,
      reason: `Action on cooldown (${hoursRemaining} hours remaining)`,
    };
  }

  return { canPerform: true };
}

/**
 * Perform an action and return updated standings
 */
export function performFactionAction(
  factionId: string,
  actionId: string,
  currentState: PlayerFactionState,
  currentGameHour: number
): {
  newState: PlayerFactionState;
  changes: Record<string, number>;
  success: boolean;
  message: string;
} {
  const standing = currentState.standings[factionId];
  if (!standing) {
    return {
      newState: currentState,
      changes: {},
      success: false,
      message: 'Unknown faction',
    };
  }

  const canPerform = canPerformAction(factionId, actionId, standing, currentGameHour);
  if (!canPerform.canPerform) {
    return {
      newState: currentState,
      changes: {},
      success: false,
      message: canPerform.reason || 'Cannot perform action',
    };
  }

  const action = getFactionAction(factionId, actionId);
  if (!action) {
    return {
      newState: currentState,
      changes: {},
      success: false,
      message: 'Action not found',
    };
  }

  // Calculate all reputation changes
  const currentReps: Record<string, number> = {};
  for (const [fid, s] of Object.entries(currentState.standings)) {
    currentReps[fid] = s.reputation;
  }
  const changes = calculateActionReputationChanges(factionId, actionId, currentReps);

  // Apply changes
  const newStandings = { ...currentState.standings };
  for (const [fid, delta] of Object.entries(changes)) {
    const oldStanding = newStandings[fid];
    if (oldStanding) {
      const newRep = Math.max(-100, Math.min(100, oldStanding.reputation + delta));
      newStandings[fid] = {
        ...oldStanding,
        reputation: newRep,
        currentTier: getReputationTier(newRep),
        peakReputation: Math.max(oldStanding.peakReputation, newRep),
        lowestReputation: Math.min(oldStanding.lowestReputation, newRep),
        completedActionIds:
          fid === factionId && action.oneTime
            ? [...oldStanding.completedActionIds, actionId]
            : oldStanding.completedActionIds,
        actionCooldowns:
          fid === factionId && action.cooldownHours
            ? { ...oldStanding.actionCooldowns, [actionId]: currentGameHour + action.cooldownHours }
            : oldStanding.actionCooldowns,
      };
    }
  }

  return {
    newState: {
      standings: newStandings,
      totalReputationChanges: currentState.totalReputationChanges + 1,
      lastUpdated: Date.now(),
    },
    changes,
    success: true,
    message: `${action.name} - reputation changed`,
  };
}

/**
 * Check if player is hostile with a faction
 */
export function isHostileWithFaction(factionId: string, reputation: number): boolean {
  const effects = getFactionTierEffects(factionId, reputation);
  return effects?.attackOnSight ?? false;
}

/**
 * Get shop price modifier for a faction
 */
export function getShopPriceModifier(factionId: string, reputation: number): number {
  const effects = getFactionTierEffects(factionId, reputation);
  return effects?.priceModifier ?? 1.0;
}

/**
 * Get quest availability for a faction
 */
export function getQuestAvailability(factionId: string, reputation: number): number {
  const effects = getFactionTierEffects(factionId, reputation);
  return effects?.questAvailability ?? 0.5;
}

/**
 * Get active perks for a faction
 */
export function getActivePerks(factionId: string, reputation: number): string[] {
  const effects = getFactionTierEffects(factionId, reputation);
  return effects?.perks ?? [];
}

/**
 * Check if player has a specific perk
 */
export function hasPerk(perkId: string, standings: Record<string, PlayerFactionStanding>): boolean {
  for (const standing of Object.values(standings)) {
    const perks = getActivePerks(standing.factionId, standing.reputation);
    if (perks.includes(perkId)) {
      return true;
    }
  }
  return false;
}

// Re-export schema utilities
export {
  getReputationTier,
  applyReputationDecay,
  calculateReputationChange,
  REPUTATION_TIER_BOUNDARIES,
} from '../schemas/faction';

export type {
  FactionDefinition,
  FactionAction,
  FactionTierEffects,
  FactionRelationship,
  PlayerFactionStanding,
  PlayerFactionState,
  ReputationTier,
  FactionActionCategory,
} from '../schemas/faction';
