/**
 * Iron Frontier - Dialogue Tree Templates
 *
 * Templates for procedural dialogue generation. These templates define the
 * structure and flow of conversations without specific content. The actual
 * dialogue text comes from DialogueSnippets, which are substituted in at
 * generation time based on NPC personality, role, faction, and context.
 *
 * Architecture:
 * - Templates define conversation STRUCTURE (nodes, choices, flow)
 * - Snippets provide conversation CONTENT (actual text)
 * - Generator combines template + snippets + NPC context = full dialogue tree
 */

import type {
  DialogueSnippet,
  DialogueTreeTemplate,
  GenerationContext,
} from '../../schemas/generation';
import type { DialogueChoice, DialogueNode, DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { SeededRandom } from '../seededRandom';

// ============================================================================
// DIALOGUE TREE TEMPLATES
// ============================================================================

/**
 * All dialogue tree templates indexed by ID
 */
export const DIALOGUE_TREE_TEMPLATES: Record<string, DialogueTreeTemplate> = {
  // -------------------------------------------------------------------------
  // GENERAL CONVERSATION
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // ROLE-SPECIFIC
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // QUEST-RELATED
  // -------------------------------------------------------------------------

  /**
   * Quest giver - initial quest offer
   */
  quest_giver_dialogue: {
    id: 'quest_giver_dialogue',
    name: 'Quest Giver Dialogue',
    description: 'Standard quest offer dialogue. Problem explanation, accept/decline.',
    entryConditions: [{ type: 'flag_not_set', target: 'quest_offered_{{quest_id}}' }],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting'],
        choicePatterns: [
          {
            textTemplate: 'You look troubled. What is it?',
            nextRole: 'quest',
            tags: ['concerned'],
          },
          { textTemplate: 'Need something done?', nextRole: 'quest', tags: ['direct'] },
          { textTemplate: 'Just passing through.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'quest',
        snippetCategories: ['quest_offer'],
        choicePatterns: [
          { textTemplate: 'Tell me more.', nextRole: 'branch', tags: ['interested'] },
          { textTemplate: "I'll handle it.", nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: "That's not my problem.", nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['quest_offer', 'small_talk'],
        choicePatterns: [
          { textTemplate: "What's in it for me?", nextRole: 'main', tags: ['negotiate'] },
          { textTemplate: "I'll take care of it.", nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: 'Sounds too risky.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['agreement', 'bribe'],
        choicePatterns: [
          { textTemplate: "Fair enough. I'm in.", nextRole: 'farewell', tags: ['accept'] },
          { textTemplate: 'Make it worth my while.', nextRole: 'branch', tags: ['haggle'] },
          { textTemplate: 'Not enough.', nextRole: 'farewell', tags: ['decline'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell', 'thanks'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: [],
    validFactions: [],
    tags: ['quest', 'offer'],
  },

  /**
   * Quest update - check progress, get hints
   */
  quest_update_dialogue: {
    id: 'quest_update_dialogue',
    name: 'Quest Update Dialogue',
    description: 'Mid-quest check-in. Progress discussion, hints, encouragement.',
    entryConditions: [{ type: 'quest_active', target: '{{quest_id}}' }],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'question'],
        choicePatterns: [
          { textTemplate: "I'm working on it.", nextRole: 'main', tags: ['update'] },
          { textTemplate: 'I need some guidance.', nextRole: 'branch', tags: ['hint'] },
          { textTemplate: '[Leave]', nextRole: null, tags: ['exit'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['quest_update', 'small_talk'],
        choicePatterns: [
          { textTemplate: 'Any advice?', nextRole: 'branch', tags: ['hint'] },
          { textTemplate: "I'll get it done.", nextRole: 'farewell', tags: ['confident'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['quest_update', 'rumor'],
        choicePatterns: [
          { textTemplate: 'That helps. Thanks.', nextRole: 'farewell', tags: ['grateful'] },
          { textTemplate: 'Anything else?', nextRole: 'rumor', tags: ['curious'] },
        ],
      },
      {
        role: 'rumor',
        snippetCategories: ['rumor', 'quest_update'],
        choicePatterns: [{ textTemplate: 'Good to know.', nextRole: 'farewell', tags: ['polite'] }],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: [],
    validFactions: [],
    tags: ['quest', 'progress'],
  },

  /**
   * Quest complete - turn in and rewards
   */
  quest_complete_dialogue: {
    id: 'quest_complete_dialogue',
    name: 'Quest Complete Dialogue',
    description: 'Quest turn-in dialogue. Report success, receive rewards.',
    entryConditions: [{ type: 'quest_complete', target: '{{quest_id}}' }],
    nodePatterns: [
      {
        role: 'greeting',
        snippetCategories: ['greeting', 'question'],
        choicePatterns: [
          { textTemplate: "It's done.", nextRole: 'quest', tags: ['report'] },
          { textTemplate: 'The job is finished.', nextRole: 'quest', tags: ['report'] },
        ],
      },
      {
        role: 'quest',
        snippetCategories: ['quest_complete', 'thanks'],
        choicePatterns: [
          { textTemplate: 'Just doing my job.', nextRole: 'main', tags: ['humble'] },
          { textTemplate: "Where's my payment?", nextRole: 'main', tags: ['direct'] },
        ],
      },
      {
        role: 'main',
        snippetCategories: ['thanks', 'agreement'],
        choicePatterns: [
          { textTemplate: 'Pleasure doing business.', nextRole: 'farewell', tags: ['polite'] },
          { textTemplate: 'Got any more work?', nextRole: 'branch', tags: ['ambitious'] },
        ],
      },
      {
        role: 'branch',
        snippetCategories: ['quest_offer', 'refusal'],
        choicePatterns: [
          {
            textTemplate: 'Let me know if anything comes up.',
            nextRole: 'farewell',
            tags: ['interested'],
          },
          { textTemplate: "I'll be around.", nextRole: 'farewell', tags: ['casual'] },
        ],
      },
      {
        role: 'farewell',
        snippetCategories: ['farewell', 'thanks'],
        choicePatterns: [{ textTemplate: '[Leave]', nextRole: null, tags: ['exit'] }],
      },
    ],
    validRoles: [],
    validFactions: [],
    tags: ['quest', 'reward', 'complete'],
  },

  // -------------------------------------------------------------------------
  // SPECIAL
  // -------------------------------------------------------------------------

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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a dialogue tree template by ID
 */
export function getDialogueTreeTemplate(id: string): DialogueTreeTemplate | undefined {
  return DIALOGUE_TREE_TEMPLATES[id];
}

/**
 * Get all dialogue tree templates valid for a specific NPC role
 */
export function getDialogueTreesForRole(role: string): DialogueTreeTemplate[] {
  return Object.values(DIALOGUE_TREE_TEMPLATES).filter((template) => {
    // Empty validRoles means valid for all roles
    if (template.validRoles.length === 0) return true;
    return template.validRoles.includes(role);
  });
}

/**
 * Get all dialogue tree templates valid for a specific faction
 */
export function getDialogueTreesForFaction(faction: string): DialogueTreeTemplate[] {
  return Object.values(DIALOGUE_TREE_TEMPLATES).filter((template) => {
    // Empty validFactions means valid for all factions
    if (template.validFactions.length === 0) return true;
    return template.validFactions.includes(faction);
  });
}

/**
 * Get templates matching both role and faction
 */
export function getDialogueTreesForNPC(role: string, faction: string): DialogueTreeTemplate[] {
  return Object.values(DIALOGUE_TREE_TEMPLATES).filter((template) => {
    const roleMatch = template.validRoles.length === 0 || template.validRoles.includes(role);
    const factionMatch =
      template.validFactions.length === 0 || template.validFactions.includes(faction);
    return roleMatch && factionMatch;
  });
}

/**
 * Get templates by tag
 */
export function getDialogueTreesByTag(tag: string): DialogueTreeTemplate[] {
  return Object.values(DIALOGUE_TREE_TEMPLATES).filter((template) => template.tags.includes(tag));
}

// ============================================================================
// DIALOGUE TREE BUILDER
// ============================================================================

/**
 * Context for building a dialogue tree
 */
interface BuildContext {
  npc: NPCDefinition;
  generationContext: GenerationContext;
  variables: Record<string, string>;
}

/**
 * Build a complete DialogueTree from a template, NPC, and snippets
 *
 * This is the main generation function that combines:
 * - Template structure (nodes, choices, flow)
 * - Snippet content (actual dialogue text)
 * - NPC context (personality, role, faction)
 * - Game context (time, region, events)
 *
 * @param templateId - ID of the dialogue tree template
 * @param npc - NPC definition to generate dialogue for
 * @param context - Generation context (world seed, time, region, etc.)
 * @param snippets - Available dialogue snippets to pull from
 * @param rng - Seeded random number generator
 * @returns Complete DialogueTree ready for use, or null if template not found
 */
export function buildDialogueTree(
  templateId: string,
  npc: NPCDefinition,
  context: GenerationContext,
  snippets: DialogueSnippet[],
  rng: SeededRandom
): DialogueTree | null {
  const template = getDialogueTreeTemplate(templateId);
  if (!template) return null;

  // Build variable substitution map
  const variables: Record<string, string> = {
    npc_name: npc.name,
    npc_title: npc.title || '',
    npc_role: npc.role,
    npc_faction: npc.faction,
    location: npc.locationId,
    time_of_day: getTimeOfDay(context.gameHour),
    region: context.regionId || 'unknown',
  };

  const buildContext: BuildContext = {
    npc,
    generationContext: context,
    variables,
  };

  // Filter snippets by NPC compatibility
  const compatibleSnippets = filterSnippetsByNPC(snippets, npc, context);

  // Build nodes from patterns
  const nodes: DialogueNode[] = [];
  const nodeIdMap: Map<string, string> = new Map();

  // First pass: create node IDs for all patterns
  template.nodePatterns.forEach((pattern, index) => {
    const nodeId = `${template.id}_${pattern.role}_${index}`;
    nodeIdMap.set(pattern.role, nodeId);
  });

  // Second pass: build actual nodes
  template.nodePatterns.forEach((pattern, index) => {
    const nodeId = nodeIdMap.get(pattern.role)!;

    // Find matching snippet for this node's categories
    const matchingSnippets = compatibleSnippets.filter((s) =>
      pattern.snippetCategories.includes(s.category)
    );

    // Select a snippet (or use fallback)
    const selectedSnippet = matchingSnippets.length > 0 ? rng.pick(matchingSnippets) : null;

    // Get text from snippet or use fallback
    const nodeText = selectedSnippet
      ? substituteVariables(rng.pick(selectedSnippet.textTemplates), variables)
      : getFallbackText(pattern.role, npc);

    // Build choices
    const choices: DialogueChoice[] = pattern.choicePatterns.map((choicePattern) => {
      const nextNodeId = choicePattern.nextRole
        ? nodeIdMap.get(choicePattern.nextRole) || null
        : null;

      return {
        text: substituteVariables(choicePattern.textTemplate, variables),
        nextNodeId,
        conditions: [],
        effects: [],
        tags: choicePattern.tags,
      };
    });

    const node: DialogueNode = {
      id: nodeId,
      text: nodeText,
      choices,
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [pattern.role],
    };

    nodes.push(node);
  });

  // Build dialogue tree
  const dialogueTree: DialogueTree = {
    id: `${template.id}_${npc.id}_${rng.int(0, 99999)}`,
    name: `${template.name} - ${npc.name}`,
    description: template.description,
    nodes,
    entryPoints: [
      {
        nodeId: nodes[0]?.id || '',
        conditions: template.entryConditions.map((ec) => ({
          type: ec.type as any,
          target: substituteVariables(ec.target || '', variables),
          value: ec.value,
        })),
        priority: 0,
      },
    ],
    tags: [...template.tags, npc.role, npc.faction],
  };

  return dialogueTree;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Get time of day string from hour
 */
function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Filter snippets by NPC compatibility
 */
function filterSnippetsByNPC(
  snippets: DialogueSnippet[],
  npc: NPCDefinition,
  context: GenerationContext
): DialogueSnippet[] {
  const timeOfDay = getTimeOfDay(context.gameHour);

  return snippets.filter((snippet) => {
    // Check role restrictions
    const validRoles = snippet.validRoles ?? [];
    if (validRoles.length > 0 && !validRoles.includes(npc.role)) {
      return false;
    }

    // Check faction restrictions
    const validFactions = snippet.validFactions ?? [];
    if (validFactions.length > 0 && !validFactions.includes(npc.faction)) {
      return false;
    }

    // Check time of day restrictions
    const validTimeOfDay = snippet.validTimeOfDay ?? [];
    if (validTimeOfDay.length > 0 && !validTimeOfDay.includes(timeOfDay)) {
      return false;
    }

    // Check personality requirements
    const personality = npc.personality;
    for (const [trait, minValue] of Object.entries(snippet.personalityMin ?? {})) {
      const npcValue = (personality as any)[trait];
      if (npcValue !== undefined && npcValue < minValue) {
        return false;
      }
    }
    for (const [trait, maxValue] of Object.entries(snippet.personalityMax ?? {})) {
      const npcValue = (personality as any)[trait];
      if (npcValue !== undefined && npcValue > maxValue) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Substitute {{variables}} in a string
 */
function substituteVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

/**
 * Get fallback text when no snippet matches
 */
function getFallbackText(role: string, npc: NPCDefinition): string {
  const fallbacks: Record<string, string> = {
    greeting: `${npc.name} acknowledges your presence.`,
    main: `${npc.name} considers what to say.`,
    branch: `${npc.name} pauses thoughtfully.`,
    farewell: `${npc.name} nods in farewell.`,
    quest: `${npc.name} has a proposition for you.`,
    shop: `${npc.name} gestures to their wares.`,
    rumor: `${npc.name} leans in conspiratorially.`,
  };

  return fallbacks[role] || `${npc.name} remains silent.`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { DialogueTreeTemplate } from '../../schemas/generation';
