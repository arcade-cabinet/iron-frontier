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
