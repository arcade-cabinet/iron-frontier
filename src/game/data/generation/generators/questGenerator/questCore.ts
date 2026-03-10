/**
 * Quest Core - Quest generation logic from templates
 */

import {
  type QuestTemplate,
  substituteTemplate,
} from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import {
  getQuestTemplatesForGiver,
  getQuestTemplatesForLevel,
} from './registry.ts';
import { generateObjective, selectTarget } from './objectives.ts';
import type {
  GeneratedQuest,
  GeneratedQuestStage,
  QuestGenerationContext,
} from './types.ts';

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
  const primaryTarget = selectTarget(questRng, 'any', [], context, usedTargets);
  if (primaryTarget) {
    variables['target'] = primaryTarget.name;
    variables['targetId'] = primaryTarget.id;
    usedTargets.add(primaryTarget.id);
    allTargetIds.push(primaryTarget.id);
    allTargetNames[primaryTarget.id] = primaryTarget.name;
  }

  // Select a secondary location if available
  const secondaryLocation = selectTarget(questRng, 'location', [], context, usedTargets);
  if (secondaryLocation) {
    variables['destination'] = secondaryLocation.name;
    variables['destinationId'] = secondaryLocation.id;
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
    questRng.int(template.rewards.xpRange[0], template.rewards.xpRange[1]) * levelMultiplier
  );
  const gold = Math.floor(
    questRng.int(template.rewards.goldRange[0], template.rewards.goldRange[1]) * levelMultiplier
  );

  // Generate item rewards
  const items: string[] = [];
  if (questRng.bool(template.rewards.itemChance)) {
    // Would select from item pool based on tags
  }

  // Generate reputation changes
  const reputationChanges: Record<string, number> = {};
  for (const [faction, range] of Object.entries(template.rewards.reputationImpact)) {
    reputationChanges[faction] = questRng.int(range[0], range[1]);
  }

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
    rewards: { xp, gold, items, reputationChanges },
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
  let validTemplates = getQuestTemplatesForLevel(context.playerLevel);

  if (giver) {
    const giverTemplates = getQuestTemplatesForGiver(giver.role, giver.faction);
    validTemplates = validTemplates.filter((t) => giverTemplates.some((gt) => gt.id === t.id));
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
