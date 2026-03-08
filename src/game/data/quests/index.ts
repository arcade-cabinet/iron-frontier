/**
 * Iron Frontier - Quest Library
 *
 * All quest definitions for the game.
 * Quests are organized by type (main, side, faction).
 *
 * Main Quest: "The Inheritance" - 4 acts following the story bible
 * Side Quests: Optional adventures that enrich the world
 *
 * All quest text is written for first-person 3D perspective.
 * Objectives include markerTarget fields for 3D spatial tracking
 * and completionRadius for proximity-based auto-completion.
 */

import type { Quest } from '../schemas/quest';

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
    'A mysterious letter brought you to Dusty Springs to claim something at an address that doesn\'t seem to exist. The letter is signed only with a gear symbol.',
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
        'You stepped off the last train into Dusty Springs. Find the address mentioned in the mysterious letter.',
      onStartText:
        'The train hisses to a stop. Dusty Springs. The letter said to find "14 Copper Street." Look around and get your bearings.',
      onCompleteText:
        'The address leads to a burned-out lot. Whatever was here is gone, but the fire looks recent.',
      objectives: [
        {
          id: 'obj_explore_town',
          description: 'Look around Dusty Springs and get your bearings',
          type: 'visit',
          target: 'dusty_springs',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Walk down the main street and take in the sights.',
          markerTarget: {
            type: 'location',
            locationId: 'dusty_springs',
          },
          completionRadius: 30,
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
          hint: 'Ask the locals about Copper Street. Look for the building with the collapsed roof on the east side of town.',
          mapMarker: {
            locationId: 'dusty_springs',
            markerLabel: 'The Address',
          },
          markerTarget: {
            type: 'building',
            buildingId: 'burned_building_01',
            locationId: 'dusty_springs',
          },
          completionRadius: 8,
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
        'The address from the letter is now a burned ruin. Someone didn\'t want you finding what was here. Search the rubble for clues.',
      onStartText:
        'The building burned down within the last week. Charred timbers and ash surround you. But fires leave traces...',
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
          hint: 'Walk up to the rubble and sift through it carefully.',
          markerTarget: {
            type: 'building',
            buildingId: 'burned_building_01',
            locationId: 'dusty_springs',
          },
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
        'The Sheriff\'s office is down Main Street - look for the star on the door. Cole has a reputation for being one of the few straight shooters left.',
      onCompleteText:
        'Cole confirmed your suspicions. IVRC "inspectors" came through asking questions about a Freeminer named Samuel Ironpick. He suggests you head to Freeminer\'s Hollow if you want answers.',
      objectives: [
        {
          id: 'obj_find_sheriff',
          description: 'Head to the Sheriff\'s Office on Main Street',
          type: 'visit',
          target: 'dusty_springs_sheriff_office',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Look for the wooden building with the star sign hanging out front, down Main Street.',
          mapMarker: {
            locationId: 'dusty_springs',
            markerLabel: "Sheriff's Office",
          },
          markerTarget: {
            type: 'building',
            buildingId: 'dusty_springs_sheriff_office',
            locationId: 'dusty_springs',
          },
          completionRadius: 5,
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
          hint: 'Walk up to him and show him the manifest. He might be cautious at first.',
          markerTarget: {
            type: 'npc',
            npcId: 'npc_sheriff_cole',
          },
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
      title: "Travel to Freeminer's Hollow",
      description:
        'Sheriff Cole pointed you toward Freeminer\'s Hollow in the Iron Mountains. Someone there knows why IVRC wanted that safehouse destroyed.',
      onStartText:
        'The road to Freeminer\'s Hollow stretches into rough country ahead. Watch your step.',
      onCompleteText:
        'You\'ve reached Freeminer\'s Hollow. Old Samuel Ironpick eyes you warily but recognizes the gear symbol. "Your parent sent that letter," he says. "Before IVRC killed them."',
      objectives: [
        {
          id: 'obj_travel_hollow',
          description: "Head to Freeminer's Hollow",
          type: 'visit',
          target: 'freeminer_hollow',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Follow the mountain road north. The Hollow is nestled in the Iron Mountains.',
          mapMarker: {
            locationId: 'freeminer_hollow',
            markerLabel: "Freeminer's Hollow",
          },
          markerTarget: {
            type: 'location',
            locationId: 'freeminer_hollow',
          },
          completionRadius: 15,
        },
        {
          id: 'obj_find_samuel',
          description: 'Find and speak to Old Samuel Ironpick',
          type: 'talk',
          target: 'npc_samuel_ironpick',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Look for the old man in the main lodge at the center of the settlement.',
          markerTarget: {
            type: 'npc',
            npcId: 'npc_samuel_ironpick',
          },
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
    'Silas Blackwood at Sunset Ranch says his cattle have been vanishing. He suspects rustlers but needs someone to find proof.',
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
        'Silas has lost a dozen head this month alone. Walk the pastures and look for signs of how the cattle are being taken.',
      onStartText:
        'Blackwood\'s foreman Rosa can show you where the cattle were last seen. Keep your eyes open for tracks on the ground.',
      onCompleteText:
        'The tracks lead west toward the badlands. Someone\'s been driving the cattle through a hidden canyon pass.',
      objectives: [
        {
          id: 'obj_talk_rosa',
          description: 'Find and speak with Rosa Martinez, the ranch foreman',
          type: 'talk',
          target: 'npc_rosa_martinez',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'She should be near the barn or out in the fields.',
          markerTarget: {
            type: 'npc',
            npcId: 'npc_rosa_martinez',
          },
        },
        {
          id: 'obj_find_tracks',
          description: 'Search the west pasture for cattle tracks',
          type: 'visit',
          target: 'marker_west_pasture',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Head west from the barn. Look near the broken fence line for disturbed ground.',
          markerTarget: {
            type: 'marker',
            markerId: 'marker_west_pasture',
            locationId: 'sunset_ranch',
          },
          completionRadius: 8,
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
          hint: 'The tracks lead into the rocky badlands to the west. Look for a narrow canyon opening.',
          markerTarget: {
            type: 'marker',
            markerId: 'marker_canyon_entrance',
            locationId: 'sunset_ranch',
          },
          completionRadius: 10,
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
        'The trail leads to a Copperhead operation hidden in the canyon. Deal with the rustlers and find evidence for Blackwood.',
      onStartText:
        'You can see a hidden corral ahead. Copperhead bandits are rebranding the cattle. This won\'t be pretty.',
      onCompleteText:
        'The rustlers are dealt with. You found a ledger showing this operation has been running for months - and Rosa\'s name is in it.',
      objectives: [
        {
          id: 'obj_defeat_rustlers',
          description: 'Take down the rustlers',
          type: 'kill',
          target: 'enemy_rustler',
          count: 3,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Three armed men guard the stolen cattle.',
        },
        {
          id: 'obj_get_ledger',
          description: 'Pick up the rustling ledger',
          type: 'collect',
          target: 'item_rustling_ledger',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Check the crates near the campfire after dealing with the rustlers.',
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
        'Bring the ledger back to Silas Blackwood at Sunset Ranch. The evidence implicates his own foreman.',
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
          hint: 'Head back to the ranch house at Sunset Ranch.',
          mapMarker: {
            locationId: 'sunset_ranch',
            markerLabel: 'Sunset Ranch',
          },
          markerTarget: {
            type: 'npc',
            npcId: 'npc_silas_blackwood',
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
  title: "Doc's Dilemma",
  description:
    'Doc Chen Wei is running low on critical medical supplies. You can get them from Junction City - expensive but safe - or Coppertown, where they\'re cheap but the town belongs to IVRC.',
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
        'Visit Doc Chen Wei at his clinic to get the list of supplies he needs. You\'ll have to decide where to get them.',
      onStartText:
        'The Doc\'s clinic is small but clean. "I\'m treating copper lung, snake bites, and worse," he says. "Without these supplies, people will die."',
      onCompleteText:
        'You have the list. Junction City has a proper pharmacy but charges IVRC prices. Coppertown\'s company store is cheaper but... it\'s Coppertown.',
      objectives: [
        {
          id: 'obj_talk_doc',
          description: 'Speak with Doc Chen Wei about what he needs',
          type: 'talk',
          target: 'npc_doc_chen_wei',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'His clinic is the small building with a cross painted on the door, on the south end of Main Street.',
          mapMarker: {
            locationId: 'dusty_springs',
            markerLabel: "Doc's Clinic",
          },
          markerTarget: {
            type: 'npc',
            npcId: 'npc_doc_chen_wei',
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
        'Get the medical supplies. Junction City is the safe route - Coppertown is cheaper but dangerous.',
      onStartText:
        'Junction City is safer but the IVRC pharmacy charges through the nose. Coppertown\'s company store is cheaper, but that town belongs to IVRC body and soul.',
      onCompleteText:
        'You\'ve secured the supplies. Now get them back to Doc before someone gets hurt.',
      objectives: [
        {
          id: 'obj_junction_supplies',
          description: 'Purchase supplies at the Junction City pharmacy',
          type: 'interact',
          target: 'junction_pharmacy',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Head to Junction City. The pharmacy is the large storefront near the train station. Costs 50 gold.',
          mapMarker: {
            locationId: 'junction_city',
            markerLabel: 'IVRC Pharmacy',
          },
          markerTarget: {
            type: 'building',
            buildingId: 'junction_pharmacy',
            locationId: 'junction_city',
          },
        },
        {
          id: 'obj_coppertown_supplies',
          description: 'Acquire supplies from Coppertown\'s company store',
          type: 'interact',
          target: 'coppertown_store',
          count: 1,
          current: 0,
          optional: true,
          hidden: false,
          hint: 'Head to Coppertown. The company store is on the main drag. Costs 20 gold but you might attract attention.',
          mapMarker: {
            locationId: 'coppertown',
            markerLabel: 'Company Store',
          },
          markerTarget: {
            type: 'building',
            buildingId: 'coppertown_store',
            locationId: 'coppertown',
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
      onStartText: 'The supplies are heavy but lives depend on getting them back. Head to the clinic.',
      onCompleteText:
        'Doc Chen Wei is relieved. "You\'ve saved lives today, stranger. That\'s worth more than gold." He presses payment into your hands anyway.',
      objectives: [
        {
          id: 'obj_deliver_supplies',
          description: 'Bring the supplies to Doc Chen Wei',
          type: 'deliver',
          target: 'item_medical_supplies',
          deliverTo: 'npc_doc_chen_wei',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Head back to the clinic in Dusty Springs and hand the supplies to Doc.',
          mapMarker: {
            locationId: 'dusty_springs',
            markerLabel: "Doc's Clinic",
          },
          markerTarget: {
            type: 'npc',
            npcId: 'npc_doc_chen_wei',
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
  return Object.values(QUESTS_BY_ID).filter((quest) => quest.startLocationId === locationId);
}

/**
 * Get all quests given by a specific NPC.
 */
export function getQuestsByNPC(npcId: string): Quest[] {
  return Object.values(QUESTS_BY_ID).filter((quest) => quest.giverNpcId === npcId);
}

/**
 * Get all quests with a specific tag.
 */
export function getQuestsByTag(tag: string): Quest[] {
  return Object.values(QUESTS_BY_ID).filter((quest) => quest.tags.includes(tag));
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
  if (!prereqs.completedQuests.every((qid) => completedQuestIds.includes(qid))) {
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
