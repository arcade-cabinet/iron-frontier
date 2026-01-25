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
  // Spatial primitives
  HexCoordSchema,
  TerrainTypeSchema,
  FeatureTypeSchema,
  EdgeTypeSchema,
  StructureTypeSchema,

  // Spatial composites
  TileDefSchema,
  MarkerSchema,
  ZoneSchema,
  SlotInstanceSchema,
  AssemblageSchema,
  LocationSchema,

  // Validators
  validateAssemblage,
  validateLocation,

  // Types
  type HexCoord,
  type TileDef,
  type Marker,
  type Zone,
  type SlotInstance,
  type Assemblage,
  type AssemblageRef,
  type Location,
} from './schemas/spatial';

export {
  // World primitives
  WorldCoordSchema,
  RegionBiomeSchema,
  DangerLevelSchema,
  LocationTypeSchema,
  TravelMethodSchema,

  // World composites
  RegionSchema,
  LocationRefSchema,
  ConnectionSchema,
  WorldSchema,

  // Validators
  validateWorld,

  // Utilities
  getLocationsInRegion,
  getConnectionsFrom,
  getRegionAt,
  getLocationAt,

  // Types
  type WorldCoord,
  type Region,
  type LocationRef,
  type Connection,
  type World,
} from './schemas/world';

// ============================================================================
// ASSEMBLAGES
// ============================================================================

export {
  // Individual assemblages
  Saloon,
  SmallTavern,
  GeneralStore,
  Gunsmith,
  Bank,
  SheriffOffice,
  Church,
  TrainStation,
  Cabin,
  House,
  Mansion,
  Well,
  Stable,
  MineEntrance,
  Campfire,
  TentCamp,
  BanditCamp,
  SmallFarm,
  CattleRanch,
  AbandonedCabin,
  GhostTown,
  Oasis,
  RockFormation,
  CanyonPass,
  Waystation,
  TelegraphPost,

  // Library and utilities
  ASSEMBLAGE_LIBRARY,
  ASSEMBLAGES_BY_ID,
  getAssemblagesBySlot,
  getAssemblagesByTag,
} from './assemblages/library';

// ============================================================================
// LOCATIONS
// ============================================================================

export {
  // Individual locations
  TestTown,
  CopperMine,
  DesertWaystation,
  SunsetRanch,
  RattlesnakeCanyon,

  // Registry
  LOCATIONS_BY_ID,
  getLocationById,
  getAllLocationIds,
} from './locations/index';

// ============================================================================
// WORLDS
// ============================================================================

export {
  // World definitions
  FrontierTerritory,

  // World loader
  loadWorld,
  getLocationData,
  validateWorldReferences,
  getTravelInfo,

  // Registry
  WORLDS_BY_ID,
  getWorldById,
  getAllWorldIds,

  // Types
  type LoadedWorld,
  type ResolvedLocation,
} from './worlds/index';

// ============================================================================
// QUESTS
// ============================================================================

export {
  // Quest schemas
  ObjectiveTypeSchema,
  ObjectiveSchema,
  QuestStageSchema,
  QuestStatusSchema,
  QuestTypeSchema,
  QuestSchema,
  ActiveQuestSchema,

  // Validators
  validateObjective,
  validateQuestStage,
  validateQuest,
  validateActiveQuest,

  // Utilities
  isStageComplete,
  isCurrentStageComplete,
  isQuestComplete,
  getCurrentStage,
  createActiveQuest,

  // Types
  type ObjectiveType,
  type Objective,
  type QuestStage,
  type QuestStatus,
  type QuestType,
  type Quest,
  type ActiveQuest,
} from './schemas/quest';

export {
  // Quest definitions
  TheInheritance,
  MissingCattle,
  DocsDilemma,

  // Registry
  QUESTS_BY_ID,
  QUESTS_BY_TYPE,
  ALL_QUEST_IDS,

  // Lookup functions
  getQuestById,
  getQuestsByType,
  getQuestsAtLocation,
  getQuestsByNPC,
  getQuestsByTag,
  arePrerequisitesMet,
} from './quests/index';

// ============================================================================
// NPC & DIALOGUE
// ============================================================================

export {
  // Dialogue schemas
  ConditionTypeSchema,
  DialogueEffectTypeSchema,
  DialogueConditionSchema,
  DialogueEffectSchema,
  DialogueChoiceSchema,
  DialogueNodeSchema,
  DialogueTreeSchema,
  NPCPersonalitySchema,
  NPCRoleSchema,
  NPCFactionSchema,
  NPCDefinitionSchema,
  DialogueStateSchema,

  // Validators
  validateDialogueNode,
  validateDialogueTree,
  validateNPCDefinition,
  validateDialogueTreeIntegrity,

  // Utilities
  getDialogueEntryNode,
  getAvailableChoices,

  // Types
  type ConditionType,
  type DialogueEffectType,
  type DialogueCondition,
  type DialogueEffect,
  type DialogueChoice,
  type DialogueNode,
  type DialogueTree,
  type NPCPersonality,
  type NPCRole,
  type NPCFaction,
  type NPCDefinition,
  type DialogueState as NPCDialogueState,
} from './schemas/npc';

export {
  // NPC definitions
  SheriffMarcusCole,
  MayorJosephineHolt,
  DocChenWei,
  FatherMiguel,
  DiamondbackDolores,
  OldSamuelIronpick,

  // Registry
  ALL_NPCS,
  NPCS_BY_ID,
  NPCS_BY_LOCATION,
  ALL_DIALOGUE_TREES,
  DIALOGUE_TREES_BY_ID,

  // Lookup functions
  getNPCById,
  getNPCsByLocation,
  getNPCsByFaction,
  getNPCsByTag,
  getDialogueTreeById,
  getDialogueTreesForNPC,
  getPrimaryDialogueTree,
  getQuestGivers,
  getEssentialNPCs,
} from './npcs/index';
