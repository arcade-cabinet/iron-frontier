/**
 * Economic Quest Templates - Debt Collection
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const ECONOMIC_DEBT_TEMPLATES: QuestTemplate[] = [
  {
    id: 'collect_debt',
    name: 'Debt Collection',
    archetype: 'debt_collection',
    questType: 'side',
    titleTemplates: ['Collect from {{target}}', 'Outstanding Debt', 'Payment Due'],
    descriptionTemplates: [
      '{{target}} owes {{giver}} money. Collect it.',
      'That debt has been outstanding for too long.',
      '{{giver}} needs you to convince {{target}} to pay up.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Debtor',
        descriptionTemplate: 'Locate {{target}}.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Find {{target}}',
            targetType: 'npc',
            targetTags: ['debtor'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Collect the Debt',
        descriptionTemplate: 'Get the money.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Collect payment from {{target}}',
            targetType: 'npc',
            targetTags: ['debtor'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Persuasion or intimidation - your choice.',
          },
        ],
        onCompleteTextTemplate: 'You collected the debt.',
      },
    ],
    rewards: {
      xpRange: [20, 40],
      goldRange: [20, 45],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['banker', 'shopkeeper', 'merchant'],
    giverFactions: ['townfolk', 'ivrc'],
    validLocationTypes: ['town'],
    tags: ['economic', 'collection'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'collect_company_debt',
    name: 'IVRC Debt Collection',
    archetype: 'debt_collection',
    questType: 'side',
    titleTemplates: ['Company Debts', 'IVRC Collection', 'Corporate Recovery'],
    descriptionTemplates: [
      'IVRC has outstanding debts from miners at {{destination}}. Collect.',
      '{{giver}} needs company money recovered from workers who skipped payments.',
      'Some folks owe IVRC. Time to settle accounts.',
    ],
    stages: [
      {
        titleTemplate: 'Collect Debts',
        descriptionTemplate: 'Visit the debtors and collect payment.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'mine'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Collect from debtors',
            targetType: 'npc',
            targetTags: ['debtor', 'worker'],
            countRange: [2, 4],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Debts collected.',
      },
    ],
    rewards: {
      xpRange: [30, 55],
      goldRange: [35, 70],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        ivrc: [5, 12],
        freeminers: [-5, -12],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['company_agent', 'accountant', 'foreman'],
    giverFactions: ['ivrc'],
    validLocationTypes: ['town', 'mine'],
    tags: ['economic', 'collection', 'ivrc'],
    repeatable: true,
    cooldownHours: 36,
  },
];
