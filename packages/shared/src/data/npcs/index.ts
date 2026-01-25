/**
 * NPC Library - Iron Frontier
 *
 * This module exports all NPC definitions and their associated dialogue trees.
 * NPCs are defined separately from their dialogues for modularity.
 *
 * Now supports both hand-crafted NPCs AND procedurally generated NPCs via
 * the ProceduralLocationManager.
 */

import {
  ProceduralLocationManager,
  type ProceduralNPC,
} from '../generation/ProceduralLocationManager';
import type { DialogueTree, NPCDefinition } from '../schemas/npc';

export type { ProceduralNPC } from '../generation/ProceduralLocationManager';
// Re-export types for external use
export type { DialogueTree, NPCDefinition } from '../schemas/npc';

// Re-export ambient dialogue system
export * from './ambientDialogue';

import { DiamondbackDialogues } from './dialogues/diamondback';
import { DocChenDialogues } from './dialogues/doc_chen';
import { FatherMiguelDialogues } from './dialogues/father_miguel';
import { MayorHoltDialogues } from './dialogues/mayor_holt';
import { SamuelIronpickDialogues } from './dialogues/samuel_ironpick';
// Import dialogue trees
import { SheriffColeDialogues } from './dialogues/sheriff_cole';

// ============================================================================
// NPC DEFINITIONS
// ============================================================================

export const SheriffMarcusCole: NPCDefinition = {
  id: 'sheriff_cole',
  name: 'Marcus Cole',
  title: 'Sheriff',
  role: 'sheriff',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 16, r: 18 }, // Sheriff's Office
  personality: {
    aggression: 0.4,
    friendliness: 0.6,
    curiosity: 0.5,
    greed: 0.1,
    honesty: 0.9,
    lawfulness: 0.8,
  },
  description:
    'A weathered man in his forties with a star pinned to his dusty vest. His eyes carry the weight of too many hard decisions.',
  portraitId: 'sheriff_cole',
  dialogueTreeIds: ['sheriff_cole_main'],
  primaryDialogueId: 'sheriff_cole_main',
  essential: true,
  questGiver: true,
  questIds: ['investigate_origins', 'investigate_disappearances'],
  backstory:
    'A Union veteran who came west looking for peace. Found duty instead. Struggles between his sworn oath and his conscience as IVRC tightens its grip.',
  relationships: [
    { npcId: 'mayor_holt', type: 'rival', notes: 'Clashes over IVRC influence' },
    { npcId: 'doc_chen', type: 'ally', notes: 'Mutual respect for integrity' },
    { npcId: 'diamondback', type: 'enemy', notes: 'Duty demands he oppose her' },
    { npcId: 'deputy_jake', type: 'ally', notes: 'Mentors the young deputy' },
    { npcId: 'cornelius_thorne', type: 'enemy', notes: 'Knows Thorne is corrupt but lacks proof' },
  ],
  tags: ['authority', 'ally_potential', 'main_quest'],
};

export const MayorJosephineHolt: NPCDefinition = {
  id: 'mayor_holt',
  name: 'Josephine Holt',
  title: 'Mayor',
  role: 'mayor',
  faction: 'ivrc',
  locationId: 'dusty_springs',
  spawnCoord: { q: 28, r: 24 }, // Holt Mansion
  personality: {
    aggression: 0.2,
    friendliness: 0.7,
    curiosity: 0.4,
    greed: 0.5,
    honesty: 0.4,
    lawfulness: 0.6,
  },
  description:
    'An elegant woman in her fifties, dressed in fine eastern clothes that seem out of place on the frontier. Her smile never quite reaches her eyes.',
  portraitId: 'mayor_holt',
  dialogueTreeIds: ['mayor_holt_main'],
  primaryDialogueId: 'mayor_holt_main',
  essential: true,
  questGiver: true,
  questIds: [],
  backstory:
    'Born to wealth, married into power. Came west with her husband to build an empire. Now a widow, she maintains control by serving IVRC interests while protecting what little independence remains.',
  relationships: [
    { npcId: 'sheriff_cole', type: 'rival', notes: 'His morality frustrates her pragmatism' },
    { npcId: 'cornelius_thorne', type: 'ally', notes: 'She owes her position to him' },
  ],
  tags: ['authority', 'ivrc_connected', 'morally_grey'],
};

export const DocChenWei: NPCDefinition = {
  id: 'doc_chen',
  name: 'Chen Wei',
  title: 'Doc',
  role: 'doctor',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 26, r: 18 }, // Doc Chen's Office
  personality: {
    aggression: 0.1,
    friendliness: 0.7,
    curiosity: 0.8,
    greed: 0.1,
    honesty: 0.8,
    lawfulness: 0.5,
  },
  description:
    'An older Chinese man with thoughtful eyes and steady hands. His small office is filled with both western medicine and traditional remedies.',
  portraitId: 'doc_chen',
  dialogueTreeIds: ['doc_chen_main'],
  primaryDialogueId: 'doc_chen_main',
  essential: true,
  questGiver: true,
  questIds: ['underground_railroad'],
  shopId: 'doc_chen_shop',
  backstory:
    'Came to America seeking opportunity, found discrimination. Built a practice serving those others ignored. Quietly runs an underground network helping workers escape IVRC debt bondage.',
  relationships: [
    {
      npcId: 'sheriff_cole',
      type: 'ally',
      notes: 'Sheriff turns a blind eye to certain activities',
    },
    { npcId: 'father_miguel', type: 'ally', notes: 'Partners in the underground' },
    { npcId: 'diamondback', type: 'neutral', notes: 'Heals her people without judgment' },
    { npcId: 'sister_maria', type: 'ally', notes: 'Coordinates medical care for escapees' },
  ],
  tags: ['healer', 'information', 'underground', 'ally_potential'],
};

export const FatherMiguel: NPCDefinition = {
  id: 'father_miguel',
  name: 'Miguel Santos',
  title: 'Father',
  role: 'preacher',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 10, r: 26 }, // St. Michael's Church
  personality: {
    aggression: 0.0,
    friendliness: 0.9,
    curiosity: 0.6,
    greed: 0.0,
    honesty: 0.7, // Hides the underground railroad
    lawfulness: 0.4, // Follows higher law
  },
  description:
    "A gentle man in simple priest's robes, his hands calloused from work alongside his flock. His Spanish accent thickens when speaking of injustice.",
  portraitId: 'father_miguel',
  dialogueTreeIds: ['father_miguel_main'],
  primaryDialogueId: 'father_miguel_main',
  essential: true,
  questGiver: true,
  questIds: ['sanctuary'],
  backstory:
    'A former missionary who lost his faith in the Church but not in God. Came to the frontier to serve the forgotten. Runs an underground railroad for escaped workers, hiding them in the church basement.',
  relationships: [
    { npcId: 'doc_chen', type: 'ally', notes: 'Partners in saving lives' },
    { npcId: 'samuel_ironpick', type: 'ally', notes: 'Old friends from the resistance days' },
    { npcId: 'sister_maria', type: 'ally', notes: 'She handles the dangerous logistics' },
  ],
  tags: ['spiritual', 'underground', 'sanctuary', 'ally_potential'],
};

export const DiamondbackDolores: NPCDefinition = {
  id: 'diamondback',
  name: 'Dolores Vega',
  title: 'Diamondback',
  role: 'gang_leader',
  faction: 'copperhead',
  locationId: 'rattlesnake_canyon',
  spawnCoord: { q: 0, r: 0 },
  personality: {
    aggression: 0.7,
    friendliness: 0.3,
    curiosity: 0.5,
    greed: 0.2, // Steals for cause, not self
    honesty: 0.6,
    lawfulness: 0.0,
  },
  description:
    'A striking woman with sun-darkened skin and cold, calculating eyes. A coiled rattlesnake tattoo winds up her neck. Her presence commands immediate attention.',
  portraitId: 'diamondback',
  dialogueTreeIds: ['diamondback_main'],
  primaryDialogueId: 'diamondback_main',
  essential: true,
  questGiver: true,
  questIds: ['copperhead_alliance', 'strike_ivrc'],
  backstory:
    "Former IVRC telegraph operator who saw too much. When she tried to expose the company's crimes, they tried to silence her permanently. She survived and vowed revenge.",
  relationships: [
    { npcId: 'sheriff_cole', type: 'enemy', notes: 'Respects him but cannot cooperate' },
    { npcId: 'samuel_ironpick', type: 'neutral', notes: 'Disagrees on methods but shares goals' },
    { npcId: 'cornelius_thorne', type: 'enemy', notes: 'Sworn enemy' },
    { npcId: 'maggie_ironpick', type: 'ally', notes: 'Secretly works with her, sees her potential' },
  ],
  tags: ['outlaw', 'faction_leader', 'ally_potential', 'copperhead'],
};

export const OldSamuelIronpick: NPCDefinition = {
  id: 'samuel_ironpick',
  name: 'Samuel Ironpick',
  title: 'Old',
  role: 'miner',
  faction: 'freeminer',
  locationId: 'freeminer_hollow',
  spawnCoord: { q: 0, r: 0 },
  personality: {
    aggression: 0.3,
    friendliness: 0.4,
    curiosity: 0.3,
    greed: 0.1,
    honesty: 0.9,
    lawfulness: 0.6,
  },
  description:
    'A grizzled old miner with a silver beard and hands like leather. His eyes hold both wisdom and deep sorrow. He carries himself with quiet dignity despite his worn clothes.',
  portraitId: 'samuel_ironpick',
  dialogueTreeIds: ['samuel_ironpick_main'],
  primaryDialogueId: 'samuel_ironpick_main',
  essential: true,
  questGiver: true,
  questIds: ['freeminer_trust', 'find_documents'],
  backstory:
    'Lost his son to a preventable mine collapse. Became leader of the Freeminer resistance, advocating peaceful resistance. Holds the key to documents that could destroy IVRC - if he can be convinced to use them.',
  relationships: [
    {
      npcId: 'diamondback',
      type: 'neutral',
      notes: 'Disapproves of violence but understands her pain',
    },
    { npcId: 'father_miguel', type: 'ally', notes: 'Old friends from better days' },
    { npcId: 'maggie_ironpick', type: 'family', notes: 'His granddaughter' },
  ],
  tags: ['faction_leader', 'ally_potential', 'freeminer', 'documents'],
};

// ============================================================================
// SUPPORTING NPCs
// ============================================================================

export const MaggieIronpick: NPCDefinition = {
  id: 'maggie_ironpick',
  name: 'Margaret Ironpick',
  title: '',
  role: 'miner',
  faction: 'freeminer',
  locationId: 'freeminer_hollow',
  spawnCoord: { q: 5, r: 3 },
  personality: {
    aggression: 0.7,
    friendliness: 0.4,
    curiosity: 0.6,
    greed: 0.2,
    honesty: 0.5,
    lawfulness: 0.2,
  },
  description:
    'A young woman with fiery red hair and fierce green eyes. Her hands are calloused from mine work, but her restless energy suggests she yearns for more than the hollow can offer.',
  portraitId: 'maggie_ironpick',
  dialogueTreeIds: ['maggie_ironpick_main'],
  primaryDialogueId: 'maggie_ironpick_main',
  essential: true,
  questGiver: true,
  questIds: ['maggies_secret'],
  backstory:
    "Samuel's granddaughter, orphaned when her father died in the mine collapse. She shares her grandfather's hatred of IVRC but not his patience. Secretly works with Diamondback and the Copperheads, believing direct action is the only answer. Her dual loyalties could tear the resistance apart.",
  relationships: [
    { npcId: 'samuel_ironpick', type: 'family', notes: 'Loves him but thinks he is too passive' },
    { npcId: 'diamondback', type: 'ally', notes: 'Secret ally, shares her methods' },
    { npcId: 'cornelius_thorne', type: 'enemy', notes: 'The face of everything she hates' },
  ],
  tags: ['freeminer', 'copperhead_connected', 'conflicted', 'ally_potential'],
};

export const CorneliusThorne: NPCDefinition = {
  id: 'cornelius_thorne',
  name: 'Cornelius Thorne',
  title: 'Director',
  role: 'mayor',
  faction: 'ivrc',
  locationId: 'iron_gulch',
  spawnCoord: { q: 30, r: 20 },
  personality: {
    aggression: 0.3,
    friendliness: 0.2,
    curiosity: 0.4,
    greed: 0.8,
    honesty: 0.2,
    lawfulness: 0.7,
  },
  description:
    'A tall, gaunt man in an impeccable black suit. His pale eyes are cold as a winter grave, and his thin lips rarely curve into anything resembling warmth. Every gesture is calculated, every word a weapon.',
  portraitId: 'cornelius_thorne',
  dialogueTreeIds: ['cornelius_thorne_main'],
  primaryDialogueId: 'cornelius_thorne_main',
  essential: true,
  questGiver: false,
  questIds: [],
  backstory:
    'The IVRC Regional Director and the main antagonist. Rose through the company ranks through ruthless efficiency and strategic elimination of rivals. Oversees all operations in the territory, including the cover-up of Project Remnant. Views people as resources to be exploited. The player will eventually have to confront him.',
  relationships: [
    { npcId: 'mayor_holt', type: 'ally', notes: 'She owes her position to him' },
    { npcId: 'diamondback', type: 'enemy', notes: 'She knows his secrets' },
    { npcId: 'sheriff_cole', type: 'rival', notes: 'Tolerates him only because killing a sheriff draws attention' },
    { npcId: 'foreman_burke', type: 'ally', notes: 'Useful tool, expendable' },
  ],
  tags: ['antagonist', 'ivrc', 'authority', 'main_quest'],
};

export const WhiskeyPete: NPCDefinition = {
  id: 'whiskey_pete',
  name: 'Peter Sullivan',
  title: '',
  role: 'bartender',
  faction: 'neutral',
  locationId: 'iron_gulch',
  spawnCoord: { q: 23, r: 26 },
  personality: {
    aggression: 0.2,
    friendliness: 0.7,
    curiosity: 0.8,
    greed: 0.5,
    honesty: 0.4,
    lawfulness: 0.3,
  },
  description:
    'A portly man with a ruddy complexion and twinkling eyes. His apron is perpetually stained, and he polishes the same glass endlessly while listening to every word spoken in his saloon.',
  portraitId: 'whiskey_pete',
  dialogueTreeIds: ['whiskey_pete_main'],
  primaryDialogueId: 'whiskey_pete_main',
  essential: false,
  questGiver: true,
  questIds: ['saloon_secrets'],
  shopId: 'whiskey_petes_saloon',
  backstory:
    "Owns the Golden Nugget Saloon in Iron Gulch. Came west after a scandal in Chicago - something about a dead man and a card game. Now he runs the most popular drinking establishment in town and hears every secret that passes through. He sells information to anyone who pays, staying carefully neutral in the conflict between IVRC and the resistance.",
  relationships: [
    { npcId: 'bartender_molly', type: 'rival', notes: 'Competing saloon owners' },
    { npcId: 'lucky_lou', type: 'neutral', notes: 'Regular customer and occasional headache' },
    { npcId: 'foreman_burke', type: 'neutral', notes: 'Good customer who talks too much when drunk' },
  ],
  tags: ['information', 'neutral', 'saloon', 'rumors'],
};

export const BlackBelle: NPCDefinition = {
  id: 'black_belle',
  name: 'Isabelle Crow',
  title: 'Black Belle',
  role: 'bounty_hunter',
  faction: 'neutral',
  locationId: 'mesa_point',
  spawnCoord: { q: 16, r: 14 },
  personality: {
    aggression: 0.7,
    friendliness: 0.3,
    curiosity: 0.4,
    greed: 0.6,
    honesty: 0.5,
    lawfulness: 0.1,
  },
  description:
    'A striking woman dressed entirely in black, from her wide-brimmed hat to her polished boots. A matched pair of revolvers hang at her hips, and her dark eyes miss nothing. Beautiful and deadly in equal measure.',
  portraitId: 'black_belle',
  dialogueTreeIds: ['black_belle_main'],
  primaryDialogueId: 'black_belle_main',
  essential: false,
  questGiver: true,
  questIds: ['belles_bounty', 'hired_gun'],
  backstory:
    "Once a Pinkerton agent, Belle left when she discovered the agency was covering up crimes for IVRC. Now she works as a bounty hunter for hire, taking jobs from anyone who pays - outlaws, lawmen, even IVRC if the price is right. She has a code: no women, no children, no one who doesn't deserve it. The definition of 'deserve' is flexible.",
  relationships: [
    { npcId: 'bounty_hunter_cole', type: 'rival', notes: 'Professional competition, mutual respect' },
    { npcId: 'diamondback', type: 'neutral', notes: 'Has turned down bounties on her - for now' },
    { npcId: 'cornelius_thorne', type: 'enemy', notes: 'Knows what he did to her old partner' },
  ],
  tags: ['bounty_hunter', 'for_hire', 'morally_grey', 'dangerous'],
};

export const ProfessorEmmettCogsworth: NPCDefinition = {
  id: 'professor_cogsworth',
  name: 'Emmett Cogsworth',
  title: 'Professor',
  role: 'blacksmith',
  faction: 'neutral',
  locationId: 'coldwater',
  spawnCoord: { q: 14, r: 16 },
  personality: {
    aggression: 0.1,
    friendliness: 0.6,
    curiosity: 0.95,
    greed: 0.3,
    honesty: 0.7,
    lawfulness: 0.5,
  },
  description:
    'A wild-haired man with thick spectacles and burn marks on his fingers. His workshop coat is covered in grease stains and scorch marks. He speaks rapidly, often trailing off mid-sentence as a new idea strikes him.',
  portraitId: 'professor_cogsworth',
  dialogueTreeIds: ['professor_cogsworth_main'],
  primaryDialogueId: 'professor_cogsworth_main',
  essential: false,
  questGiver: true,
  questIds: ['cogsworths_contraption', 'the_prototype'],
  shopId: 'cogsworth_gadgets',
  backstory:
    "A former IVRC researcher who was dismissed for 'dangerous and impractical' ideas. Now he tinkers in Coldwater, far from the company's reach. His inventions range from brilliant to bizarre - some work perfectly, others explode. He knows more about Project Remnant than he lets on, having worked on its early stages before being reassigned.",
  relationships: [
    { npcId: 'engineer_clara', type: 'ally', notes: 'Former colleagues, she sends him technical papers' },
    { npcId: 'the_wanderer', type: 'neutral', notes: 'Suspects what they are but says nothing' },
    { npcId: 'vet_nell', type: 'ally', notes: 'She patches up his burns, he fixes her equipment' },
  ],
  tags: ['inventor', 'gadgets', 'eccentric', 'remnant_knowledge'],
};

export const SisterMaria: NPCDefinition = {
  id: 'sister_maria',
  name: 'Maria Esperanza',
  title: 'Sister',
  role: 'preacher',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 11, r: 27 },
  personality: {
    aggression: 0.0,
    friendliness: 0.9,
    curiosity: 0.5,
    greed: 0.0,
    honesty: 0.6,
    lawfulness: 0.4,
  },
  description:
    'A young nun with kind brown eyes and a gentle smile. Her habit is worn but clean, and her hands are rough from hard work. Despite her serene demeanor, there is steel in her spine.',
  portraitId: 'sister_maria',
  dialogueTreeIds: ['sister_maria_main'],
  primaryDialogueId: 'sister_maria_main',
  essential: false,
  questGiver: true,
  questIds: ['sanctuary_path', 'the_lost_sheep'],
  backstory:
    "Came to the frontier from a convent in Mexico after hearing of Father Miguel's work. She helps run the underground railroad that smuggles escaped IVRC workers to freedom. More pragmatic than the Father, she handles the dangerous logistics - forging papers, bribing guards, and occasionally wielding a shotgun when prayers aren't enough.",
  relationships: [
    { npcId: 'father_miguel', type: 'ally', notes: 'Works closely with him on the underground' },
    { npcId: 'doc_chen', type: 'ally', notes: 'Coordinates medical care for escapees' },
    { npcId: 'sheriff_cole', type: 'neutral', notes: 'Suspects he knows but trusts his silence' },
  ],
  tags: ['underground', 'spiritual', 'ally_potential', 'sanctuary'],
};

export const DeputyJakeHawkins: NPCDefinition = {
  id: 'deputy_jake',
  name: 'Jacob Hawkins',
  title: 'Deputy',
  role: 'sheriff',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 17, r: 17 },
  personality: {
    aggression: 0.4,
    friendliness: 0.7,
    curiosity: 0.6,
    greed: 0.1,
    honesty: 0.9,
    lawfulness: 0.9,
  },
  description:
    'A fresh-faced young man barely out of his teens, with earnest blue eyes and a badge he polishes every morning. His quick draw is impressive, but his idealism has yet to be tested by hard choices.',
  portraitId: 'deputy_jake',
  dialogueTreeIds: ['deputy_jake_main'],
  primaryDialogueId: 'deputy_jake_main',
  essential: false,
  questGiver: true,
  questIds: ['jakes_dilemma'],
  backstory:
    "Sheriff Cole's newest deputy, hand-picked for his honesty and quick reflexes. Jake believes in the law absolutely - black and white, right and wrong. He hasn't yet learned that justice in the frontier is painted in shades of grey. His faith in the system will be tested when he discovers IVRC's influence over the courts.",
  relationships: [
    { npcId: 'sheriff_cole', type: 'ally', notes: 'Mentor and hero, would follow him anywhere' },
    { npcId: 'deputy_marshall', type: 'ally', notes: 'Fellow deputy, friendly rivalry' },
    { npcId: 'cornelius_thorne', type: 'neutral', notes: 'Respects his authority, unaware of his crimes' },
  ],
  tags: ['law', 'authority', 'idealistic', 'ally_potential'],
};

export const LuckyLou: NPCDefinition = {
  id: 'lucky_lou',
  name: 'Louis Fontaine',
  title: 'Lucky',
  role: 'townsfolk',
  faction: 'neutral',
  locationId: 'iron_gulch',
  spawnCoord: { q: 24, r: 24 },
  personality: {
    aggression: 0.2,
    friendliness: 0.8,
    curiosity: 0.5,
    greed: 0.7,
    honesty: 0.3,
    lawfulness: 0.2,
  },
  description:
    'A dapper man in a slightly worn but well-maintained suit, with nimble fingers and a winning smile. A deck of cards is never far from his hands, and his eyes constantly calculate odds.',
  portraitId: 'lucky_lou',
  dialogueTreeIds: ['lucky_lou_main'],
  primaryDialogueId: 'lucky_lou_main',
  essential: false,
  questGiver: true,
  questIds: ['high_stakes', 'the_big_game', 'debt_collector'],
  backstory:
    "A professional gambler who drifted into Iron Gulch following the money. His 'luck' is mostly skill and a few tricks he learned in New Orleans. He runs high-stakes poker games for miners with too much pay and not enough sense. Despite his profession, he has a code - he only fleeces those who can afford it and occasionally helps those in genuine need.",
  relationships: [
    { npcId: 'whiskey_pete', type: 'ally', notes: 'Pete takes a cut of his games' },
    { npcId: 'bartender_molly', type: 'neutral', notes: 'She banned him from her saloon for cheating' },
    { npcId: 'the_fence', type: 'ally', notes: 'Helps move stolen goods for a percentage' },
  ],
  tags: ['gambler', 'quest_giver', 'information', 'morally_grey'],
};

// ============================================================================
// NPC REGISTRY
// ============================================================================

export const ALL_NPCS: NPCDefinition[] = [
  SheriffMarcusCole,
  MayorJosephineHolt,
  DocChenWei,
  FatherMiguel,
  DiamondbackDolores,
  OldSamuelIronpick,
  // Supporting NPCs
  MaggieIronpick,
  CorneliusThorne,
  WhiskeyPete,
  BlackBelle,
  ProfessorEmmettCogsworth,
  SisterMaria,
  DeputyJakeHawkins,
  LuckyLou,
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

// ============================================================================
// DIALOGUE REGISTRY
// ============================================================================

export const ALL_DIALOGUE_TREES: DialogueTree[] = [
  ...SheriffColeDialogues,
  ...DocChenDialogues,
  ...DiamondbackDialogues,
  ...FatherMiguelDialogues,
  ...MayorHoltDialogues,
  ...SamuelIronpickDialogues,
];

export const DIALOGUE_TREES_BY_ID: Record<string, DialogueTree> = Object.fromEntries(
  ALL_DIALOGUE_TREES.map((tree) => [tree.id, tree])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get an NPC by their ID
 * Checks both hand-crafted NPCs and procedural NPCs
 */
export function getNPCById(id: string): NPCDefinition | undefined {
  // First check hand-crafted NPCs
  const handCrafted = NPCS_BY_ID[id];
  if (handCrafted) {
    return handCrafted;
  }

  // Check procedural NPCs if the ID looks procedural
  if (id.startsWith('npc_') && ProceduralLocationManager.isInitialized()) {
    // Extract location from ID pattern - procedural NPCs have format: npc_templateId_seed
    // We need to search all cached locations
    // For now, return undefined - caller should use getProceduralNPCById for known locations
    return undefined;
  }

  return undefined;
}

/**
 * Get all NPCs in a location
 * Combines hand-crafted NPCs with procedurally generated ones
 */
export function getNPCsByLocation(locationId: string): NPCDefinition[] {
  // Get hand-crafted NPCs
  const handCrafted = NPCS_BY_LOCATION[locationId] || [];

  // Get procedural NPCs if manager is initialized and has content for this location
  if (
    ProceduralLocationManager.isInitialized() &&
    ProceduralLocationManager.hasGeneratedContent(locationId)
  ) {
    const procedural = ProceduralLocationManager.getOrGenerateNPCs(locationId);
    return [...handCrafted, ...procedural];
  }

  return handCrafted;
}

/**
 * Get NPCs by faction
 */
export function getNPCsByFaction(faction: string): NPCDefinition[] {
  return ALL_NPCS.filter((npc) => npc.faction === faction);
}

/**
 * Get NPCs with a specific tag
 */
export function getNPCsByTag(tag: string): NPCDefinition[] {
  return ALL_NPCS.filter((npc) => npc.tags.includes(tag));
}

/**
 * Get a dialogue tree by ID
 * Checks both hand-crafted dialogue trees and procedural ones
 */
export function getDialogueTreeById(id: string): DialogueTree | undefined {
  // First check hand-crafted dialogue trees
  const handCrafted = DIALOGUE_TREES_BY_ID[id];
  if (handCrafted) {
    return handCrafted;
  }

  // Check procedural dialogue trees
  if (id.startsWith('proc_dialogue_') && ProceduralLocationManager.isInitialized()) {
    // Extract NPC ID from dialogue tree ID: proc_dialogue_npcId
    const npcId = id.replace('proc_dialogue_', '');
    // We need to find which location this NPC is in
    // For now, search all cached locations - this is O(n) but acceptable for small datasets
    return undefined; // Caller should use getProceduralDialogueTree for known locations
  }

  return undefined;
}

/**
 * Get procedural dialogue tree for an NPC at a specific location
 */
export function getProceduralDialogueTree(npcId: string, locationId: string): DialogueTree | null {
  if (!ProceduralLocationManager.isInitialized()) {
    return null;
  }
  return ProceduralLocationManager.getOrGenerateDialogue(npcId, locationId);
}

/**
 * Get all dialogue trees for an NPC
 */
export function getDialogueTreesForNPC(npcId: string): DialogueTree[] {
  const npc = NPCS_BY_ID[npcId];
  if (!npc) return [];

  return npc.dialogueTreeIds
    .map((id) => DIALOGUE_TREES_BY_ID[id])
    .filter((tree): tree is DialogueTree => tree !== undefined);
}

/**
 * Get the primary dialogue tree for an NPC
 * Supports both hand-crafted and procedural NPCs
 */
export function getPrimaryDialogueTree(
  npcId: string,
  locationId?: string
): DialogueTree | undefined {
  // First check hand-crafted NPCs
  const npc = NPCS_BY_ID[npcId];
  if (npc && npc.primaryDialogueId) {
    return DIALOGUE_TREES_BY_ID[npc.primaryDialogueId];
  }

  // Check procedural dialogue if we have a location
  if (locationId && ProceduralLocationManager.isInitialized()) {
    const proceduralTree = ProceduralLocationManager.getOrGenerateDialogue(npcId, locationId);
    if (proceduralTree) {
      return proceduralTree;
    }
  }

  return undefined;
}

/**
 * Get quest-giving NPCs
 */
export function getQuestGivers(): NPCDefinition[] {
  return ALL_NPCS.filter((npc) => npc.questGiver);
}

/**
 * Get essential NPCs (cannot die)
 */
export function getEssentialNPCs(): NPCDefinition[] {
  return ALL_NPCS.filter((npc) => npc.essential);
}
