/**
 * Dialogue Generator - Barrel export for procedural dialogue tree generation
 */

// Types and registry
export {
  type GeneratedDialogueChoice,
  type GeneratedDialogueNode,
  type GeneratedDialogueTree,
  initDialogueData,
  getSnippetsRegistry,
  getTreeTemplatesRegistry,
} from './types.ts';

// Snippet selection and accessors
export {
  getSnippetsByCategory,
  getSnippetsForNPC,
  getDialogueTreesForRole,
  getDialogueTreeTemplate,
  selectSnippet,
} from './snippets.ts';

// Template-based tree building
export { buildDialogueTree, buildDialogueVariables } from './builders.ts';

// Simple tree generation
export { generateSimpleDialogueTree } from './simpleTree.ts';
