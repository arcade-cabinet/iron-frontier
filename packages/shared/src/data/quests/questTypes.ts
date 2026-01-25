/**
 * Iron Frontier - Quest Type Definitions
 *
 * Extended types and constants for the quest system.
 * This file defines the location and NPC identifiers used throughout
 * the quest definitions to ensure consistency.
 *
 * Architecture Note:
 * These constants map to the authored world defined in ARCHITECTURE_V2.md:
 * - 6 towns: Frontier's Edge, Iron Gulch, Mesa Point, Coldwater, Salvation
 * - 5 routes: Dusty Trail, Desert Pass, Mountain Road, Badlands Trail, Final Trail
 */

// ============================================================================
// LOCATION IDS
// ============================================================================

/**
 * Town identifiers matching the world architecture.
 * These are the primary settlement locations where quests originate.
 */
export const TOWN_IDS = {
  /** Starting tutorial town */
  FRONTIERS_EDGE: 'frontiers_edge',
  /** Mining hub - Act 1 main location */
  IRON_GULCH: 'iron_gulch',
  /** Outlaw hideout - Act 2 optional */
  MESA_POINT: 'mesa_point',
  /** Ranch town - Act 2 optional */
  COLDWATER: 'coldwater',
  /** Final act town */
  SALVATION: 'salvation',
} as const;

/**
 * Route identifiers connecting towns.
 * Travel between towns occurs via these paths.
 */
export const ROUTE_IDS = {
  /** Frontier's Edge to Iron Gulch */
  DUSTY_TRAIL: 'dusty_trail',
  /** Iron Gulch to Mesa Point */
  DESERT_PASS: 'desert_pass',
  /** Iron Gulch to Coldwater */
  MOUNTAIN_ROAD: 'mountain_road',
  /** Mesa Point to Coldwater */
  BADLANDS_TRAIL: 'badlands_trail',
  /** Mesa Point/Coldwater to Salvation */
  FINAL_TRAIL: 'final_trail',
} as const;

/**
 * Location markers within towns and routes.
 * Used for specific quest objectives.
 */
export const LOCATION_MARKERS = {
  // Frontier's Edge
  FE_SHERIFF_OFFICE: 'frontiers_edge_sheriff_office',
  FE_GENERAL_STORE: 'frontiers_edge_general_store',
  FE_SALOON: 'frontiers_edge_saloon',
  FE_OLD_TIMERS_BENCH: 'frontiers_edge_old_timers_bench',

  // Dusty Trail
  DT_ABANDONED_WAGON: 'dusty_trail_abandoned_wagon',
  DT_CAMPSITE: 'dusty_trail_campsite',

  // Iron Gulch
  IG_MINE_ENTRANCE: 'iron_gulch_mine_entrance',
  IG_MINE_OFFICE: 'iron_gulch_mine_office',
  IG_SALOON: 'iron_gulch_saloon',
  IG_DOC_OFFICE: 'iron_gulch_doc_office',
  IG_WORKSHOP: 'iron_gulch_workshop',
  IG_MINE_DEEP_SECTION: 'iron_gulch_mine_deep',
  IG_POKER_ROOM: 'iron_gulch_poker_room',
  IG_COGSWORTH_LAB: 'iron_gulch_cogsworth_lab',
  IG_WIDOWS_COTTAGE: 'iron_gulch_widows_cottage',
  IG_COLLAPSED_SHAFT: 'iron_gulch_collapsed_shaft',

  // Mesa Point
  MP_BLACK_MARKET: 'mesa_point_black_market',
  MP_HIDEOUT: 'mesa_point_hideout',
  MP_WHISPERS_DEN: 'mesa_point_whispers_den',

  // Coldwater
  CW_RANCH_HOUSE: 'coldwater_ranch_house',
  CW_PASTURE: 'coldwater_pasture',
  CW_WANDERERS_CAMP: 'coldwater_wanderers_camp',

  // Salvation
  SV_CHURCH: 'salvation_church',
  SV_FINAL_DUNGEON: 'salvation_underground',
  SV_PADRE_QUARTERS: 'salvation_padre_quarters',
  SV_IVRC_CAMP: 'salvation_ivrc_camp',
} as const;

// ============================================================================
// NPC IDS
// ============================================================================

/**
 * NPC identifiers for quest givers and objective targets.
 * Organized by location for easy reference.
 */
export const NPC_IDS = {
  // Frontier's Edge NPCs
  SHERIFF_HANK: 'npc_sheriff_hank',
  MERCHANT_MARTHA: 'npc_merchant_martha',
  OLD_TIMER_GUS: 'npc_old_timer_gus',

  // Dusty Trail NPCs
  PROSPECTOR_JED: 'npc_prospector_jed',

  // Iron Gulch NPCs
  FOREMAN_BURKE: 'npc_foreman_burke',
  ENGINEER_CLARA: 'npc_engineer_clara',
  BARTENDER_PETE: 'npc_bartender_pete',
  DOC_MORRISON: 'npc_doc_morrison',
  MINER_SILAS: 'npc_miner_silas', // Red herring suspect
  SABOTEUR_VANCE: 'npc_saboteur_vance', // True saboteur
  INFORMANT_RAT: 'npc_informant_rat',
  LUCKY_LOU: 'npc_lucky_lou', // Gambler with stolen winnings
  CARDSHARK_CHARLIE: 'npc_cardshark_charlie', // Cheating card player
  PROFESSOR_COGSWORTH: 'npc_professor_cogsworth', // Inventor needing parts
  WIDOW_MARGARET: 'npc_widow_margaret', // Lost her locket
  MINE_FOREMAN_JENKINS: 'npc_mine_foreman_jenkins', // Mine shaft rescue

  // Mesa Point NPCs
  REYNA_RED_EYE: 'npc_reyna_red_eye', // Gang leader
  WHISPER: 'npc_whisper', // Informant
  BOUNTY_HUNTER_COLE: 'npc_bounty_hunter_cole',
  BLACK_BELLE: 'npc_black_belle', // Bounty hunter partner

  // Coldwater NPCs
  RANCHER_MCGRAW: 'npc_rancher_mcgraw',
  THE_WANDERER: 'npc_the_wanderer',
  VETERINARIAN_ROSE: 'npc_veterinarian_rose',

  // Salvation NPCs
  PREACHER_SOLOMON: 'npc_preacher_solomon',
  SISTER_MERCY: 'npc_sister_mercy',
  FATHER_MIGUEL: 'npc_father_miguel', // Preacher with a secret past
  IVRC_AGENT_SHAW: 'npc_ivrc_agent_shaw', // Blackmailing the preacher
} as const;

// ============================================================================
// FACTION IDS
// ============================================================================

/**
 * Faction identifiers for reputation tracking.
 */
export const FACTION_IDS = {
  /** The law and order faction */
  LAW: 'law',
  /** Outlaws and criminals */
  OUTLAWS: 'outlaws',
  /** Mining workers and union */
  MINERS: 'miners',
  /** Ranchers and farmers */
  RANCHERS: 'ranchers',
  /** The mysterious church */
  CHURCH: 'church',
  /** General townsfolk */
  TOWNSFOLK: 'townsfolk',
} as const;

// ============================================================================
// QUEST FLAG IDS
// ============================================================================

/**
 * Game state flags set by quests.
 * Used for tracking choices and branching paths.
 */
export const QUEST_FLAGS = {
  // Act 1 flags
  TUTORIAL_COMPLETE: 'tutorial_complete',
  FOUND_PROSPECTOR_CLUES: 'found_prospector_clues',
  MINE_ACCESS_GRANTED: 'mine_access_granted',
  TRUSTED_CLARA_FULLY: 'trusted_clara_fully',
  SUSPECTED_CLARA: 'suspected_clara',
  SABOTEUR_REVEALED: 'saboteur_revealed',

  // Act 2 flags - Mesa Point path
  INFILTRATED_OUTLAWS: 'infiltrated_outlaws',
  BETRAYED_OUTLAWS: 'betrayed_outlaws',
  JOINED_OUTLAWS_TEMP: 'joined_outlaws_temporarily',
  HAS_BLACK_MARKET_ACCESS: 'has_black_market_access',
  HAS_CONSPIRACY_DOCS: 'has_conspiracy_docs',

  // Act 2 flags - Coldwater path
  HELPED_MCGRAW: 'helped_mcgraw',
  WANDERER_REVEALED_INFO: 'wanderer_revealed_info',

  // Act 2 combination flags
  BOTH_PATHS_COMPLETE: 'both_paths_complete',
  FULL_EVIDENCE_GATHERED: 'full_evidence_gathered',
  PARTIAL_EVIDENCE: 'partial_evidence',

  // Act 3 flags
  POINT_OF_NO_RETURN: 'point_of_no_return',
  SOLOMON_IS_VILLAIN: 'solomon_is_villain',
  SOLOMON_IS_MANIPULATED: 'solomon_is_manipulated',
  RECRUITED_CLARA: 'recruited_clara_ally',
  RECRUITED_COLE: 'recruited_cole_ally',
  RECRUITED_REYNA: 'recruited_reyna_ally',
  RECRUITED_WANDERER: 'recruited_wanderer_ally',

  // Ending flags
  GOOD_ENDING: 'ending_good',
  NEUTRAL_ENDING: 'ending_neutral',
  DARK_ENDING: 'ending_dark',

  // Side quest flags
  GAMBLERS_DEBT_COMPLETE: 'gamblers_debt_complete',
  COGSWORTH_GADGET_OBTAINED: 'cogsworth_gadget_obtained',
  DOYLE_CAPTURED_ALIVE: 'doyle_captured_alive',
  DOYLE_KILLED: 'doyle_killed',
  LOCKET_TRUTH_REVEALED: 'locket_truth_revealed',
  MINERS_RESCUED: 'miners_rescued',
  MIGUEL_PROTECTED: 'miguel_protected',
  MIGUEL_EXPOSED: 'miguel_exposed',
} as const;

// ============================================================================
// QUEST ITEM IDS
// ============================================================================

/**
 * Quest-specific items used as objectives or keys.
 */
export const QUEST_ITEM_IDS = {
  // Act 1 items
  STARTING_SUPPLIES: 'item_starting_supplies',
  PROSPECTOR_JOURNAL: 'item_prospector_journal',
  MINE_SABOTAGE_EVIDENCE: 'item_sabotage_evidence',
  CLARAS_GADGET: 'item_claras_gadget',

  // Act 2 items
  OUTLAW_LEDGER: 'item_outlaw_ledger',
  CONSPIRACY_DOCUMENTS: 'item_conspiracy_documents',
  RUSTLER_EVIDENCE: 'item_rustler_evidence',
  WANDERER_TOKEN: 'item_wanderer_token',

  // Act 3 items
  SOLOMON_KEY: 'item_solomon_key',
  TRUTH_REVEALED: 'item_truth_revealed',

  // Side quest items
  MEDICAL_SUPPLIES: 'item_medical_supplies',
  BOUNTY_POSTER: 'item_bounty_poster',
  WHISPERS_INFO: 'item_whispers_info',
  STOLEN_WINNINGS: 'item_stolen_winnings',
  CHEATING_EVIDENCE: 'item_cheating_evidence',
  STEAM_VALVE: 'item_steam_valve',
  PRESSURE_GAUGE: 'item_pressure_gauge',
  COPPER_COIL: 'item_copper_coil',
  COGSWORTH_GADGET: 'item_cogsworth_gadget',
  BELLE_BOUNTY_POSTER: 'item_belle_bounty_poster',
  OUTLAW_DOYLE: 'item_outlaw_doyle',
  WIDOWS_LOCKET: 'item_widows_locket',
  FAMILY_LETTER: 'item_family_letter',
  MINE_SHAFT_KEY: 'item_mine_shaft_key',
  RESCUE_SUPPLIES: 'item_rescue_supplies',
  MIGUELS_CONFESSION: 'item_miguels_confession',
  BLACKMAIL_LETTER: 'item_blackmail_letter',
} as const;

// ============================================================================
// ENEMY IDS FOR QUEST COMBAT
// ============================================================================

/**
 * Enemy identifiers used in quest combat encounters.
 */
export const QUEST_ENEMY_IDS = {
  // Tutorial enemies
  COYOTE: 'enemy_coyote',

  // Act 1 enemies
  SABOTEUR_THUG: 'enemy_saboteur_thug',
  MINE_BOSS_VANCE: 'enemy_boss_vance',

  // Act 2 enemies
  OUTLAW_GRUNT: 'enemy_outlaw_grunt',
  RUSTLER: 'enemy_rustler',

  // Act 3 enemies
  CULT_FANATIC: 'enemy_cult_fanatic',
  FINAL_BOSS: 'enemy_final_boss',

  // Wildlife
  WOLF: 'enemy_wolf',
  RATTLESNAKE: 'enemy_rattlesnake',
  BEAR: 'enemy_bear',

  // Side quest enemies
  BANDIT: 'enemy_bandit',
  BAR_BRAWLER: 'enemy_bar_brawler',
  CARDSHARK_THUG: 'enemy_cardshark_thug',
  NOTORIOUS_OUTLAW_DOYLE: 'enemy_outlaw_doyle',
  IVRC_THUG: 'enemy_ivrc_thug',
} as const;

// ============================================================================
// QUEST ACT DEFINITIONS
// ============================================================================

/**
 * Act definitions for organizing the main quest.
 */
export const QUEST_ACTS = {
  ACT_1: {
    id: 'act_1',
    name: 'The Saboteur',
    description: "Investigate mysterious events in the frontier's mining towns.",
    locations: [TOWN_IDS.FRONTIERS_EDGE, ROUTE_IDS.DUSTY_TRAIL, TOWN_IDS.IRON_GULCH],
  },
  ACT_2: {
    id: 'act_2',
    name: 'The Conspiracy',
    description: 'Uncover the truth behind the sabotage and follow the trail.',
    locations: [
      TOWN_IDS.IRON_GULCH,
      ROUTE_IDS.DESERT_PASS,
      ROUTE_IDS.MOUNTAIN_ROAD,
      TOWN_IDS.MESA_POINT,
      TOWN_IDS.COLDWATER,
    ],
  },
  ACT_3: {
    id: 'act_3',
    name: 'Reckoning',
    description: 'Confront the mastermind and determine the fate of the frontier.',
    locations: [ROUTE_IDS.FINAL_TRAIL, TOWN_IDS.SALVATION],
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TownId = (typeof TOWN_IDS)[keyof typeof TOWN_IDS];
export type RouteId = (typeof ROUTE_IDS)[keyof typeof ROUTE_IDS];
export type LocationMarker = (typeof LOCATION_MARKERS)[keyof typeof LOCATION_MARKERS];
export type NpcId = (typeof NPC_IDS)[keyof typeof NPC_IDS];
export type FactionId = (typeof FACTION_IDS)[keyof typeof FACTION_IDS];
export type QuestFlag = (typeof QUEST_FLAGS)[keyof typeof QUEST_FLAGS];
export type QuestItemId = (typeof QUEST_ITEM_IDS)[keyof typeof QUEST_ITEM_IDS];
export type QuestEnemyId = (typeof QUEST_ENEMY_IDS)[keyof typeof QUEST_ENEMY_IDS];
