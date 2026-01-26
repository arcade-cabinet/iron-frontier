/**
 * Iron Frontier - Companion Schema Definitions
 *
 * Zod-backed schemas for the companion system.
 * Companions are recruitable NPCs that join the player's party,
 * with their own combat abilities, personal quests, and relationship systems.
 *
 * Design principles:
 * - Companions are data-driven with declarative abilities and AI
 * - Approval/disapproval tracks player choices and affects loyalty
 * - Personal quests unlock abilities and deepen relationships
 * - Combat AI is configurable and context-aware
 * - Equipment system integrates with existing item schemas
 */

import { z } from 'zod';
import { HexCoordSchema } from './spatial';

// ============================================================================
// COMPANION PATH / FACTION
// ============================================================================

/**
 * Recruitment paths determine how a companion can be recruited.
 * Each path represents a different playstyle or faction alignment.
 */
export const CompanionPathSchema = z.enum([
  'lawful', // Side with law enforcement
  'freeminer', // Support the Freeminer Coalition
  'copperhead', // Join the Copperhead Gang
  'neutral', // Available for hire or through generic quests
  'support', // Help the underground/humanitarian efforts
  'tech', // Help inventors and technologists
]);
export type CompanionPath = z.infer<typeof CompanionPathSchema>;

// ============================================================================
// COMBAT ROLE
// ============================================================================

/**
 * Combat roles define a companion's preferred fighting style.
 * Affects ability loadout, AI behavior, and equipment preferences.
 */
export const CombatRoleSchema = z.enum([
  'ranged_support', // Mid-range, buffs allies, cover fire
  'melee_explosives', // Close combat with area damage
  'assassin', // High damage single target, stealth
  'healer', // Keeps party alive, buffs
  'dual_melee', // Fast melee, poison/debuffs
  'tank', // Absorbs damage, protects allies
]);
export type CombatRole = z.infer<typeof CombatRoleSchema>;

// ============================================================================
// COMPANION ABILITY
// ============================================================================

/**
 * Ability target types
 */
export const AbilityTargetSchema = z.enum([
  'self', // Affects the companion
  'ally', // Targets a friendly unit
  'enemy', // Targets a hostile unit
  'area_enemy', // Hits multiple enemies in area
  'area_ally', // Buffs allies in area
  'all_allies', // Affects all friendly units
  'all_enemies', // Affects all enemies
  'ground', // Targets a hex position
]);
export type AbilityTarget = z.infer<typeof AbilityTargetSchema>;

/**
 * Ability effect types
 */
export const AbilityEffectTypeSchema = z.enum([
  'damage', // Deal damage
  'heal', // Restore health
  'buff', // Apply positive status
  'debuff', // Apply negative status
  'stun', // Prevent action
  'knockback', // Push target
  'pull', // Pull target closer
  'shield', // Absorb damage
  'taunt', // Force enemies to target companion
  'stealth', // Become hidden
  'mark', // Mark target for bonus damage
  'execute', // Bonus damage to low health targets
  'non_lethal', // Subdue without killing
  'summon', // Create temporary ally
]);
export type AbilityEffectType = z.infer<typeof AbilityEffectTypeSchema>;

/**
 * Individual effect within an ability
 */
export const AbilityEffectSchema = z.object({
  type: AbilityEffectTypeSchema,
  /** Base value (damage, heal amount, etc.) */
  value: z.number().int().min(0).default(0),
  /** Duration in turns (0 = instant) */
  duration: z.number().int().min(0).default(0),
  /** Chance to apply (0-100, for debuffs/secondary effects) */
  chance: z.number().min(0).max(100).default(100),
  /** Status effect ID to apply */
  statusId: z.string().optional(),
  /** Scaling with companion level (value * (1 + level * scaling)) */
  levelScaling: z.number().min(0).max(1).default(0.1),
});
export type AbilityEffect = z.infer<typeof AbilityEffectSchema>;

/**
 * Companion ability definition
 */
export const CompanionAbilitySchema = z.object({
  /** Unique ID */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Description shown to player */
  description: z.string(),

  /** Target type */
  target: AbilityTargetSchema,

  /** Action point cost */
  apCost: z.number().int().min(0).max(10).default(2),

  /** Cooldown in turns (0 = no cooldown) */
  cooldown: z.number().int().min(0).default(0),

  /** Range in hexes (0 = melee) */
  range: z.number().int().min(0).max(10).default(1),

  /** Area of effect radius (0 = single target) */
  areaRadius: z.number().int().min(0).max(5).default(0),

  /** Effects applied when ability is used */
  effects: z.array(AbilityEffectSchema).min(1),

  /** Is this ability unlocked from the start? */
  unlockedByDefault: z.boolean().default(true),

  /** Personal quest ID that unlocks this ability (if not default) */
  unlockedByQuest: z.string().optional(),

  /** Minimum companion level required */
  levelRequired: z.number().int().min(1).max(10).default(1),

  /** Tags for categorization */
  tags: z.array(z.string()).default([]),

  /** Icon identifier */
  icon: z.string().optional(),

  /** Sound effect ID */
  soundId: z.string().optional(),
});
export type CompanionAbility = z.infer<typeof CompanionAbilitySchema>;

// ============================================================================
// COMPANION AI PREFERENCE
// ============================================================================

/**
 * AI behavior preferences for companions
 */
export const AIPrioritySchema = z.enum([
  'protect_player', // Stay near and defend player
  'aggressive', // Engage enemies first
  'supportive', // Focus on healing/buffing
  'cautious', // Avoid direct combat
  'balanced', // Adapt to situation
]);
export type AIPriority = z.infer<typeof AIPrioritySchema>;

export const CompanionAISchema = z.object({
  /** Primary behavior priority */
  priority: AIPrioritySchema.default('balanced'),

  /** Preferred distance from enemies (hexes) */
  preferredRange: z.number().int().min(0).max(10).default(2),

  /** Health threshold to retreat (0-100) */
  retreatThreshold: z.number().min(0).max(100).default(25),

  /** Will use consumables when low health */
  usesConsumables: z.boolean().default(true),

  /** Prefers non-lethal takedowns when available */
  prefersNonLethal: z.boolean().default(false),

  /** Will protect wounded allies */
  protectsWounded: z.boolean().default(true),

  /** Will break stealth to save ally */
  breaksStealthForAlly: z.boolean().default(true),

  /** Ability usage preferences (ability ID -> priority 1-10) */
  abilityPriorities: z.record(z.string(), z.number().int().min(1).max(10)).default({}),
});
export type CompanionAI = z.infer<typeof CompanionAISchema>;

// ============================================================================
// EQUIPMENT SLOTS
// ============================================================================

/**
 * Equipment slot configuration for companions
 */
export const CompanionEquipmentSchema = z.object({
  /** Primary weapon slot */
  weapon: z.string().nullable().default(null),

  /** Secondary weapon slot (for dual-wielders) */
  secondaryWeapon: z.string().nullable().default(null),

  /** Armor slot */
  armor: z.string().nullable().default(null),

  /** Accessory slot */
  accessory: z.string().nullable().default(null),

  /** Allowed weapon types (item tags) */
  allowedWeaponTypes: z.array(z.string()).default([]),

  /** Allowed armor types (item tags) */
  allowedArmorTypes: z.array(z.string()).default([]),
});
export type CompanionEquipment = z.infer<typeof CompanionEquipmentSchema>;

// ============================================================================
// APPROVAL SYSTEM
// ============================================================================

/**
 * Actions that affect companion approval
 */
export const ApprovalTriggerTypeSchema = z.enum([
  'quest_complete', // Completed a quest
  'quest_choice', // Made a choice during a quest
  'dialogue_choice', // Said something in dialogue
  'faction_action', // Action affecting a faction
  'combat_action', // Something during combat
  'world_action', // General world interaction
  'gift', // Gave item to companion
  'romance', // Romantic interaction
]);
export type ApprovalTriggerType = z.infer<typeof ApprovalTriggerTypeSchema>;

export const ApprovalTriggerSchema = z.object({
  /** Trigger type */
  type: ApprovalTriggerTypeSchema,

  /** Specific trigger ID (quest ID, dialogue ID, etc.) */
  triggerId: z.string(),

  /** Approval change (-100 to 100) */
  change: z.number().int().min(-100).max(100),

  /** Description of why (for logging/debugging) */
  reason: z.string().optional(),
});
export type ApprovalTrigger = z.infer<typeof ApprovalTriggerSchema>;

// ============================================================================
// BANTER SYSTEM
// ============================================================================

/**
 * Banter trigger conditions
 */
export const BanterTriggerSchema = z.enum([
  'travel_start', // Beginning travel between locations
  'travel_during', // During travel
  'enter_location', // Entering a specific location type
  'combat_start', // Before combat
  'combat_end', // After combat
  'low_health', // Companion is wounded
  'player_low_health', // Player is wounded
  'specific_companion', // Another companion is present
  'time_of_day', // Morning, afternoon, evening, night
  'weather', // Specific weather condition
  'idle', // Nothing happening for a while
  'quest_active', // A specific quest is active
  'reputation_milestone', // Player reached reputation threshold
]);
export type BanterTrigger = z.infer<typeof BanterTriggerSchema>;

export const BanterLineSchema = z.object({
  /** Unique ID */
  id: z.string(),

  /** The dialogue line */
  text: z.string(),

  /** Trigger condition */
  trigger: BanterTriggerSchema,

  /** Additional trigger data (location type, companion ID, etc.) */
  triggerData: z.string().optional(),

  /** Required approval level (-100 to 100) */
  minApproval: z.number().int().min(-100).max(100).optional(),

  /** Maximum approval level */
  maxApproval: z.number().int().min(-100).max(100).optional(),

  /** Required flag to be set */
  requiresFlag: z.string().optional(),

  /** Required quest state */
  requiresQuest: z
    .object({
      questId: z.string(),
      state: z.enum(['active', 'complete', 'not_started']),
    })
    .optional(),

  /** Can only be said once (default: false if not specified) */
  oneTime: z.boolean().optional(),

  /** Priority (higher = more likely to be chosen) (default: 5 if not specified) */
  priority: z.number().int().min(1).max(10).optional(),
});
export type BanterLine = z.infer<typeof BanterLineSchema>;

// ============================================================================
// PERSONAL QUEST
// ============================================================================

/**
 * Personal quest stage
 */
export const PersonalQuestStageSchema = z.object({
  /** Stage ID */
  id: z.string(),

  /** Stage title */
  title: z.string(),

  /** Description */
  description: z.string(),

  /** Objectives (references to objective IDs from quest system) */
  objectiveIds: z.array(z.string()).min(1),

  /** Dialogue tree ID for this stage */
  dialogueId: z.string().optional(),

  /** Rewards for completing this stage */
  rewards: z
    .object({
      approval: z.number().int().min(0).max(50).optional(),
      unlocksAbility: z.string().optional(),
      unlocksRomance: z.boolean().optional(),
    })
    .optional(),
});
export type PersonalQuestStage = z.infer<typeof PersonalQuestStageSchema>;

/**
 * Personal quest definition
 */
export const PersonalQuestSchema = z.object({
  /** Unique ID */
  id: z.string(),

  /** Display title */
  title: z.string(),

  /** Brief description */
  description: z.string(),

  /** Detailed backstory/motivation */
  motivation: z.string(),

  /** Required approval to start */
  requiredApproval: z.number().int().min(-100).max(100).default(25),

  /** Stages of the personal quest */
  stages: z.array(PersonalQuestStageSchema).min(1),

  /** Final rewards on completion */
  finalRewards: z
    .object({
      approval: z.number().int().min(0).max(100).optional(),
      unlocksAbility: z.string().optional(),
      unlocksRomanceEnding: z.boolean().optional(),
      uniqueItem: z.string().optional(),
    })
    .optional(),

  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type PersonalQuest = z.infer<typeof PersonalQuestSchema>;

// ============================================================================
// ROMANCE SYSTEM
// ============================================================================

/**
 * Romance stage progression
 */
export const RomanceStageSchema = z.enum([
  'unavailable', // Cannot be romanced
  'locked', // Requirements not met
  'acquaintance', // Just met
  'friend', // Built rapport
  'close_friend', // Personal quest started
  'interested', // Romantic interest shown
  'courting', // Active romance
  'committed', // In relationship
]);
export type RomanceStage = z.infer<typeof RomanceStageSchema>;

export const RomanceOptionsSchema = z.object({
  /** Is this companion romanceable? */
  available: z.boolean().default(false),

  /** Required approval to unlock romance */
  approvalRequired: z.number().int().min(0).max(100).default(50),

  /** Must complete personal quest first? */
  requiresPersonalQuest: z.boolean().default(true),

  /** Incompatible companion IDs (can't romance both) */
  incompatibleWith: z.array(z.string()).default([]),

  /** Special dialogue tree for romance */
  romanceDialogueId: z.string().optional(),

  /** Unique gift item ID that boosts romance */
  favoriteGiftId: z.string().optional(),
});
export type RomanceOptions = z.infer<typeof RomanceOptionsSchema>;

// ============================================================================
// RECRUITMENT REQUIREMENTS
// ============================================================================

/**
 * Requirements to recruit a companion
 */
export const RecruitmentRequirementsSchema = z.object({
  /** Required quest to complete */
  questId: z.string().optional(),

  /** Required faction reputation (faction ID -> min rep) */
  factionReputation: z.record(z.string(), z.number().int()).default({}),

  /** Minimum player level */
  minLevel: z.number().int().min(1).optional(),

  /** Required gold (for hired companions) */
  goldCost: z.number().int().min(0).default(0),

  /** Required item */
  requiredItem: z.string().optional(),

  /** Required flag to be set */
  requiredFlag: z.string().optional(),

  /** Incompatible companions (can't recruit if these are in party) */
  incompatibleCompanions: z.array(z.string()).default([]),

  /** Description of how to recruit (for journal/hints) */
  recruitmentHint: z.string(),
});
export type RecruitmentRequirements = z.infer<typeof RecruitmentRequirementsSchema>;

// ============================================================================
// COMPANION DEFINITION
// ============================================================================

/**
 * Complete companion definition
 */
export const CompanionDefinitionSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Full name */
  name: z.string(),

  /** Nickname/alias (e.g., "Black Belle", "Copperhead Viper") */
  nickname: z.string().optional(),

  /** Short title (e.g., "Deputy", "Sister", "Professor") */
  title: z.string().optional(),

  /** Physical description */
  description: z.string(),

  /** Detailed backstory */
  backstory: z.string(),

  /** Portrait image ID */
  portraitId: z.string(),

  /** Recruitment path/faction */
  path: CompanionPathSchema,

  /** Combat role */
  combatRole: CombatRoleSchema,

  /** Initial location ID */
  locationId: z.string(),

  /** Spawn position in location */
  spawnCoord: HexCoordSchema.optional(),

  /** Base stats */
  stats: z.object({
    maxHealth: z.number().int().min(1).default(100),
    actionPoints: z.number().int().min(1).max(10).default(4),
    baseDamage: z.number().int().min(0).default(10),
    armor: z.number().int().min(0).default(0),
    accuracy: z.number().int().min(0).max(100).default(70),
    evasion: z.number().int().min(0).max(100).default(10),
  }),

  /** Available abilities */
  abilities: z.array(CompanionAbilitySchema).min(1),

  /** AI behavior configuration */
  ai: CompanionAISchema,

  /** Equipment configuration */
  equipment: CompanionEquipmentSchema,

  /** Starting equipment item IDs */
  startingEquipment: z
    .object({
      weapon: z.string().optional(),
      secondaryWeapon: z.string().optional(),
      armor: z.string().optional(),
      accessory: z.string().optional(),
    })
    .default({}),

  /** Approval triggers (what they like/dislike) */
  approvalTriggers: z.array(ApprovalTriggerSchema).default([]),

  /** Banter lines */
  banter: z.array(BanterLineSchema).default([]),

  /** Personal quest */
  personalQuest: PersonalQuestSchema,

  /** Romance options */
  romance: RomanceOptionsSchema,

  /** Recruitment requirements */
  recruitment: RecruitmentRequirementsSchema,

  /** Primary dialogue tree ID (for conversations) */
  dialogueTreeId: z.string(),

  /** Is this companion essential (can't die permanently)? */
  essential: z.boolean().default(true),

  /** Voice/personality tags for dialogue generation */
  voiceTags: z.array(z.string()).default([]),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type CompanionDefinition = z.infer<typeof CompanionDefinitionSchema>;

// ============================================================================
// COMPANION STATE (Runtime)
// ============================================================================

/**
 * Runtime state for an active companion
 */
export const CompanionStateSchema = z.object({
  /** Reference to companion definition */
  companionId: z.string(),

  /** Is currently in player's party */
  inParty: z.boolean().default(false),

  /** Has been recruited */
  recruited: z.boolean().default(false),

  /** Is alive */
  alive: z.boolean().default(true),

  /** Current level */
  level: z.number().int().min(1).max(10).default(1),

  /** Current experience */
  experience: z.number().int().min(0).default(0),

  /** Current health */
  health: z.number().int().min(0),

  /** Approval rating (-100 to 100) */
  approval: z.number().int().min(-100).max(100).default(0),

  /** Currently equipped items */
  equipment: z.object({
    weapon: z.string().nullable(),
    secondaryWeapon: z.string().nullable(),
    armor: z.string().nullable(),
    accessory: z.string().nullable(),
  }),

  /** Unlocked abilities */
  unlockedAbilities: z.array(z.string()),

  /** Ability cooldowns (ability ID -> turns remaining) */
  abilityCooldowns: z.record(z.string(), z.number().int().min(0)).default({}),

  /** Personal quest progress */
  personalQuestState: z.object({
    started: z.boolean().default(false),
    currentStageIndex: z.number().int().min(0).default(0),
    completed: z.boolean().default(false),
  }),

  /** Romance progression */
  romanceStage: RomanceStageSchema.default('locked'),

  /** Flags set for this companion */
  flags: z.record(z.string(), z.boolean()).default({}),

  /** Banter lines already used (for one-time lines) */
  usedBanterIds: z.array(z.string()).default([]),

  /** When recruited (timestamp) */
  recruitedAt: z.number().nullable().default(null),

  /** Total time in party (game hours) */
  totalTimeInParty: z.number().int().min(0).default(0),

  /** Combat stats tracking */
  combatStats: z.object({
    enemiesDefeated: z.number().int().min(0).default(0),
    damageDealt: z.number().int().min(0).default(0),
    healingDone: z.number().int().min(0).default(0),
    timesKnockedOut: z.number().int().min(0).default(0),
  }),
});
export type CompanionState = z.infer<typeof CompanionStateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateCompanionDefinition(data: unknown): CompanionDefinition {
  return CompanionDefinitionSchema.parse(data);
}

export function validateCompanionState(data: unknown): CompanionState {
  return CompanionStateSchema.parse(data);
}

export function validateCompanionAbility(data: unknown): CompanionAbility {
  return CompanionAbilitySchema.parse(data);
}

export function validatePersonalQuest(data: unknown): PersonalQuest {
  return PersonalQuestSchema.parse(data);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a companion can be recruited based on current game state
 */
export function canRecruit(
  companion: CompanionDefinition,
  gameState: {
    completedQuests: string[];
    factionReputation: Record<string, number>;
    playerLevel: number;
    playerGold: number;
    playerItems: string[];
    flags: Record<string, boolean>;
    currentCompanions: string[];
  }
): { canRecruit: boolean; reason?: string } {
  const req = companion.recruitment;

  // Check quest requirement
  if (req.questId && !gameState.completedQuests.includes(req.questId)) {
    return { canRecruit: false, reason: `Must complete quest: ${req.questId}` };
  }

  // Check faction reputation
  for (const [factionId, minRep] of Object.entries(req.factionReputation)) {
    const currentRep = gameState.factionReputation[factionId] ?? 0;
    if (currentRep < minRep) {
      return { canRecruit: false, reason: `Insufficient reputation with ${factionId}` };
    }
  }

  // Check level
  if (req.minLevel && gameState.playerLevel < req.minLevel) {
    return { canRecruit: false, reason: `Requires level ${req.minLevel}` };
  }

  // Check gold
  if (req.goldCost > 0 && gameState.playerGold < req.goldCost) {
    return { canRecruit: false, reason: `Requires ${req.goldCost} gold` };
  }

  // Check required item
  if (req.requiredItem && !gameState.playerItems.includes(req.requiredItem)) {
    return { canRecruit: false, reason: `Requires item: ${req.requiredItem}` };
  }

  // Check required flag
  if (req.requiredFlag && !gameState.flags[req.requiredFlag]) {
    return { canRecruit: false, reason: 'Requirements not met' };
  }

  // Check incompatible companions
  for (const incompatible of req.incompatibleCompanions) {
    if (gameState.currentCompanions.includes(incompatible)) {
      return { canRecruit: false, reason: `Incompatible with ${incompatible}` };
    }
  }

  return { canRecruit: true };
}

/**
 * Get the approval level description
 */
export function getApprovalLevel(approval: number): string {
  if (approval >= 75) return 'Devoted';
  if (approval >= 50) return 'Loyal';
  if (approval >= 25) return 'Friendly';
  if (approval >= 0) return 'Neutral';
  if (approval >= -25) return 'Wary';
  if (approval >= -50) return 'Distrustful';
  if (approval >= -75) return 'Hostile';
  return 'Betrayed';
}

/**
 * Calculate experience needed for next level
 */
export function getExperienceForLevel(level: number): number {
  // Exponential curve: 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4100
  return Math.floor(100 * Math.pow(level, 1.5) + 50 * level);
}

/**
 * Create initial companion state from definition
 */
export function createCompanionState(companion: CompanionDefinition): CompanionState {
  // Get default unlocked abilities
  const unlockedAbilities = companion.abilities
    .filter((a) => a.unlockedByDefault && a.levelRequired <= 1)
    .map((a) => a.id);

  return {
    companionId: companion.id,
    inParty: false,
    recruited: false,
    alive: true,
    level: 1,
    experience: 0,
    health: companion.stats.maxHealth,
    approval: 0,
    equipment: {
      weapon: companion.startingEquipment.weapon ?? null,
      secondaryWeapon: companion.startingEquipment.secondaryWeapon ?? null,
      armor: companion.startingEquipment.armor ?? null,
      accessory: companion.startingEquipment.accessory ?? null,
    },
    unlockedAbilities,
    abilityCooldowns: {},
    personalQuestState: {
      started: false,
      currentStageIndex: 0,
      completed: false,
    },
    romanceStage: companion.romance.available ? 'locked' : 'unavailable',
    flags: {},
    usedBanterIds: [],
    recruitedAt: null,
    totalTimeInParty: 0,
    combatStats: {
      enemiesDefeated: 0,
      damageDealt: 0,
      healingDone: 0,
      timesKnockedOut: 0,
    },
  };
}

/**
 * Get available banter lines for current context
 */
export function getAvailableBanter(
  companion: CompanionDefinition,
  state: CompanionState,
  context: {
    trigger: BanterTrigger;
    triggerData?: string;
    activeQuests?: string[];
    completedQuests?: string[];
    flags?: Record<string, boolean>;
  }
): BanterLine[] {
  return companion.banter
    .filter((line) => {
      // Check trigger type
      if (line.trigger !== context.trigger) return false;

      // Check trigger data
      if (line.triggerData && line.triggerData !== context.triggerData) return false;

      // Check approval range
      if (line.minApproval !== undefined && state.approval < line.minApproval) return false;
      if (line.maxApproval !== undefined && state.approval > line.maxApproval) return false;

      // Check flag requirement
      if (line.requiresFlag && !context.flags?.[line.requiresFlag]) return false;

      // Check quest requirement
      if (line.requiresQuest) {
        const isActive = context.activeQuests?.includes(line.requiresQuest.questId) ?? false;
        const isComplete = context.completedQuests?.includes(line.requiresQuest.questId) ?? false;

        switch (line.requiresQuest.state) {
          case 'active':
            if (!isActive) return false;
            break;
          case 'complete':
            if (!isComplete) return false;
            break;
          case 'not_started':
            if (isActive || isComplete) return false;
            break;
        }
      }

      // Check one-time usage
      if (line.oneTime && state.usedBanterIds.includes(line.id)) return false;

      return true;
    })
    .sort((a, b) => (b.priority ?? 5) - (a.priority ?? 5));
}

export const COMPANION_SCHEMA_VERSION = '1.0.0';
