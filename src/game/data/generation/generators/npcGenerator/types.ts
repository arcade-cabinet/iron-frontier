/**
 * NPC Generator Types - Interfaces for generated NPC data
 */

import type { GeneratedName, NameGender } from '../nameGenerator';

/**
 * Generated NPC data
 */
export interface GeneratedNPC {
  /** Unique ID */
  id: string;
  /** Full name */
  name: string;
  /** Template used */
  templateId: string;
  /** Role */
  role: string;
  /** Faction */
  faction: string;
  /** Gender */
  gender: NameGender;
  /** Name details */
  nameDetails: GeneratedName;
  /** Generated personality values */
  personality: {
    aggression: number;
    friendliness: number;
    curiosity: number;
    greed: number;
    honesty: number;
    lawfulness: number;
  };
  /** Generated backstory */
  backstory: string;
  /** Generated description */
  description: string;
  /** Is quest giver */
  isQuestGiver: boolean;
  /** Has shop */
  hasShop: boolean;
  /** Tags from template */
  tags: string[];
  /** Generation seed for reproducibility */
  seed: number;
}
