/**
 * Game Store Integration - Bridge between procedural generation and game state
 *
 * Provides conversion functions and population methods to integrate
 * procedurally generated content with the game store.
 */

import { SeededRandom, hashString, combineSeeds } from '../seededRandom';
import {
  WorldGenerator,
  type GeneratedLocation,
  type GeneratedWorld,
  type WorldGenerationOptions,
} from '../generators/worldGenerator';
import {
  generateNPC,
  generateNPCsForLocation,
  generateRandomQuest,
  generateRandomEncounter,
  shouldTriggerEncounter,
  generateSimpleDialogueTree,
  type GeneratedNPC,
  type GeneratedQuest,
  type GeneratedQuestStage,
  type GeneratedObjective,
  type GeneratedDialogueTree,
  type GeneratedDialogueNode,
  type GeneratedDialogueChoice,
  type GeneratedEncounter,
  type QuestGenerationContext,
} from '../generators';
import type { GenerationContext } from '../../schemas/generation';

// Import game store types
import { useGameStore, type InventoryItem } from '../../../game/store/gameStore';
import type {
  NPC,
  NPCPersonality,
  CharacterAppearance,
  WorldPosition,
  WorldItem,
} from '../../../engine/types';
import type { NPCDefinition, NPCFaction, NPCRole } from '../../schemas/npc';
import type {
  DialogueTree,
  DialogueNode,
  DialogueChoice,
  DialogueEffect,
  DialogueCondition,
} from '../../schemas/npc';
import type {
  Quest,
  QuestStage,
  Objective,
  QuestType,
} from '../../schemas/quest';

// ============================================================================
// TYPE CONVERTERS - Generated Content to Game Format
// ============================================================================

/**
 * Convert generated NPC personality to engine format
 */
function convertPersonality(
  generated: GeneratedNPC['personality']
): NPCPersonality {
  return {
    aggression: generated.aggression,
    friendliness: generated.friendliness,
    curiosity: generated.curiosity,
    greed: generated.greed,
    honesty: generated.honesty,
  };
}

/**
 * Generate a default appearance for an NPC based on their role and personality
 */
function generateDefaultAppearance(
  rng: SeededRandom,
  npc: GeneratedNPC
): CharacterAppearance {
  const isMale = npc.gender === 'male';
  const isFemale = npc.gender === 'female';

  return {
    bodyType: rng.pick(['slim', 'average', 'stocky']),
    height: rng.float(1.6, 1.9),
    skinTone: rng.pick(['#e8c9a0', '#d4a574', '#c19a6b', '#a67b5b', '#8b6914']),

    faceShape: rng.int(0, 5),
    hasBeard: isMale && rng.bool(0.4),
    beardStyle: rng.pick(['stubble', 'full', 'mustache', 'goatee']),
    hasScar: rng.bool(npc.personality.aggression * 0.5),
    scarPosition: rng.pick(['cheek', 'eye', 'chin']),

    hatStyle: rng.pick(['cowboy', 'bowler', 'flat_cap', 'none']),
    hatColor: rng.pick(['#3a2a1a', '#5a4a3a', '#2a1a0a', '#4a3a2a']),
    shirtStyle: rng.pick(['work', 'fancy', 'vest']),
    shirtColor: rng.pick(['#8b7355', '#6b8e23', '#a0522d', '#daa520', '#cd853f']),
    pantsStyle: rng.pick(['jeans', 'chaps', 'slacks']),
    pantsColor: rng.pick(['#2f4f4f', '#3a3a3a', '#4a3728', '#363636']),
    bootsStyle: rng.pick(['work', 'fancy', 'spurs']),

    hasBandana: rng.bool(0.2),
    bandanaColor: rng.pick(['#8b0000', '#2f4f4f', '#daa520']),
    hasGunbelt: rng.bool(npc.personality.aggression * 0.8 + 0.2),
    hasPoncho: rng.bool(0.1),
    ponchoColor: rng.pick(['#8b4513', '#a0522d', '#d2691e']),
  };
}

/**
 * Convert generated NPC to game store's NPC type (engine NPC)
 */
export function convertGeneratedNPCToEngine(
  generated: GeneratedNPC,
  position: WorldPosition,
  rng: SeededRandom
): NPC {
  return {
    id: generated.id,
    name: generated.name,
    role: generated.role as NPC['role'],
    appearance: generateDefaultAppearance(rng, generated),
    personality: convertPersonality(generated.personality),
    position,
    rotation: rng.float(0, Math.PI * 2),
    homeStructureId: undefined,
    disposition: 50 + Math.round((generated.personality.friendliness - 0.5) * 50),
    isAlive: true,
    questGiver: generated.isQuestGiver,
    questIds: [],
  };
}

/**
 * Convert generated NPC to NPCDefinition format (data NPC)
 */
export function convertGeneratedNPC(
  generated: GeneratedNPC,
  locationId: string
): NPCDefinition {
  return {
    id: generated.id,
    name: generated.name,
    title: generated.nameDetails.nickname ?? undefined,
    role: generated.role as NPCRole,
    faction: (generated.faction as NPCFaction) ?? 'neutral',
    locationId,
    personality: {
      aggression: generated.personality.aggression,
      friendliness: generated.personality.friendliness,
      curiosity: generated.personality.curiosity,
      greed: generated.personality.greed,
      honesty: generated.personality.honesty,
      lawfulness: generated.personality.lawfulness,
    },
    description: generated.description,
    backstory: generated.backstory,
    questGiver: generated.isQuestGiver,
    questIds: [],
    dialogueTreeIds: [],
    tags: generated.tags,
    essential: false,
    relationships: [],
  };
}

/**
 * Convert generated objective to Quest objective format
 */
function convertGeneratedObjective(generated: GeneratedObjective): Objective {
  // Map generated objective type to quest schema type
  const typeMap: Record<string, Objective['type']> = {
    kill: 'kill',
    collect: 'collect',
    talk: 'talk',
    visit: 'visit',
    interact: 'interact',
    deliver: 'deliver',
    fetch: 'collect',
    escort: 'visit',
    investigate: 'interact',
  };

  return {
    id: generated.id,
    description: generated.description,
    type: typeMap[generated.type] ?? 'interact',
    target: generated.targetId ?? generated.targetName ?? 'unknown',
    count: generated.count,
    current: generated.currentCount,
    optional: generated.optional,
    hidden: false,
    hint: generated.hint,
  };
}

/**
 * Convert generated quest stage to Quest stage format
 */
function convertGeneratedStage(generated: GeneratedQuestStage): QuestStage {
  return {
    id: generated.id,
    title: generated.title,
    description: generated.description,
    objectives: generated.objectives.map(convertGeneratedObjective),
    onStartText: generated.onStartText,
    onCompleteText: generated.onCompleteText,
    stageRewards: {
      xp: 0,
      gold: 0,
      items: [],
      reputation: {},
    },
  };
}

/**
 * Convert generated quest to Quest format
 */
export function convertGeneratedQuest(generated: GeneratedQuest): Quest {
  // Map archetype to quest type
  const typeMap: Record<string, QuestType> = {
    bounty_hunt: 'bounty',
    clear_area: 'side',
    escort: 'side',
    ambush: 'side',
    fetch_item: 'delivery',
    steal_item: 'side',
    recover_lost: 'side',
    gather_materials: 'side',
    deliver_message: 'delivery',
    deliver_package: 'delivery',
    smuggle: 'side',
    find_person: 'side',
    investigate: 'exploration',
    spy: 'side',
    convince_npc: 'side',
    intimidate: 'side',
    mediate: 'side',
    explore_location: 'exploration',
    map_area: 'exploration',
    find_route: 'exploration',
    debt_collection: 'side',
    investment: 'faction',
    trade_route: 'faction',
  };

  return {
    id: generated.id,
    title: generated.title,
    description: generated.description,
    type: typeMap[generated.archetype] ?? 'side',
    giverNpcId: generated.giverId ?? null,
    startLocationId: generated.locationIds[0],
    recommendedLevel: generated.level,
    stages: generated.stages.map(convertGeneratedStage),
    prerequisites: {
      completedQuests: [],
      factionReputation: {},
      requiredItems: [],
    },
    rewards: {
      xp: generated.rewards.xp,
      gold: generated.rewards.gold,
      items: generated.rewards.items.map((itemId) => ({
        itemId,
        quantity: 1,
      })),
      reputation: generated.rewards.reputationChanges,
      unlocksQuests: [],
    },
    tags: generated.tags,
    repeatable: generated.repeatable,
    timeLimitHours: null,
  };
}

/**
 * Convert generated dialogue choice to DialogueChoice format
 */
function convertGeneratedDialogueChoice(
  generated: GeneratedDialogueChoice
): DialogueChoice {
  const effects: DialogueEffect[] = [];

  // Convert reputation effects
  if (generated.effects?.reputation) {
    for (const [faction, value] of Object.entries(generated.effects.reputation)) {
      effects.push({
        type: 'change_reputation',
        target: faction,
        value,
      });
    }
  }

  // Convert flag effects
  if (generated.effects?.flags) {
    for (const flag of generated.effects.flags) {
      effects.push({
        type: 'set_flag',
        target: flag,
      });
    }
  }

  return {
    text: generated.text,
    nextNodeId: generated.nextNodeId,
    conditions: [],
    effects,
    tags: generated.tags,
  };
}

/**
 * Convert generated dialogue node to DialogueNode format
 */
function convertGeneratedDialogueNode(
  generated: GeneratedDialogueNode
): DialogueNode {
  return {
    id: generated.id,
    text: generated.speakerText,
    speaker: generated.speakerName,
    choices: generated.choices.map(convertGeneratedDialogueChoice),
    nextNodeId: null,
    choiceDelay: 0,
    onEnterEffects: [],
    tags: generated.tags,
  };
}

/**
 * Convert generated dialogue tree to DialogueTree format
 */
export function convertGeneratedDialogue(
  generated: GeneratedDialogueTree
): DialogueTree {
  const nodes: DialogueNode[] = [];

  // Use Array.from to iterate over Map values for compatibility
  for (const node of Array.from(generated.nodes.values())) {
    nodes.push(convertGeneratedDialogueNode(node));
  }

  return {
    id: generated.id,
    name: `Dialogue with ${generated.npcName}`,
    description: `Generated dialogue for ${generated.npcId}`,
    nodes,
    entryPoints: [
      {
        nodeId: generated.rootNodeId,
        conditions: [],
        priority: 0,
      },
    ],
    tags: generated.tags,
  };
}

// ============================================================================
// GAME STORE POPULATION
// ============================================================================

/**
 * Populate a location with generated NPCs
 */
export function populateLocationWithNPCs(
  locationId: string,
  npcs: GeneratedNPC[],
  centerPosition: WorldPosition = { x: 128, y: 0, z: 128 }
): void {
  const store = useGameStore.getState();
  const rng = new SeededRandom(hashString(locationId));

  const updatedNPCs: Record<string, NPC> = { ...store.npcs };

  for (let i = 0; i < npcs.length; i++) {
    const generated = npcs[i];

    // Spread NPCs around the center
    const angle = (i / npcs.length) * Math.PI * 2;
    const radius = 5 + rng.float(0, 15);
    const position: WorldPosition = {
      x: centerPosition.x + Math.cos(angle) * radius,
      y: centerPosition.y,
      z: centerPosition.z + Math.sin(angle) * radius,
    };

    const engineNPC = convertGeneratedNPCToEngine(generated, position, rng);
    updatedNPCs[engineNPC.id] = engineNPC;
  }

  useGameStore.setState({ npcs: updatedNPCs });
}

/**
 * Populate a location with generated quests
 * Note: Quests are registered but not started automatically
 */
export function populateLocationWithQuests(
  locationId: string,
  quests: GeneratedQuest[]
): Quest[] {
  // Convert quests to game format
  // Note: The game store uses getQuestById from a static registry,
  // so we return the converted quests for the caller to manage
  return quests.map(convertGeneratedQuest);
}

/**
 * Populate a location with world items
 */
export function populateLocationWithItems(
  locationId: string,
  items: Array<{
    itemId: string;
    quantity: number;
    position?: WorldPosition;
  }>,
  centerPosition: WorldPosition = { x: 128, y: 0, z: 128 }
): void {
  const store = useGameStore.getState();
  const rng = new SeededRandom(hashString(locationId + '_items'));

  const updatedItems: Record<string, WorldItem> = { ...store.worldItems };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Generate position if not provided
    const position = item.position ?? {
      x: centerPosition.x + rng.float(-20, 20),
      y: centerPosition.y,
      z: centerPosition.z + rng.float(-20, 20),
    };

    const worldItem: WorldItem = {
      id: `world_item_${locationId}_${i}_${Date.now()}`,
      itemId: item.itemId,
      position,
      quantity: item.quantity,
    };

    updatedItems[worldItem.id] = worldItem;
  }

  useGameStore.setState({ worldItems: updatedItems });
}

// ============================================================================
// GENERATION TRIGGERS
// ============================================================================

/**
 * Build generation context from current game state
 */
export function buildGenerationContext(
  overrides: Partial<GenerationContext> = {}
): GenerationContext {
  const store = useGameStore.getState();

  return {
    worldSeed: store.worldSeed,
    regionId: store.currentWorldId ?? undefined,
    locationId: store.currentLocationId ?? undefined,
    playerLevel: store.playerStats.level,
    gameHour: store.time.hour,
    factionTensions: {},
    activeEvents: [],
    contextTags: [],
    ...overrides,
  };
}

/**
 * Build quest generation context with available targets
 */
export function buildQuestGenerationContext(
  baseContext: GenerationContext,
  npcs: GeneratedNPC[] = []
): QuestGenerationContext {
  return {
    ...baseContext,
    availableNPCs: npcs.map((n) => ({
      id: n.id,
      name: n.name,
      role: n.role,
      tags: n.tags,
    })),
    availableItems: [],
    availableLocations: [],
    availableEnemies: [],
  };
}

/**
 * Generate and populate a complete location
 */
export async function generateAndPopulateLocation(
  rng: SeededRandom,
  locationId: string,
  context: GenerationContext,
  options: {
    locationType?: string;
    npcCounts?: { background: number; notable: number };
    generateQuests?: boolean;
    centerPosition?: WorldPosition;
  } = {}
): Promise<{
  npcs: GeneratedNPC[];
  quests: Quest[];
}> {
  const locationType = options.locationType ?? 'frontier_town';
  const npcCounts = options.npcCounts ?? { background: 3, notable: 2 };
  const centerPosition = options.centerPosition ?? { x: 128, y: 0, z: 128 };

  // Generate NPCs
  const npcs = generateNPCsForLocation(rng, locationType, context, npcCounts);

  // Populate game store with NPCs
  populateLocationWithNPCs(locationId, npcs, centerPosition);

  // Generate quests from quest-giving NPCs
  const quests: Quest[] = [];
  if (options.generateQuests !== false) {
    const questContext = buildQuestGenerationContext(context, npcs);
    const questGivers = npcs.filter((npc) => npc.isQuestGiver);

    for (const giver of questGivers) {
      const generatedQuest = generateRandomQuest(rng, questContext, {
        id: giver.id,
        name: giver.name,
        role: giver.role,
        faction: giver.faction,
      });

      if (generatedQuest) {
        quests.push(convertGeneratedQuest(generatedQuest));
      }
    }
  }

  return { npcs, quests };
}

/**
 * Generate a quest from a specific NPC
 */
export function generateQuestForGiver(
  rng: SeededRandom,
  giverId: string,
  giverName: string,
  giverRole: string,
  giverFaction: string,
  context: GenerationContext
): Quest | null {
  const questContext = buildQuestGenerationContext(context);

  const generatedQuest = generateRandomQuest(rng, questContext, {
    id: giverId,
    name: giverName,
    role: giverRole,
    faction: giverFaction,
  });

  if (!generatedQuest) {
    return null;
  }

  return convertGeneratedQuest(generatedQuest);
}

/**
 * Check and trigger a random encounter
 */
export function generateRandomEncounterCheck(
  rng: SeededRandom,
  context: GenerationContext,
  options: {
    biome?: string;
    locationType?: string;
    minDifficulty?: number;
    maxDifficulty?: number;
    baseChance?: number;
  } = {}
): GeneratedEncounter | null {
  // Check if encounter should trigger
  if (!shouldTriggerEncounter(rng, context, options.baseChance)) {
    return null;
  }

  // Generate the encounter using generateRandomEncounter
  const encounter = generateRandomEncounter(rng, context, options);

  return encounter;
}

// ============================================================================
// WORLD INITIALIZATION
// ============================================================================

/**
 * Procedural world state tracker
 */
export interface ProceduralWorldState {
  worldSeed: number;
  worldName: string;
  generatedLocations: Map<string, GeneratedLocation>;
  generatedQuests: Map<string, Quest>;
  initialized: boolean;
}

// Global procedural world state (separate from game store)
let proceduralWorldState: ProceduralWorldState | null = null;

/**
 * Get current procedural world state
 */
export function getProceduralWorldState(): ProceduralWorldState | null {
  return proceduralWorldState;
}

/**
 * Initialize a procedural world
 */
export async function initializeProceduralWorld(
  worldSeed: number,
  options: {
    worldName?: string;
    regionCount?: number;
    locationsPerRegion?: [number, number];
    namePools?: Parameters<typeof WorldGenerator.prototype.initialize>[0];
    placeNamePools?: Parameters<typeof WorldGenerator.prototype.initialize>[1];
    npcTemplates?: Parameters<typeof WorldGenerator.prototype.initialize>[2];
    questTemplates?: Parameters<typeof WorldGenerator.prototype.initialize>[3];
  } = {}
): Promise<ProceduralWorldState> {
  const worldName = options.worldName ?? 'Iron Frontier';

  // Create world generator
  const generator = new WorldGenerator({
    seed: worldSeed,
    worldName,
    regionCount: options.regionCount ?? 1,
    locationsPerRegion: options.locationsPerRegion ?? [3, 5],
  });

  // Initialize with templates if provided
  if (
    options.namePools &&
    options.placeNamePools &&
    options.npcTemplates &&
    options.questTemplates
  ) {
    await generator.initialize(
      options.namePools,
      options.placeNamePools,
      options.npcTemplates,
      options.questTemplates
    );
  }

  // Create state tracker
  proceduralWorldState = {
    worldSeed,
    worldName,
    generatedLocations: new Map(),
    generatedQuests: new Map(),
    initialized: generator.isInitialized(),
  };

  // Update game store with world seed
  useGameStore.setState({ worldSeed });

  return proceduralWorldState;
}

/**
 * Regenerate a specific location
 */
export async function regenerateLocation(
  locationId: string,
  options: {
    locationType?: string;
    npcCounts?: { background: number; notable: number };
    clearExisting?: boolean;
  } = {}
): Promise<{
  npcs: GeneratedNPC[];
  quests: Quest[];
}> {
  const store = useGameStore.getState();

  // Create RNG from location and world seed
  const locationSeed = combineSeeds(store.worldSeed, hashString(locationId));
  const rng = new SeededRandom(locationSeed);

  // Clear existing NPCs at this location if requested
  if (options.clearExisting) {
    const updatedNPCs = { ...store.npcs };
    // Remove NPCs that were generated for this location
    for (const [id, npc] of Object.entries(updatedNPCs)) {
      if (id.includes(locationId)) {
        delete updatedNPCs[id];
      }
    }
    useGameStore.setState({ npcs: updatedNPCs });
  }

  // Build generation context
  const context = buildGenerationContext({
    locationId,
    worldSeed: store.worldSeed,
  });

  // Generate and populate
  return generateAndPopulateLocation(rng, locationId, context, options);
}

/**
 * Generate dialogue for an NPC dynamically
 */
export function generateNPCDialogue(
  npc: GeneratedNPC,
  context: GenerationContext,
  options: {
    includeRumors?: boolean;
    includeQuest?: boolean;
    includeShop?: boolean;
  } = {}
): DialogueTree {
  const rng = new SeededRandom(hashString(npc.id + '_dialogue'));

  const generatedTree = generateSimpleDialogueTree(rng, npc, context, {
    includeRumors: options.includeRumors ?? true,
    includeQuest: options.includeQuest ?? npc.isQuestGiver,
    includeShop: options.includeShop ?? npc.hasShop,
  });

  return convertGeneratedDialogue(generatedTree);
}
