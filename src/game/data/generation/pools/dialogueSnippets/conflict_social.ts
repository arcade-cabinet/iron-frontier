/**
 * Compliment and Insult Snippets
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const COMPLIMENT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'compliment_sincere_1',
    category: 'compliment',
    textTemplates: [
      "You've got a good head on your shoulders.",
      "This town's lucky to have someone like you.",
      "You're alright, stranger. Better than most.",
    ],
    personalityMin: { friendliness: 0.6, honesty: 0.6 },
    tags: ['sincere'],
  },
  {
    id: 'compliment_skill_1',
    category: 'compliment',
    textTemplates: [
      "I've seen a lot of gunslingers, but you're something special.",
      'You handle yourself well out there.',
      'Not many could have done what you did.',
    ],
    tags: ['skill', 'combat'],
  },
  {
    id: 'compliment_character_1',
    category: 'compliment',
    textTemplates: [
      "You're good people. This town needs more like you.",
      "It's rare to find someone with genuine honor these days.",
      "You've got integrity. That's worth more than gold.",
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['character', 'moral'],
  },
  {
    id: 'compliment_intelligence_1',
    category: 'compliment',
    textTemplates: [
      "You're sharper than most folks around here.",
      "I can tell you've got a good head on your shoulders.",
      'Not just muscle between your ears, I see.',
    ],
    tags: ['intelligence', 'wit'],
  },
  {
    id: 'compliment_bravery_1',
    category: 'compliment',
    textTemplates: [
      'That took real courage. I respect that.',
      "Brave as they come. I'm impressed.",
      'Most would have run. You stood your ground.',
    ],
    tags: ['bravery', 'courage'],
  },
  {
    id: 'compliment_reputation_1',
    category: 'compliment',
    textTemplates: [
      "I've heard stories about you. They don't do you justice.",
      'Your reputation precedes you, and for good reason.',
      'Folks speak highly of you. Now I see why.',
    ],
    tags: ['reputation', 'fame'],
  },
  {
    id: 'compliment_merchant_1',
    category: 'compliment',
    textTemplates: [
      'You drive a hard bargain. I like that in a customer.',
      "You've got a nose for value. Impressive.",
      'A savvy buyer. My favorite kind.',
    ],
    validRoles: ['merchant', 'banker'],
    tags: ['commerce', 'business'],
  },
  {
    id: 'compliment_work_1',
    category: 'compliment',
    textTemplates: [
      "Quality work. You've got skilled hands.",
      'Job well done. Better than I expected.',
      "You know your craft. That's obvious.",
    ],
    tags: ['work', 'professional'],
  },
  {
    id: 'compliment_outlaw_1',
    category: 'compliment',
    textTemplates: [
      "You've got guts, I'll give you that.",
      "Most folks would be dead by now. You're still standing.",
      "You're either very brave or very stupid. Either way, I respect it.",
    ],
    validRoles: ['outlaw', 'gang_leader', 'bounty_hunter'],
    tags: ['grudging', 'respect'],
  },
  {
    id: 'compliment_loyalty_1',
    category: 'compliment',
    textTemplates: [
      'A loyal friend is worth their weight in gold.',
      "You stood by me when others wouldn't. I won't forget that.",
      "True loyalty is rare. You've got it.",
    ],
    tags: ['loyalty', 'friendship'],
  },
];

export const INSULT_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'insult_mild_1',
    category: 'insult',
    textTemplates: [
      "You ain't too bright, are you?",
      'Bless your heart...',
      'Did your mama drop you on your head?',
    ],
    tags: ['mild'],
  },
  {
    id: 'insult_harsh_1',
    category: 'insult',
    textTemplates: [
      "You're lower than a snake's belly.",
      "I've seen better faces on wanted posters.",
      "You ain't worth the lead it'd take to shoot you.",
    ],
    personalityMin: { aggression: 0.6 },
    tags: ['harsh'],
  },
  {
    id: 'insult_coward_1',
    category: 'insult',
    textTemplates: [
      'Yellow-bellied coward. Makes me sick just looking at you.',
      "I've seen braver tumbleweeds.",
      "You'd run from your own shadow.",
    ],
    personalityMin: { aggression: 0.4 },
    tags: ['cowardice'],
  },
  {
    id: 'insult_intelligence_1',
    category: 'insult',
    textTemplates: [
      "You're about as sharp as a sack of wet mice.",
      "If brains were dynamite, you couldn't blow your nose.",
      'Not the brightest star in the sky, are you?',
    ],
    tags: ['stupidity'],
  },
  {
    id: 'insult_appearance_1',
    category: 'insult',
    textTemplates: [
      "You look like something the buzzards wouldn't touch.",
      'Did you get dressed in a dust storm?',
      "I've seen prettier things crawl out of the desert.",
    ],
    tags: ['appearance'],
  },
  {
    id: 'insult_dishonesty_1',
    category: 'insult',
    textTemplates: [
      'Liar and a cheat, through and through.',
      "Your word ain't worth the breath it takes to speak it.",
      'Snake in the grass if I ever saw one.',
    ],
    personalityMin: { honesty: 0.5 },
    tags: ['dishonesty', 'liar'],
  },
  {
    id: 'insult_outlaw_1',
    category: 'insult',
    textTemplates: [
      'Nothing but a common criminal.',
      'Trash like you belongs in a cell.',
      'The law will catch up with you eventually, scum.',
    ],
    validRoles: ['sheriff', 'deputy'],
    personalityMin: { lawfulness: 0.6 },
    tags: ['criminal', 'authority'],
  },
  {
    id: 'insult_greenhorn_1',
    category: 'insult',
    textTemplates: [
      'Wet behind the ears greenhorn.',
      'Go back east where you belong, tenderfoot.',
      'The frontier will chew you up and spit you out.',
    ],
    validRoles: ['rancher', 'miner', 'farmer'],
    tags: ['inexperience'],
  },
  {
    id: 'insult_drunk_1',
    category: 'insult',
    textTemplates: [
      "Worthless drunk. Probably can't even see straight.",
      'Spend more time at the saloon than anywhere else, I reckon.',
      "Whiskey's rotted what little brains you had.",
    ],
    tags: ['alcoholism'],
  },
  {
    id: 'insult_general_1',
    category: 'insult',
    textTemplates: [
      'You make me sick.',
      'Get out of my sight.',
      "I've scraped better things off my boot.",
    ],
    personalityMin: { aggression: 0.5 },
    tags: ['general', 'hostile'],
  },
  {
    id: 'insult_weakness_1',
    category: 'insult',
    textTemplates: [
      "Couldn't fight your way out of a paper bag.",
      'My grandmother hits harder than you.',
      'All bark and no bite.',
    ],
    personalityMin: { aggression: 0.5 },
    tags: ['weakness', 'combat'],
  },
  {
    id: 'insult_honor_1',
    category: 'insult',
    textTemplates: [
      'No honor among your kind.',
      "You wouldn't know integrity if it shot you.",
      "A man's only as good as his word, and yours is worthless.",
    ],
    personalityMin: { honesty: 0.6 },
    tags: ['honor'],
  },
  {
    id: 'insult_traitor_1',
    category: 'insult',
    textTemplates: [
      "Backstabbing traitor. You'll get what's coming.",
      'Sold us out for a few pieces of silver.',
      'Judas would be proud of you.',
    ],
    tags: ['betrayal', 'traitor'],
  },
  {
    id: 'insult_greed_1',
    category: 'insult',
    textTemplates: [
      'Greedy vulture, picking at the bones of honest folk.',
      "You'd sell your own mother for a nickel.",
      'Nothing but a money-grubbing parasite.',
    ],
    personalityMin: { honesty: 0.5 },
    personalityMax: { greed: 0.5 },
    tags: ['greed'],
  },
  {
    id: 'insult_frontier_1',
    category: 'insult',
    textTemplates: [
      "You're not fit to water the horses.",
      "Couldn't rope a fence post.",
      "Call yourself a frontier man? That's a laugh.",
    ],
    validRoles: ['rancher', 'miner', 'farmer'],
    tags: ['frontier', 'skills'],
  },
];
