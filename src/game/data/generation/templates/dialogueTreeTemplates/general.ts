/**
 * Dialogue Tree Templates - General
 */

import type { DialogueTreeTemplate } from '../../../schemas/generation.ts';

export const GENERAL_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
  /**
   * Generic townsfolk - basic NPC chat for ambient NPCs
   */
  generic_townsfolk: {
    id: 'generic_townsfolk',
    name: 'Generic Townsfolk',
    description:
      'Basic conversation for unnamed or background NPCs. Simple greeting, optional rumor, farewell.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'What news do you have?', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'Good day.', nextRole: 'farewell', tags: ['polite'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Interesting. Anything else?', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'Thanks for the information.', nextRole: 'farewell', tags: ['polite'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['townsfolk', 'farmer', 'miner', 'rancher'],
    validFactions: ['neutral', 'townsfolk', 'freeminer'],
    tags: ['generic', 'ambient'],
  },

  /**
   * Hostile greeting - for NPCs with low reputation towards player
   */
  hostile_greeting: {
    id: 'hostile_greeting',
    name: 'Hostile Greeting',
    description: 'Conversation opener for NPCs who dislike the player. Terse, unwelcoming.',
    entryConditions: [{ type: 'reputation_lte', target: 'speaker_faction', value: -25 }],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['threat', 'refusal'],
        choicePatterns: [
          { textTemplate: 'I mean no harm.', nextRole: 'main', tags: ['peaceful'] },
          { textTemplate: 'Watch your tone.', nextRole: 'branch', tags: ['aggressive'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['refusal', 'insult'],
        choicePatterns: [
          {
            textTemplate: 'Is there any way we can work this out?',
            nextRole: 'branch',
            tags: ['diplomatic'],
          },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['threat', 'refusal'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: [],
    validFactions: [],
    tags: ['hostile', 'reputation'],
  },

  /**
   * Friendly greeting - for NPCs with high reputation towards player
   */
  friendly_greeting: {
    id: 'friendly_greeting',
    name: 'Friendly Greeting',
    description:
      'Warm conversation opener for NPCs who like the player. Offers help and information.',
    entryConditions: [{ type: 'reputation_gte', target: 'speaker_faction', value: 50 }],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'compliment'],
        choicePatterns: [
          { textTemplate: 'Good to see you too, friend.', nextRole: 'main', tags: ['friendly'] },
          { textTemplate: 'I could use your help.', nextRole: 'quest', tags: ['quest'] },
          { textTemplate: 'Heard any good rumors lately?', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['small_talk', 'compliment'],
        choicePatterns: [
          { textTemplate: 'Tell me more.', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'Take care of yourself.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor'],
        choicePatterns: [
          { textTemplate: 'Appreciate the information.', nextRole: 'farewell', tags: ['polite'] },
          { textTemplate: 'Know anything else?', nextRole: 'rumor', tags: ['curious'] },
        ],
      },
      {
        role: 'quest',
        snippetCategories: ['quest_offer'],
        choicePatterns: [
          { textTemplate: 'I might be able to help.', nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: 'Not right now.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: [],
    validFactions: [],
    tags: ['friendly', 'reputation'],
  },
};
