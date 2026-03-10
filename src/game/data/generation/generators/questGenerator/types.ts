/**
 * Quest Generator Types - Interfaces for generated quest data
 */

import type { GenerationContext, QuestArchetype } from '../../../schemas/generation';

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
 * Context for quest generation with available targets
 */
export interface QuestGenerationContext extends GenerationContext {
  availableNPCs: Array<{ id: string; name: string; role: string; tags: string[] }>;
  availableItems: Array<{ id: string; name: string; tags: string[] }>;
  availableLocations: Array<{ id: string; name: string; type: string; tags: string[] }>;
  availableEnemies: Array<{ id: string; name: string; tags: string[] }>;
}
