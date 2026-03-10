/**
 * Iron Frontier - Side Quest: Missing Cattle
 *
 * Silas Blackwood's cattle are being stolen. Investigation reveals
 * a connection to the Copperhead Gang.
 */

import type { Quest } from '../schemas/quest';

export const MissingCattle: Quest = {
  id: 'side_missing_cattle',
  title: 'Missing Cattle',
  description:
    'Silas Blackwood at Sunset Ranch says his cattle have been vanishing. He suspects rustlers but needs someone to find proof.',
  type: 'side',
  giverNpcId: 'silas_blackwood',
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
          target: 'rosa_martinez',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'She should be near the barn or out in the fields.',
          markerTarget: { type: 'npc', npcId: 'rosa_martinez' },
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
      stageRewards: { xp: 30, gold: 0, items: [], reputation: {} },
    },
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
      stageRewards: { xp: 50, gold: 20, items: [], reputation: {} },
    },
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
          target: 'silas_blackwood',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Head back to the ranch house at Sunset Ranch.',
          mapMarker: { locationId: 'sunset_ranch', markerLabel: 'Sunset Ranch' },
          markerTarget: { type: 'npc', npcId: 'silas_blackwood' },
        },
      ],
      stageRewards: { xp: 25, gold: 0, items: [], reputation: {} },
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
