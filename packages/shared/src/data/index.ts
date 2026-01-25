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
 * - Audio: Music and sound effect trigger definitions
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

// ============================================================================
// ENDINGS
// ============================================================================

export {
  // Ending definitions
  ENDING_CORPORATE_VICTORY,
  ENDING_REVOLUTION,
  ENDING_PEACEFUL_REFORM,
  ENDING_LAWMANS_JUSTICE,
  ENDING_EXODUS,
  ENDING_LONE_WOLF,
  ENDING_TRUE_PEACE,
  // Registries
  ALL_ENDINGS,
  ENDINGS_BY_ID,
  ENDINGS_BY_PATH,
  GOOD_ENDINGS,
  SECRET_ENDINGS,
  STANDARD_ENDINGS,
  // Lookup functions
  getEndingById,
  getEndingsByPath,
  getEndingsByTag,
  getFallbackEnding,
} from './endings/index';

export {
  // Ending schemas
  EndingSchema,
  EndingPathSchema,
  EndingConditionSchema,
  EndingConditionTypeSchema,
  CharacterFateSchema,
  FateTypeSchema,
  EpilogueSlideSchema,
  PlayerStatisticsSchema,
  EndingStateSchema,
  // Types
  type Ending,
  type EndingPath,
  type EndingCondition,
  type EndingConditionType,
  type CharacterFate,
  type FateType,
  type EpilogueSlide,
  type PlayerStatistics,
  type EndingState,
  // Validators
  validateEnding,
  validateEndingCondition,
  validateCharacterFate,
  validateEpilogueSlide,
  validatePlayerStatistics,
  validateEndingState,
  // Utility functions
  calculateEndingScore,
  areRequiredConditionsMet,
  selectBestEnding,
  getAvailableEndings,
  resolveCharacterFates,
  formatStatisticsMessage,
  createInitialStatistics,
  ENDING_SCHEMA_VERSION,
} from './schemas/ending';

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
// CRAFTING & COOKING
// ============================================================================

export {
  // Recipe categories
  AMMUNITION_RECIPES,
  MEDICINE_RECIPES,
  EQUIPMENT_RECIPES,
  SURVIVAL_RECIPES,
  COOKING_RECIPES,
  // Registry
  ALL_CRAFTING_RECIPES,
  RECIPES_BY_ID,
  RECIPES_BY_CATEGORY,
  // Utility functions
  getRecipeById,
  getRecipesByCategory,
  getRecipesByStation,
  getRecipesByTag,
  getRecipesBySkill,
  getDefaultUnlockedRecipes,
  getLockedRecipes,
  getRecipesUsingIngredient,
  getRecipesProducingItem,
  recipeExists,
  getRecipeCountByCategory,
  getTotalRecipeCount,
  // Types
  type CraftingRecipe,
  type CraftingCategory,
  type CraftingStation,
  type CraftingIngredient,
  type CraftingOutput,
  type SkillType,
  // Schemas
  CraftingCategorySchema,
  CraftingStationSchema,
  CraftingRecipeSchema,
  CraftingIngredientSchema,
  CraftingOutputSchema,
  SkillTypeSchema,
  // Validators
  validateCraftingRecipe,
  // Helpers
  hasIngredients,
  meetsSkillRequirement,
  hasStationAccess,
  isRecipeUnlocked,
  calculateSuccessChance,
  getCategoryColor,
  getCategoryName,
  getStationName,
  CRAFTING_SCHEMA_VERSION,
} from './crafting/index';

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

// ============================================================================
// TUTORIAL & ONBOARDING
// ============================================================================

export {
  // Schemas
  TutorialTriggerSchema,
  TutorialStepSchema,
  TutorialQuestSchema,
  HelpTipContextSchema,
  HelpTipSchema,
  LoadingTipSchema,
  TutorialStateSchema,
  // Types
  type TutorialTrigger,
  type TutorialStep,
  type TutorialQuest,
  type HelpTipContext,
  type HelpTip,
  type LoadingTip,
  type TutorialState,
  // Content
  OPENING_CINEMATIC,
  TUTORIAL_STEPS,
  TUTORIAL_QUEST,
  TUTORIAL_MENTOR_NPC,
  HELP_TIPS,
  LOADING_TIPS,
  // State functions
  createTutorialState,
  isStepCompleted,
  isTutorialComplete,
  getNextTutorialStep,
  getTutorialStepByTrigger,
  completeTutorialStep,
  skipTutorial,
  markCinematicViewed,
  shouldShowHelpTip,
  getHelpTipForContext,
  markHelpTipShown,
  getRandomLoadingTip,
  // Validation
  validateTutorialStep,
  validateHelpTip,
  validateLoadingTip,
  validateTutorialState,
  // Registry
  TUTORIAL_STEPS_BY_ID,
  HELP_TIPS_BY_ID,
  HELP_TIPS_BY_CONTEXT,
  LOADING_TIPS_BY_ID,
  LOADING_TIPS_BY_CATEGORY,
  getTutorialStepById,
  getHelpTipById,
  getLoadingTipById,
  // Constants
  TUTORIAL_SCHEMA_VERSION,
  TUTORIAL_CONSTANTS,
} from './tutorial/index';

// ============================================================================
// LORE CODEX
// ============================================================================

export {
  // Lore entries by category
  HISTORY_ENTRIES,
  FACTION_ENTRIES,
  LOCATION_ENTRIES,
  TECHNOLOGY_ENTRIES,
  CHARACTER_ENTRIES,
  // Combined collections
  ALL_LORE_ENTRIES,
  LORE_ENTRIES_BY_CATEGORY,
  LORE_ENTRIES_BY_ID,
  // Lookup functions
  getLoreByCategory,
  getLoreEntryById,
  getUnlockedLore,
  getUnlockedLoreByCategory,
  getLoreByTags,
  getRelatedLore,
  getLoreForLocation,
  getLoreForNPC,
  getLoreForQuest,
  getAutomaticLoreEntries,
  // State management
  discoverLore,
  isLoreUnlocked,
  createInitialLoreCodexState,
  // Progress tracking
  getTotalLoreCount,
  getLoreProgress,
  // Types re-exported from lore/index
  type LoreEntry as CodexLoreEntry,
  type LoreCategory as CodexLoreCategory,
  type DiscoveryCondition as CodexDiscoveryCondition,
  type LoreCodexState as CodexState,
} from './lore/index';

export {
  // Lore schema definitions
  LoreCategorySchema,
  DiscoveryConditionTypeSchema,
  DiscoveryConditionSchema,
  LoreEntrySchema,
  LoreCodexStateSchema,
  // Types
  type LoreCategory,
  type DiscoveryConditionType,
  type DiscoveryCondition,
  type LoreEntry,
  type LoreCodexState,
  // Validators
  validateLoreEntry,
  validateLoreCodexState,
  validateDiscoveryCondition,
  // Utilities
  isConditionMet,
  createInitialCodexState,
  // Version
  LORE_SCHEMA_VERSION,
} from './schemas/lore';

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export {
  // Schemas
  AchievementSchema,
  AchievementCategorySchema,
  AchievementRaritySchema,
  AchievementRewardSchema,
  UnlockConditionSchema,
  UnlockConditionTypeSchema,
  ProgressTrackingSchema,
  PlayerAchievementStateSchema,
  RewardTypeSchema,
  // Types
  type Achievement,
  type AchievementCategory,
  type AchievementRarity,
  type AchievementReward,
  type UnlockCondition,
  type UnlockConditionType,
  type ProgressTracking,
  type PlayerAchievementState,
  type RewardType,
  // Story Achievements
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
  // Combat Achievements
  ACH_FirstBlood,
  ACH_BodyCount,
  ACH_Untouchable,
  ACH_KingSlayer,
  ACH_JusticeServed,
  ACH_SteelBreaker,
  ACH_JackOfAllTrades,
  ACH_LegendaryGunman,
  // Exploration Achievements
  ACH_Trailblazer,
  ACH_WellTraveled,
  ACH_Historian,
  ACH_SecretSeeker,
  ACH_LongRider,
  ACH_FreshOffTheCoach,
  ACH_Cartographer,
  ACH_JourneysEnd,
  // Economic Achievements
  ACH_StrikingItRich,
  ACH_BigSpender,
  ACH_WilySalesman,
  ACH_BountyHunter,
  ACH_FrontierTycoon,
  ACH_FirstPurchase,
  // Social Achievements
  ACH_PeoplePerson,
  ACH_LawAbiding,
  ACH_Outlaw,
  ACH_GoodSamaritan,
  ACH_Crossroads,
  ACH_PathChosen,
  ACH_FriendOfMiners,
  ACH_Cattlehand,
  // Secret Achievements
  ACH_RustingDreams,
  ACH_BestFriend,
  ACH_CollectorOfBounties,
  ACH_HighStakes,
  ACH_DancingWithTheDead,
  // Achievement Collections
  STORY_ACHIEVEMENTS,
  COMBAT_ACHIEVEMENTS,
  EXPLORATION_ACHIEVEMENTS,
  ECONOMIC_ACHIEVEMENTS,
  SOCIAL_ACHIEVEMENTS,
  SECRET_ACHIEVEMENTS,
  ALL_ACHIEVEMENTS,
  // Registries
  ACHIEVEMENTS_BY_ID,
  ACHIEVEMENTS_BY_CATEGORY,
  ACHIEVEMENTS_BY_RARITY,
  // Utility Functions
  getAchievementById,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getVisibleAchievements,
  getHiddenAchievements,
  getAchievementsByTag,
  getTotalAvailablePoints,
  getCategoryPoints,
  calculatePlayerScore,
  getCategoryCompletion,
  getOverallCompletion,
  createDefaultAchievementState,
  createAllAchievementStates,
  getRarityColor as getAchievementRarityColor,
  getCategoryDisplayName,
  // Validation
  validateAchievement,
  validatePlayerAchievementState,
  // Statistics
  ACHIEVEMENT_STATS,
  ACHIEVEMENT_SCHEMA_VERSION,
} from './achievements/index';

// ============================================================================
// ENVIRONMENT (Weather, Hazards, Time Effects)
// ============================================================================

export {
  // Weather Types and Effects
  WEATHER_EFFECTS,
  SEVERITY_MULTIPLIERS,
  // Biome Weather Patterns
  BIOME_WEATHER_PATTERNS,
  // Environmental Hazards
  ENVIRONMENTAL_HAZARDS,
  HAZARDS_BY_ID,
  HAZARDS_BY_TYPE,
  // Time of Day Effects
  TIME_OF_DAY_EFFECTS,
  // Seasonal Effects
  SEASONAL_EFFECTS,
  // Default States
  DEFAULT_WEATHER_STATE,
  DEFAULT_ENVIRONMENT_STATE,
  // Weather System Class
  WeatherSystem,
  // Hazard System Class
  HazardSystem,
  // Time Utilities
  getTimeOfDay as getEnvironmentTimeOfDay,
  getTimeEffects,
  getSeason,
  getSeasonalEffects,
  // Combined Effects
  getCombinedEffects,
  // Types
  type WeatherType,
  type WeatherSeverity,
  type WeatherEffects,
  type WeatherState,
  type BiomeWeatherPattern,
  type EnvironmentalHazard,
  type HazardCheckResult,
  type HazardType,
  type HazardCheckType,
  type HazardStatusEffect,
  type TimeOfDay,
  type TimeEffects,
  type Season,
  type SeasonalEffects,
  type EnvironmentState,
  // Schema Validators
  WeatherTypeSchema,
  WeatherSeveritySchema,
  WeatherEffectsSchema,
  WeatherStateSchema,
  EnvironmentalHazardSchema,
  HazardCheckResultSchema,
  EnvironmentStateSchema,
  ENVIRONMENT_SCHEMA_VERSION,
} from './environment/index';

// ============================================================================
// AUDIO (Music Cues, Sound Effects, Dynamic Music)
// ============================================================================

export {
  // Types - Music
  type MusicCategory,
  type MusicMood,
  type TimeOfDay as AudioTimeOfDay,
  type BiomeType,
  type FactionTheme,
  type TransitionType,
  type MusicLayer,
  type MusicTriggerCondition,
  type MusicTrack,

  // Types - Sound Effects
  type SFXCategory,
  type SFXTriggerEvent,
  type SoundCue,

  // Types - Dynamic Music
  type DynamicMusicConfig,
  type MusicMemory,

  // Types - Ambience
  type AmbienceLayer,

  // Exploration Themes (6)
  MainOverworldTheme,
  DesertExplorationTheme,
  MountainExplorationTheme,
  NightExplorationTheme,
  TownAmbienceTheme,
  DangerousTensionTheme,

  // Combat Themes (4)
  StandardCombatTheme,
  BossBattleTheme,
  AmbushCombatTheme,
  FinalConfrontationTheme,

  // Emotional Themes (6)
  VictoryTriumphTheme,
  DefeatGameOverTheme,
  SadLossMomentTheme,
  MysteryDiscoveryTheme,
  RomanceTenderTheme,
  TensionStealthTheme,

  // Location Themes (6)
  SaloonPianoTheme,
  ChurchOrganTheme,
  IVRCCorporateTheme,
  FreeminerCampTheme,
  CopperheadHideoutTheme,
  FinalLocationTheme,

  // Stingers
  VictoryStinger,
  DefeatStinger,
  QuestCompleteStinger,
  LevelUpStinger,
  DiscoveryStinger,
  DangerStinger,

  // Registries
  ALL_MUSIC_TRACKS,
  MUSIC_TRACKS_BY_ID,
  MUSIC_TRACKS_BY_CATEGORY,
  SOUND_CUES,
  SOUND_CUES_BY_EVENT,
  SOUND_CUES_BY_CATEGORY,
  AMBIENCE_LAYERS,
  AMBIENCE_LAYERS_BY_ID,

  // Configuration
  DYNAMIC_MUSIC_CONFIG,

  // Utility Functions
  selectMusicTrack,
  getSoundCue,
  selectAmbienceLayer,
  getMusicTracksByCategory,
  getMusicTrackById,
  getStingers,
  getSoundCuesByCategory,
  shouldPlaySoundCue,
  selectSoundVariant,
} from './audio/index';

// ============================================================================
// RANDOM EVENTS (Travel, Town, Camp)
// ============================================================================

export {
  // Schemas
  EventCategorySchema,
  EventRaritySchema,
  TimeOfDaySchema as EventTimeOfDaySchema,
  EventEffectTypeSchema,
  EventConditionSchema,
  EventEffectSchema,
  EventChoiceSchema,
  RandomEventSchema,
  // Types
  type EventCategory,
  type EventRarity,
  type TimeOfDay as EventTimeOfDay,
  type EventEffectType,
  type EventCondition,
  type EventEffect,
  type EventChoice,
  type RandomEvent,
  // Constants
  RARITY_WEIGHTS,
  RANDOM_EVENTS_SCHEMA_VERSION,
  // Event Collections
  TRAVEL_EVENTS,
  TOWN_EVENTS,
  CAMP_EVENTS,
  ALL_RANDOM_EVENTS,
  // Utility Functions
  getEventsByCategory,
  getEventsByRarity,
  getEventById,
  checkEventConditions,
  selectRandomEvent as selectRandomEventForContext,
  getAvailableChoices as getAvailableEventChoices,
  calculateEffectValue,
  // Validation
  validateRandomEvent,
  validateEventChoice,
  validateEventEffect,
} from './events/index';

// ============================================================================
// FACTION REPUTATION SYSTEM
// ============================================================================

export {
  // Faction Definitions
  IVRC_FACTION,
  COPPERHEADS_FACTION,
  FREEMINERS_FACTION,
  LAW_FACTION,
  TOWNSFOLK_FACTION,
  // Registries
  ALL_FACTIONS,
  FACTIONS_BY_ID,
  // Lookup Functions
  getFaction,
  getAllFactionIds,
  getFactionTierEffects,
  getFactionAction,
  // Reputation Calculation
  calculateActionReputationChanges,
  applyFactionDecay,
  // State Management
  createInitialFactionState,
  canPerformAction,
  performFactionAction,
  // Query Functions
  isHostileWithFaction,
  getShopPriceModifier,
  getQuestAvailability,
  getActivePerks,
  hasPerk,
  // Re-exported utilities
  getReputationTier,
  applyReputationDecay,
  calculateReputationChange,
  REPUTATION_TIER_BOUNDARIES,
  // Types
  type FactionDefinition,
  type FactionAction,
  type FactionTierEffects,
  type FactionRelationship,
  type PlayerFactionStanding,
  type PlayerFactionState,
  type ReputationTier,
  type FactionActionCategory,
} from './factions/index';

export {
  // Faction Schemas
  ReputationTierSchema,
  FactionActionCategorySchema,
  FactionActionSchema,
  FactionTierEffectsSchema,
  FactionRelationshipSchema,
  FactionDefinitionSchema,
  PlayerFactionStandingSchema,
  PlayerFactionStateSchema,
  // Validators
  validateFactionDefinition,
  validateFactionAction,
  validatePlayerFactionStanding,
  // Utility Functions
  getTierIndex,
  getReputationForTier,
  // Version
  FACTION_SCHEMA_VERSION,
} from './schemas/faction';

// ============================================================================
// COMPANIONS
// ============================================================================

export {
  // Companion Definitions
  DeputyJakeHawkins,
  MaggieIronpick,
  BlackBelle,
  SisterMaria,
  CopperheadViper,
  SteamAutomaton,
  // Registries
  ALL_COMPANIONS,
  COMPANIONS_BY_ID,
  COMPANIONS_BY_PATH,
  COMPANIONS_BY_LOCATION,
  // Lookup Functions
  getCompanionById,
  getCompanionsByPath,
  getCompanionsByLocation,
  getRomanceableCompanions,
  getCompanionsByCombatRole,
  getCompanionsByTag,
  areCompanionsCompatible,
  getAllAbilities,
  getUnlockedAbilities,
  selectBanterLine,
  getEffectiveStats,
  // State Functions
  canRecruit,
  createCompanionState,
  getApprovalLevel,
  getAvailableBanter,
  getExperienceForLevel,
  // Validators
  validateCompanionDefinition,
  validateCompanionState,
  validateCompanionAbility,
  validatePersonalQuest,
  // Schemas
  CompanionDefinitionSchema,
  CompanionStateSchema,
  COMPANION_SCHEMA_VERSION,
  // Types
  type CompanionDefinition,
  type CompanionState,
  type CompanionAbility,
  type CompanionPath,
  type CombatRole,
  type CompanionAI,
  type CompanionEquipment,
  type AbilityEffect,
  type AbilityEffectType,
  type AbilityTarget,
  type AIPriority,
  type ApprovalTrigger,
  type ApprovalTriggerType,
  type BanterLine,
  type BanterTrigger,
  type PersonalQuest,
  type PersonalQuestStage,
  type RecruitmentRequirements,
  type RomanceOptions,
  type RomanceStage,
} from './companions/index';

// ============================================================================
// SECRETS AND EASTER EGGS
// ============================================================================

export {
  // Schemas
  SecretTypeSchema,
  DiscoveryMethodSchema,
  SecretHintSchema,
  SecretSchema,
  // Types
  type SecretType,
  type DiscoveryMethod,
  type SecretHint,
  type Secret,
  // Secret Locations (8)
  FoundersTomb,
  NativeSacredCave,
  CrashedAirship,
  GhostTownPromise,
  SmugglersTunnel,
  HermitsCabin,
  MeteorCrater,
  IVRCSecretLab,
  // Easter Eggs (10)
  TimeTraveler,
  GiantSkeleton,
  FourthWall,
  DeveloperRoom,
  MusicalRocks,
  ConspiracyBoard,
  FamousGrave,
  ImpossibleShot,
  TheDance,
  SecretDialogue,
  // Hidden Items (6)
  RelicRevolver,
  FoolsGoldNugget,
  TheDeed,
  MysteriousMap,
  AncientJournal,
  CrystalSkull,
  // Collections
  SECRET_LOCATIONS,
  EASTER_EGGS,
  HIDDEN_ITEMS,
  ALL_SECRETS,
  // Registries
  SECRETS_BY_ID,
  SECRETS_BY_TYPE,
  // Lookup Functions
  getSecretById,
  getSecretsByType,
  getSecretsAtLocation,
  getSecretsRequiringItem,
  getSecretsByTag,
  getSecretsByDifficulty,
  getHintsForLocation,
  canDiscoverSecret,
  // Secret Items
  SECRET_ITEMS,
  SECRET_ITEMS_BY_ID,
  getSecretItemById,
  // Version
  SECRETS_SCHEMA_VERSION,
} from './secrets/index';
