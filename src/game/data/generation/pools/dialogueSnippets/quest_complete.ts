/**
 * Quest Complete Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const QUEST_COMPLETE_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'quest_complete_grateful_1',
    category: 'quest_complete',
    textTemplates: [
      'You did it! I knew I could count on you.',
      "Outstanding work. Here's what I owe you.",
      'The town owes you a debt of gratitude.',
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['grateful'],
  },
  {
    id: 'quest_complete_grateful_2',
    category: 'quest_complete',
    textTemplates: [
      "You did it! I can't thank you enough!",
      "I don't know how I can ever repay you.",
      "You're a hero. A genuine hero!",
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['grateful', 'enthusiastic'],
  },
  {
    id: 'quest_complete_matter_of_fact_1',
    category: 'quest_complete',
    textTemplates: [
      "Job's done then. Here's your pay.",
      "Alright. We're square.",
      'Payment as agreed. Pleasure doing business.',
    ],
    tags: ['business'],
  },
  {
    id: 'quest_complete_surprised_1',
    category: 'quest_complete',
    textTemplates: [
      "I... I didn't think you could actually do it.",
      "Well, I'll be damned. You actually pulled it off.",
      'Color me impressed. I had my doubts.',
    ],
    tags: ['surprised', 'impressed'],
  },
  {
    id: 'quest_complete_relieved_1',
    category: 'quest_complete',
    textTemplates: [
      "Finally, it's over. I can breathe again.",
      "Thank the Lord. It's done.",
      "Such relief. You've lifted a weight off my shoulders.",
    ],
    tags: ['relief'],
  },
  {
    id: 'quest_complete_sheriff_1',
    category: 'quest_complete',
    textTemplates: [
      'Justice has been served. The town thanks you.',
      "You've done the law a great service today.",
      'This makes my job easier. Well done.',
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'justice'],
  },
  {
    id: 'quest_complete_merchant_1',
    category: 'quest_complete',
    textTemplates: [
      "Business is saved! You've earned a permanent discount.",
      'My livelihood, restored. Thank you!',
      "You're always welcome in my establishment.",
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'quest_complete_grudging_1',
    category: 'quest_complete',
    textTemplates: [
      "Fine. You've earned your pay.",
      'I suppose you did alright.',
      'Hmph. Better than I expected.',
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['grudging', 'reluctant'],
  },
  {
    id: 'quest_complete_emotional_1',
    category: 'quest_complete',
    textTemplates: [
      "I'm... I'm sorry. I'm just so happy.",
      "You've restored my faith in people.",
      "Words can't express what this means to me.",
    ],
    tags: ['emotional', 'heartfelt'],
  },
  {
    id: 'quest_complete_friendship_1',
    category: 'quest_complete',
    textTemplates: [
      "You've made a friend for life today.",
      'Consider me in your debt. Anything you need.',
      'From now on, my door is always open to you.',
    ],
    personalityMin: { friendliness: 0.6 },
    tags: ['friendship', 'loyalty'],
  },
];
