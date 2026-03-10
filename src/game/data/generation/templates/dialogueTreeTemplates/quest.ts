/**
 * Dialogue Tree Templates - Quest
 */

import type { DialogueTreeTemplate } from '../../../schemas/generation.ts';

export const QUEST_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
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
};
