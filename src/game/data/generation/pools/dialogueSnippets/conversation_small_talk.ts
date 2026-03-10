/**
 * Conversation Dialogue Snippets - SMALL TALK
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';

export const SMALL_TALK_SNIPPETS: DialogueSnippet[] = [
  {
    id: 'small_talk_weather_1',
    category: 'small_talk',
    textTemplates: [
      "Hot one today, ain't it?",
      "Think we might get rain soon. Ground's thirsty.",
      "Dust storm's comin'. Can smell it.",
    ],
    tags: ['weather'],
  },
  {
    id: 'small_talk_weather_2',
    category: 'small_talk',
    textTemplates: [
      'Hot enough to fry an egg on the rocks.',
      "Wind's been kicking up something fierce.",
      "Desert heat'll kill you quicker than a bullet.",
    ],
    tags: ['weather'],
  },
  {
    id: 'small_talk_business_1',
    category: 'small_talk',
    textTemplates: [
      'Business been slow lately. Too much trouble on the roads.',
      "Can't complain. Folks always need what I'm selling.",
      "Railroad's been good for business, I'll say that much.",
    ],
    validRoles: ['merchant', 'bartender', 'blacksmith'],
    tags: ['business'],
  },
  {
    id: 'small_talk_town_1',
    category: 'small_talk',
    textTemplates: [
      "{{location}}'s a good town. Mostly peaceful.",
      "Used to be quieter 'round here. Before the boom.",
      "This town's seen better days, I reckon.",
    ],
    tags: ['local'],
  },
  {
    id: 'small_talk_town_2',
    category: 'small_talk',
    textTemplates: [
      'Not much happens in these parts.',
      "Quiet town. That's how we like it.",
      'Folks here mind their own business. Mostly.',
    ],
    validRoles: ['townsfolk'],
    tags: ['town', 'local'],
  },
  {
    id: 'small_talk_work_1',
    category: 'small_talk',
    textTemplates: [
      'Another day, another dollar.',
      'Work never ends around here.',
      "My back's killing me from all this labor.",
    ],
    validRoles: ['miner', 'farmer', 'rancher', 'blacksmith'],
    tags: ['work', 'labor'],
  },
  {
    id: 'small_talk_animals_1',
    category: 'small_talk',
    textTemplates: [
      'Saw a rattlesnake near the well yesterday.',
      'The coyotes have been bold lately.',
      'Wild horses been spotted up in the hills.',
    ],
    tags: ['animals', 'wildlife'],
  },
  {
    id: 'small_talk_saloon_1',
    category: 'small_talk',
    textTemplates: [
      "Whiskey here's not half bad.",
      'Got a good card game going most nights.',
      'Place gets rowdy on paydays.',
    ],
    validRoles: ['bartender', 'gambler'],
    tags: ['saloon'],
  },
  {
    id: 'small_talk_railroad_1',
    category: 'small_talk',
    textTemplates: [
      "Train's running late again.",
      "The Railroad's changed everything around here.",
      'Remember when this was all just empty land?',
    ],
    tags: ['railroad', 'progress'],
  },
  {
    id: 'small_talk_mining_1',
    category: 'small_talk',
    textTemplates: [
      'Copper prices have been up lately.',
      'Another cave-in at the main shaft last week.',
      "Mining's dangerous work, but it pays.",
    ],
    validRoles: ['miner', 'prospector'],
    tags: ['mining'],
  },
  {
    id: 'small_talk_ranching_1',
    category: 'small_talk',
    textTemplates: [
      'Lost two head to rustlers last month.',
      'Cattle drive coming up. Going to be busy.',
      'Price of beef keeps going down.',
    ],
    validRoles: ['rancher', 'farmer'],
    tags: ['ranching'],
  },
  {
    id: 'small_talk_memories_1',
    category: 'small_talk',
    textTemplates: [
      'I remember when this was all wilderness.',
      'Been here longer than most folks remember.',
      'Times change. Not always for the better.',
    ],
    tags: ['nostalgia', 'memories'],
  },
  {
    id: 'small_talk_future_1',
    category: 'small_talk',
    textTemplates: [
      'Wonder what this place will look like in ten years.',
      'Progress marches on, like it or not.',
      'Big changes coming. Can feel it in my bones.',
    ],
    tags: ['future', 'progress'],
  },
  {
    id: 'small_talk_health_1',
    category: 'small_talk',
    textTemplates: [
      'My joints ache something terrible.',
      'Getting too old for this life.',
      "Can't complain. Still breathing, ain't I?",
    ],
    tags: ['health', 'age'],
  },
  {
    id: 'small_talk_food_1',
    category: 'small_talk',
    textTemplates: [
      'Supplies are getting low at the general store.',
      'Miss a good home-cooked meal sometimes.',
      'Bean stew again tonight, I reckon.',
    ],
    tags: ['food'],
  },
  {
    id: 'small_talk_stranger_1',
    category: 'small_talk',
    textTemplates: [
      "We don't get many strangers around here.",
      'New face in town always causes a stir.',
      'You planning on staying long?',
    ],
    tags: ['stranger', 'newcomer'],
  },
  {
    id: 'small_talk_lawless_1',
    category: 'small_talk',
    textTemplates: [
      'Law barely reaches out here.',
      'Every man for himself in these parts.',
      "The strong survive. That's the only law.",
    ],
    validRoles: ['outlaw', 'drifter'],
    personalityMax: { lawfulness: 0.4 },
    tags: ['lawless'],
  },
  {
    id: 'small_talk_church_1',
    category: 'small_talk',
    textTemplates: [
      'Sunday service was well attended.',
      "The congregation's been growing.",
      'Faith keeps us going in hard times.',
    ],
    validRoles: ['preacher'],
    tags: ['religious'],
  },
  {
    id: 'small_talk_night_1',
    category: 'small_talk',
    textTemplates: [
      'Stars are bright tonight.',
      'Quiet night, for once.',
      'Night brings out the worst in some folks.',
    ],
    validTimeOfDay: ['night'],
    tags: ['night', 'time_specific'],
  },
  {
    id: 'small_talk_philosophy_1',
    category: 'small_talk',
    textTemplates: [
      'Life out here makes you think about what matters.',
      "We're all just passing through, when you think about it.",
      'The desert has a way of putting things in perspective.',
    ],
    personalityMin: { curiosity: 0.5 },
    tags: ['philosophical'],
  },
];
