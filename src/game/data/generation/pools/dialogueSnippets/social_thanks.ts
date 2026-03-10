/**
 * Thanks and Refusal Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const THANKS_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'thanks_sincere_1',
    category: 'thanks',
    textTemplates: [
      "Much obliged. You've done me a real service.",
      "Thank you kindly. I won't forget this.",
      "You're a good sort. Thank you.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['sincere'],
  },
  {
    id: 'thanks_genuine_1',
    category: 'thanks',
    textTemplates: [
      'I owe you one. And I always pay my debts.',
      'From the bottom of my heart, thank you.',
      "You've done more than you know. Thank you.",
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['genuine', 'heartfelt'],
  },
  {
    id: 'thanks_grudging_1',
    category: 'thanks',
    textTemplates: ['Fine. Thanks, I guess.', 'Suppose I owe you one.', 'Yeah... appreciated.'],
    personalityMax: { friendliness: 0.5 },
    tags: ['grudging'],
  },
  {
    id: 'thanks_formal_1',
    category: 'thanks',
    textTemplates: [
      'Your assistance is greatly appreciated.',
      'The town is in your debt.',
      'On behalf of everyone, thank you.',
    ],
    validRoles: ['mayor', 'sheriff', 'banker'],
    tags: ['formal'],
  },
  {
    id: 'thanks_excited_1',
    category: 'thanks',
    textTemplates: [
      'You did it! I could kiss you!',
      "Hot damn! You're a miracle worker!",
      'I knew you could do it!',
    ],
    personalityMin: { friendliness: 0.7 },
    tags: ['enthusiastic'],
  },
  {
    id: 'thanks_religious_1',
    category: 'thanks',
    textTemplates: [
      'Bless your heart. The Lord works through you.',
      "Heaven sent you to us, I'm sure of it.",
      'May God repay your kindness tenfold.',
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'thanks_merchant_1',
    category: 'thanks',
    textTemplates: [
      'My business thanks you. Here, take a discount next time.',
      "You've earned yourself a friend in commerce.",
      'The general store is always open to you, friend.',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'thanks_outlaw_1',
    category: 'thanks',
    textTemplates: [
      "You're either brave or stupid. Either way, thanks.",
      "We won't forget this. The gang takes care of its friends.",
      "You've got sand, stranger. I respect that.",
    ],
    validRoles: ['outlaw', 'gang_leader'],
    validFactions: ['copperhead'],
    tags: ['criminal'],
  },
  {
    id: 'thanks_rancher_1',
    category: 'thanks',
    textTemplates: [
      'The ranch owes you. Stop by anytime for a meal.',
      "You saved my livelihood. That's not something I'll forget.",
      "If you ever need work, there's a place for you here.",
    ],
    validRoles: ['rancher', 'farmer'],
    tags: ['rural'],
  },
  {
    id: 'thanks_tearful_1',
    category: 'thanks',
    textTemplates: [
      "I... I don't know what to say. Thank you.",
      "You saved everything. I can't ever repay you.",
      'After everything... you came through. Thank you.',
    ],
    tags: ['emotional'],
  },
];

export const REFUSAL_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'refusal_polite_1',
    category: 'refusal',
    textTemplates: [
      "Sorry, can't help you with that.",
      "Afraid that ain't somethin' I can do.",
      "I'd like to help, but I can't.",
    ],
    personalityMin: { friendliness: 0.5 },
    tags: ['polite'],
  },
  {
    id: 'refusal_firm_1',
    category: 'refusal',
    textTemplates: ["No. And that's final.", "Don't ask me again.", 'I said no. Are you deaf?'],
    personalityMin: { aggression: 0.4 },
    tags: ['firm'],
  },
  {
    id: 'refusal_scared_1',
    category: 'refusal',
    textTemplates: [
      "I-I can't. Please don't ask me to.",
      "You don't understand. I'll be killed if I help you.",
      'Leave me out of this. I got a family.',
    ],
    personalityMax: { aggression: 0.3 },
    tags: ['scared', 'fearful'],
  },
  {
    id: 'refusal_hostile_1',
    category: 'refusal',
    textTemplates: [
      'Are you deaf? I said no!',
      'Get that through your thick skull: NO.',
      "Ask me again and I'll show you the door personally.",
    ],
    personalityMin: { aggression: 0.6 },
    tags: ['hostile', 'aggressive'],
  },
  {
    id: 'refusal_moral_1',
    category: 'refusal',
    textTemplates: [
      "I won't do that. It's not right.",
      "My conscience won't allow it.",
      "There are lines I won't cross, friend.",
    ],
    personalityMin: { honesty: 0.6, lawfulness: 0.5 },
    tags: ['moral'],
  },
  {
    id: 'refusal_sheriff_1',
    category: 'refusal',
    textTemplates: [
      'That would be against the law, and I am the law.',
      "I don't bend the rules for anyone.",
      "Justice doesn't work that way.",
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority'],
  },
  {
    id: 'refusal_merchant_1',
    category: 'refusal',
    textTemplates: [
      "Sorry, but that's not for sale. At any price.",
      'I run a respectable business. Take that elsewhere.',
      'No credit, no charity, no exceptions.',
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'refusal_preacher_1',
    category: 'refusal',
    textTemplates: [
      'I cannot condone such actions. It goes against everything I believe.',
      'The church will not be party to sin.',
      'Seek redemption, not vengeance.',
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'refusal_busy_1',
    category: 'refusal',
    textTemplates: [
      "Can't you see I'm busy? Come back later.",
      "I don't have time for this right now.",
      "There's a hundred things that need doing before I can help you.",
    ],
    tags: ['busy'],
  },
  {
    id: 'refusal_distrust_1',
    category: 'refusal',
    textTemplates: [
      "I don't know you well enough for that.",
      "Trust is earned, stranger. You haven't earned mine.",
      'Why should I help you? What have you done for me?',
    ],
    personalityMax: { friendliness: 0.4 },
    tags: ['distrustful'],
  },
  {
    id: 'refusal_outlaw_1',
    category: 'refusal',
    textTemplates: [
      "Ha! You think I'd help you? That's rich.",
      "We don't do favors for your kind.",
      'Get lost before my patience runs out.',
    ],
    validRoles: ['outlaw', 'gang_leader'],
    tags: ['criminal', 'hostile'],
  },
  {
    id: 'refusal_cowardly_1',
    category: 'refusal',
    textTemplates: [
      "That's too dangerous. Find someone braver.",
      "I'm not cut out for that kind of thing.",
      'I value my hide too much, sorry.',
    ],
    personalityMax: { aggression: 0.3 },
    tags: ['cowardly'],
  },
  {
    id: 'refusal_greedy_1',
    category: 'refusal',
    textTemplates: [
      "Not for that price, I won't.",
      "My help doesn't come cheap. Pay up or get out.",
      "Money talks. And you're not saying enough.",
    ],
    personalityMin: { greed: 0.6 },
    tags: ['greedy'],
  },
  {
    id: 'refusal_loyal_1',
    category: 'refusal',
    textTemplates: [
      "I won't betray them. No matter what you offer.",
      "My loyalty isn't for sale.",
      'Some things are more important than gold.',
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['loyal'],
  },
  {
    id: 'refusal_political_1',
    category: 'refusal',
    textTemplates: [
      'The political situation makes that impossible.',
      "If word got out... I can't risk it.",
      'There are larger forces at play here.',
    ],
    validRoles: ['mayor', 'banker'],
    tags: ['political'],
  },
];
