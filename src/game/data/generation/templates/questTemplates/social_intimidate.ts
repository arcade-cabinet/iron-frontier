/**
 * Social Quest Templates - Intimidation
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';

export const SOCIAL_INTIMIDATE_TEMPLATES: QuestTemplate[] = [
  {
    id: 'intimidate_witness',
    name: 'Silence a Witness',
    archetype: 'intimidate',
    questType: 'side',
    titleTemplates: ['Shut Them Up', 'Silence {{target}}', 'The Quiet Treatment'],
    descriptionTemplates: [
      '{{target}} knows too much. Convince them to keep quiet.',
      'A witness named {{target}} needs to forget what they saw.',
      '{{giver}} needs {{target}} silenced. No violence - just intimidation.',
    ],
    stages: [
      {
        titleTemplate: 'Find {{target}}',
        descriptionTemplate: 'Track down {{target}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'building'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Locate {{target}}',
            targetType: 'npc',
            targetTags: ['witness'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Deliver the Message',
        descriptionTemplate: 'Make {{target}} understand the consequences.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Intimidate {{target}}',
            targetType: 'npc',
            targetTags: ['witness'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Be convincing.',
          },
        ],
        onCompleteTextTemplate: '{{target}} gets the message.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [30, 55],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        law: [-5, -12],
        townfolk: [-3, -8],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['fixer', 'gang_member', 'corrupt_official'],
    giverFactions: ['copperhead', 'neutral'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['social', 'intimidation', 'criminal'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'intimidate_protection',
    name: 'Protection Money',
    archetype: 'intimidate',
    questType: 'side',
    titleTemplates: ['Collect Protection', 'Time to Pay Up', 'Insurance Collection'],
    descriptionTemplates: [
      "{{target}} hasn't paid protection money. Remind them.",
      "Some merchants need a visit. Collect what's owed.",
      '{{giver}} wants their cut. Make sure they pay.',
    ],
    stages: [
      {
        titleTemplate: 'Collect the Payment',
        descriptionTemplate: 'Visit {{target}} and collect.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['shop', 'building'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Collect from {{target}}',
            targetType: 'npc',
            targetTags: ['merchant', 'victim'],
            countRange: [1, 3],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Payment collected.',
      },
    ],
    rewards: {
      xpRange: [30, 50],
      goldRange: [40, 80],
      itemTags: [],
      itemChance: 0.05,
      reputationImpact: {
        townfolk: [-8, -15],
        law: [-5, -12],
        copperhead: [5, 10],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['gang_boss', 'enforcer', 'fixer'],
    giverFactions: ['copperhead'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['social', 'intimidation', 'gang'],
    repeatable: true,
    cooldownHours: 24,
  },
];
