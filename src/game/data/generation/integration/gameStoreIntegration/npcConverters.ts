/**
 * NPC Type Converters - Generated NPCs to Game Format
 */

import type {
  CharacterAppearance,
  NPC,
  NPCPersonality,
  NPCRole,
  WorldPosition,
} from '../../../../types/engine';
import type { NPCDefinition, NPCFaction } from '../../../schemas/npc';
import type { GeneratedNPC } from '../../generators';
import { SeededRandom } from '../../seededRandom';

/**
 * Convert generated NPC personality to engine format
 */
function convertPersonality(generated: GeneratedNPC['personality']): NPCPersonality {
  return {
    aggression: generated.aggression,
    friendliness: generated.friendliness,
    curiosity: generated.curiosity,
    greed: generated.greed,
    honesty: generated.honesty,
  };
}

/**
 * Generate a default appearance for an NPC based on their role and personality
 */
function generateDefaultAppearance(rng: SeededRandom, npc: GeneratedNPC): CharacterAppearance {
  const isMale = npc.gender === 'male';

  return {
    bodyType: rng.pick(['slim', 'average', 'stocky']),
    height: rng.float(1.6, 1.9),
    skinTone: rng.pick(['#e8c9a0', '#d4a574', '#c19a6b', '#a67b5b', '#8b6914']),

    faceShape: rng.int(0, 5),
    hasBeard: isMale && rng.bool(0.4),
    beardStyle: rng.pick(['stubble', 'full', 'mustache', 'goatee']),
    hasScar: rng.bool(npc.personality.aggression * 0.5),
    scarPosition: rng.pick(['cheek', 'eye', 'chin']),

    hatStyle: rng.pick(['cowboy', 'bowler', 'flat_cap', 'none']),
    hatColor: rng.pick(['#3a2a1a', '#5a4a3a', '#2a1a0a', '#4a3a2a']),
    shirtStyle: rng.pick(['work', 'fancy', 'vest']),
    shirtColor: rng.pick(['#8b7355', '#6b8e23', '#a0522d', '#daa520', '#cd853f']),
    pantsStyle: rng.pick(['jeans', 'chaps', 'slacks']),
    pantsColor: rng.pick(['#2f4f4f', '#3a3a3a', '#4a3728', '#363636']),
    bootsStyle: rng.pick(['work', 'fancy', 'spurs']),

    hasBandana: rng.bool(0.2),
    bandanaColor: rng.pick(['#8b0000', '#2f4f4f', '#daa520']),
    hasGunbelt: rng.bool(npc.personality.aggression * 0.8 + 0.2),
    hasPoncho: rng.bool(0.1),
    ponchoColor: rng.pick(['#8b4513', '#a0522d', '#d2691e']),
  };
}

/**
 * Convert generated NPC to game store's NPC type (engine NPC)
 */
export function convertGeneratedNPCToEngine(
  generated: GeneratedNPC,
  position: WorldPosition,
  rng: SeededRandom
): NPC {
  return {
    id: generated.id,
    name: generated.name,
    role: generated.role as NPC['role'],
    appearance: generateDefaultAppearance(rng, generated),
    personality: convertPersonality(generated.personality),
    position,
    rotation: rng.float(0, Math.PI * 2),
    homeStructureId: undefined,
    disposition: 50 + Math.round((generated.personality.friendliness - 0.5) * 50),
    isAlive: true,
    questGiver: generated.isQuestGiver,
    questIds: [],
  };
}

/**
 * Convert generated NPC to NPCDefinition format (data NPC)
 */
export function convertGeneratedNPC(generated: GeneratedNPC, locationId: string): NPCDefinition {
  return {
    id: generated.id,
    name: generated.name,
    title: generated.nameDetails.nickname ?? undefined,
    role: generated.role as NPCRole,
    faction: (generated.faction as NPCFaction) ?? 'neutral',
    locationId,
    personality: {
      aggression: generated.personality.aggression,
      friendliness: generated.personality.friendliness,
      curiosity: generated.personality.curiosity,
      greed: generated.personality.greed,
      honesty: generated.personality.honesty,
      lawfulness: generated.personality.lawfulness,
    },
    description: generated.description,
    backstory: generated.backstory,
    questGiver: generated.isQuestGiver,
    questIds: [],
    dialogueTreeIds: [],
    tags: generated.tags,
    essential: false,
    relationships: [],
  };
}
