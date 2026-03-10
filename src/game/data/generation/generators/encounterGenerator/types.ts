/**
 * Encounter Generator Types - Interfaces for generated encounter data
 */

/**
 * Generated enemy in encounter
 */
export interface GeneratedEnemy {
  id: string;
  enemyType: string;
  templateId: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  damage: number;
  armor: number;
  accuracy: number;
  evasion: number;
  behaviorTags: string[];
  combatTags: string[];
  xpValue: number;
  lootTableId?: string;
}

/**
 * Generated encounter data
 */
export interface GeneratedEncounter {
  id: string;
  templateId: string;
  name: string;
  description: string;
  enemies: GeneratedEnemy[];
  difficulty: number;
  xpReward: number;
  goldReward: number;
  lootTableId?: string;
  tags: string[];
  seed: number;
}
