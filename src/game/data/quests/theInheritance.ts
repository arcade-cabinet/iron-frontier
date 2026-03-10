import type { Quest } from '../schemas/quest.ts';

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
          target: 'sheriff_cole',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Walk up to him and show him the manifest. He might be cautious at first.',
          markerTarget: {
            type: 'npc',
            npcId: 'sheriff_cole',
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
          target: 'samuel_ironpick',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Look for the old man in the main lodge at the center of the settlement.',
          markerTarget: {
            type: 'npc',
            npcId: 'samuel_ironpick',
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
