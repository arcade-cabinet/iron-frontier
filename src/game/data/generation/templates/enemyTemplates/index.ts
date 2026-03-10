/**
 * Enemy Templates - Procedural enemy generation
 */

export {
  BehaviorTagSchema,
  type BehaviorTag,
  EnemyNamePoolSchema,
  type EnemyNamePool,
  EnemyStatsSchema,
  type EnemyStats,
  EnemyTemplateSchema,
  type EnemyTemplate,
  LevelScalingSchema,
  type LevelScaling,
} from './schemas.ts';

export {
  BanditThugTemplate,
  BanditGunmanTemplate,
  BanditSharpshooterTemplate,
  BanditLeaderTemplate,
  DesertWolfTemplate,
  RattlesnakeTemplate,
  MountainLionTemplate,
  GrizzlyBearTemplate,
  ScorpionTemplate,
  VultureTemplate,
  IVRCGuardTemplate,
  IVRCMarksmanTemplate,
  IVRCCaptainTemplate,
  CopperheadGunslingerTemplate,
  CopperheadEnforcerTemplate,
  CopperheadDynamiterTemplate,
  RemnantScoutTemplate,
  RemnantSentryTemplate,
  RemnantJuggernautTemplate,
  RustlerTemplate,
  MercenaryTemplate,
  CorruptDeputyTemplate,
  HostileProspectorTemplate,
  DesperadoTemplate,
  GhostTownDwellerTemplate,
  TombRaiderTemplate,
} from './helpers.ts';

export {
  calculateScaledStats,
  DEFAULT_ENEMY_TEMPLATE,
  ENEMY_TEMPLATES,
  getEnemyTemplate,
  getEnemyTemplatesByBehavior,
  getEnemyTemplatesByCombatTag,
  getEnemyTemplatesByFaction,
  getEnemyTemplatesForLevel,
  getEnemyTemplatesMatching,
} from './helpers.ts';
