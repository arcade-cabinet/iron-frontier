/**
 * Dialogue UI Types
 *
 * Type definitions for the dialogue system UI components.
 * These types are used by both web and React Native implementations.
 */

import type { ReactNode } from 'react';

/**
 * NPC emotion states for portrait expressions
 */
export type NPCEmotion = 'neutral' | 'happy' | 'angry' | 'sad' | 'suspicious' | 'worried' | 'determined' | 'thoughtful';

/**
 * Typewriter effect configuration
 */
export interface TypewriterConfig {
  /** Characters per second (default: 40) */
  speed?: number;
  /** Delay before starting (ms) */
  startDelay?: number;
  /** Whether typing sound is enabled */
  soundEnabled?: boolean;
}

/**
 * Dialogue choice with metadata
 */
export interface DialogueChoiceData {
  /** Display text */
  text: string;
  /** Next node ID (null = end conversation) */
  nextNodeId: string | null;
  /** Whether this choice is available */
  available: boolean;
  /** Reason if unavailable */
  unavailableReason?: string;
  /** Optional consequence preview */
  consequence?: string;
  /** Tags for styling (e.g., 'aggressive', 'kind') */
  tags?: string[];
  /** Tooltip hint */
  hint?: string;
}

/**
 * NPC data for portrait display
 */
export interface NPCPortraitData {
  /** NPC unique ID */
  id: string;
  /** Display name */
  name: string;
  /** Title or nickname */
  title?: string;
  /** Portrait image ID/URL */
  portraitId?: string;
  /** Current emotion */
  emotion?: NPCEmotion;
}

/**
 * Complete dialogue state for UI
 */
export interface DialogueUIState {
  /** Current NPC */
  npc: NPCPortraitData;
  /** Current dialogue text */
  text: string;
  /** Speaker name override (for cutscenes) */
  speaker?: string;
  /** Available choices */
  choices: DialogueChoiceData[];
  /** Whether this node auto-advances */
  autoAdvance: boolean;
  /** History of visited node IDs */
  history: string[];
}

/**
 * Dialogue context actions
 */
export interface DialogueActions {
  /** Select a choice by index */
  selectChoice: (index: number) => void;
  /** Advance to next auto-advance node */
  advance: () => void;
  /** Close the dialogue */
  close: () => void;
  /** Go back in history (if supported) */
  goBack?: () => void;
}

/**
 * Quest notification type
 */
export type QuestNotificationType = 'started' | 'updated' | 'completed' | 'failed';

/**
 * Quest notification data
 */
export interface QuestNotificationData {
  /** Notification type */
  type: QuestNotificationType;
  /** Quest name */
  questName: string;
  /** Optional description */
  description?: string;
}

/**
 * Item received notification data
 */
export interface ItemReceivedData {
  /** Item ID */
  itemId: string;
  /** Item name */
  name: string;
  /** Item icon URL/ID */
  iconId?: string;
  /** Quantity received */
  quantity: number;
  /** Item rarity for styling */
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Base props for dialogue components
 */
export interface DialogueBaseProps {
  /** Test ID for automated testing */
  testID?: string;
  /** Additional CSS classes */
  className?: string;
  /** Children elements */
  children?: ReactNode;
}
