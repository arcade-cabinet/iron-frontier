import type { Quest } from '../schemas/quest.ts';

type Stage = Quest['stages'][number];

/** Stages 4-5 of The Reclamation */
export const reclamationStages1: Stage[] = [
  // Stage 4: Rally the Miners
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
        id: 'obj_convince_samuel',
        description: 'Show Samuel the IVRC manifest and convince him to fight',
        type: 'talk',
        target: 'samuel_ironpick',
        count: 1,
        current: 0,
        optional: false,
        hidden: false,
        hint: 'Samuel is cautious. The manifest proving IVRC is mining starcite illegally should convince him.',
        markerTarget: {
          type: 'npc',
          npcId: 'samuel_ironpick',
        },
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
    stageRewards: {
      xp: 75,
      gold: 0,
      items: [],
      reputation: { freeminers: 25 },
    },
  },

  // Stage 5: Reclaim the Mine
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
    stageRewards: {
      xp: 150,
      gold: 50,
      items: [],
      reputation: { freeminers: 30 },
    },
  },
];
