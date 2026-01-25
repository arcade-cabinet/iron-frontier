/**
 * Game Store Integration - Export all integration functionality
 *
 * Provides the bridge between the procedural generation system
 * and the game store, allowing generated content to be used
 * in the running game.
 */

// Type converters
export {
  convertGeneratedNPCToEngine,
  convertGeneratedNPC,
  convertGeneratedQuest,
  convertGeneratedDialogue,
} from './gameStoreIntegration';

// Game store population
export {
  populateLocationWithNPCs,
  populateLocationWithQuests,
  populateLocationWithItems,
} from './gameStoreIntegration';

// Generation triggers
export {
  buildGenerationContext,
  buildQuestGenerationContext,
  generateAndPopulateLocation,
  generateQuestForGiver,
  generateRandomEncounterCheck,
} from './gameStoreIntegration';

// World initialization
export {
  initializeProceduralWorld,
  regenerateLocation,
  generateNPCDialogue,
  getProceduralWorldState,
  type ProceduralWorldState,
} from './gameStoreIntegration';
