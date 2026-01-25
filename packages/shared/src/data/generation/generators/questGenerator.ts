/**
 * Quest Generator - Procedural quest generation from templates
 *
 * Combines quest templates with context to create unique quests.
 */

import { SeededRandom } from '../seededRandom';
import {
  type QuestTemplate,
  type QuestArchetype,
  type GenerationContext,
  type ObjectiveTemplate,
  substituteTemplate,
} from '../../schemas/generation';

// Template registry
let QUEST_TEMPLATES: QuestTemplate[] = [];

/**
 * Initialize quest templates
 */
export function initQuestTemplates(templates: QuestTemplate[]): void {
  QUEST_TEMPLATES = templates;
}

/**
 * Generated objective data
 */
export interface GeneratedObjective {
  id: string;
  type: string;
  description: string;
  targetType: 'npc' | 'item' | 'location' | 'enemy' | 'any';
  targetId?: string;
  targetName?: string;
  count: number;
  currentCount: number;
  optional: boolean;
  hint?: string;
  completed: boolean;
}

/**
 * Generated quest stage
 */
export interface GeneratedQuestStage {
  id: string;
  title: string;
  description: string;
  objectives: GeneratedObjective[];
  onStartText?: string;
  onCompleteText?: string;
  completed: boolean;
}

/**
 * Generated quest data
 */
export interface GeneratedQuest {
  id: string;
  templateId: string;
  archetype: QuestArchetype;
  questType: string;
  title: string;
  description: string;
  stages: GeneratedQuestStage[];
  currentStageIndex: number;
  rewards: {
    xp: number;
    gold: number;
    items: string[];
    reputationChanges: Record<string, number>;
  };
  giverId?: string;
  giverName?: string;
  targetIds: string[];
  targetNames: Record<string, string>;
  locationIds: string[];
  level: number;
  tags: string[];
  repeatable: boolean;
  cooldownHours: number;
  completed: boolean;
  failed: boolean;
  seed: number;
}

/**
 * Get quest template by ID
 */
export function getQuestTemplate(id: string): QuestTemplate | undefined {
  return QUEST_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get quest templates by archetype
 */
export function getQuestTemplatesByArchetype(
  archetype: QuestArchetype
): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => t.archetype === archetype);
}

/**
 * Get quest templates valid for a level
 */
export function getQuestTemplatesForLevel(level: number): QuestTemplate[] {
  return QUEST_TEMPLATES.filter(
    (t) => level >= t.levelRange[0] && level <= t.levelRange[1]
  );
}

/**
 * Get quest templates a specific giver role can offer
 */
export function getQuestTemplatesForGiver(
  role: string,
  faction: string
): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => {
    const roleMatch =
      t.giverRoles.length === 0 || t.giverRoles.includes(role);
    const factionMatch =
      t.giverFactions.length === 0 || t.giverFactions.includes(faction);
    return roleMatch && factionMatch;
  });
}

/**
 * Context for quest generation with available targets
 */
export interface QuestGenerationContext extends GenerationContext {
  availableNPCs: Array<{ id: string; name: string; role: string; tags: string[] }>;
  availableItems: Array<{ id: string; name: string; tags: string[] }>;
  availableLocations: Array<{ id: string; name: string; type: string; tags: string[] }>;
  availableEnemies: Array<{ id: string; name: string; tags: string[] }>;
}

/**
 * Select a target matching the criteria
 */
function selectTarget(
  rng: SeededRandom,
  targetType: 'npc' | 'item' | 'location' | 'enemy' | 'any',
  targetTags: string[],
  context: QuestGenerationContext,
  excludeIds: Set<string>
): { id: string; name: string } | null {
  let candidates: Array<{ id: string; name: string; tags: string[] }> = [];

  switch (targetType) {
    case 'npc':
      candidates = context.availableNPCs;
      break;
    case 'item':
      candidates = context.availableItems;
      break;
    case 'location':
      candidates = context.availableLocations;
      break;
    case 'enemy':
      candidates = context.availableEnemies;
      break;
    case 'any':
      candidates = [
        ...context.availableNPCs,
        ...context.availableItems,
        ...context.availableLocations,
      ];
      break;
  }

  // Filter by tags if specified
  if (targetTags.length > 0) {
    candidates = candidates.filter((c) =>
      targetTags.some((tag) => c.tags.includes(tag))
    );
  }

  // Exclude already used
  candidates = candidates.filter((c) => !excludeIds.has(c.id));

  if (candidates.length === 0) {
    return null;
  }

  const selected = rng.pick(candidates);
  return { id: selected.id, name: selected.name };
}

/**
 * Generate an objective from a template
 */
function generateObjective(
  rng: SeededRandom,
  template: ObjectiveTemplate,
  context: QuestGenerationContext,
  variables: Record<string, string>,
  usedTargets: Set<string>,
  index: number
): GeneratedObjective {
  // Select target if needed
  let targetId: string | undefined;
  let targetName: string | undefined;

  if (template.targetType !== 'any' || template.targetTags.length > 0) {
    const target = selectTarget(
      rng,
      template.targetType,
      template.targetTags,
      context,
      usedTargets
    );
    if (target) {
      targetId = target.id;
      targetName = target.name;
      usedTargets.add(target.id);
      variables.target = target.name;
    }
  }

  // Generate count
  const count = rng.int(template.countRange[0], template.countRange[1]);

  // Generate description
  const description = substituteTemplate(template.descriptionTemplate, variables);

  // Generate hint
  const hint = template.hintTemplate
    ? substituteTemplate(template.hintTemplate, variables)
    : undefined;

  return {
    id: `obj_${index}_${rng.int(0, 0xffff).toString(16)}`,
    type: template.type,
    description,
    targetType: template.targetType,
    targetId,
    targetName,
    count,
    currentCount: 0,
    optional: template.optional,
    hint,
    completed: false,
  };
}

/**
 * Generate a quest from a template
 */
export function generateQuest(
  rng: SeededRandom,
  template: QuestTemplate,
  context: QuestGenerationContext,
  giver?: { id: string; name: string }
): GeneratedQuest {
  const questSeed = rng.int(0, 0xffffffff);
  const questRng = new SeededRandom(questSeed);

  // Track used targets to avoid duplicates
  const usedTargets = new Set<string>();
  const allTargetIds: string[] = [];
  const allTargetNames: Record<string, string> = {};
  const allLocationIds: string[] = [];

  // Build initial variables
  const variables: Record<string, string> = {
    giver: giver?.name ?? 'someone',
    giverId: giver?.id ?? '',
    location: context.locationId ?? 'the frontier',
    region: context.regionId ?? 'these parts',
    player: 'stranger', // Will be replaced at runtime
  };

  // Select a primary target for title/description
  const primaryTarget = selectTarget(
    questRng,
    'any',
    [],
    context,
    usedTargets
  );
  if (primaryTarget) {
    variables.target = primaryTarget.name;
    variables.targetId = primaryTarget.id;
    usedTargets.add(primaryTarget.id);
    allTargetIds.push(primaryTarget.id);
    allTargetNames[primaryTarget.id] = primaryTarget.name;
  }

  // Select a secondary location if available
  const secondaryLocation = selectTarget(
    questRng,
    'location',
    [],
    context,
    usedTargets
  );
  if (secondaryLocation) {
    variables.destination = secondaryLocation.name;
    variables.destinationId = secondaryLocation.id;
    usedTargets.add(secondaryLocation.id);
    allLocationIds.push(secondaryLocation.id);
  }

  // Generate title
  const titleTemplate = questRng.pick(template.titleTemplates);
  const title = substituteTemplate(titleTemplate, variables);

  // Generate description
  const descTemplate = questRng.pick(template.descriptionTemplates);
  const description = substituteTemplate(descTemplate, variables);

  // Generate stages
  const stages: GeneratedQuestStage[] = template.stages.map((stageTemplate, stageIndex) => {
    // Generate objectives for this stage
    const objectives = stageTemplate.objectives.map((objTemplate, objIndex) =>
      generateObjective(
        questRng,
        objTemplate,
        context,
        { ...variables },
        usedTargets,
        stageIndex * 100 + objIndex
      )
    );

    // Track target IDs from objectives
    for (const obj of objectives) {
      if (obj.targetId) {
        allTargetIds.push(obj.targetId);
        if (obj.targetName) {
          allTargetNames[obj.targetId] = obj.targetName;
        }
      }
    }

    return {
      id: `stage_${stageIndex}_${questRng.int(0, 0xffff).toString(16)}`,
      title: substituteTemplate(stageTemplate.titleTemplate, variables),
      description: substituteTemplate(stageTemplate.descriptionTemplate, variables),
      objectives,
      onStartText: stageTemplate.onStartTextTemplate
        ? substituteTemplate(stageTemplate.onStartTextTemplate, variables)
        : undefined,
      onCompleteText: stageTemplate.onCompleteTextTemplate
        ? substituteTemplate(stageTemplate.onCompleteTextTemplate, variables)
        : undefined,
      completed: false,
    };
  });

  // Generate rewards
  const level = questRng.int(template.levelRange[0], template.levelRange[1]);
  const levelMultiplier = 1 + (level - 1) * 0.2;

  const xp = Math.floor(
    questRng.int(template.rewards.xpRange[0], template.rewards.xpRange[1]) *
      levelMultiplier
  );
  const gold = Math.floor(
    questRng.int(template.rewards.goldRange[0], template.rewards.goldRange[1]) *
      levelMultiplier
  );

  // Generate item rewards
  const items: string[] = [];
  if (questRng.bool(template.rewards.itemChance)) {
    // Would select from item pool based on tags
    // For now, just note the tags
  }

  // Generate reputation changes
  const reputationChanges: Record<string, number> = {};
  for (const [faction, range] of Object.entries(template.rewards.reputationImpact)) {
    reputationChanges[faction] = questRng.int(range[0], range[1]);
  }

  // Generate unique ID
  const id = `quest_${template.id}_${questSeed.toString(16)}`;

  return {
    id,
    templateId: template.id,
    archetype: template.archetype,
    questType: template.questType,
    title,
    description,
    stages,
    currentStageIndex: 0,
    rewards: {
      xp,
      gold,
      items,
      reputationChanges,
    },
    giverId: giver?.id,
    giverName: giver?.name,
    targetIds: allTargetIds,
    targetNames: allTargetNames,
    locationIds: allLocationIds,
    level,
    tags: [...template.tags],
    repeatable: template.repeatable,
    cooldownHours: template.cooldownHours,
    completed: false,
    failed: false,
    seed: questSeed,
  };
}

/**
 * Generate a random quest appropriate for the context
 */
export function generateRandomQuest(
  rng: SeededRandom,
  context: QuestGenerationContext,
  giver?: { id: string; name: string; role: string; faction: string }
): GeneratedQuest | null {
  // Get valid templates
  let validTemplates = getQuestTemplatesForLevel(context.playerLevel);

  // Filter by giver if provided
  if (giver) {
    const giverTemplates = getQuestTemplatesForGiver(giver.role, giver.faction);
    validTemplates = validTemplates.filter((t) =>
      giverTemplates.some((gt) => gt.id === t.id)
    );
  }

  if (validTemplates.length === 0) {
    return null;
  }

  const template = rng.pick(validTemplates);
  return generateQuest(
    rng,
    template,
    context,
    giver ? { id: giver.id, name: giver.name } : undefined
  );
}
