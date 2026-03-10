/**
 * Quest Objectives - Target selection and objective generation logic
 */

import {
  type ObjectiveTemplate,
  substituteTemplate,
} from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import type { GeneratedObjective, QuestGenerationContext } from './types.ts';

/**
 * Select a target matching the criteria
 */
export function selectTarget(
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
    candidates = candidates.filter((c) => targetTags.some((tag) => c.tags.includes(tag)));
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
export function generateObjective(
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
      variables['target'] = target.name;
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
