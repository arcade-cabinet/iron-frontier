/**
 * Shop Transaction Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const SHOP_SELL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_sell_1',
    category: 'shop_sell',
    textTemplates: [
      'Let me see what you got there...',
      'Hmm, I can give you {{price}} for that.',
      'Fair price for fair goods.',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['transaction'],
  },
  {
    id: 'shop_sell_interested_1',
    category: 'shop_sell',
    textTemplates: [
      'What have you got to sell?',
      "Let me see what you're offering.",
      'Buying and selling. Show me your goods.',
    ],
    tags: ['interested'],
  },
  {
    id: 'shop_sell_offer_1',
    category: 'shop_sell',
    textTemplates: [
      'I can give you {{price}} gold for that.',
      'Best I can do is {{price}} gold.',
      '{{price}} gold. Fair offer.',
    ],
    tags: ['offer', 'price'],
  },
  {
    id: 'shop_sell_accept_1',
    category: 'shop_sell',
    textTemplates: [
      'Deal. Hand it over.',
      "Sold. Here's your gold.",
      'Done. Always happy to buy quality goods.',
    ],
    tags: ['accept', 'complete'],
  },
  {
    id: 'shop_sell_refuse_1',
    category: 'shop_sell',
    textTemplates: [
      "I'm not interested in that. Try elsewhere.",
      "Can't use that. No deal.",
      "That's got no value to me. Sorry.",
    ],
    tags: ['refuse', 'no_interest'],
  },
  {
    id: 'shop_sell_lowball_1',
    category: 'shop_sell',
    textTemplates: [
      "That's all it's worth, friend.",
      "You won't get better elsewhere.",
      "I've got to make a profit somehow.",
    ],
    personalityMin: { greed: 0.5 },
    tags: ['lowball', 'cheap'],
  },
  {
    id: 'shop_sell_fair_1',
    category: 'shop_sell',
    textTemplates: [
      'Fair price for fair goods.',
      'I try to be honest in my dealings.',
      "That's what it's worth, plain and simple.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['fair', 'honest'],
  },
  {
    id: 'shop_sell_impressed_1',
    category: 'shop_sell',
    textTemplates: [
      "Well now, that's quite something. Let me make you an offer.",
      "Impressive goods. I'll pay well for these.",
      "Now that's what I like to see. Quality merchandise.",
    ],
    tags: ['impressed', 'quality'],
  },
];

export const SHOP_FAREWELL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'shop_farewell_1',
    category: 'shop_farewell',
    textTemplates: [
      'Come back anytime!',
      'Safe travels. Come again.',
      'You know where to find me.',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['farewell'],
  },
  {
    id: 'shop_farewell_friendly_1',
    category: 'shop_farewell',
    textTemplates: [
      "Come back anytime! Door's always open.",
      'Take care out there. See you next time!',
      'Pleasure serving you. Safe travels!',
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['friendly', 'welcoming'],
  },
  {
    id: 'shop_farewell_professional_1',
    category: 'shop_farewell',
    textTemplates: ['Thank you for your business.', 'Until next time.', 'Good day to you.'],
    tags: ['professional'],
  },
  {
    id: 'shop_farewell_gruff_1',
    category: 'shop_farewell',
    textTemplates: ['Yeah. Bye.', "Door's that way.", "We're done here."],
    personalityMax: { friendliness: 0.4 },
    tags: ['gruff', 'dismissive'],
  },
  {
    id: 'shop_farewell_salesman_1',
    category: 'shop_farewell',
    textTemplates: [
      "Remember: we've got new stock every week!",
      'Tell your friends about us!',
      'Come back when you need more supplies!',
    ],
    personalityMin: { greed: 0.4 },
    tags: ['salesman', 'promotional'],
  },
  {
    id: 'shop_farewell_saloon_1',
    category: 'shop_farewell',
    textTemplates: [
      "Don't be a stranger. Drinks are always cold.",
      'Watch yourself out there. Come back for more.',
      'Safe travels. See you at the bar.',
    ],
    validRoles: ['bartender'],
    tags: ['saloon'],
  },
  {
    id: 'shop_farewell_no_sale_1',
    category: 'shop_farewell',
    textTemplates: [
      "Come back when you've got coin to spend.",
      "Maybe next time you'll find something.",
      'Just browsing? Alright then.',
    ],
    tags: ['no_sale', 'disappointed'],
  },
  {
    id: 'shop_farewell_good_sale_1',
    category: 'shop_farewell',
    textTemplates: [
      "A pleasure! You're my favorite kind of customer.",
      "Now that's what I call a good sale. Thank you!",
      'Wonderful doing business! Come back soon!',
    ],
    personalityMin: { friendliness: 0.5, greed: 0.4 },
    tags: ['good_sale', 'happy'],
  },
];
