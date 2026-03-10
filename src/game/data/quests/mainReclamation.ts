/**
 * Iron Frontier - Main Quest: The Reclamation
 *
 * Continues after The Inheritance. The player arrives at Freeminer's Hollow,
 * discovers the family mine, and faces IVRC opposition to reclaim it.
 */

import type { Quest } from '../schemas/quest';

export const TheReclamation: Quest = {
  id: 'main_the_reclamation',
  title: 'The Reclamation',
  description:
    'Old Samuel Ironpick revealed the truth: your parent was a Freeminer leader, murdered by IVRC. The family mine in the Iron Mountains is your birthright — but IVRC has already moved in. Take it back.',
  type: 'main',
  giverNpcId: 'samuel_ironpick',
  startLocationId: 'freeminer_hollow',
  recommendedLevel: 3,
  tags: ['main', 'combat', 'ivrc', 'freeminers', 'mine'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['main_the_inheritance'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
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
          markerTarget: { type: 'npc', npcId: 'samuel_ironpick' },
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
          mapMarker: { locationId: 'ironpick_mine', markerLabel: 'Ironpick Mine' },
          markerTarget: { type: 'location', locationId: 'ironpick_mine' },
          completionRadius: 15,
        },
      ],
      stageRewards: { xp: 50, gold: 0, items: [], reputation: { freeminers: 10 } },
    },
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
          markerTarget: { type: 'npc', npcId: 'foreman_briggs' },
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
      stageRewards: { xp: 100, gold: 0, items: [], reputation: { freeminers: 15 } },
    },
    {
      id: 'stage_4_rally',
      title: 'Rally the Freeminers',
      description:
        'IVRC has too many guards for you alone. Return to Freeminer\'s Hollow and convince the miners to join your cause.',
      onStartText:
        'You need allies. The Freeminers have been pushed around by IVRC for years — maybe it\'s time they pushed back. Samuel can help rally them, but you\'ll need to earn their trust.',
      onCompleteText:
        'The miners are with you. Picks, shovels, and old rifles in hand, a dozen Freeminers stand ready. Samuel clasps your shoulder. "Your parent would be proud."',
      objectives: [
        {
          id: 'obj_return_hollow',
          description: 'Return to Freeminer\'s Hollow',
          type: 'visit',
          target: 'freeminer_hollow',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Head back down the mountain to the Hollow.',
          mapMarker: { locationId: 'freeminer_hollow', markerLabel: "Freeminer's Hollow" },
          markerTarget: { type: 'location', locationId: 'freeminer_hollow' },
          completionRadius: 15,
        },
        {
          id: 'obj_convince_samuel',
          description: 'Show Samuel the IVRC manifest and convince him to fight',
          type: 'talk',
          target: 'samuel_ironpick',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Samuel is cautious. The manifest proving IVRC is mining starcite illegally should convince him.',
          markerTarget: { type: 'npc', npcId: 'samuel_ironpick' },
        },
        {
          id: 'obj_rally_miners',
          description: 'Speak to the miners and rally support',
          type: 'interact',
          target: 'miner_rally_point',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Gather the miners at the central fire pit and make your case.',
          markerTarget: {
            type: 'marker',
            markerId: 'miner_rally_point',
            locationId: 'freeminer_hollow',
          },
          completionRadius: 10,
        },
      ],
      stageRewards: { xp: 75, gold: 0, items: [], reputation: { freeminers: 25 } },
    },
    {
      id: 'stage_5_reclaim',
      title: 'Reclaim the Ironpick Mine',
      description:
        'Lead the Freeminers back to the mine and drive IVRC out. The mine belongs to you — take it back.',
      onStartText:
        'Dawn breaks over the Iron Mountains. The Freeminers march behind you, grim-faced but determined. Today, the Ironpick Mine comes home.',
      onCompleteText:
        'The last IVRC guard flees down the mountain. The mine is yours. Samuel raises the old Freeminer banner — a gear and pickaxe — over the entrance. "This is just the beginning," he warns. "Thorne won\'t let this stand." But for now, you\'ve won.',
      objectives: [
        {
          id: 'obj_return_mine',
          description: 'Lead the miners back to the Ironpick Mine',
          type: 'visit',
          target: 'ironpick_mine',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'March north along the mountain trail. The miners follow your lead.',
          mapMarker: { locationId: 'ironpick_mine', markerLabel: 'Ironpick Mine' },
          markerTarget: { type: 'location', locationId: 'ironpick_mine' },
          completionRadius: 15,
        },
        {
          id: 'obj_defeat_ivrc_forces',
          description: 'Defeat the IVRC guards at the mine',
          type: 'kill',
          target: 'enemy_ivrc_guard',
          count: 5,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'The miners will fight alongside you. Focus on the armed guards first.',
        },
        {
          id: 'obj_defeat_briggs',
          description: 'Defeat or drive off Foreman Briggs',
          type: 'kill',
          target: 'enemy_foreman_briggs',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'Briggs is tough but outnumbered. He\'ll be the last to give ground.',
        },
        {
          id: 'obj_raise_banner',
          description: 'Raise the Freeminer banner over the mine',
          type: 'interact',
          target: 'mine_flagpole',
          count: 1,
          current: 0,
          optional: false,
          hidden: false,
          hint: 'The flagpole is at the mine entrance. Raise the banner to claim it.',
          markerTarget: {
            type: 'marker',
            markerId: 'mine_flagpole',
            locationId: 'ironpick_mine',
          },
        },
      ],
      stageRewards: { xp: 150, gold: 50, items: [], reputation: { freeminers: 30 } },
    },
  ],

  rewards: {
    xp: 300,
    gold: 200,
    items: [
      { itemId: 'item_ironpick_deed', quantity: 1 },
      { itemId: 'item_starcite_sample', quantity: 3 },
    ],
    reputation: { freeminers: 50, ivrc: -30 },
    unlocksQuests: [],
  },
};
