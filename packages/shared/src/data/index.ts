/**
 * Data Library - All game data definitions and loaders
 *
 * This module exports all the spatial, assemblage, location, and world data
 * that defines Iron Frontier's game world.
 *
 * Architecture:
 * - Schemas: Zod-validated data definitions (DDL)
 * - Assemblages: Reusable building templates
 * - Locations: Hand-crafted places (towns, mines, hideouts)
 * - Worlds: Complete world definitions with regions and connections
 */

// ============================================================================
// SCHEMAS
// ============================================================================

export {
  type Assemblage,
  type AssemblageRef,
  AssemblageSchema,
  EdgeTypeSchema,
  FeatureTypeSchema,
  // Types
  type HexCoord,
  // Spatial primitives
  HexCoordSchema,
  type Location,
  LocationSchema,
  type Marker,
  MarkerSchema,
  type SlotInstance,
  SlotInstanceSchema,
  StructureTypeSchema,
  TerrainTypeSchema,
  type TileDef,
  // Spatial composites
  TileDefSchema,
  // Validators
  validateAssemblage,
  validateLocation,
  type Zone,
  ZoneSchema,
} from './schemas/spatial';

export {
  type Connection,
  ConnectionSchema,
  DangerLevelSchema,
  getConnectionsFrom,
  getLocationAt,
  // Utilities
  getLocationsInRegion,
  getRegionAt,
  type LocationRef,
  LocationRefSchema,
  LocationTypeSchema,
  type Region,
  RegionBiomeSchema,
  // World composites
  RegionSchema,
  TravelMethodSchema,
  // Validators
  validateWorld,
  type World,
  // Types
  type WorldCoord,
  // World primitives
  WorldCoordSchema,
  WorldSchema,
} from './schemas/world';

// ============================================================================
// ASSEMBLAGES
// ============================================================================

export {
  AbandonedCabin,
  // Library and utilities
  ASSEMBLAGE_LIBRARY,
  ASSEMBLAGES_BY_ID,
  BanditCamp,
  Bank,
  Cabin,
  Campfire,
  CanyonPass,
  CattleRanch,
  Church,
  GeneralStore,
  GhostTown,
  Gunsmith,
  getAssemblagesBySlot,
  getAssemblagesByTag,
  House,
  Mansion,
  MineEntrance,
  Oasis,
  RockFormation,
  // Individual assemblages
  Saloon,
  SheriffOffice,
  SmallFarm,
  SmallTavern,
  Stable,
  TelegraphPost,
  TentCamp,
  TrainStation,
  Waystation,
  Well,
} from './assemblages/library';

// ============================================================================
// LOCATIONS
// ============================================================================

export {
  CopperMine,
  DesertWaystation,
  getAllLocationIds,
  getLocationById,
  // Registry
  LOCATIONS_BY_ID,
  RattlesnakeCanyon,
  SunsetRanch,
  // Individual locations
  TestTown,
} from './locations/index';

// ============================================================================
// WORLDS
// ============================================================================

export {
  // World definitions
  FrontierTerritory,
  getAllWorldIds,
  getLocationData,
  getTravelInfo,
  getWorldById,
  // Types
  type LoadedWorld,
  // World loader
  loadWorld,
  type ResolvedLocation,
  validateWorldReferences,
  // Registry
  WORLDS_BY_ID,
} from './worlds/index';

// ============================================================================
// QUESTS
// ============================================================================

export {
  ALL_QUEST_IDS,
  arePrerequisitesMet,
  DocsDilemma,
  // Lookup functions
  getQuestById,
  getQuestsAtLocation,
  getQuestsByNPC,
  getQuestsByTag,
  getQuestsByType,
  MissingCattle,
  // Registry
  QUESTS_BY_ID,
  QUESTS_BY_TYPE,
  // Quest definitions
  TheInheritance,
} from './quests/index';
export {
  type ActiveQuest,
  ActiveQuestSchema,
  createActiveQuest,
  getCurrentStage,
  isCurrentStageComplete,
  isQuestComplete,
  // Utilities
  isStageComplete,
  type Objective,
  ObjectiveSchema,
  // Types
  type ObjectiveType,
  // Quest schemas
  ObjectiveTypeSchema,
  type Quest,
  QuestSchema,
  type QuestStage,
  QuestStageSchema,
  type QuestStatus,
  QuestStatusSchema,
  type QuestType,
  QuestTypeSchema,
  validateActiveQuest,
  // Validators
  validateObjective,
  validateQuest,
  validateQuestStage,
} from './schemas/quest';

// ============================================================================
// NPC & DIALOGUE
// ============================================================================

export {
  ALL_DIALOGUE_TREES,
  // Registry
  ALL_NPCS,
  DIALOGUE_TREES_BY_ID,
  DiamondbackDolores,
  DocChenWei,
  FatherMiguel,
  getDialogueTreeById,
  getDialogueTreesForNPC,
  getEssentialNPCs,
  // Lookup functions
  getNPCById,
  getNPCsByFaction,
  getNPCsByLocation,
  getNPCsByTag,
  getPrimaryDialogueTree,
  getQuestGivers,
  MayorJosephineHolt,
  NPCS_BY_ID,
  NPCS_BY_LOCATION,
  OldSamuelIronpick,
  // NPC definitions
  SheriffMarcusCole,
} from './npcs/index';
export {
  // Types
  type ConditionType,
  // Dialogue schemas
  ConditionTypeSchema,
  type DialogueChoice,
  DialogueChoiceSchema,
  type DialogueCondition,
  DialogueConditionSchema,
  type DialogueEffect,
  DialogueEffectSchema,
  type DialogueEffectType,
  DialogueEffectTypeSchema,
  type DialogueNode,
  DialogueNodeSchema,
  type DialogueState as NPCDialogueState,
  DialogueStateSchema,
  type DialogueTree,
  DialogueTreeSchema,
  getAvailableChoices,
  // Utilities
  getDialogueEntryNode,
  type NPCDefinition,
  NPCDefinitionSchema,
  type NPCFaction,
  NPCFactionSchema,
  type NPCPersonality,
  NPCPersonalitySchema,
  type NPCRole,
  NPCRoleSchema,
  // Validators
  validateDialogueNode,
  validateDialogueTree,
  validateDialogueTreeIntegrity,
  validateNPCDefinition,
} from './schemas/npc';

// ============================================================================
// ENEMIES
// ============================================================================

export {
  // Wildlife
  Coyote,
  Rattlesnake,
  Scorpion,
  Buzzard,
  Wolf,
  MountainLion,
  Bear,
  GiantScorpion,
  DesertWolf,
  // Bandits
  LoneBandit,
  BanditGunner,
  BanditBrute,
  BanditLeader,
  BanditThug,
  BanditGunman,
  BanditSharpshooter,
  // Outlaws
  OutlawGunslinger,
  OutlawEnforcer,
  RedEyesLieutenant,
  CopperheadEnforcer,
  CopperheadGunslinger,
  CopperheadDynamiter,
  // IVRC
  IVRCGuard,
  IVRCMarksman,
  IVRCCaptain,
  // Automatons
  ClockworkDrone,
  SteamGolem,
  CorruptedProspector,
  MechanicalHorror,
  RemnantSentry,
  RemnantScout,
  RemnantJuggernaut,
  // Bosses
  BanditKing,
  TheSaboteur,
  IronTyrant,
  // Registry
  ALL_ENEMIES,
  ENEMIES_BY_ID,
  // Utility functions
  getEnemyById,
  getEnemiesByFaction,
  getEnemiesByTag,
  getEnemiesByType,
  getEnemiesByDifficulty,
  getRandomEnemy,
  // Encounters
  CoyotePack,
  SnakeNest,
  WolfPack,
  MountainPredator,
  GrizzlyAttack,
  RoadsideBandits,
  BanditCamp as BanditCampEncounter,
  BanditBoss,
  CopperheadPatrol,
  OutlawAmbush,
  LieutenantShowdown,
  IVRCCheckpoint,
  IVRCPatrol,
  IVRCCaptainEncounter,
  RemnantAwakening,
  ClockworkSwarm,
  SteamGolemEncounter,
  JuggernautBoss,
  BanditKingBattle,
  SaboteurBattle,
  IronTyrantBattle,
  ALL_ENCOUNTERS,
  ENCOUNTERS_BY_ID,
  getEncounterById,
  getEncountersByTag,
  getRandomEncounter,
  getBossEncounters,
  getEncountersByDifficulty,
} from './enemies/index';

// ============================================================================
// ITEMS (Extended)
// ============================================================================

export {
  // Healing Items
  HEALING_ITEMS,
  // Food Items
  FOOD_ITEMS,
  // Weapons
  MELEE_WEAPONS,
  RANGED_WEAPONS,
  // Armor
  BODY_ARMOR,
  // Key Items
  KEY_ITEMS as NEW_KEY_ITEMS,
  // Loot
  ANIMAL_LOOT,
  BANDIT_LOOT,
  MECHANICAL_LOOT,
  // Ammunition
  AMMUNITION,
  // Registry
  ALL_NEW_ITEMS,
  NEW_ITEMS_BY_ID,
  // Utility functions
  getNewItemById,
  getNewItemsByType,
  getNewItemsByTag,
  getNewItemsByRarity,
  getHealingItems,
  getWeaponsByType,
  getArmorBySlot,
  getLootItems,
} from './items/items';

// ============================================================================
// LOOT TABLES
// ============================================================================

export {
  // Rarity system
  LOOT_RARITY_WEIGHTS,
  type LootRarity,
  // Wildlife loot tables
  WildlifeCommonLoot,
  WildlifeVenomLoot,
  WildlifePeltsLoot,
  WildlifeRareLoot,
  // Bandit loot tables
  BanditCommonLoot,
  BanditLeaderLoot,
  // Outlaw loot tables
  OutlawCommonLoot,
  OutlawLeaderLoot,
  // IVRC loot tables
  IVRCCommonLoot,
  IVRCLeaderLoot,
  // Automaton loot tables
  AutomatonScrapLoot,
  AutomatonRareLoot,
  // Corrupted loot tables
  CorruptedHumanLoot,
  // Boss loot tables
  BossBanditKingLoot,
  BossSaboteurLoot,
  BossFinalLoot,
  // Container loot tables
  ChestCommonLoot,
  ChestUncommonLoot,
  ChestRareLoot,
  SafeLoot,
  // Money drops
  MONEY_DROPS,
  type MoneyDrop,
  // Registry
  ALL_LOOT_TABLES,
  LOOT_TABLES_BY_ID,
  // Utility functions
  getLootTableById,
  rollLootTable,
  rollMoneyDrop,
  getLootTableForEnemy,
} from './lootTables';

// ============================================================================
// AUTHORED WORLD DATA (Towns, Routes, World)
// ============================================================================

export {
  // Town schemas
  TownSchema,
  TownSizeSchema,
  TownThemeSchema,
  TownBuildingTypeSchema,
  TownPositionSchema,
  TownShopSchema,
  TownBuildingSchema,
  TownUnlockConditionSchema,
  type Town,
  type TownSize,
  type TownTheme,
  type TownBuildingType,
  type TownPosition,
  type TownShop,
  type TownBuilding,
  type TownUnlockCondition,
  // Town utilities
  validateTown,
  safeParseTown,
  validateTownIntegrity,
  isTownUnlocked,
  getShopsByType,
  getBuildingsByType,
  calculateTownDistance,
  TOWN_SCHEMA_VERSION,
  // Route schemas
  RouteSchema,
  RouteTerrainSchema,
  RouteConditionSchema,
  RouteEncounterSchema,
  RouteEventSchema,
  RouteLandmarkSchema,
  EncounterTriggerSchema,
  EventTriggerTypeSchema,
  LandmarkTypeSchema,
  type Route,
  type RouteTerrain,
  type RouteCondition,
  type RouteEncounter,
  type RouteEvent,
  type RouteLandmark,
  type EncounterTrigger,
  type EventTriggerType,
  type LandmarkType,
  // Route utilities
  validateRoute,
  safeParseRoute,
  validateRouteIntegrity,
  selectRandomEncounter,
  getLandmarksInRange,
  calculateTravelTime,
  isRoutePassable,
  ROUTE_SCHEMA_VERSION,
  // World schemas
  WorldDefinitionSchema,
  WorldConfigSchema,
  TimeConfigSchema,
  DifficultyConfigSchema,
  DifficultyPresetSchema,
  SurvivalConfigSchema,
  FactionSchema,
  StartingConditionsSchema,
  type WorldDefinition,
  type WorldConfig,
  type TimeConfig,
  type DifficultyConfig,
  type DifficultyPreset,
  type SurvivalConfig,
  type Faction,
  type StartingConditions,
  // World utilities
  validateWorld as validateAuthoredWorld,
  safeParseWorld,
  validateWorldIntegrity,
  getTownById,
  getRouteById,
  getFactionById,
  getRoutesForTown,
  getConnectedTowns,
  findRoute,
  calculateRouteTravelTime,
  getTimeOfDay,
  getDifficultyModifiers,
  WORLD_SCHEMA_VERSION,
  // Combined validation
  validateWorldComplete,
  DATA_WORLD_SCHEMA_VERSION,
} from './world/index';
