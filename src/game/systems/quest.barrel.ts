/**
 * Quest & Dialogue Systems Barrel
 *
 * Re-exports quest and dialogue bridge systems:
 * QuestEvents, QuestWiring, QuestMarkerSystem, DialogueQuestBridge
 *
 * @module systems/quest
 */

// Quest Event System
export {
  QuestEventEmitter,
  questEvents,
  type QuestEventMap,
  type QuestEventName,
  type QuestEventHandler,
} from './QuestEvents';

// Quest Wiring (connects events to store)
export {
  initQuestSystem,
  teardownQuestSystem,
  type QuestSystemHandle,
} from './QuestWiring';

// Quest Marker System (3D spatial quest tracking)
export {
  getActiveQuestMarkers,
  checkProximityObjectives,
  type QuestMarker,
} from './QuestMarkerSystem';

// Dialogue <-> Quest Bridge
export {
  evaluateCondition,
  areChoiceConditionsMet,
  filterAvailableChoices,
  applyDialogueEffect,
  applyChoiceEffects,
  canStartQuest,
  getAvailableNpcQuests,
  onDialogueEnd,
  type BridgeStoreReader,
  type BridgeStoreActions,
  type BridgeStore,
} from './DialogueQuestBridge';
