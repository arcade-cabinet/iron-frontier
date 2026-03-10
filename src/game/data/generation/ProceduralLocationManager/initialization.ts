/**
 * ProceduralLocationManager - Initialization logic
 *
 * Handles template and pool initialization for the procedural generation system.
 */

import { ITEM_LIBRARY } from '../../items';
import { initDialogueData } from '../generators/dialogueGenerator';
import { initItemGeneration } from '../generators/itemGenerator';
import { initNamePools } from '../generators/nameGenerator';
import { initNPCTemplates } from '../generators/npcGenerator';
import { initQuestTemplates } from '../generators/questGenerator';
import { convertItemsToTemplates } from '../integration/itemIntegration';
import { DIALOGUE_SNIPPETS } from '../pools/dialogueSnippets';
import { NAME_POOLS, PLACE_NAME_POOLS } from '../pools/index';
import { DIALOGUE_TREE_TEMPLATES } from '../templates/dialogueTreeTemplates';
import { NPC_TEMPLATES, QUEST_TEMPLATES } from '../templates/index';

/**
 * Initialize all generator subsystems with templates and pools.
 */
export function initializeGenerators(): void {
  initNamePools(NAME_POOLS, PLACE_NAME_POOLS);
  initNPCTemplates(NPC_TEMPLATES);
  initQuestTemplates(QUEST_TEMPLATES);
  initDialogueData(DIALOGUE_SNIPPETS, Object.values(DIALOGUE_TREE_TEMPLATES));

  const itemTemplates = convertItemsToTemplates(Object.values(ITEM_LIBRARY));
  initItemGeneration(itemTemplates);
}
