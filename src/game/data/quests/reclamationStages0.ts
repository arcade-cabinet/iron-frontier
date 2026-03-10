import type { Quest } from '../schemas/quest.ts';

type Stage = Quest['stages'][number];

/** Stages 1-3 of The Reclamation */
export const reclamationStages0: Stage[] = [
  // Stage 1: Reach the Mine
  {
    id: 'stage_1_find_mine',
    title: 'Find the Ironpick Mine',
    description:
      'Samuel marked the family mine on your map. Head into the Iron Mountains and find the old Ironpick claim before IVRC strips it bare.',
    onStartText:
      'Samuel\'s hand trembles as he sketches a map. "The mine entrance is hidden behind a rockslide your parent set up years ago. IVRC\'s been blasting through it. Hurry."',
    onCompleteText:
      'The mine entrance is wide open — blasting charges have torn away the rockslide camouflage. Fresh bootprints and rail tracks lead inside. IVRC is already here.',
    objectives: [
      {
        id: 'obj_talk_samuel_plan',
        description: 'Speak with Samuel about the mine\'s location',
        type: 'talk',
        target: 'samuel_ironpick',
        count: 1,
        current: 0,
        optional: false,
        hidden: false,
        hint: 'Samuel is in the main lodge at Freeminer\'s Hollow.',
        markerTarget: {
          type: 'npc',
          npcId: 'samuel_ironpick',
        },
      },
      {
        id: 'obj_reach_mine',
        description: 'Travel to the Ironpick Mine',
        type: 'visit',
        target: 'ironpick_mine',
        count: 1,
        current: 0,
        optional: false,
        hidden: false,
        hint: 'Follow the mountain trail north from the Hollow. The mine is set into the cliff face.',
        mapMarker: {
          locationId: 'ironpick_mine',
          markerLabel: 'Ironpick Mine',
        },
        markerTarget: {
          type: 'location',
          locationId: 'ironpick_mine',
        },
        completionRadius: 15,
      },
    ],
    stageRewards: {
      xp: 50,
      gold: 0,
      items: [],
      reputation: { freeminers: 10 },
    },
  },

  // Stage 2: Investigate IVRC Presence
  {
    id: 'stage_2_investigate',
    title: 'Investigate the IVRC Operation',
    description:
      'IVRC has set up a mining operation inside the Ironpick claim. Scout the area and find out what they\'re after and how many men they have.',
    onStartText:
      'Lantern light flickers from inside the mine. You can hear pickaxes and shouted orders. Time to see what IVRC is doing in your family\'s mine.',
    onCompleteText:
      'IVRC isn\'t just mining copper — they\'re extracting a rare ore called "starcite." The manifest shows they\'re shipping it to Cornelius Thorne directly. This is bigger than a land grab.',
    objectives: [
      {
        id: 'obj_scout_camp',
        description: 'Scout the IVRC mining camp outside the mine',
        type: 'visit',
        target: 'marker_ivrc_camp',
        count: 1,
        current: 0,
        optional: false,
        hidden: false,
        hint: 'Approach carefully. There\'s a ridge overlooking their camp to the east.',
        markerTarget: {
          type: 'marker',
          markerId: 'marker_ivrc_camp',
          locationId: 'ironpick_mine',
        },
        completionRadius: 12,
      },
      {
        id: 'obj_find_shipping_manifest',
        description: 'Find the IVRC shipping manifest',
        type: 'collect',
        target: 'item_ivrc_manifest',
        count: 1,
        current: 0,
        optional: false,
        hidden: false,
        hint: 'Check the foreman\'s tent. Important documents are usually kept with the boss.',
      },
      {
        id: 'obj_count_guards',
        description: 'Identify the number of IVRC guards',
        type: 'interact',
        target: 'ivrc_guard_count',
        count: 1,
        current: 0,
        optional: true,
        hidden: false,
        hint: 'Observe the guard rotations from the ridge. This information will help when rallying the miners.',
      },
    ],
    stageRewards: {
      xp: 75,
      gold: 15,
      items: [{ itemId: 'item_ivrc_manifest', quantity: 1 }],
      reputation: {},
    },
  },

  // Stage 3: Confront the Foreman
  {
    id: 'stage_3_foreman',
    title: 'Confront the IVRC Foreman',
    description:
      'Foreman Briggs runs the IVRC operation. Confront him with your claim to the mine. He won\'t give it up willingly.',
    onStartText:
      'Foreman Briggs is a bull of a man with a company badge and a short temper. He\'s in the main shaft, supervising the starcite extraction.',
    onCompleteText:
      'Briggs laughed in your face and called for his guards. You barely escaped, but now you know the score: IVRC won\'t leave peacefully. You\'ll need help.',
    objectives: [
      {
        id: 'obj_find_briggs',
        description: 'Find Foreman Briggs in the mine',
        type: 'visit',
        target: 'marker_briggs_office',
        count: 1,
        current: 0,
        optional: false,
        hidden: false,
        hint: 'He operates from a makeshift office deep in the main shaft.',
        markerTarget: {
          type: 'marker',
          markerId: 'marker_briggs_office',
          locationId: 'ironpick_mine',
        },
        completionRadius: 8,
      },
      {
        id: 'obj_confront_briggs',
        description: 'Confront Foreman Briggs about the Ironpick claim',
        type: 'talk',
        target: 'foreman_briggs',
        count: 1,
        current: 0,
        optional: false,
        hidden: false,
        hint: 'Show him the manifest and your family\'s claim. He won\'t be happy.',
        markerTarget: {
          type: 'npc',
          npcId: 'foreman_briggs',
        },
      },
      {
        id: 'obj_escape_guards',
        description: 'Escape or defeat the IVRC guards',
        type: 'kill',
        target: 'enemy_ivrc_guard',
        count: 2,
        current: 0,
        optional: false,
        hidden: true,
        hint: 'Fight your way out or find another exit from the mine.',
      },
    ],
    stageRewards: {
      xp: 100,
      gold: 0,
      items: [],
      reputation: { freeminers: 15 },
    },
  },
];
