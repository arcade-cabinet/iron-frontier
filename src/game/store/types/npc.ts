import type { CharacterAppearance, WorldPosition } from './common';

export type NPCRole =
  | 'sheriff'
  | 'deputy'
  | 'mayor'
  | 'merchant'
  | 'bartender'
  | 'blacksmith'
  | 'doctor'
  | 'banker'
  | 'rancher'
  | 'miner'
  | 'farmer'
  | 'prospector'
  | 'outlaw'
  | 'gang_leader'
  | 'bounty_hunter'
  | 'drifter'
  | 'preacher'
  | 'gambler'
  | 'undertaker'
  | 'innkeeper'
  | 'townsfolk';

export interface NPCPersonality {
  aggression: number;
  friendliness: number;
  curiosity: number;
  greed: number;
  honesty: number;
}

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  appearance: CharacterAppearance;
  personality: NPCPersonality;
  position: WorldPosition;
  rotation: number;
  homeStructureId?: string;
  disposition: number;
  isAlive: boolean;
  questGiver: boolean;
  questIds: string[];
}
