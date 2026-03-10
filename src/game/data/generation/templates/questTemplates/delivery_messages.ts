/**
 * Delivery Quest Templates - Messages & Packages
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const DELIVERY_MESSAGE_TEMPLATES: QuestTemplate[] = [
  {
    id: 'deliver_message',
    name: 'Message Delivery',
    archetype: 'deliver_message',
    questType: 'delivery',
    titleTemplates: [
      'Urgent Message for {{target}}',
      'Deliver the Letter',
      'Correspondence to {{destination}}',
    ],
    descriptionTemplates: [
      '{{giver}} needs an important message delivered to {{target}}.',
      'This letter must reach {{target}} in {{destination}}. Time is critical.',
      'Can you deliver this correspondence? The telegraph is down.',
    ],
    stages: [
      {
        titleTemplate: 'Deliver the Message',
        descriptionTemplate: 'Find {{target}} and deliver the message.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Deliver message to {{target}}',
            targetType: 'npc',
            targetTags: ['recipient'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: '{{target}} should be in {{destination}}.',
          },
        ],
        onCompleteTextTemplate: 'The message was delivered.',
      },
    ],
    rewards: {
      xpRange: [15, 25],
      goldRange: [10, 20],
      itemTags: [],
      itemChance: 0.05,
      reputationImpact: {},
    },
    levelRange: [1, 3],
    giverRoles: ['mayor', 'shopkeeper', 'banker'],
    giverFactions: ['townfolk', 'ivrc'],
    validLocationTypes: ['town'],
    tags: ['delivery', 'simple', 'travel'],
    repeatable: true,
    cooldownHours: 12,
  },
  {
    id: 'deliver_secret_message',
    name: 'Secret Correspondence',
    archetype: 'deliver_message',
    questType: 'delivery',
    titleTemplates: ['Secret Message', 'Confidential Delivery', 'Coded Dispatch'],
    descriptionTemplates: [
      '{{giver}} has a sensitive message for their contact at {{destination}}. Be discreet.',
      'This coded message must reach {{target}} without IVRC knowing.',
      "Deliver this letter to {{destination}}, but don't let anyone see you.",
    ],
    stages: [
      {
        titleTemplate: 'Make Contact',
        descriptionTemplate: 'Find {{target}} at {{destination}} discreetly.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'hideout'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Use back alleys and avoid main streets.',
          },
          {
            type: 'deliver',
            descriptionTemplate: 'Pass the message to {{target}}',
            targetType: 'npc',
            targetTags: ['contact', 'spy'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Message delivered. {{target}} nods and disappears.',
      },
    ],
    rewards: {
      xpRange: [30, 50],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        freeminers: [5, 10],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['rebel', 'informant', 'union_organizer'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['town', 'mine'],
    tags: ['delivery', 'stealth', 'resistance'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'deliver_package',
    name: 'Package Delivery',
    archetype: 'deliver_package',
    questType: 'delivery',
    titleTemplates: ['Deliver to {{target}}', 'Package for {{destination}}', 'Special Delivery'],
    descriptionTemplates: [
      '{{giver}} has a package that needs to reach {{target}} safely.',
      "This crate is valuable. Don't let anything happen to it.",
      'Deliver this to {{target}} in {{destination}}. Handle with care.',
    ],
    stages: [
      {
        titleTemplate: 'Make the Delivery',
        descriptionTemplate: 'Transport the package to {{target}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Deliver package to {{target}}',
            targetType: 'npc',
            targetTags: ['recipient'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Package delivered safely.',
      },
    ],
    rewards: {
      xpRange: [20, 35],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [2, 5],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['shopkeeper', 'merchant'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['delivery', 'cargo'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'deliver_supplies',
    name: 'Supply Delivery',
    archetype: 'deliver_package',
    questType: 'delivery',
    titleTemplates: ['Supplies to {{destination}}', 'Supply Run', 'Goods for {{target}}'],
    descriptionTemplates: [
      '{{giver}} needs these supplies delivered to {{destination}}.',
      '{{target}} at {{destination}} is waiting for this shipment.',
      'These goods must reach {{destination}} intact.',
    ],
    stages: [
      {
        titleTemplate: 'Deliver the Supplies',
        descriptionTemplate: 'Bring the supplies to {{target}} at {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Travel to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'ranch', 'mine', 'outpost'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'deliver',
            descriptionTemplate: 'Hand over the supplies',
            targetType: 'npc',
            targetTags: ['recipient'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '"Everything\'s here. Much obliged."',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [20, 40],
      itemTags: ['consumable'],
      itemChance: 0.15,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['merchant', 'quartermaster', 'shopkeeper'],
    giverFactions: ['townfolk', 'ivrc', 'freeminers'],
    validLocationTypes: ['town', 'depot'],
    tags: ['delivery', 'supplies'],
    repeatable: true,
    cooldownHours: 18,
  },
];
