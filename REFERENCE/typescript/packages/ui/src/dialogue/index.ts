/**
 * @iron-frontier/ui/dialogue
 *
 * Dialogue UI components for NPC conversations in Iron Frontier.
 *
 * This module provides a complete dialogue system with:
 * - NPC portraits with emotion states
 * - Typewriter text effect
 * - Branching dialogue choices
 * - Quest and item notifications
 *
 * Usage:
 *
 * ```tsx
 * import {
 *   DialogueProvider,
 *   DialogueBox,
 *   QuestNotification,
 *   ItemReceived,
 * } from '@iron-frontier/ui/dialogue';
 *
 * // Basic dialogue setup
 * <DialogueProvider>
 *   <DialogueBox
 *     state={dialogueState}
 *     onSelectChoice={handleChoice}
 *     onAdvance={handleAdvance}
 *     onClose={handleClose}
 *   />
 * </DialogueProvider>
 *
 * // Quest notification
 * <QuestNotification
 *   data={{ type: 'started', questName: 'The Missing Miners' }}
 *   visible={showNotification}
 *   onDismiss={() => setShowNotification(false)}
 * />
 *
 * // Item received
 * <ItemReceived
 *   data={{ itemId: 'gold_nugget', name: 'Gold Nugget', quantity: 3, rarity: 'rare' }}
 *   visible={showItem}
 *   onDismiss={() => setShowItem(false)}
 * />
 * ```
 */

// Types
export type {
  DialogueActions,
  DialogueBaseProps,
  DialogueChoiceData,
  DialogueUIState,
  ItemReceivedData,
  NPCEmotion,
  NPCPortraitData,
  QuestNotificationData,
  QuestNotificationType,
  TypewriterConfig,
} from './types';

// Context & Provider
export {
  createDialogueUIState,
  DialogueContext,
  DialogueProvider,
  useDialogue,
  useDialogueActions,
  useDialogueState,
  useIsDialogueActive,
  type DialogueProviderProps,
} from './DialogueProvider';

// Main dialogue components
export {
  contentContainerVariants,
  DialogueBox,
  dialogueBoxVariants,
  type DialogueBoxProps,
} from './DialogueBox';

export {
  DialogueText,
  textContainerVariants,
  textStyleVariants,
  type DialogueTextProps,
} from './DialogueText';

export {
  choiceButtonVariants,
  ChoiceList,
  choiceListVariants,
  choiceNumberVariants,
  type ChoiceListProps,
} from './ChoiceList';

export {
  nameLabelVariants,
  NPCPortrait,
  portraitFrameVariants,
  portraitImageVariants,
  breatheKeyframes,
  type NPCPortraitProps,
} from './NPCPortrait';

// Notification components
export {
  notificationContainerVariants,
  QuestNotification,
  shrinkKeyframes,
  type QuestNotificationProps,
} from './QuestNotification';

export {
  iconContainerVariants,
  itemContainerVariants,
  ItemReceived,
  rarityTextVariants,
  useItemNotificationQueue,
  type ItemReceivedProps,
} from './ItemReceived';

// Typewriter utilities
export {
  parseDialogueText,
  useTypewriter,
  type TextSegment,
  type UseTypewriterResult,
} from './useTypewriter';

/**
 * CSS keyframes for dialogue animations
 *
 * Add this to your global CSS or Tailwind config:
 *
 * ```css
 * @keyframes breathe {
 *   0%, 100% { transform: scale(1); }
 *   50% { transform: scale(1.015); }
 * }
 *
 * @keyframes shrink {
 *   from { width: 100%; }
 *   to { width: 0%; }
 * }
 *
 * .animate-breathe {
 *   animation: breathe 4s ease-in-out infinite;
 * }
 *
 * .animate-pulse-subtle {
 *   animation: pulse 3s ease-in-out infinite;
 * }
 * ```
 */
export const dialogueKeyframes = `
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.015);
  }
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(217, 147, 48, 0.4);
  }
  50% {
    opacity: 0.95;
    box-shadow: 0 0 20px 5px rgba(217, 147, 48, 0.2);
  }
}
`;
