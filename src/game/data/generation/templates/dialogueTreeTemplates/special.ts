/**
 * Dialogue Tree Templates - Special
 */

import type { DialogueTreeTemplate } from '../../../schemas/generation.ts';

export const SPECIAL_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
  /**
   * Trader - traveling merchant with haggling focus
   */
  trader_dialogue: {
    id: 'trader_dialogue',
    name: 'Traveling Trader Dialogue',
    description: 'Wandering merchant. Exotic goods, hard bargaining, worldly knowledge.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'shop_welcome'],
        choicePatterns: [
          { textTemplate: 'Show me your exotic wares.', nextRole: 'shop', tags: ['browse'] },
          { textTemplate: 'Where have you traveled from?', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'Just browsing.', nextRole: 'main', tags: ['casual'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['shop_browse', 'small_talk'],
        choicePatterns: [
          { textTemplate: "What's your best piece?", nextRole: 'shop', tags: ['interested'] },
          { textTemplate: 'Safe travels.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'shop',
        snippetCategories: ['shop_buy', 'shop_sell'],
        choicePatterns: [
          { textTemplate: 'That price is robbery!', nextRole: 'branch', tags: ['haggle'] },
          { textTemplate: 'I have items to trade.', nextRole: 'shop', tags: ['sell'] },
          { textTemplate: "I'll take it.", nextRole: 'farewell', tags: ['purchase'] },
          { textTemplate: 'Never mind.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['bribe', 'refusal', 'agreement'],
        choicePatterns: [
          { textTemplate: 'I can go lower. How about...', nextRole: 'branch', tags: ['haggle'] },
          { textTemplate: 'Fine. You drive a hard bargain.', nextRole: 'shop', tags: ['accept'] },
          { textTemplate: 'Forget it.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor'],
        choicePatterns: [
          {
            textTemplate: 'Fascinating. Now about those goods...',
            nextRole: 'shop',
            tags: ['transition'],
          },
          { textTemplate: 'Good luck on the road.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell', 'shop_farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['merchant', 'drifter'],
    validFactions: ['neutral'],
    tags: ['commerce', 'traveling', 'exotic'],
  },

  /**
   * Automaton - mechanical speech patterns
   */
  automaton_dialogue: {
    id: 'automaton_dialogue',
    name: 'Automaton Dialogue',
    description: 'Steam-powered automaton speech. Mechanical, logical, slightly uncanny.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting'],
        choicePatterns: [
          { textTemplate: 'State your function.', nextRole: 'main', tags: ['query'] },
          { textTemplate: 'Do you have information?', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'Can you assist me?', nextRole: 'quest', tags: ['help'] },
          { textTemplate: '[Disengage]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['small_talk'],
        choicePatterns: [
          { textTemplate: 'Clarify your purpose.', nextRole: 'branch', tags: ['query'] },
          { textTemplate: 'That is acceptable.', nextRole: 'farewell', tags: ['accept'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['agreement', 'refusal'],
        choicePatterns: [
          { textTemplate: 'Proceed.', nextRole: 'rumor', tags: ['continue'] },
          { textTemplate: 'End protocol.', nextRole: 'farewell', tags: ['exit'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor'],
        choicePatterns: [
          { textTemplate: 'Data received.', nextRole: 'farewell', tags: ['acknowledge'] },
          { textTemplate: 'Provide additional data.', nextRole: 'rumor', tags: ['more'] },
        ],
      },
      {
        role: 'quest',
        snippetCategories: ['quest_offer'],
        choicePatterns: [
          { textTemplate: 'Task parameters accepted.', nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: 'Task parameters rejected.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell'],
        choicePatterns: [{ textTemplate: '[Disengage]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: [],
    validFactions: ['remnant'],
    tags: ['mechanical', 'automaton', 'steam'],
  },

  /**
   * Drunk - unreliable information, slurred speech
   */
  drunk_dialogue: {
    id: 'drunk_dialogue',
    name: 'Drunk NPC Dialogue',
    description: 'Inebriated conversation. Slurred speech, unreliable rumors, comic relief.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Easy there, friend.', nextRole: 'main', tags: ['calming'] },
          { textTemplate: 'What are you drinking?', nextRole: 'shop', tags: ['social'] },
          { textTemplate: 'Heard anything interesting?', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: '[Walk away]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['small_talk', 'compliment', 'insult'],
        choicePatterns: [
          { textTemplate: 'You should get some rest.', nextRole: 'farewell', tags: ['concerned'] },
          { textTemplate: 'Tell me a story.', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'Yeah, whatever.', nextRole: 'farewell', tags: ['dismissive'] },
        ],
      },
      {
        role: 'shop',
        snippetCategories: ['shop_buy', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'One more for the road?', nextRole: 'rumor', tags: ['social'] },
          { textTemplate: "You've had enough.", nextRole: 'farewell', tags: ['concerned'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Is any of that true?', nextRole: 'branch', tags: ['skeptical'] },
          { textTemplate: "That's... something.", nextRole: 'farewell', tags: ['dismissive'] },
          { textTemplate: 'Tell me more!', nextRole: 'rumor', tags: ['amused'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['agreement', 'refusal', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Sure it is.', nextRole: 'farewell', tags: ['sarcastic'] },
          { textTemplate: 'Alright, thanks anyway.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['townsfolk', 'gambler', 'drifter'],
    validFactions: ['neutral', 'townsfolk'],
    tags: ['drunk', 'comic', 'unreliable'],
  },
};
