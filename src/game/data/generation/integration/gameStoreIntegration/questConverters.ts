/**
 * Quest Type Converters - Generated Quests to Game Format
 */

import type { Objective, Quest, QuestStage, QuestType } from '../../../schemas/quest';
import type {
  GeneratedObjective,
  GeneratedQuest,
  GeneratedQuestStage,
} from '../../generators';

/**
 * Convert generated objective to Quest objective format
 */
function convertGeneratedObjective(generated: GeneratedObjective): Objective {
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
