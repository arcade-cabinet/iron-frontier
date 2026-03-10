/**
 * Quest event wiring for the GameAudioBridge.
 *
 * @module services/audio/GameAudioBridge/wireQuestEvents
 */

import { questEvents } from '../../../systems/QuestEvents';
import type { SFXNodeCache } from './SFXNodeCache';

/**
 * Subscribe to quest-related events and trigger the appropriate SFX.
 * Returns an unsubscribe function.
 */
export function wireQuestEvents(sfxCache: SFXNodeCache): () => void {
  const onQuestStarted = () => {
    sfxCache.play('quest_start');
  };

  const onStageAdvanced = () => {
    sfxCache.play('stage_advance');
  };

  const onQuestCompleted = () => {
    sfxCache.play('quest_complete');
  };

  const onEnemyKilled = () => {
    sfxCache.play('enemy_death');
  };

  const onItemPickedUp = () => {
    sfxCache.play('item_pickup');
  };

  questEvents.on('questStarted', onQuestStarted);
  questEvents.on('stageAdvanced', onStageAdvanced);
  questEvents.on('questCompleted', onQuestCompleted);
  questEvents.on('enemyKilled', onEnemyKilled);
  questEvents.on('itemPickedUp', onItemPickedUp);

  return () => {
    questEvents.off('questStarted', onQuestStarted);
    questEvents.off('stageAdvanced', onStageAdvanced);
    questEvents.off('questCompleted', onQuestCompleted);
    questEvents.off('enemyKilled', onEnemyKilled);
    questEvents.off('itemPickedUp', onItemPickedUp);
  };
}
