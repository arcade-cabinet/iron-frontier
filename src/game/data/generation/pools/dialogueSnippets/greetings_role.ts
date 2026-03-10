/**
 * Role-specific and Farewell Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const FAREWELL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'farewell_friendly_1',
    category: 'farewell',
    textTemplates: [
      'Safe travels, friend.',
      'Come back anytime!',
      'Take care of yourself out there.',
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['friendly'],
  },
  {
    id: 'farewell_friendly_2',
    category: 'farewell',
    textTemplates: [
      'Watch yourself on those roads, you hear?',
      "Don't be a stranger now!",
      'May fortune smile on your journey.',
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['friendly', 'warm'],
  },
  {
    id: 'farewell_neutral_1',
    category: 'farewell',
    textTemplates: ['Yeah, see ya.', 'Bye.', 'Watch yourself.'],
    tags: ['neutral'],
  },
  {
    id: 'farewell_hostile_1',
    category: 'farewell',
    textTemplates: ["Don't let the door hit ya.", 'Good riddance.', "Don't come back."],
    personalityMin: { aggression: 0.5 },
    personalityMax: { friendliness: 0.4 },
    tags: ['hostile'],
  },
  {
    id: 'farewell_merchant_1',
    category: 'farewell',
    textTemplates: [
      'Thank you for your business!',
      'Come back when your pockets are full again!',
      'Pleasure doing business with you!',
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'farewell_preacher_1',
    category: 'farewell',
    textTemplates: [
      'Go with God, my child.',
      'May the Lord watch over you.',
      'Blessings upon your journey.',
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'farewell_sheriff_1',
    category: 'farewell',
    textTemplates: [
      'Stay out of trouble.',
      "Remember: I'm watching.",
      'Keep your gun holstered in my town.',
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'warning'],
  },
  {
    id: 'farewell_threatening_1',
    category: 'farewell',
    textTemplates: [
      'Watch your back out there.',
      'Next time we meet might not be so friendly.',
      "Don't let me catch you around here again.",
    ],
    personalityMin: { aggression: 0.6 },
    tags: ['threatening'],
  },
  {
    id: 'farewell_doctor_1',
    category: 'farewell',
    textTemplates: [
      'Try not to get shot before your next visit.',
      "Stay healthy. I've got enough patients.",
      'Come back if anything starts hurting.',
    ],
    validRoles: ['doctor'],
    tags: ['medical', 'dark_humor'],
  },
  {
    id: 'farewell_mysterious_1',
    category: 'farewell',
    textTemplates: [
      'Our paths may cross again.',
      'The desert has a way of bringing folks together.',
      "Something tells me this isn't goodbye.",
    ],
    validRoles: ['drifter', 'gambler'],
    tags: ['mysterious'],
  },
  {
    id: 'farewell_rancher_1',
    category: 'farewell',
    textTemplates: [
      "These cattle won't herd themselves.",
      'Got work to do. You take care.',
      "Sun's wasting. Best get moving.",
    ],
    validRoles: ['rancher', 'farmer', 'miner'],
    tags: ['working_class'],
  },
  {
    id: 'farewell_outlaw_1',
    category: 'farewell',
    textTemplates: [
      'Get out of here before I change my mind.',
      "You're lucky I'm feeling generous today.",
      'Run along now, before things get ugly.',
    ],
    validRoles: ['outlaw', 'gang_leader'],
    tags: ['hostile'],
  },
  {
    id: 'farewell_night_1',
    category: 'farewell',
    textTemplates: [
      "Don't let the coyotes get you.",
      'Watch out for what lurks in the dark.',
      'Sleep with one eye open out there.',
    ],
    validTimeOfDay: ['night'],
    tags: ['ominous', 'time_specific'],
  },
  {
    id: 'farewell_hopeful_1',
    category: 'farewell',
    textTemplates: [
      "Here's hoping tomorrow's better than today.",
      'Keep the faith, stranger.',
      'Good luck out there. Lord knows we all need it.',
    ],
    tags: ['hopeful'],
  },
  {
    id: 'farewell_banker_1',
    category: 'farewell',
    textTemplates: [
      'Your assets are safe with us.',
      'Remember: compound interest is your friend.',
      'May your investments prosper.',
    ],
    validRoles: ['banker'],
    tags: ['formal', 'money'],
  },
];
