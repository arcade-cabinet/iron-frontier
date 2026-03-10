/**
 * Dialogue Trees - Authority (Sheriff, Bartender, Shopkeeper)
 */

import type { DialogueTreeTemplate } from '../../../schemas/generation.ts';

export const ROLE_AUTHORITY_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
  /**
   * Sheriff - law enforcement conversations
   */
  sheriff_dialogue: {
    id: 'sheriff_dialogue',
    name: 'Sheriff Dialogue',
    description: 'Conversations with the local law. Bounties, reports, law business.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting'],
        choicePatterns: [
          { textTemplate: 'Any bounties posted?', nextRole: 'quest', tags: ['bounty'] },
          {
            textTemplate: 'I have information about a crime.',
            nextRole: 'branch',
            tags: ['report'],
          },
          { textTemplate: 'Just passing through.', nextRole: 'main', tags: ['casual'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['small_talk', 'rumor'],
        choicePatterns: [
          { textTemplate: 'Any trouble around here?', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'Stay safe, Sheriff.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'quest',
        snippetCategories: ['quest_offer'],
        choicePatterns: [
          { textTemplate: "I'll take the job.", nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: 'Not my kind of work.', nextRole: 'main', tags: ['decline'] },
          { textTemplate: 'Tell me more about the target.', nextRole: 'quest', tags: ['info'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['question'],
        choicePatterns: [
          {
            textTemplate: 'I saw suspicious activity near {{location}}.',
            nextRole: 'farewell',
            tags: ['report'],
          },
          { textTemplate: "Never mind, it's nothing.", nextRole: 'main', tags: ['cancel'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor'],
        choicePatterns: [
          { textTemplate: 'I can handle it.', nextRole: 'quest', tags: ['offer'] },
          { textTemplate: 'Thanks for the warning.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['sheriff', 'deputy'],
    validFactions: ['townsfolk', 'neutral'],
    tags: ['law', 'authority', 'bounty'],
  },

  /**
   * Bartender - drinks, rumors, local knowledge
   */
  bartender_dialogue: {
    id: 'bartender_dialogue',
    name: 'Bartender Dialogue',
    description: 'Saloon keeper conversation. Drinks, gossip, local information hub.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'shop_welcome'],
        choicePatterns: [
          { textTemplate: "I'll have a drink.", nextRole: 'shop', tags: ['purchase'] },
          {
            textTemplate: 'What can you tell me about this town?',
            nextRole: 'rumor',
            tags: ['curious'],
          },
          {
            textTemplate: 'Anyone interesting pass through lately?',
            nextRole: 'rumor',
            tags: ['curious'],
          },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'shop',
        snippetCategories: ['shop_browse', 'shop_buy'],
        choicePatterns: [
          { textTemplate: "What's the word around town?", nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: "That's all I need.", nextRole: 'farewell', tags: ['done'] },
          { textTemplate: 'Another round.', nextRole: 'shop', tags: ['purchase'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Tell me more.', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'That sounds like a job for me.', nextRole: 'quest', tags: ['offer'] },
          { textTemplate: 'Thanks for the gossip.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'quest',
        snippetCategories: ['quest_offer'],
        choicePatterns: [
          { textTemplate: "I'll look into it.", nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: 'On second thought, never mind.', nextRole: 'rumor', tags: ['decline'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell', 'shop_farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['bartender'],
    validFactions: ['neutral', 'townsfolk'],
    tags: ['commerce', 'information', 'saloon'],
  },

  /**
   * Shopkeeper - general commerce focused
   */
  shopkeeper_dialogue: {
    id: 'shopkeeper_dialogue',
    name: 'Shopkeeper Dialogue',
    description: 'General store or specialty shop conversation. Focus on buying/selling.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'shop_welcome'],
        choicePatterns: [
          { textTemplate: 'Show me what you have.', nextRole: 'shop', tags: ['browse'] },
          { textTemplate: 'I have some items to sell.', nextRole: 'shop', tags: ['sell'] },
          { textTemplate: 'Just looking around.', nextRole: 'main', tags: ['casual'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['shop_browse', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Actually, let me see your wares.', nextRole: 'shop', tags: ['browse'] },
          {
            textTemplate: 'Heard anything interesting lately?',
            nextRole: 'rumor',
            tags: ['curious'],
          },
          { textTemplate: 'I should be going.', nextRole: 'farewell', tags: ['exit'] },
        ],
      },
      {
        role: 'shop',
        snippetCategories: ['shop_buy', 'shop_sell'],
        choicePatterns: [
          { textTemplate: 'Can you do better on the price?', nextRole: 'branch', tags: ['haggle'] },
          { textTemplate: "That's all I need.", nextRole: 'farewell', tags: ['done'] },
          { textTemplate: 'What else do you have?', nextRole: 'shop', tags: ['browse'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['agreement', 'refusal'],
        choicePatterns: [
          { textTemplate: 'Deal.', nextRole: 'shop', tags: ['accept'] },
          { textTemplate: 'Fine, the regular price then.', nextRole: 'shop', tags: ['accept'] },
          { textTemplate: 'I changed my mind.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor', 'small_talk'],
        choicePatterns: [
          {
            textTemplate: 'Interesting. Now about those goods...',
            nextRole: 'shop',
            tags: ['transition'],
          },
          { textTemplate: 'Thanks.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell', 'shop_farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['merchant', 'blacksmith'],
    validFactions: ['neutral', 'townsfolk', 'ivrc'],
    tags: ['commerce', 'shop', 'haggle'],
  },

  /**
   * Doctor - medical services and treatment
   */
};
