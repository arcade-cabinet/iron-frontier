/**
 * Iron Frontier - Quest Library
 *
 * All quest definitions for the game.
 * Quests are organized by type (main, side, faction).
 *
 * Main Quest: "The Inheritance" - 4 acts following the story bible
 * Side Quests: Optional adventures that enrich the world
 */

import { Quest } from '../schemas/quest';

// ============================================================================
// MAIN QUEST: THE INHERITANCE
// ============================================================================

/**
 * The Inheritance - Main storyline quest
 *
 * The player arrives in Dusty Springs with a mysterious letter,
 * leading them to uncover a conspiracy involving IVRC and their
 * parent's hidden legacy.
 */
export const TheInheritance: Quest = {
  id: 'main_the_inheritance',
  title: 'The Inheritance',
  description:
    'A mysterious letter summoned you to Dusty Springs to "claim what\'s rightfully yours" at an address that doesn\'t seem to exist. The letter is signed only with a gear symbol.',
  type: 'main',
  giverNpcId: null, // Auto-triggered on game start
  startLocationId: 'dusty_springs',
  recommendedLevel: 1,
  tags: ['main', 'mystery', 'ivrc', 'freeminers'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    // Stage 1: Arrival
    {
      id: 'stage_1_arrival',
      title: 'Arrive in Dusty Springs',
      description:
        'You\'ve arrived on the last train into Dusty Springs. Find the address mentioned in the mysterious letter.',
      onStartText:
        'The train hisses to a stop. Dusty Springs. The letter said to find "14 Copper Street." Time to get your bearings.',
      onCompleteText:
        'The address leads to a burned-out lot. Whatever was here is gone, but the fire looks recent.',
      objectives: [
        {
          id: 'obj_explore_town',
          description: 'Explore Dusty Springs and get your bearings',
          type: 'visit',
          target: 'dusty_springs',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Take a look around the main street.',
        },
        {
          id: 'obj_find_address',
          description: 'Find 14 Copper Street',
          type: 'visit',
          target: 'marker_burned_building',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Ask the locals about Copper Street.',
          mapMarker: {
            locationId: 'dusty_springs',
            markerLabel: 'The Address',
          },
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [],
        reputation: {},
      },
    },

    // Stage 2: Investigation
    {
      id: 'stage_2_investigation',
      title: 'Investigate the Burned Building',
      description:
        'The address from the letter is now a burned ruin. Someone didn\'t want you finding what was here. Look for clues.',
      onStartText:
        'The building burned down within the last week. Charred timbers and ash. But fires leave traces...',
      onCompleteText:
        'You found evidence this was a Freeminer safehouse. And something else - a partial manifest mentioning "The Old Works."',
      objectives: [
        {
          id: 'obj_search_ruins',
          description: 'Search the burned building for clues',
          type: 'interact',
          target: 'ruins_search',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Sift through the rubble carefully.',
        },
        {
          id: 'obj_find_manifest',
          description: 'Find the hidden manifest',
          type: 'collect',
          target: 'item_partial_manifest',
          count: 1,
          current: 0,
          optional: false,
          hidden: true, // Revealed after searching
          hint: 'Check beneath the floorboards.',
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 10,
        items: [{ itemId: 'item_partial_manifest', quantity: 1 }],
        reputation: {},
      },
    },

    // Stage 3: The Sheriff
    {
      id: 'stage_3_sheriff',
      title: 'Talk to Sheriff Cole',
      description:
        'Sheriff Marcus Cole might know something about the fire. He\'s an honest man in a town full of IVRC influence.',
      onStartText:
        'The Sheriff\'s office is on Main Street. Cole has a reputation for being one of the few straight shooters left.',
      onCompleteText:
        'Cole confirmed your suspicions. IVRC "inspectors" came through asking questions about a Freeminer named Samuel Ironpick. He suggests you head to Freeminer\'s Hollow if you want answers.',
      objectives: [
        {
          id: 'obj_find_sheriff',
          description: 'Find Sheriff Cole at the Sheriff\'s Office',
          type: 'visit',
          target: 'dusty_springs_sheriff_office',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: 'dusty_springs',
            markerLabel: 'Sheriff\'s Office',
          },
        },
        {
          id: 'obj_talk_sheriff',
          description: 'Ask Sheriff Cole about the fire',
          type: 'talk',
          target: 'npc_sheriff_cole',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'He might be cautious at first. Show him the manifest.',
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 0,
        items: [],
        reputation: { law: 10 },
      },
    },

    // Stage 4: Follow the Leads
    {
      id: 'stage_4_freeminers',
      title: 'Travel to Freeminer\'s Hollow',
      description:
        'Sheriff Cole pointed you toward Freeminer\'s Hollow in the Iron Mountains. Someone there knows why IVRC wanted that safehouse destroyed.',
      onStartText:
        'The road to Freeminer\'s Hollow is long and passes through rough country. Watch yourself.',
      onCompleteText:
        'You\'ve reached Freeminer\'s Hollow. Old Samuel Ironpick eyes you warily but recognizes the gear symbol. "Your parent sent that letter," he says. "Before IVRC killed them."',
      objectives: [
        {
          id: 'obj_travel_hollow',
          description: 'Travel to Freeminer\'s Hollow',
          type: 'visit',
          target: 'freeminer_hollow',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: 'freeminer_hollow',
            markerLabel: 'Freeminer\'s Hollow',
          },
        },
        {
          id: 'obj_find_samuel',
          description: 'Find Old Samuel Ironpick',
          type: 'talk',
          target: 'npc_samuel_ironpick',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'The leader of the Freeminers should be in the main lodge.',
        },
      ],
      stageRewards: {
        xp: 100,
        gold: 25,
        items: [],
        reputation: { freeminers: 25 },
      },
    },
  ],

  rewards: {
    xp: 200,
    gold: 100,
    items: [],
    reputation: { freeminers: 50 },
    unlocksQuests: ['main_the_reclamation'],
  },
};

// ============================================================================
// SIDE QUEST: MISSING CATTLE
// ============================================================================

/**
 * Missing Cattle - Side quest from Silas Blackwood
 *
 * Silas Blackwood's cattle are being stolen. Investigation reveals
 * a connection to the Copperhead Gang.
 */
export const MissingCattle: Quest = {
  id: 'side_missing_cattle',
  title: 'Missing Cattle',
  description:
    'Silas Blackwood of Sunset Ranch reports that his cattle have been disappearing. He suspects rustlers but needs proof.',
  type: 'side',
  giverNpcId: 'npc_silas_blackwood',
  startLocationId: 'sunset_ranch',
  recommendedLevel: 2,
  tags: ['side', 'investigation', 'copperhead', 'ranch'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    // Stage 1: Investigation
    {
      id: 'stage_cattle_investigate',
      title: 'Investigate the Rustling',
      description:
        'Silas has lost a dozen head this month alone. Check the pastures for signs of how the cattle are being taken.',
      onStartText:
        'Blackwood\'s foreman Rosa will show you where the cattle were last seen. Keep your eyes open for tracks.',
      onCompleteText:
        'The tracks lead west toward the badlands. Someone\'s driving the cattle through a hidden canyon pass.',
      objectives: [
        {
          id: 'obj_talk_rosa',
          description: 'Speak with Rosa Martinez, the foreman',
          type: 'talk',
          target: 'npc_rosa_martinez',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_find_tracks',
          description: 'Find cattle tracks in the west pasture',
          type: 'visit',
          target: 'marker_west_pasture',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Check near the fence line.',
        },
        {
          id: 'obj_follow_tracks',
          description: 'Follow the tracks to their source',
          type: 'visit',
          target: 'marker_canyon_entrance',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 30,
        gold: 0,
        items: [],
        reputation: {},
      },
    },

    // Stage 2: Confrontation
    {
      id: 'stage_cattle_confront',
      title: 'Confront the Rustlers',
      description:
        'The trail leads to a Copperhead operation. Deal with the rustlers and recover evidence for Blackwood.',
      onStartText:
        'You\'ve found a hidden corral. Copperhead bandits are rebranding the cattle. This won\'t be pretty.',
      onCompleteText:
        'The rustlers are dealt with. You found a ledger showing this operation has been running for months - and Rosa\'s name is in it.',
      objectives: [
        {
          id: 'obj_defeat_rustlers',
          description: 'Defeat the rustlers',
          type: 'kill',
          target: 'enemy_rustler',
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
        },
        {
          id: 'obj_get_ledger',
          description: 'Retrieve the rustling ledger',
          type: 'collect',
          target: 'item_rustling_ledger',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 50,
        gold: 20,
        items: [],
        reputation: {},
      },
    },

    // Stage 3: Resolution
    {
      id: 'stage_cattle_resolve',
      title: 'Report to Blackwood',
      description:
        'Return to Silas Blackwood with the evidence. The ledger implicates his own foreman.',
      onStartText:
        'Rosa\'s name is in this ledger. Blackwood needs to know, but this will hurt him.',
      onCompleteText:
        'Blackwood is devastated but grateful for the truth. He pays you well and promises to "handle" Rosa.',
      objectives: [
        {
          id: 'obj_return_blackwood',
          description: 'Return to Silas Blackwood with the ledger',
          type: 'talk',
          target: 'npc_silas_blackwood',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: 'sunset_ranch',
            markerLabel: 'Sunset Ranch',
          },
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [],
        reputation: {},
      },
    },
  ],

  rewards: {
    xp: 75,
    gold: 75,
    items: [{ itemId: 'item_blackwood_rifle', quantity: 1 }],
    reputation: { ranch: 20, copperhead: -15 },
    unlocksQuests: [],
  },
};

// ============================================================================
// SIDE QUEST: DOC'S DILEMMA
// ============================================================================

/**
 * Doc's Dilemma - Side quest from Doc Chen Wei
 *
 * The town doctor needs medical supplies that are hard to come by.
 * Player must retrieve them from Junction City or Coppertown.
 */
export const DocsDilemma: Quest = {
  id: 'side_docs_dilemma',
  title: 'Doc\'s Dilemma',
  description:
    'Doc Chen Wei is running low on critical medical supplies. The nearest source is either Junction City (expensive) or Coppertown (dangerous).',
  type: 'side',
  giverNpcId: 'npc_doc_chen_wei',
  startLocationId: 'dusty_springs',
  recommendedLevel: 2,
  tags: ['side', 'delivery', 'choice', 'medical'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: [],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    // Stage 1: Get the List
    {
      id: 'stage_doc_list',
      title: 'Get the Supply List',
      description:
        'Doc Chen Wei will give you a list of what\'s needed. You\'ll have to decide where to get it.',
      onStartText:
        'The Doc\'s clinic is small but clean. "I\'m treating copper lung, snake bites, and worse," he says. "Without these supplies, people will die."',
      onCompleteText:
        'You have the list. Junction City has a proper pharmacy but IVRC prices. Coppertown\'s company store is cheaper but... it\'s Coppertown.',
      objectives: [
        {
          id: 'obj_talk_doc',
          description: 'Speak with Doc Chen Wei about supplies',
          type: 'talk',
          target: 'npc_doc_chen_wei',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: 'dusty_springs',
            markerLabel: 'Doc\'s Clinic',
          },
        },
        {
          id: 'obj_get_list',
          description: 'Receive the supply list',
          type: 'collect',
          target: 'item_supply_list',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
        },
      ],
      stageRewards: {
        xp: 15,
        gold: 0,
        items: [{ itemId: 'item_supply_list', quantity: 1 }],
        reputation: {},
      },
    },

    // Stage 2: Acquire Supplies (choose path)
    {
      id: 'stage_doc_acquire',
      title: 'Acquire Medical Supplies',
      description:
        'Get the medical supplies from either Junction City or Coppertown. Each has its challenges.',
      onStartText:
        'Junction City is safer but the IVRC pharmacy charges through the nose. Coppertown\'s company store is cheaper, but that town belongs to IVRC body and soul.',
      onCompleteText:
        'You\'ve secured the supplies. Now get them back to Doc before someone gets hurt.',
      objectives: [
        {
          id: 'obj_junction_supplies',
          description: 'Purchase supplies in Junction City',
          type: 'interact',
          target: 'junction_pharmacy',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Costs 50 gold but no trouble.',
          mapMarker: {
            locationId: 'junction_city',
            markerLabel: 'IVRC Pharmacy',
          },
        },
        {
          id: 'obj_coppertown_supplies',
          description: 'Acquire supplies in Coppertown',
          type: 'interact',
          target: 'coppertown_store',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Costs 20 gold but you might attract attention.',
          mapMarker: {
            locationId: 'coppertown',
            markerLabel: 'Company Store',
          },
        },
      ],
      stageRewards: {
        xp: 40,
        gold: 0,
        items: [{ itemId: 'item_medical_supplies', quantity: 1 }],
        reputation: {},
      },
    },

    // Stage 3: Delivery
    {
      id: 'stage_doc_deliver',
      title: 'Deliver to Doc',
      description: 'Bring the medical supplies back to Doc Chen Wei in Dusty Springs.',
      onStartText: 'The supplies are heavy but lives depend on getting them back.',
      onCompleteText:
        'Doc Chen Wei is relieved. "You\'ve saved lives today, stranger. That\'s worth more than gold." He presses payment into your hands anyway.',
      objectives: [
        {
          id: 'obj_deliver_supplies',
          description: 'Deliver supplies to Doc Chen Wei',
          type: 'deliver',
          target: 'item_medical_supplies',
          deliverTo: 'npc_doc_chen_wei',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          mapMarker: {
            locationId: 'dusty_springs',
            markerLabel: 'Doc\'s Clinic',
          },
        },
      ],
      stageRewards: {
        xp: 25,
        gold: 0,
        items: [],
        reputation: { townfolk: 15 },
      },
    },
  ],

  rewards: {
    xp: 60,
    gold: 40,
    items: [{ itemId: 'item_healing_tonic', quantity: 3 }],
    reputation: { townfolk: 10 },
    unlocksQuests: [],
  },
};

// ============================================================================
// QUEST REGISTRY
// ============================================================================

/**
 * All quests indexed by ID for quick lookup.
 */
export const QUESTS_BY_ID: Record<string, Quest> = {
  [TheInheritance.id]: TheInheritance,
  [MissingCattle.id]: MissingCattle,
  [DocsDilemma.id]: DocsDilemma,
};

/**
 * Quests organized by type.
 */
export const QUESTS_BY_TYPE: Record<string, Quest[]> = {
  main: [TheInheritance],
  side: [MissingCattle, DocsDilemma],
  faction: [],
  bounty: [],
  delivery: [],
  exploration: [],
};

/**
 * All quest IDs.
 */
export const ALL_QUEST_IDS = Object.keys(QUESTS_BY_ID);

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get a quest by its ID.
 */
export function getQuestById(questId: string): Quest | undefined {
  return QUESTS_BY_ID[questId];
}

/**
 * Get all quests of a specific type.
 */
export function getQuestsByType(type: string): Quest[] {
  return QUESTS_BY_TYPE[type] ?? [];
}

/**
 * Get all quests available at a specific location.
 */
export function getQuestsAtLocation(locationId: string): Quest[] {
  return Object.values(QUESTS_BY_ID).filter(
    quest => quest.startLocationId === locationId
  );
}

/**
 * Get all quests given by a specific NPC.
 */
export function getQuestsByNPC(npcId: string): Quest[] {
  return Object.values(QUESTS_BY_ID).filter(
    quest => quest.giverNpcId === npcId
  );
}

/**
 * Get all quests with a specific tag.
 */
export function getQuestsByTag(tag: string): Quest[] {
  return Object.values(QUESTS_BY_ID).filter(quest => quest.tags.includes(tag));
}

/**
 * Check if a quest's prerequisites are met.
 */
export function arePrerequisitesMet(
  quest: Quest,
  completedQuestIds: string[],
  playerLevel: number,
  factionRep: Record<string, number>
): boolean {
  const prereqs = quest.prerequisites;

  // Check completed quests
  if (!prereqs.completedQuests.every(qid => completedQuestIds.includes(qid))) {
    return false;
  }

  // Check player level
  if (prereqs.minLevel && playerLevel < prereqs.minLevel) {
    return false;
  }

  // Check faction reputation
  for (const [factionId, minRep] of Object.entries(prereqs.factionReputation)) {
    if ((factionRep[factionId] ?? 0) < minRep) {
      return false;
    }
  }

  return true;
}
