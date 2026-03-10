/**
 * Quick World Generation Function - Convenience wrapper for WorldGenerator
 */

import { initNamePools } from '../nameGenerator';
import { initNPCTemplates } from '../npcGenerator';
import { initQuestTemplates } from '../questGenerator';
import { WorldGenerator } from './WorldGeneratorClass.ts';
import type { GeneratedWorld, WorldGenerationOptions } from './types.ts';

/**
 * Quick world generation function
 */
export async function generateWorld(
  options: WorldGenerationOptions,
  pools: {
    namePools: Parameters<typeof initNamePools>[0];
    placeNamePools: Parameters<typeof initNamePools>[1];
    npcTemplates: Parameters<typeof initNPCTemplates>[0];
    questTemplates: Parameters<typeof initQuestTemplates>[0];
  }
): Promise<GeneratedWorld> {
  const generator = new WorldGenerator(options);
  await generator.initialize(
    pools.namePools,
    pools.placeNamePools,
    pools.npcTemplates,
    pools.questTemplates
  );
  return generator.generateWorld();
}
