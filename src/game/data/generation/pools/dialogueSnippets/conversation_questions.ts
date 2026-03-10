/**
 * Conversation Dialogue Snippets - QUESTION
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const QUESTION_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'question_stranger_1',
    category: 'question',
    textTemplates: [
      'Where you from, stranger?',
      'What brings you to {{location}}?',
      'You running from something?',
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['personal'],
  },
  {
    id: 'question_business_1',
    category: 'question',
    textTemplates: [
      'You looking for work?',
      "What's your trade, friend?",
      'You good with that iron on your hip?',
    ],
    tags: ['practical'],
  },
  {
    id: 'question_suspicious_1',
    category: 'question',
    textTemplates: ['Who sent you?', 'You working for someone?', "What's your angle here?"],
    personalityMax: { friendliness: 0.4 },
    tags: ['suspicious'],
  },
  {
    id: 'question_news_1',
    category: 'question',
    textTemplates: [
      'Heard any news from the outside?',
      "What's going on out there?",
      'Any word from {{location}}?',
    ],
    personalityMin: { curiosity: 0.4 },
    tags: ['news', 'world'],
  },
  {
    id: 'question_skill_1',
    category: 'question',
    textTemplates: [
      'You any good with a gun?',
      'Ever done any honest work?',
      'What kind of skills you got?',
    ],
    tags: ['skills', 'assessment'],
  },
  {
    id: 'question_sheriff_1',
    category: 'question',
    textTemplates: [
      'Seen any suspicious characters lately?',
      'You know anything about the recent crimes?',
      'Got any information for the law?',
    ],
    validRoles: ['sheriff', 'deputy'],
    tags: ['authority', 'investigation'],
  },
  {
    id: 'question_merchant_1',
    category: 'question',
    textTemplates: [
      'Looking to buy or sell?',
      'Need any supplies for the road?',
      'What kind of goods interest you?',
    ],
    validRoles: ['merchant', 'blacksmith'],
    tags: ['commerce'],
  },
  {
    id: 'question_doctor_1',
    category: 'question',
    textTemplates: [
      'Where does it hurt?',
      'How long have you had these symptoms?',
      'Any allergies I should know about?',
    ],
    validRoles: ['doctor'],
    tags: ['medical'],
  },
  {
    id: 'question_preacher_1',
    category: 'question',
    textTemplates: [
      'Have you found peace with the Lord?',
      'Is something troubling your soul?',
      'When did you last pray, child?',
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'question_gossip_1',
    category: 'question',
    textTemplates: [
      'You hear what happened to {{target}}?',
      'Did you know about {{target}}?',
      'Want to know a secret?',
    ],
    personalityMin: { curiosity: 0.5 },
    personalityMax: { honesty: 0.5 },
    tags: ['gossip'],
  },
  {
    id: 'question_philosophical_1',
    category: 'question',
    textTemplates: [
      'You ever wonder what this is all for?',
      "Think there's something after all this?",
      'What keeps you going, stranger?',
    ],
    personalityMin: { curiosity: 0.6 },
    tags: ['philosophical'],
  },
  {
    id: 'question_past_1',
    category: 'question',
    textTemplates: [
      'What did you do before coming here?',
      'You running from something?',
      'Got any family out there?',
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['personal', 'backstory'],
  },
  {
    id: 'question_rumor_1',
    category: 'question',
    textTemplates: [
      'You heard the rumors about {{location}}?',
      'They say strange things happen at {{location}}. You believe it?',
      'Word is {{target}} is up to something. Know anything?',
    ],
    tags: ['rumor', 'investigation'],
  },
  {
    id: 'question_faction_1',
    category: 'question',
    textTemplates: [
      'You with the Railroad or the miners?',
      'Which side are you on in all this?',
      'Got any allegiances I should know about?',
    ],
    tags: ['faction', 'political'],
  },
  {
    id: 'question_challenge_1',
    category: 'question',
    textTemplates: [
      "You think you're tough enough?",
      'Got what it takes?',
      'You sure you want to do this?',
    ],
    personalityMin: { aggression: 0.4 },
    tags: ['challenge'],
  },
];
