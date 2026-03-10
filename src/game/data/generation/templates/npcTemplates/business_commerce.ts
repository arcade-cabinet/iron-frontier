/**
 * NPC Templates - Commerce (Saloon, Store, Gunsmith, Blacksmith)
 */

import type { NPCTemplate } from '../../../schemas/generation.ts';

export const SaloonKeeperTemplate: NPCTemplate = {
  id: 'saloon_keeper',
  name: 'Saloon Keeper',
  description:
    "Master of the watering hole - knows everyone's secrets and serves everyone's vices.",
  role: 'merchant',
  allowedFactions: ['neutral', 'townsfolk'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.5, 0.8],
    curiosity: [0.6, 0.9],
    greed: [0.4, 0.7],
    honesty: [0.3, 0.7],
    lawfulness: [0.3, 0.6],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_hispanic', weight: 3 },
    { origin: 'frontier_european', weight: 3 },
  ],
  genderDistribution: [0.5, 0.5, 0],
  backstoryTemplates: [
    '{{name}} won the {{location}} saloon in a poker game {{years}} years ago. Best hand {{firstName}} ever played.',
    "After {{relative}} died, {{name}} took over the family saloon. It's honest work, if you count selling rotgut to desperate men as honest.",
    "{{name}} used to ride with {{rival}} before settling down. The saloon is {{firstName}}'s retirement plan.",
    'A former performer from back East, {{name}} discovered that running a saloon paid better than singing in one.',
    "{{name}} built this place from nothing after {{event}}. Every bottle on the shelf represents a piece of {{firstName}}'s soul.",
  ],
  descriptionTemplates: [
    'A friendly face behind the bar, always ready with a drink or a word of advice. {{firstName}} knows when to listen and when to talk.',
    'Barrel-chested with arms like ham hocks. {{firstName}} has thrown out more troublemakers than most folks have met.',
    "A knowing smile plays across {{firstName}}'s lips. The barkeep has heard it all and then some.",
    "Weathered hands work the taps with practiced ease. {{firstName}} could pour drinks in {{firstName}}'s sleep.",
    'Eyes that have seen too much and a mouth that knows when to stay shut. {{firstName}} is the soul of discretion.',
  ],
  dialogueTreeIds: ['saloon_generic', 'saloon_rumor', 'saloon_shop'],
  questGiverChance: 0.5,
  shopChance: 0.9,
  tags: ['merchant', 'social', 'information', 'quest_giver'],
  validLocationTypes: ['town', 'city', 'outpost', 'camp'],
  minImportance: 0.5,
};

export const GeneralStoreOwnerTemplate: NPCTemplate = {
  id: 'general_store_owner',
  name: 'General Store Owner',
  description:
    "Supplier of necessities - from beans to bullets, if they don't have it, you don't need it.",
  role: 'merchant',
  allowedFactions: ['neutral', 'townsfolk', 'ivrc'],
  personality: {
    aggression: [0.1, 0.3],
    friendliness: [0.5, 0.8],
    curiosity: [0.3, 0.6],
    greed: [0.4, 0.7],
    honesty: [0.5, 0.8],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_chinese', weight: 3 },
    { origin: 'frontier_european', weight: 3 },
  ],
  genderDistribution: [0.5, 0.5, 0],
  backstoryTemplates: [
    '{{name}} started with a pack mule and a dream. Now the general store in {{location}} stocks everything from axle grease to zinc ointment.',
    'The {{faction}} hired {{name}} to manage the company store. {{firstName}} tries to be fair, despite corporate pressure.',
    'Three generations of {{lastName}}s have run this store. {{name}} intends to keep the tradition alive.',
    '{{name}} came west after {{event}}, bringing capital and connections from {{hometown}}.',
    'A former prospector, {{name}} realized that selling picks was more profitable than swinging them.',
  ],
  descriptionTemplates: [
    'An apron-wearing figure surrounded by the smell of leather, tobacco, and possibility. {{firstName}} knows the inventory by heart.',
    "Quick with a smile and quicker with the abacus. {{firstName}} can calculate your total before you've finished browsing.",
    'Dusty from restocking shelves, with a pencil perpetually behind one ear. {{firstName}} is always working.',
    "A merchant's calculating gaze softened by genuine warmth. {{firstName}} remembers every customer.",
    'Ink-stained fingers and tired feet. Running a general store is harder than it looks.',
  ],
  dialogueTreeIds: ['merchant_generic', 'merchant_shop', 'merchant_special_order'],
  questGiverChance: 0.4,
  shopChance: 1.0,
  tags: ['merchant', 'essential', 'supplies'],
  validLocationTypes: ['town', 'city', 'outpost'],
  minImportance: 0.5,
};

export const GunsmithTemplate: NPCTemplate = {
  id: 'gunsmith',
  name: 'Gunsmith',
  description: "Craftsman of death's tools - where the line between art and armament blurs.",
  role: 'merchant',
  allowedFactions: ['neutral', 'townsfolk', 'freeminer'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.3, 0.6],
    curiosity: [0.5, 0.8],
    greed: [0.3, 0.6],
    honesty: [0.5, 0.8],
    lawfulness: [0.4, 0.7],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 4 },
    { origin: 'frontier_european', weight: 5 },
    { origin: 'frontier_hispanic', weight: 1 },
  ],
  genderDistribution: [0.8, 0.2, 0],
  backstoryTemplates: [
    '{{name}} apprenticed under a master gunsmith in {{hometown}} before {{event}} brought {{firstName}} west. The skills translate well to the frontier.',
    'A former army armorer, {{name}} served {{years}} years before mustering out. Now {{firstName}} serves anyone with coin.',
    '{{name}} designed guns for the {{faction}} before a disagreement over ethics. Now {{firstName}} works independently in {{location}}.',
    'Self-taught from books and trial, {{name}} has blown up more prototypes than {{firstName}} cares to admit. The surviving designs are exceptional.',
    '{{name}} inherited the craft from {{relative}}. The family has been making guns for three generations.',
  ],
  descriptionTemplates: [
    "Scarred hands and a missing finger - occupational hazards. {{firstName}}'s remaining fingers are surgeon-steady.",
    'Squinting eyes from years of detail work. {{firstName}} examines every weapon like a surgeon studying a patient.',
    "Oil-stained and perpetually busy. {{firstName}}'s workshop smells of metal and gunpowder.",
    "A craftsman's pride shows in every piece {{firstName}} makes. Each gun is signed.",
    'Callused fingers and a critical eye. {{firstName}} can spot a flaw at twenty paces.',
  ],
  dialogueTreeIds: ['gunsmith_generic', 'gunsmith_shop', 'gunsmith_custom'],
  questGiverChance: 0.4,
  shopChance: 1.0,
  tags: ['merchant', 'craftsman', 'weapons', 'combat'],
  validLocationTypes: ['town', 'city'],
  minImportance: 0.5,
};

export const BlacksmithTemplate: NPCTemplate = {
  id: 'blacksmith',
  name: 'Blacksmith',
  description: 'Master of fire and iron - the backbone of any frontier settlement.',
  role: 'blacksmith',
  allowedFactions: ['neutral', 'townsfolk', 'freeminer'],
  personality: {
    aggression: [0.2, 0.5],
    friendliness: [0.4, 0.7],
    curiosity: [0.3, 0.5],
    greed: [0.2, 0.5],
    honesty: [0.6, 0.9],
    lawfulness: [0.5, 0.8],
  },
  nameOrigins: [
    { origin: 'frontier_anglo', weight: 3 },
    { origin: 'frontier_european', weight: 4 },
    { origin: 'frontier_hispanic', weight: 3 },
  ],
  genderDistribution: [0.75, 0.25, 0],
  backstoryTemplates: [
    "{{name}} has worked the forge for {{years}} years. The heat doesn't bother {{firstName}} anymore - it's like an old friend.",
    'A former farrier for the cavalry, {{name}} followed the army west and stayed when {{firstName}} found {{location}}.',
    '{{name}} learned the trade from {{relative}} in {{hometown}}. Now {{firstName}} teaches it to anyone willing to learn.',
    "The {{faction}} contracted {{name}} to maintain their equipment. It's steady work, if morally complicated.",
    'After {{event}}, {{name}} needed to disappear. What better place to hide than behind a forge?',
  ],
  descriptionTemplates: [
    'Arms like tree trunks and a permanent sheen of sweat. {{firstName}} looks like {{firstName}} was forged rather than born.',
    "Burn scars criss-cross {{firstName}}'s forearms like a map of {{firstName}}'s career.",
    'A leather apron hangs over a barrel chest. The sound of hammer on anvil follows {{firstName}} even in sleep.',
    'Soot-blackened face split by a white-toothed grin. {{firstName}} loves the work.',
    'Quiet and methodical. {{firstName}} lets the hammer do the talking.',
  ],
  dialogueTreeIds: ['blacksmith_generic', 'blacksmith_shop', 'blacksmith_repair'],
  questGiverChance: 0.3,
  shopChance: 0.9,
  tags: ['merchant', 'craftsman', 'essential', 'labor'],
  validLocationTypes: ['town', 'city', 'outpost', 'ranch', 'mine'],
  minImportance: 0.4,
};
