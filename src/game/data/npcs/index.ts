/**
 * NPC Library - Iron Frontier
 *
 * This module exports all NPC definitions and their associated dialogue trees.
 */

import { ProceduralLocationManager } from '../generation/ProceduralLocationManager';
import type { DialogueTree, NPCDefinition } from '../schemas/npc.ts';

export type { ProceduralNPC } from '../generation/ProceduralLocationManager';
export type { DialogueTree, NPCDefinition } from '../schemas/npc.ts';

// Re-export NPC definitions
export {
  SheriffMarcusCole,
  MayorJosephineHolt,
  DocChenWei,
  FatherMiguel,
  DiamondbackDolores,
  OldSamuelIronpick,
} from './definitions.ts';

import {
  SheriffMarcusCole,
  MayorJosephineHolt,
  DocChenWei,
  FatherMiguel,
  DiamondbackDolores,
  OldSamuelIronpick,
} from './definitions.ts';

import { DiamondbackDialogues } from './dialogues/diamondback/index.ts';
import { DocChenDialogues } from './dialogues/doc_chen/index.ts';
import { FatherMiguelDialogues } from './dialogues/father_miguel/index.ts';
import { MayorHoltDialogues } from './dialogues/mayor_holt/index.ts';
import { SamuelIronpickDialogues } from './dialogues/samuel_ironpick/index.ts';
import { SheriffColeDialogues } from './dialogues/sheriff_cole/index.ts';

export const ALL_NPCS: NPCDefinition[] = [
  SheriffMarcusCole,
  MayorJosephineHolt,
  DocChenWei,
  FatherMiguel,
  DiamondbackDolores,
  OldSamuelIronpick,
];

export const NPCS_BY_ID: Record<string, NPCDefinition> = Object.fromEntries(
  ALL_NPCS.map((npc) => [npc.id, npc])
);

export const NPCS_BY_LOCATION: Record<string, NPCDefinition[]> = ALL_NPCS.reduce(
  (acc, npc) => {
    if (!acc[npc.locationId]) {
      acc[npc.locationId] = [];
    }
    acc[npc.locationId].push(npc);
    return acc;
  },
  {} as Record<string, NPCDefinition[]>
);

export const ALL_DIALOGUE_TREES: DialogueTree[] = [
  ...SheriffColeDialogues,
  ...DocChenDialogues,
  ...DiamondbackDialogues,
  ...MayorHoltDialogues,
  ...FatherMiguelDialogues,
  ...SamuelIronpickDialogues,
];

export const DIALOGUE_TREES_BY_ID: Record<string, DialogueTree> = Object.fromEntries(
  ALL_DIALOGUE_TREES.map((tree) => [tree.id, tree])
);

export function getNPCById(id: string): NPCDefinition | undefined {
  const handCrafted = NPCS_BY_ID[id];
  if (handCrafted) return handCrafted;
  if (id.startsWith('npc_') && ProceduralLocationManager.isInitialized()) {
    return undefined;
  }
  return undefined;
}

export function getNPCsByLocation(locationId: string): NPCDefinition[] {
  const handCrafted = NPCS_BY_LOCATION[locationId] || [];
  if (
    ProceduralLocationManager.isInitialized() &&
    ProceduralLocationManager.hasGeneratedContent(locationId)
  ) {
    const procedural = ProceduralLocationManager.getOrGenerateNPCs(locationId);
    return [...handCrafted, ...procedural];
  }
  return handCrafted;
}

export function getNPCsByFaction(faction: string): NPCDefinition[] {
  return ALL_NPCS.filter((npc) => npc.faction === faction);
}

export function getNPCsByTag(tag: string): NPCDefinition[] {
  return ALL_NPCS.filter((npc) => npc.tags.includes(tag));
}

export function getDialogueTreeById(id: string): DialogueTree | undefined {
  const handCrafted = DIALOGUE_TREES_BY_ID[id];
  if (handCrafted) return handCrafted;
  if (id.startsWith('proc_dialogue_') && ProceduralLocationManager.isInitialized()) {
    return undefined;
  }
  return undefined;
}

export function getProceduralDialogueTree(npcId: string, locationId: string): DialogueTree | null {
  if (!ProceduralLocationManager.isInitialized()) return null;
  return ProceduralLocationManager.getOrGenerateDialogue(npcId, locationId);
}

export function getDialogueTreesForNPC(npcId: string): DialogueTree[] {
  const npc = NPCS_BY_ID[npcId];
  if (!npc) return [];
  return npc.dialogueTreeIds
    .map((id) => DIALOGUE_TREES_BY_ID[id])
    .filter((tree): tree is DialogueTree => tree !== undefined);
}

export function getPrimaryDialogueTree(
  npcId: string,
  locationId?: string
): DialogueTree | undefined {
  const npc = NPCS_BY_ID[npcId];
  if (npc?.primaryDialogueId) {
    return DIALOGUE_TREES_BY_ID[npc.primaryDialogueId];
  }
  if (locationId && ProceduralLocationManager.isInitialized()) {
    const proceduralTree = ProceduralLocationManager.getOrGenerateDialogue(npcId, locationId);
    if (proceduralTree) return proceduralTree;
  }
  return undefined;
}

export function getQuestGivers(): NPCDefinition[] {
  return ALL_NPCS.filter((npc) => npc.questGiver);
}

export function getEssentialNPCs(): NPCDefinition[] {
  return ALL_NPCS.filter((npc) => npc.essential);
}
