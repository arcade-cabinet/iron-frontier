import type { StoreApi } from 'zustand';
import { QuestNotification } from '@/components/game/QuestNotification';
import { questEvents, type QuestEventMap } from '../systems/QuestEvents';
import type { GameState } from '../store/types';

export function wireQuestNotifications(
  store: StoreApi<GameState>,
): () => void {
  const onQuestStarted = (d: QuestEventMap['questStarted']) => {
    const def = store.getState().getQuestDefinition(d.questId);
    QuestNotification.show(
      'quest_started',
      def?.title ?? d.questId,
      def?.description,
    );
  };

  const onQuestCompleted = (d: QuestEventMap['questCompleted']) => {
    const def = store.getState().getQuestDefinition(d.questId);
    QuestNotification.show(
      'quest_completed',
      def?.title ?? d.questId,
    );
  };

  const onStageAdvanced = (d: QuestEventMap['stageAdvanced']) => {
    const def = store.getState().getQuestDefinition(d.questId);
    const stage = def?.stages[d.stageIndex];
    QuestNotification.show(
      'quest_updated',
      def?.title ?? d.questId,
      stage?.title,
    );
  };

  questEvents.on('questStarted', onQuestStarted);
  questEvents.on('questCompleted', onQuestCompleted);
  questEvents.on('stageAdvanced', onStageAdvanced);

  return () => {
    questEvents.off('questStarted', onQuestStarted);
    questEvents.off('questCompleted', onQuestCompleted);
    questEvents.off('stageAdvanced', onStageAdvanced);
  };
}
