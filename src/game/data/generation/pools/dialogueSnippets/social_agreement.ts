/**
 * Agreement Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const AGREEMENT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'agreement_eager_1',
    category: 'agreement',
    textTemplates: ['You got yourself a deal!', "Now you're talkin'!", "I'm in. What do you need?"],
    personalityMin: { friendliness: 0.6 },
    tags: ['eager'],
  },
  {
    id: 'agreement_enthusiastic_1',
    category: 'agreement',
    textTemplates: [
      'Absolutely! Count me in!',
      "Finally, some action! I'm with you!",
      "Hot damn, let's do this!",
    ],
    personalityMin: { friendliness: 0.7 },
    tags: ['enthusiastic'],
  },
  {
    id: 'agreement_reluctant_1',
    category: 'agreement',
    textTemplates: [
      'Fine. But you owe me.',
      'Alright, but this is the last time.',
      "I'll do it. Don't make me regret it.",
    ],
    personalityMax: { friendliness: 0.5 },
    tags: ['reluctant'],
  },
  {
    id: 'agreement_professional_1',
    category: 'agreement',
    textTemplates: ['Consider it done.', 'You have my word.', "I'll handle it personally."],
    tags: ['professional'],
  },
  {
    id: 'agreement_conditional_1',
    category: 'agreement',
    textTemplates: [
      'Alright, but there are conditions.',
      "I'll do it, but you owe me one.",
      'Fine, but we do this my way.',
    ],
    tags: ['conditional'],
  },
  {
    id: 'agreement_merchant_1',
    category: 'agreement',
    textTemplates: [
      'You drive a hard bargain, but deal.',
      'For that price? Absolutely.',
      'Pleasure doing business with you.',
    ],
    validRoles: ['merchant', 'banker'],
    tags: ['commerce'],
  },
  {
    id: 'agreement_sheriff_1',
    category: 'agreement',
    textTemplates: [
      'The law will back you on this.',
      "Justice must be served. I'll help.",
      "Deputizing you temporarily. Don't make me regret it.",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority'],
  },
  {
    id: 'agreement_outlaw_1',
    category: 'agreement',
    textTemplates: [
      "You've got guts. I like that. We're in.",
      'The gang could use someone like you.',
      "Alright, but cross us and you're dead.",
    ],
    validRoles: ['outlaw', 'gang_leader'],
    tags: ['criminal'],
  },
  {
    id: 'agreement_humble_1',
    category: 'agreement',
    textTemplates: [
      "If you think I can help, I'll try my best.",
      "I'm not much, but I'll do what I can.",
      "Honored you'd ask. I won't let you down.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['humble'],
  },
  {
    id: 'agreement_solemn_1',
    category: 'agreement',
    textTemplates: [
      'I swear it on my life.',
      'You have my solemn oath.',
      'I give you my word, and my word is iron.',
    ],
    personalityMin: { honesty: 0.7 },
    tags: ['solemn'],
  },
];
