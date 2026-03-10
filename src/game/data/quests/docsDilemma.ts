import type { Quest } from '../schemas/quest.ts';

export const DocsDilemma: Quest = {
  id: 'side_docs_dilemma',
  title: "Doc's Dilemma",
  description:
    'Doc Chen Wei is running low on critical medical supplies. You can get them from Junction City - expensive but safe - or Coppertown, where they\'re cheap but the town belongs to IVRC.',
  type: 'side',
  giverNpcId: 'doc_chen',
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
          target: 'doc_chen',
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
            npcId: 'doc_chen',
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
          deliverTo: 'doc_chen',
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
            npcId: 'doc_chen',
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
