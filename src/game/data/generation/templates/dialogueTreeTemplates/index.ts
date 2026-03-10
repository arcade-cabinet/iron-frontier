/**
 * Dialogue Tree Templates
 */

export { GENERAL_DIALOGUE_TREES } from './general.ts';
export { ROLE_SPECIFIC_DIALOGUE_TREES } from './role_specific.ts';
export { QUEST_DIALOGUE_TREES } from './quest.ts';
export { SPECIAL_DIALOGUE_TREES } from './special.ts';

export {
  buildDialogueTree,
  DIALOGUE_TREE_TEMPLATES,
  getDialogueTreesByTag,
  getDialogueTreesForFaction,
  getDialogueTreesForNPC,
  getDialogueTreesForRole,
  getDialogueTreeTemplate,
} from './helpers.ts';

export type { DialogueTreeTemplate } from '../../../schemas/generation.ts';
