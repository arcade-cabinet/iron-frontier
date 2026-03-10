/**
 * NPC Templates - Settlers (Homesteader, Widow, Widower)
 */

import type { NPCTemplate } from '../../../schemas/generation.ts';

export const HomesteaderTemplate: NPCTemplate = {
  id: 'homesteader',
  name: 'Homesteader',
  description: 'Builder of dreams on claimed land - fighting the frontier for a future.',
  role: 'farmer',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.4, 0.7],
    curiosity: [0.3, 0.6],
    greed: [0.2, 0.5],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 4 },
    { origin: 'frontier_hispanic', weight: 2 },
  ],
  genderDistribution: [0.5, 0.5, 0],
  backstoryTemplates: [
    '{{name}} filed a claim {{years}} years ago. The land is finally starting to yield.',
    'After {{event}} in {{hometown}}, {{name}} decided to build something new from scratch.',
    '{{name}} came west with {{relative}} and a dream. Now {{firstName}} has the land and the dream - {{relative}} is buried on it.',
    "The {{faction}} wanted this land, but {{name}} got here first. It's been a fight ever since.",
    '{{name}} proved up the claim last year. Now {{firstName}} just has to survive long enough to enjoy it.',
  ],
  descriptionTemplates: [
    'Calloused hands and a stubborn jaw. {{firstName}} has wrested a living from unwilling earth.',
    'Sun-weathered but unbowed. {{firstName}} has survived drought, locusts, and worse.',
    'A determined set to the shoulders. {{firstName}} has bet everything on this land.',
    'Work-worn clothes and honest eyes. {{firstName}} represents the best of the frontier spirit.',
    'Tired but hopeful. {{firstName}} sees the farm it will become, not the struggle it is now.',
  ],
  dialogueTreeIds: ['homesteader_generic', 'homesteader_trouble', 'homesteader_help'],
  questGiverChance: 0.5,
  shopChance: 0.2,
  tags: ['rural', 'labor', 'independent', 'quest_giver'],
  validLocationTypes: ['ranch', 'town', 'outpost', 'wilderness'],
  minImportance: 0.3,
};

export const WidowTemplate: NPCTemplate = {
  id: 'widow',
  name: 'Widow',
  description: 'Left alone by the frontier - surviving against the odds.',
  role: 'townsfolk',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.1, 0.4],
    friendliness: [0.4, 0.7],
    curiosity: [0.3, 0.6],
    greed: [0.2, 0.5],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 3 },
    { origin: 'frontier_hispanic', weight: 3 },
  ],
  genderDistribution: [0.1, 0.9, 0],
  backstoryTemplates: [
    '{{name}} lost {{relative}} to {{event}} {{years}} years ago. {{firstName}} has kept going ever since.',
    "The frontier took {{name}}'s husband. Now {{firstName}} runs the {{item}} alone.",
    '{{name}} came west as a bride. {{firstName}} stayed as a survivor.',
    'They said {{name}} should go back East after {{relative}} died. {{firstName}} had other ideas.',
    "{{name}} wears black not for mourning, but as a reminder. {{firstName}} won't be beaten.",
  ],
  descriptionTemplates: [
    "A strength in {{firstName}}'s bearing that belies the black dress. This one is a survivor.",
    'Grief-lined face but determined eyes. {{firstName}} has buried the past and looks forward.',
    'Work-worn hands that handle everything from rifles to ladles. {{firstName}} does what needs doing.',
    'A quiet dignity that commands respect. {{firstName}} has earned every bit of it.',
    "Black clothes and iron will. {{firstName}} bends but doesn't break.",
  ],
  dialogueTreeIds: ['widow_generic', 'widow_help', 'widow_story'],
  questGiverChance: 0.5,
  shopChance: 0.3,
  tags: ['social', 'survivor', 'quest_giver'],
  validLocationTypes: ['town', 'city', 'ranch', 'outpost'],
  minImportance: 0.3,
};

export const WidowerTemplate: NPCTemplate = {
  id: 'widower',
  name: 'Widower',
  description: 'A man haunted by loss - working to fill the void.',
  role: 'townsfolk',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.3, 0.6],
    curiosity: [0.2, 0.5],
    greed: [0.1, 0.4],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 3 },
    { origin: 'frontier_hispanic', weight: 3 },
  ],
  genderDistribution: [0.9, 0.1, 0],
  backstoryTemplates: [
    '{{name}} buried {{relative}} on the hill overlooking {{location}}. {{firstName}} visits every Sunday.',
    "The fever took {{relative}} {{years}} years ago. {{name}} hasn't been the same since.",
    "{{name}} threw {{firstName}} into work after {{relative}} passed. It's the only thing that helps.",
    "They say {{name}} talked to {{relative}}'s grave for a whole year. Maybe {{firstName}} still does.",
    "{{name}} wears {{relative}}'s wedding ring on a chain. The weight is a comfort.",
  ],
  descriptionTemplates: [
    'A hollow look in the eyes that grief has carved. {{firstName}} is present but not quite here.',
    "Shoulders that carry more than physical weight. {{firstName}} bears {{firstName}}'s loss visibly.",
    'Work-focused and word-scarce. {{firstName}} finds solace in being busy.',
    "A wedding ring on the wrong hand - moved after {{relative}} died. {{firstName}} couldn't bear to take it off.",
    'Weathered face with deeper lines than the years alone would carve. Loss ages a person.',
  ],
  dialogueTreeIds: ['widower_generic', 'widower_help', 'widower_story'],
  questGiverChance: 0.4,
  shopChance: 0.2,
  tags: ['social', 'survivor', 'melancholy'],
  validLocationTypes: ['town', 'city', 'ranch', 'outpost'],
  minImportance: 0.3,
};
