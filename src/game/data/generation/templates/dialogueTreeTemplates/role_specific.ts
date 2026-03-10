/**
 * Dialogue Tree Templates - Role specific
 */

import type { DialogueTreeTemplate } from '../../../schemas/generation.ts';

export const ROLE_SPECIFIC_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
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
  doctor_dialogue: {
    id: 'doctor_dialogue',
    name: 'Doctor Dialogue',
    description: 'Town doctor or frontier surgeon. Medical services, health advice.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting'],
        choicePatterns: [
          { textTemplate: 'I need medical attention.', nextRole: 'shop', tags: ['heal'] },
          { textTemplate: 'I need supplies.', nextRole: 'shop', tags: ['purchase'] },
          { textTemplate: "How's business, Doc?", nextRole: 'main', tags: ['casual'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['small_talk', 'rumor'],
        choicePatterns: [
          { textTemplate: 'Seen anything unusual?', nextRole: 'rumor', tags: ['curious'] },
          { textTemplate: 'Keep up the good work.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'shop',
        snippetCategories: ['shop_welcome', 'shop_buy'],
        choicePatterns: [
          { textTemplate: 'Patch me up.', nextRole: 'branch', tags: ['heal'] },
          { textTemplate: 'What medicines do you have?', nextRole: 'shop', tags: ['browse'] },
          { textTemplate: "That's all I need.", nextRole: 'farewell', tags: ['done'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['agreement', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Much obliged, Doc.', nextRole: 'farewell', tags: ['thanks'] },
          { textTemplate: 'Got any advice for the road?', nextRole: 'rumor', tags: ['curious'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor'],
        choicePatterns: [
          { textTemplate: "I'll keep that in mind.", nextRole: 'farewell', tags: ['polite'] },
          { textTemplate: 'Tell me more.', nextRole: 'rumor', tags: ['curious'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['doctor'],
    validFactions: ['neutral', 'townsfolk'],
    tags: ['medical', 'healing', 'service'],
  },

  /**
   * Preacher - moral guidance, confessions, spiritual matters
   */
  preacher_dialogue: {
    id: 'preacher_dialogue',
    name: 'Preacher Dialogue',
    description: 'Religious figure dialogue. Moral advice, confessions, blessings.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting'],
        choicePatterns: [
          { textTemplate: 'I seek guidance, Father.', nextRole: 'main', tags: ['spiritual'] },
          {
            textTemplate: 'I have something to confess.',
            nextRole: 'branch',
            tags: ['confession'],
          },
          {
            textTemplate: "What's the state of the town's soul?",
            nextRole: 'rumor',
            tags: ['curious'],
          },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['small_talk', 'compliment'],
        choicePatterns: [
          { textTemplate: 'What wisdom can you share?', nextRole: 'branch', tags: ['wisdom'] },
          { textTemplate: 'Thank you, Father.', nextRole: 'farewell', tags: ['polite'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['agreement', 'small_talk'],
        choicePatterns: [
          { textTemplate: "I'll reflect on that.", nextRole: 'farewell', tags: ['accept'] },
          {
            textTemplate: 'Is there anything I can do to help?',
            nextRole: 'quest',
            tags: ['offer'],
          },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor'],
        choicePatterns: [
          { textTemplate: 'Perhaps I can help.', nextRole: 'quest', tags: ['offer'] },
          {
            textTemplate: 'The Lord works in mysterious ways.',
            nextRole: 'farewell',
            tags: ['spiritual'],
          },
        ],
      },
      {
        role: 'quest',
        snippetCategories: ['quest_offer'],
        choicePatterns: [
          { textTemplate: "I'll do what I can.", nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: 'That may be beyond me.', nextRole: 'main', tags: ['decline'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['preacher'],
    validFactions: ['neutral', 'townsfolk'],
    tags: ['spiritual', 'moral', 'church'],
  },

  /**
   * Outlaw - threats, deals, criminal dealings
   */
  outlaw_dialogue: {
    id: 'outlaw_dialogue',
    name: 'Outlaw Dialogue',
    description: 'Criminal NPC dialogue. Threats, shady deals, intimidation.',
    entryConditions: [],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'threat'],
        choicePatterns: [
          { textTemplate: "I'm not looking for trouble.", nextRole: 'main', tags: ['peaceful'] },
          { textTemplate: "I've got a proposition.", nextRole: 'branch', tags: ['deal'] },
          { textTemplate: 'You should watch your back.', nextRole: 'branch', tags: ['aggressive'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['threat', 'insult', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Maybe we can help each other.', nextRole: 'quest', tags: ['deal'] },
          { textTemplate: 'Heard about any easy scores?', nextRole: 'rumor', tags: ['criminal'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['threat', 'bribe', 'agreement'],
        choicePatterns: [
          { textTemplate: 'Name your price.', nextRole: 'quest', tags: ['bribe'] },
          { textTemplate: 'This ends now.', nextRole: null, tags: ['combat'] },
          { textTemplate: 'Forget I said anything.', nextRole: 'farewell', tags: ['retreat'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor'],
        choicePatterns: [
          { textTemplate: 'Count me in.', nextRole: 'quest', tags: ['accept'] },
          { textTemplate: "That's too hot for me.", nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'quest',
        snippetCategories: ['quest_offer', 'bribe'],
        choicePatterns: [
          { textTemplate: "You've got a deal.", nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: "I'll think about it.", nextRole: 'farewell', tags: ['stall'] },
          { textTemplate: 'Not interested.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell', 'threat'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: ['outlaw', 'gang_leader'],
    validFactions: ['copperhead', 'neutral'],
    tags: ['criminal', 'threat', 'deal'],
  },
};
