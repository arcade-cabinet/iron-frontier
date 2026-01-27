/**
 * Quest Templates - Procedural quest generation templates
 *
 * Templates define the structure for different quest archetypes
 * with variable slots for procedural content generation.
 *
 * Variables use {{variable}} syntax:
 * - {{target}} - Target NPC, enemy, or item name
 * - {{location}} - Location name
 * - {{destination}} - Destination location
 * - {{region}} - Region name
 * - {{faction}} - Faction name
 * - {{item}} - Item name
 * - {{giver}} - Quest giver name
 * - {{npc}} - Generic NPC name
 * - {{amount}} - Numeric amount
 */

import {
  type QuestArchetype,
  type QuestTemplate,
  QuestTemplateSchema,
} from '../../schemas/generation';

/**
 * All quest templates for procedural generation.
 */
export const QUEST_TEMPLATES: QuestTemplate[] = [
  // ============================================================================
  // BOUNTY HUNT (3 templates)
  // ============================================================================
  {
    id: 'bounty_basic',
    name: 'Basic Bounty',
    archetype: 'bounty_hunt',
    questType: 'bounty',
    titleTemplates: [
      'Wanted: {{target}}',
      'Bounty on {{target}}',
      'Bring in {{target}}',
      'Dead or Alive: {{target}}',
    ],
    descriptionTemplates: [
      '{{target}} is wanted for crimes in {{region}}. Bring them in, dead or alive.',
      "The law wants {{target}}. There's a price on their head.",
      '{{giver}} needs {{target}} dealt with. Permanently.',
    ],
    stages: [
      {
        titleTemplate: 'Hunt the Outlaw',
        descriptionTemplate: 'Track down and confront {{target}}.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Kill or capture {{target}}',
            targetType: 'enemy',
            targetTags: ['outlaw', 'bandit'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Check the saloons and outlaw camps.',
          },
        ],
        onCompleteTextTemplate: '{{target}} has been dealt with.',
      },
      {
        titleTemplate: 'Claim the Bounty',
        descriptionTemplate: 'Return to {{giver}} to claim your reward.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: ['lawman', 'official'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'You collected the bounty.',
      },
    ],
    rewards: {
      xpRange: [30, 60],
      goldRange: [20, 50],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        law: [5, 15],
        copperhead: [-5, -15],
      },
    },
    levelRange: [1, 5],
    giverRoles: ['sheriff', 'deputy', 'bounty_hunter'],
    giverFactions: ['law'],
    validLocationTypes: ['town', 'outpost'],
    tags: ['combat', 'bounty', 'law'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'bounty_gang_leader',
    name: 'Gang Leader Bounty',
    archetype: 'bounty_hunt',
    questType: 'bounty',
    titleTemplates: [
      'Wanted: {{target}} - Gang Leader',
      'High Bounty: {{target}}',
      "Take Down {{target}}'s Gang",
    ],
    descriptionTemplates: [
      '{{target}} leads a gang terrorizing {{region}}. The bounty is substantial.',
      'This outlaw has evaded the law for too long. It ends now.',
      '{{giver}} is offering top dollar for {{target}}.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Gang',
        descriptionTemplate: "Locate {{target}}'s hideout.",
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Find the gang hideout',
            targetType: 'location',
            targetTags: ['bandit_camp', 'hideout'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Ask around. Someone knows where they hide.',
          },
        ],
      },
      {
        titleTemplate: 'Eliminate the Gang',
        descriptionTemplate: 'Clear out the gang and their leader.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat gang members',
            targetType: 'enemy',
            targetTags: ['bandit', 'gang_member'],
            countRange: [3, 6],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Kill or capture {{target}}',
            targetType: 'enemy',
            targetTags: ['bandit_leader'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The gang has been destroyed.',
      },
    ],
    rewards: {
      xpRange: [60, 100],
      goldRange: [50, 100],
      itemTags: ['weapon'],
      itemChance: 0.4,
      reputationImpact: {
        law: [10, 25],
        copperhead: [-15, -30],
      },
    },
    levelRange: [3, 8],
    giverRoles: ['sheriff', 'marshal'],
    giverFactions: ['law'],
    validLocationTypes: ['town'],
    tags: ['combat', 'bounty', 'gang', 'difficult'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'bounty_desperado',
    name: 'Desperado Bounty',
    archetype: 'bounty_hunt',
    questType: 'bounty',
    titleTemplates: [
      'The {{target}} Bounty',
      'Dangerous Outlaw: {{target}}',
      'Wanted for Murder: {{target}}',
    ],
    descriptionTemplates: [
      '{{target}} is a cold-blooded killer. Find them near {{destination}} and end their reign of terror.',
      'This desperado has left a trail of bodies. Last seen heading to {{destination}}.',
      '{{giver}} warns that {{target}} is extremely dangerous. Approach with caution.',
    ],
    stages: [
      {
        titleTemplate: 'Track {{target}}',
        descriptionTemplate: "Follow {{target}}'s trail to {{destination}}.",
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search {{destination}} for {{target}}',
            targetType: 'location',
            targetTags: ['wilderness', 'hideout'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Showdown',
        descriptionTemplate: 'Face {{target}} in a final confrontation.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat {{target}}',
            targetType: 'enemy',
            targetTags: ['desperado', 'boss'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '{{target}} will trouble no one ever again.',
      },
    ],
    rewards: {
      xpRange: [75, 125],
      goldRange: [60, 120],
      itemTags: ['weapon', 'rare'],
      itemChance: 0.5,
      reputationImpact: {
        law: [15, 30],
        townfolk: [5, 15],
      },
    },
    levelRange: [4, 9],
    giverRoles: ['sheriff', 'marshal', 'bounty_hunter'],
    giverFactions: ['law'],
    validLocationTypes: ['town'],
    tags: ['combat', 'bounty', 'boss', 'difficult'],
    repeatable: true,
    cooldownHours: 96,
  },

  // ============================================================================
  // CLEAR AREA (3 templates)
  // ============================================================================
  {
    id: 'clear_bandits',
    name: 'Clear Bandits',
    archetype: 'clear_area',
    questType: 'side',
    titleTemplates: [
      'Bandit Problem at {{destination}}',
      'Clear the Road to {{destination}}',
      'Drive Out the Outlaws',
    ],
    descriptionTemplates: [
      'Bandits have been ambushing travelers near {{destination}}. Clear them out.',
      '{{giver}} is worried about bandit activity. Help make the area safe.',
      'The road to {{destination}} is too dangerous. Deal with the bandits.',
    ],
    stages: [
      {
        titleTemplate: 'Hunt the Bandits',
        descriptionTemplate: 'Travel to {{destination}} and eliminate the bandits.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Eliminate bandits near {{destination}}',
            targetType: 'enemy',
            targetTags: ['bandit'],
            countRange: [3, 6],
            optional: false,
            hintTemplate: 'They usually ambush near the crossroads.',
          },
        ],
        onCompleteTextTemplate: 'The bandits have been dealt with.',
      },
    ],
    rewards: {
      xpRange: [25, 50],
      goldRange: [15, 35],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        townfolk: [3, 8],
      },
    },
    levelRange: [1, 5],
    giverRoles: ['sheriff', 'mayor', 'shopkeeper', 'rancher'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town', 'ranch', 'outpost'],
    tags: ['combat', 'safety'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'clear_wildlife',
    name: 'Wildlife Control',
    archetype: 'clear_area',
    questType: 'side',
    titleTemplates: ['Predator Problem', 'Dangerous Wildlife', 'Animal Attacks Near {{location}}'],
    descriptionTemplates: [
      'Wild animals have been attacking livestock and people. Hunt them down.',
      '{{giver}} lost cattle to predators. Help deal with the problem.',
      "The wildlife's gotten bold and dangerous. Thin the herd.",
    ],
    stages: [
      {
        titleTemplate: 'Hunt the Predators',
        descriptionTemplate: 'Track and eliminate the dangerous wildlife.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Kill dangerous animals',
            targetType: 'enemy',
            targetTags: ['wildlife', 'predator'],
            countRange: [3, 5],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The predators have been dealt with.',
      },
    ],
    rewards: {
      xpRange: [15, 30],
      goldRange: [10, 25],
      itemTags: ['hide', 'crafting'],
      itemChance: 0.4,
      reputationImpact: {
        ranch: [3, 8],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['rancher', 'farmer', 'hunter'],
    giverFactions: ['ranch', 'townfolk'],
    validLocationTypes: ['ranch', 'farm', 'town'],
    tags: ['hunting', 'wildlife'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'clear_mine',
    name: 'Clear the Mine',
    archetype: 'clear_area',
    questType: 'side',
    titleTemplates: ['Reclaim the Mine', 'Clear {{destination}}', 'Dangerous Infestation'],
    descriptionTemplates: [
      'Creatures have overrun the {{destination}} mine. Clear them out so work can resume.',
      "{{giver}} can't get workers back in until the mine is safe.",
      'Something dangerous moved into {{destination}}. Deal with it.',
    ],
    stages: [
      {
        titleTemplate: 'Enter the Mine',
        descriptionTemplate: 'Descend into {{destination}} and clear the threat.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Enter {{destination}}',
            targetType: 'location',
            targetTags: ['mine', 'cave'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Eliminate the creatures',
            targetType: 'enemy',
            targetTags: ['creature', 'vermin'],
            countRange: [4, 8],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The mine is clear. Workers can return.',
      },
    ],
    rewards: {
      xpRange: [35, 65],
      goldRange: [25, 50],
      itemTags: ['ore', 'mineral'],
      itemChance: 0.3,
      reputationImpact: {
        freeminers: [5, 12],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['foreman', 'miner', 'prospector'],
    giverFactions: ['freeminers', 'ivrc'],
    validLocationTypes: ['mine', 'town'],
    tags: ['combat', 'dungeon', 'mining'],
    repeatable: true,
    cooldownHours: 48,
  },

  // ============================================================================
  // ESCORT (2 templates)
  // ============================================================================
  {
    id: 'escort_traveler',
    name: 'Escort Traveler',
    archetype: 'escort',
    questType: 'side',
    titleTemplates: [
      'Safe Passage to {{destination}}',
      'Escort {{target}} to {{destination}}',
      'Bodyguard Duty',
    ],
    descriptionTemplates: [
      '{{target}} needs safe escort to {{destination}}. The roads are dangerous.',
      'A traveler requires protection on the journey to {{destination}}.',
      '{{giver}} will pay well if you can get {{target}} to {{destination}} safely.',
    ],
    stages: [
      {
        titleTemplate: 'Meet {{target}}',
        descriptionTemplate: 'Find {{target}} and prepare for the journey.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Meet {{target}}',
            targetType: 'npc',
            targetTags: ['traveler', 'civilian'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Escort to {{destination}}',
        descriptionTemplate: 'Protect {{target}} on the road to {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Arrive at {{destination}} with {{target}}',
            targetType: 'location',
            targetTags: ['town', 'outpost'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Stay close and watch for ambushes.',
          },
        ],
        onCompleteTextTemplate: '{{target}} arrived safely.',
      },
    ],
    rewards: {
      xpRange: [30, 55],
      goldRange: [20, 45],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        townfolk: [3, 8],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['traveler', 'merchant', 'townsperson'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town', 'waystation'],
    tags: ['escort', 'protection', 'travel'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'escort_wagon',
    name: 'Guard the Wagon',
    archetype: 'escort',
    questType: 'side',
    titleTemplates: ['Wagon Guard to {{destination}}', 'Protect the Shipment', 'Supply Convoy'],
    descriptionTemplates: [
      '{{giver}} needs guards for a supply wagon heading to {{destination}}.',
      "Valuable cargo must reach {{destination}} safely. Bandits know it's coming.",
      'This shipment is worth a lot. Make sure nothing happens to it.',
    ],
    stages: [
      {
        titleTemplate: 'Guard the Wagon',
        descriptionTemplate: 'Protect the wagon on its journey to {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Travel with the wagon to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'depot', 'mine'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Defeat any attackers',
            targetType: 'enemy',
            targetTags: ['bandit', 'raider'],
            countRange: [0, 6],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'The cargo arrived intact.',
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [30, 60],
      itemTags: ['supply'],
      itemChance: 0.25,
      reputationImpact: {},
    },
    levelRange: [2, 6],
    giverRoles: ['merchant', 'quartermaster', 'foreman'],
    giverFactions: ['ivrc', 'freeminers', 'townfolk'],
    validLocationTypes: ['town', 'depot'],
    tags: ['escort', 'wagon', 'cargo'],
    repeatable: true,
    cooldownHours: 36,
  },

  // ============================================================================
  // AMBUSH (2 templates)
  // ============================================================================
  {
    id: 'ambush_raiders',
    name: 'Ambush the Raiders',
    archetype: 'ambush',
    questType: 'side',
    titleTemplates: ['Turn the Tables', 'Trap at {{destination}}', 'Counter-Ambush'],
    descriptionTemplates: [
      'Raiders have been hitting travelers near {{destination}}. Set a trap for them.',
      '{{giver}} knows when the bandits will strike next. Be ready for them.',
      'Intel says raiders will pass through {{destination}}. Ambush them first.',
    ],
    stages: [
      {
        titleTemplate: 'Set the Trap',
        descriptionTemplate: 'Position yourself at {{destination}} and wait.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to the ambush point at {{destination}}',
            targetType: 'location',
            targetTags: ['road', 'pass', 'canyon'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Set up the ambush',
            targetType: 'any',
            targetTags: ['ambush_point'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Spring the Trap',
        descriptionTemplate: 'Eliminate the raiders when they arrive.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat the raiders',
            targetType: 'enemy',
            targetTags: ['raider', 'bandit'],
            countRange: [4, 7],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The ambush was a success.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [30, 60],
      itemTags: ['weapon', 'ammo'],
      itemChance: 0.35,
      reputationImpact: {
        law: [5, 12],
        townfolk: [3, 8],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['sheriff', 'ranger', 'scout'],
    giverFactions: ['law', 'townfolk'],
    validLocationTypes: ['town', 'outpost'],
    tags: ['combat', 'ambush', 'tactical'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'ambush_supply_line',
    name: 'Hit the Supply Line',
    archetype: 'ambush',
    questType: 'side',
    titleTemplates: ['Disrupt IVRC Supplies', 'Supply Line Sabotage', 'Strike at {{destination}}'],
    descriptionTemplates: [
      '{{giver}} wants you to ambush an IVRC supply convoy near {{destination}}.',
      'IVRC shipments pass through {{destination}} regularly. Intercept one.',
      'Hit them where it hurts - their supply line to {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Intercept the Convoy',
        descriptionTemplate: 'Wait at {{destination}} for the IVRC shipment.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach the ambush point',
            targetType: 'location',
            targetTags: ['road', 'pass'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Attack',
        descriptionTemplate: 'Seize the supplies and deal with the guards.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat IVRC guards',
            targetType: 'enemy',
            targetTags: ['ivrc_guard', 'mercenary'],
            countRange: [3, 5],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Secure the supplies',
            targetType: 'item',
            targetTags: ['supply', 'cargo'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: "The supplies are yours. IVRC won't be happy.",
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [40, 80],
      itemTags: ['supply', 'equipment'],
      itemChance: 0.5,
      reputationImpact: {
        ivrc: [-15, -25],
        freeminers: [10, 20],
      },
    },
    levelRange: [4, 8],
    giverRoles: ['rebel', 'union_organizer', 'guerrilla'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['hideout', 'camp'],
    tags: ['combat', 'ambush', 'anti-ivrc'],
    repeatable: true,
    cooldownHours: 72,
  },

  // ============================================================================
  // FETCH ITEM (3 templates)
  // ============================================================================
  {
    id: 'fetch_medicine',
    name: 'Medicine Run',
    archetype: 'fetch_item',
    questType: 'side',
    titleTemplates: [
      'Urgent: Medicine Needed',
      'Medical Supplies for {{location}}',
      "Fetch Dr. {{giver}}'s Order",
    ],
    descriptionTemplates: [
      '{{giver}} desperately needs medical supplies from {{destination}}.',
      "Someone's sick and needs medicine. Pick it up from {{destination}}.",
      'The doctor is out of supplies. Get more from the trading post.',
    ],
    stages: [
      {
        titleTemplate: 'Get the Medicine',
        descriptionTemplate: 'Travel to {{destination}} and acquire the supplies.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Acquire medical supplies',
            targetType: 'item',
            targetTags: ['medicine', 'medical'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'The general store or trading post should have what you need.',
          },
        ],
      },
      {
        titleTemplate: 'Deliver the Medicine',
        descriptionTemplate: 'Bring the supplies back to {{giver}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Give supplies to {{giver}}',
            targetType: 'npc',
            targetTags: ['doctor'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The medicine arrived in time.',
      },
    ],
    rewards: {
      xpRange: [20, 35],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [5, 12],
      },
    },
    levelRange: [1, 3],
    giverRoles: ['doctor', 'apothecary'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['fetch', 'urgent', 'helpful'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'fetch_parts',
    name: 'Machine Parts',
    archetype: 'fetch_item',
    questType: 'side',
    titleTemplates: ['Parts Needed', 'Steam Engine Repair', 'Mechanical Components Wanted'],
    descriptionTemplates: [
      '{{giver}} needs specific parts to fix a machine. Can you find them?',
      'The steam engine is down. We need replacement parts from {{destination}}.',
      'Without these parts, the whole operation stops.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Parts',
        descriptionTemplate: 'Search for the mechanical components.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Find mechanical parts',
            targetType: 'item',
            targetTags: ['parts', 'mechanical', 'steam'],
            countRange: [2, 4],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Deliver the Parts',
        descriptionTemplate: 'Return the parts to {{giver}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Give parts to {{giver}}',
            targetType: 'npc',
            targetTags: ['engineer', 'blacksmith'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The machine can be repaired now.',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        freeminers: [3, 8],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['blacksmith', 'engineer', 'foreman'],
    giverFactions: ['freeminers', 'ivrc'],
    validLocationTypes: ['town', 'mine'],
    tags: ['fetch', 'industrial', 'steampunk'],
    repeatable: true,
    cooldownHours: 36,
  },
  {
    id: 'fetch_heirloom',
    name: 'Lost Heirloom',
    archetype: 'fetch_item',
    questType: 'side',
    titleTemplates: ['Find the {{item}}', 'Family Heirloom', 'Recover the {{item}}'],
    descriptionTemplates: [
      '{{giver}} lost a precious family {{item}} at {{destination}}. Retrieve it.',
      'A valuable {{item}} was left behind at {{destination}}. It has sentimental value.',
      "{{giver}}'s {{item}} is somewhere in {{destination}}. Find it and return it.",
    ],
    stages: [
      {
        titleTemplate: 'Search for the {{item}}',
        descriptionTemplate: 'Look for the {{item}} at {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['building', 'ruins', 'wilderness'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Find the {{item}}',
            targetType: 'item',
            targetTags: ['heirloom', 'valuable'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Return the {{item}}',
        descriptionTemplate: 'Bring it back to {{giver}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Return the {{item}} to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '"My {{item}}! I thought I\'d lost it forever. Thank you!"',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [15, 35],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        townfolk: [5, 12],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['townsperson', 'elder', 'widow'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['fetch', 'personal', 'helpful'],
    repeatable: true,
    cooldownHours: 24,
  },

  // ============================================================================
  // STEAL ITEM (2 templates)
  // ============================================================================
  {
    id: 'steal_documents',
    name: 'Acquire Documents',
    archetype: 'steal_item',
    questType: 'side',
    titleTemplates: ['Covert Acquisition', 'Get the {{item}}', 'Corporate Secrets'],
    descriptionTemplates: [
      '{{giver}} needs you to "acquire" {{item}} from {{destination}}. Discretion is key.',
      'Important documents are held at {{destination}}. Get them without being seen.',
      "{{giver}} wants {{item}} retrieved quietly. Don't ask why.",
    ],
    stages: [
      {
        titleTemplate: 'Infiltrate',
        descriptionTemplate: 'Get inside {{destination}} undetected.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Enter {{destination}}',
            targetType: 'location',
            targetTags: ['office', 'warehouse', 'building'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Look for a back entrance or unlocked window.',
          },
        ],
      },
      {
        titleTemplate: 'Take the {{item}}',
        descriptionTemplate: 'Find and secure the {{item}}.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Take the {{item}}',
            targetType: 'item',
            targetTags: ['document', 'evidence'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'visit',
            descriptionTemplate: 'Escape undetected',
            targetType: 'location',
            targetTags: ['outside'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'You got out clean.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [35, 70],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        law: [-3, -8],
      },
    },
    levelRange: [3, 7],
    giverRoles: ['fixer', 'informant', 'rebel'],
    giverFactions: ['freeminers', 'copperhead', 'neutral'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['stealth', 'criminal', 'documents'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'steal_payroll',
    name: 'Payroll Heist',
    archetype: 'steal_item',
    questType: 'side',
    titleTemplates: ['The Payroll Job', 'IVRC Payroll', 'Redistribution'],
    descriptionTemplates: [
      '{{giver}} wants IVRC\'s payroll "redirected" from {{destination}}.',
      "The workers deserve that payroll more than IVRC. It's at {{destination}}.",
      'Hit the payroll at {{destination}}. For the people.',
    ],
    stages: [
      {
        titleTemplate: 'Case the Joint',
        descriptionTemplate: 'Scout {{destination}} for the payroll.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Scout {{destination}}',
            targetType: 'location',
            targetTags: ['office', 'bank', 'depot'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Grab the Payroll',
        descriptionTemplate: 'Take the money and get out.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Take the payroll',
            targetType: 'item',
            targetTags: ['money', 'payroll'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Deal with guards',
            targetType: 'enemy',
            targetTags: ['guard', 'security'],
            countRange: [0, 3],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'The payroll is yours.',
      },
    ],
    rewards: {
      xpRange: [60, 100],
      goldRange: [80, 150],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        ivrc: [-15, -25],
        freeminers: [10, 20],
        law: [-10, -18],
      },
    },
    levelRange: [4, 8],
    giverRoles: ['rebel', 'union_organizer', 'fixer'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['town', 'mine'],
    tags: ['heist', 'anti-ivrc', 'criminal'],
    repeatable: true,
    cooldownHours: 96,
  },

  // ============================================================================
  // RECOVER LOST (2 templates)
  // ============================================================================
  {
    id: 'recover_shipment',
    name: 'Lost Shipment',
    archetype: 'recover_lost',
    questType: 'side',
    titleTemplates: ['Find the Lost Shipment', 'Missing Cargo', "Where's the Wagon?"],
    descriptionTemplates: [
      'A shipment went missing between here and {{destination}}. Find out what happened.',
      "{{giver}}'s cargo never arrived from {{destination}}. Track it down.",
      'The supply wagon vanished near {{destination}}. Recover what you can.',
    ],
    stages: [
      {
        titleTemplate: 'Search for the Shipment',
        descriptionTemplate: 'Investigate the route to {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search along the route',
            targetType: 'location',
            targetTags: ['road', 'wilderness'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Look for signs of a struggle or abandoned cargo.',
          },
          {
            type: 'interact',
            descriptionTemplate: 'Find the wreckage',
            targetType: 'any',
            targetTags: ['wagon', 'wreckage'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Recover the Cargo',
        descriptionTemplate: 'Salvage what remains.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Salvage the cargo',
            targetType: 'item',
            targetTags: ['cargo', 'supply'],
            countRange: [1, 3],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Deal with scavengers',
            targetType: 'enemy',
            targetTags: ['bandit', 'scavenger'],
            countRange: [0, 4],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'You recovered what was left.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [25, 50],
      itemTags: ['salvage'],
      itemChance: 0.4,
      reputationImpact: {},
    },
    levelRange: [2, 5],
    giverRoles: ['merchant', 'quartermaster', 'foreman'],
    giverFactions: ['townfolk', 'ivrc', 'freeminers'],
    validLocationTypes: ['town', 'depot'],
    tags: ['recovery', 'investigation', 'cargo'],
    repeatable: true,
    cooldownHours: 36,
  },
  {
    id: 'recover_artifact',
    name: 'Relic Recovery',
    archetype: 'recover_lost',
    questType: 'side',
    titleTemplates: ['The Lost {{item}}', 'Relic of the Past', 'Ancient {{item}}'],
    descriptionTemplates: [
      'An ancient {{item}} was lost in {{destination}} years ago. Find it.',
      'Legends speak of a {{item}} hidden in {{destination}}.',
      "{{giver}} believes their ancestor's {{item}} is still at {{destination}}.",
    ],
    stages: [
      {
        titleTemplate: 'Search {{destination}}',
        descriptionTemplate: 'Explore {{destination}} for the {{item}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Explore {{destination}}',
            targetType: 'location',
            targetTags: ['ruins', 'cave', 'tomb'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Search for clues',
            targetType: 'any',
            targetTags: ['inscription', 'marker'],
            countRange: [1, 2],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Claim the {{item}}',
        descriptionTemplate: 'Find and secure the {{item}}.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Retrieve the {{item}}',
            targetType: 'item',
            targetTags: ['artifact', 'relic'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Defeat guardians',
            targetType: 'enemy',
            targetTags: ['guardian', 'creature'],
            countRange: [1, 3],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'The {{item}} is yours.',
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [40, 80],
      itemTags: ['artifact', 'rare'],
      itemChance: 0.6,
      reputationImpact: {},
    },
    levelRange: [4, 8],
    giverRoles: ['scholar', 'collector', 'elder'],
    giverFactions: ['townfolk', 'freeminers'],
    validLocationTypes: ['town'],
    tags: ['recovery', 'exploration', 'artifact'],
    repeatable: true,
    cooldownHours: 72,
  },

  // ============================================================================
  // GATHER MATERIALS (2 templates)
  // ============================================================================
  {
    id: 'gather_ore',
    name: 'Ore Collection',
    archetype: 'gather_materials',
    questType: 'side',
    titleTemplates: ['Ore Needed', 'Mining Request', 'Gather {{item}}'],
    descriptionTemplates: [
      '{{giver}} needs {{item}} for operations. Gather some from {{destination}}.',
      'The blacksmith requires {{item}}. Find it near {{destination}}.',
      '{{giver}} will pay well for {{item}} from the {{destination}} deposits.',
    ],
    stages: [
      {
        titleTemplate: 'Gather {{item}}',
        descriptionTemplate: 'Collect {{item}} from {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['mine', 'quarry'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Mine {{item}}',
            targetType: 'item',
            targetTags: ['ore', 'mineral'],
            countRange: [5, 10],
            optional: false,
            hintTemplate: 'Look for exposed veins.',
          },
        ],
        onCompleteTextTemplate: "You've gathered enough.",
      },
    ],
    rewards: {
      xpRange: [20, 40],
      goldRange: [15, 35],
      itemTags: ['tool'],
      itemChance: 0.2,
      reputationImpact: {},
    },
    levelRange: [1, 3],
    giverRoles: ['blacksmith', 'merchant', 'foreman'],
    giverFactions: ['townfolk', 'freeminers'],
    validLocationTypes: ['town', 'mine'],
    tags: ['gathering', 'mining'],
    repeatable: true,
    cooldownHours: 12,
  },
  {
    id: 'gather_scrap',
    name: 'Scrap Collection',
    archetype: 'gather_materials',
    questType: 'side',
    titleTemplates: ['Scrap Hunt', 'Parts Needed', 'Salvage Run'],
    descriptionTemplates: [
      '{{giver}} needs mechanical parts. Salvage some from {{destination}}.',
      'Old machinery at {{destination}} has parts we need.',
      '{{giver}} requires components for repairs. Check the scrap at {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Salvage Parts',
        descriptionTemplate: 'Gather parts from {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['junkyard', 'ruins', 'abandoned'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Salvage parts',
            targetType: 'item',
            targetTags: ['parts', 'scrap', 'component'],
            countRange: [3, 8],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Good haul.',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [15, 30],
      itemTags: ['parts', 'crafting'],
      itemChance: 0.3,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['engineer', 'mechanic', 'inventor'],
    giverFactions: ['townfolk', 'freeminers'],
    validLocationTypes: ['town', 'depot'],
    tags: ['gathering', 'salvage', 'steampunk'],
    repeatable: true,
    cooldownHours: 18,
  },

  // ============================================================================
  // DELIVER MESSAGE (2 templates)
  // ============================================================================
  {
    id: 'deliver_message',
    name: 'Message Delivery',
    archetype: 'deliver_message',
    questType: 'delivery',
    titleTemplates: [
      'Urgent Message for {{target}}',
      'Deliver the Letter',
      'Correspondence to {{destination}}',
    ],
    descriptionTemplates: [
      '{{giver}} needs an important message delivered to {{target}}.',
      'This letter must reach {{target}} in {{destination}}. Time is critical.',
      'Can you deliver this correspondence? The telegraph is down.',
    ],
    stages: [
      {
        titleTemplate: 'Deliver the Message',
        descriptionTemplate: 'Find {{target}} and deliver the message.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Deliver message to {{target}}',
            targetType: 'npc',
            targetTags: ['recipient'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: '{{target}} should be in {{destination}}.',
          },
        ],
        onCompleteTextTemplate: 'The message was delivered.',
      },
    ],
    rewards: {
      xpRange: [15, 25],
      goldRange: [10, 20],
      itemTags: [],
      itemChance: 0.05,
      reputationImpact: {},
    },
    levelRange: [1, 3],
    giverRoles: ['mayor', 'shopkeeper', 'banker'],
    giverFactions: ['townfolk', 'ivrc'],
    validLocationTypes: ['town'],
    tags: ['delivery', 'simple', 'travel'],
    repeatable: true,
    cooldownHours: 12,
  },
  {
    id: 'deliver_secret_message',
    name: 'Secret Correspondence',
    archetype: 'deliver_message',
    questType: 'delivery',
    titleTemplates: ['Secret Message', 'Confidential Delivery', 'Coded Dispatch'],
    descriptionTemplates: [
      '{{giver}} has a sensitive message for their contact at {{destination}}. Be discreet.',
      'This coded message must reach {{target}} without IVRC knowing.',
      "Deliver this letter to {{destination}}, but don't let anyone see you.",
    ],
    stages: [
      {
        titleTemplate: 'Make Contact',
        descriptionTemplate: 'Find {{target}} at {{destination}} discreetly.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'hideout'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Use back alleys and avoid main streets.',
          },
          {
            type: 'deliver',
            descriptionTemplate: 'Pass the message to {{target}}',
            targetType: 'npc',
            targetTags: ['contact', 'spy'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Message delivered. {{target}} nods and disappears.',
      },
    ],
    rewards: {
      xpRange: [30, 50],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        freeminers: [5, 10],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['rebel', 'informant', 'union_organizer'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['town', 'mine'],
    tags: ['delivery', 'stealth', 'resistance'],
    repeatable: true,
    cooldownHours: 24,
  },

  // ============================================================================
  // DELIVER PACKAGE (2 templates)
  // ============================================================================
  {
    id: 'deliver_package',
    name: 'Package Delivery',
    archetype: 'deliver_package',
    questType: 'delivery',
    titleTemplates: ['Deliver to {{target}}', 'Package for {{destination}}', 'Special Delivery'],
    descriptionTemplates: [
      '{{giver}} has a package that needs to reach {{target}} safely.',
      "This crate is valuable. Don't let anything happen to it.",
      'Deliver this to {{target}} in {{destination}}. Handle with care.',
    ],
    stages: [
      {
        titleTemplate: 'Make the Delivery',
        descriptionTemplate: 'Transport the package to {{target}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Deliver package to {{target}}',
            targetType: 'npc',
            targetTags: ['recipient'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Package delivered safely.',
      },
    ],
    rewards: {
      xpRange: [20, 35],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [2, 5],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['shopkeeper', 'merchant'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['delivery', 'cargo'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'deliver_supplies',
    name: 'Supply Delivery',
    archetype: 'deliver_package',
    questType: 'delivery',
    titleTemplates: ['Supplies to {{destination}}', 'Supply Run', 'Goods for {{target}}'],
    descriptionTemplates: [
      '{{giver}} needs these supplies delivered to {{destination}}.',
      '{{target}} at {{destination}} is waiting for this shipment.',
      'These goods must reach {{destination}} intact.',
    ],
    stages: [
      {
        titleTemplate: 'Deliver the Supplies',
        descriptionTemplate: 'Bring the supplies to {{target}} at {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Travel to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'ranch', 'mine', 'outpost'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'deliver',
            descriptionTemplate: 'Hand over the supplies',
            targetType: 'npc',
            targetTags: ['recipient'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '"Everything\'s here. Much obliged."',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [20, 40],
      itemTags: ['consumable'],
      itemChance: 0.15,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['merchant', 'quartermaster', 'shopkeeper'],
    giverFactions: ['townfolk', 'ivrc', 'freeminers'],
    validLocationTypes: ['town', 'depot'],
    tags: ['delivery', 'supplies'],
    repeatable: true,
    cooldownHours: 18,
  },

  // ============================================================================
  // SMUGGLE (2 templates)
  // ============================================================================
  {
    id: 'smuggle_contraband',
    name: 'Contraband Run',
    archetype: 'smuggle',
    questType: 'delivery',
    titleTemplates: ['Under the Radar', 'Contraband to {{destination}}', 'Off the Books'],
    descriptionTemplates: [
      "{{giver}} needs banned goods smuggled into {{destination}}. Don't get caught.",
      'These items are prohibited by IVRC. Get them to {{target}} quietly.',
      'Slip this contraband past the checkpoints to {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Avoid Detection',
        descriptionTemplate: 'Smuggle the goods to {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach {{destination}} undetected',
            targetType: 'location',
            targetTags: ['town', 'mine', 'camp'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Avoid main roads and patrol routes.',
          },
          {
            type: 'deliver',
            descriptionTemplate: 'Hand off the goods to {{target}}',
            targetType: 'npc',
            targetTags: ['contact', 'fence'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Clean delivery.',
      },
    ],
    rewards: {
      xpRange: [40, 75],
      goldRange: [50, 100],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        law: [-5, -12],
        freeminers: [5, 12],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['smuggler', 'fixer', 'rebel'],
    giverFactions: ['freeminers', 'copperhead'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['delivery', 'smuggling', 'criminal'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'smuggle_weapons',
    name: 'Weapons Smuggling',
    archetype: 'smuggle',
    questType: 'delivery',
    titleTemplates: ['Arms Delivery', 'Weapons to {{destination}}', 'Hot Iron'],
    descriptionTemplates: [
      "{{giver}} needs weapons delivered to {{destination}}. IVRC can't know.",
      'The resistance needs arms. Get them to {{target}} at {{destination}}.',
      'Smuggle these weapons past IVRC checkpoints to {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Smuggle the Weapons',
        descriptionTemplate: 'Get the weapons to {{destination}} secretly.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach {{destination}}',
            targetType: 'location',
            targetTags: ['hideout', 'camp', 'mine'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'deliver',
            descriptionTemplate: 'Deliver weapons to {{target}}',
            targetType: 'npc',
            targetTags: ['rebel', 'contact'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The resistance is better armed now.',
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [60, 120],
      itemTags: ['weapon'],
      itemChance: 0.3,
      reputationImpact: {
        ivrc: [-10, -20],
        freeminers: [10, 20],
        law: [-8, -15],
      },
    },
    levelRange: [4, 7],
    giverRoles: ['rebel', 'guerrilla', 'fixer'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['hideout', 'camp'],
    tags: ['smuggling', 'weapons', 'resistance'],
    repeatable: true,
    cooldownHours: 72,
  },

  // ============================================================================
  // FIND PERSON (2 templates)
  // ============================================================================
  {
    id: 'find_missing_person',
    name: 'Missing Person',
    archetype: 'find_person',
    questType: 'side',
    titleTemplates: ['Find {{target}}', 'Missing: {{target}}', 'Search for the Lost'],
    descriptionTemplates: [
      '{{target}} went missing days ago. {{giver}} is worried sick.',
      'No one has seen {{target}} since they headed to {{destination}}.',
      'Help find {{target}}. They could be in danger.',
    ],
    stages: [
      {
        titleTemplate: 'Search for {{target}}',
        descriptionTemplate: "Investigate {{target}}'s disappearance.",
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search {{destination}}',
            targetType: 'location',
            targetTags: ['wilderness', 'ruins'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Talk to people who last saw {{target}}.',
          },
        ],
      },
      {
        titleTemplate: 'Find {{target}}',
        descriptionTemplate: 'Locate the missing person.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Find {{target}}',
            targetType: 'npc',
            targetTags: ['missing', 'victim'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'You found {{target}}!',
      },
    ],
    rewards: {
      xpRange: [30, 55],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        townfolk: [8, 15],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['townsperson', 'family_member', 'sheriff'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town'],
    tags: ['investigation', 'rescue', 'missing_person'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'find_debtor',
    name: 'Track the Debtor',
    archetype: 'find_person',
    questType: 'side',
    titleTemplates: ['Find the Debtor', 'Hunt Down {{target}}', '{{target}} Owes Money'],
    descriptionTemplates: [
      '{{target}} owes money and skipped town. Track them to {{destination}}.',
      'A debtor named {{target}} fled toward {{destination}}.',
      '{{target}} ran off without paying. Find them.',
    ],
    stages: [
      {
        titleTemplate: 'Track {{target}}',
        descriptionTemplate: "Follow {{target}}'s trail.",
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'hideout'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Ask locals about {{target}}',
            targetType: 'npc',
            targetTags: ['local', 'informant'],
            countRange: [1, 2],
            optional: true,
          },
        ],
      },
      {
        titleTemplate: 'Confront {{target}}',
        descriptionTemplate: 'Find {{target}} and settle the debt.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Confront {{target}}',
            targetType: 'npc',
            targetTags: ['debtor'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '{{target}} pays up.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [35, 70],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {},
    },
    levelRange: [2, 5],
    giverRoles: ['banker', 'merchant', 'loan_shark'],
    giverFactions: ['ivrc', 'townfolk'],
    validLocationTypes: ['town'],
    tags: ['investigation', 'tracking', 'debt'],
    repeatable: true,
    cooldownHours: 48,
  },

  // ============================================================================
  // INVESTIGATE (2 templates)
  // ============================================================================
  {
    id: 'investigate_crime',
    name: 'Crime Investigation',
    archetype: 'investigate',
    questType: 'side',
    titleTemplates: ['Who Done It?', 'Solve the Crime', 'Investigation: {{location}}'],
    descriptionTemplates: [
      "Something bad happened and {{giver}} wants to know who's responsible.",
      "There's been a crime. Help investigate.",
      '{{giver}} needs someone to get to the bottom of this.',
    ],
    stages: [
      {
        titleTemplate: 'Gather Evidence',
        descriptionTemplate: 'Investigate the scene and talk to witnesses.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Search for clues',
            targetType: 'any',
            targetTags: ['clue', 'evidence'],
            countRange: [2, 4],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Interview witnesses',
            targetType: 'npc',
            targetTags: ['witness'],
            countRange: [2, 3],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Confront the Culprit',
        descriptionTemplate: 'Bring the guilty party to justice.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Confront the culprit',
            targetType: 'npc',
            targetTags: ['suspect', 'culprit'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Justice has been served.',
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [30, 55],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        law: [8, 15],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['sheriff', 'mayor', 'victim'],
    giverFactions: ['law', 'townfolk'],
    validLocationTypes: ['town'],
    tags: ['investigation', 'crime', 'mystery'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'investigate_corruption',
    name: 'Follow the Money',
    archetype: 'investigate',
    questType: 'side',
    titleTemplates: ['Corporate Corruption', 'Follow the Money', 'Dirty Dealings'],
    descriptionTemplates: [
      '{{giver}} suspects corruption. Find evidence at {{destination}}.',
      "Someone's skimming profits. Investigate the books.",
      "There's dirty money flowing through {{destination}}. Expose it.",
    ],
    stages: [
      {
        titleTemplate: 'Find Records',
        descriptionTemplate: 'Access financial records at {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Enter {{destination}}',
            targetType: 'location',
            targetTags: ['office', 'bank'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Obtain the ledgers',
            targetType: 'item',
            targetTags: ['document', 'ledger'],
            countRange: [1, 2],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Verify the Evidence',
        descriptionTemplate: 'Confirm the corruption with witnesses.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Find corroborating testimony',
            targetType: 'npc',
            targetTags: ['witness', 'informant'],
            countRange: [1, 2],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The evidence is damning.',
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [40, 80],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        freeminers: [5, 15],
      },
    },
    levelRange: [4, 7],
    giverRoles: ['journalist', 'reformer', 'rebel'],
    giverFactions: ['freeminers', 'law'],
    validLocationTypes: ['town'],
    tags: ['investigation', 'corruption', 'political'],
    repeatable: true,
    cooldownHours: 96,
  },

  // ============================================================================
  // SPY (2 templates)
  // ============================================================================
  {
    id: 'spy_on_ivrc',
    name: 'Intelligence Gathering',
    archetype: 'spy',
    questType: 'side',
    titleTemplates: ['Spy on IVRC', 'Eyes and Ears', 'Watch and Report'],
    descriptionTemplates: [
      '{{giver}} needs intel on IVRC activities at {{destination}}. Observe and report.',
      'We need to know what IVRC is planning at {{destination}}.',
      'Keep an eye on {{destination}} and report any suspicious activity.',
    ],
    stages: [
      {
        titleTemplate: 'Infiltrate',
        descriptionTemplate: 'Get close to {{destination}} without being detected.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach observation point',
            targetType: 'location',
            targetTags: ['building', 'camp'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Observe and Report',
        descriptionTemplate: 'Watch IVRC activities and gather intel.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Observe operations',
            targetType: 'any',
            targetTags: ['observation', 'intel'],
            countRange: [2, 3],
            optional: false,
            hintTemplate: 'Stay hidden and take mental notes.',
          },
          {
            type: 'talk',
            descriptionTemplate: 'Report to your contact',
            targetType: 'npc',
            targetTags: ['handler', 'contact'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Good work. This information is valuable.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [35, 65],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        freeminers: [8, 15],
        ivrc: [-5, -10],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['rebel', 'spymaster', 'union_organizer'],
    giverFactions: ['freeminers'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['investigation', 'spy', 'stealth'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'spy_gang_movements',
    name: 'Track Gang Movements',
    archetype: 'spy',
    questType: 'side',
    titleTemplates: ['Scout the Gang', 'Track Copperhead', 'Eyes on the Outlaws'],
    descriptionTemplates: [
      '{{giver}} needs information on Copperhead gang movements near {{destination}}.',
      'We need to know where the gang is operating. Scout {{destination}}.',
      "Track the outlaws but don't engage. Intel only.",
    ],
    stages: [
      {
        titleTemplate: 'Scout the Area',
        descriptionTemplate: 'Survey {{destination}} for gang activity.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Search {{destination}}',
            targetType: 'location',
            targetTags: ['wilderness', 'hideout'],
            countRange: [1, 2],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Document gang positions',
            targetType: 'any',
            targetTags: ['observation'],
            countRange: [2, 3],
            optional: false,
          },
        ],
        onCompleteTextTemplate: "You've gathered valuable intelligence.",
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [25, 50],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        law: [5, 12],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['sheriff', 'ranger', 'scout'],
    giverFactions: ['law'],
    validLocationTypes: ['town', 'outpost'],
    tags: ['investigation', 'spy', 'gang'],
    repeatable: true,
    cooldownHours: 36,
  },

  // ============================================================================
  // CONVINCE NPC (2 templates)
  // ============================================================================
  {
    id: 'convince_settler',
    name: 'Persuade the Settler',
    archetype: 'convince_npc',
    questType: 'side',
    titleTemplates: ['Talk Some Sense', 'Convince {{target}}', 'Diplomatic Mission'],
    descriptionTemplates: [
      '{{giver}} needs you to convince {{target}} to see reason.',
      "{{target}} won't listen to {{giver}}. Maybe they'll listen to you.",
      'A little diplomacy could prevent a lot of trouble.',
    ],
    stages: [
      {
        titleTemplate: 'Find {{target}}',
        descriptionTemplate: 'Locate {{target}} and talk to them.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Find and speak with {{target}}',
            targetType: 'npc',
            targetTags: ['settler', 'townsperson'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Convince {{target}}',
        descriptionTemplate: 'Use your words to persuade them.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Convince {{target}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Consider their perspective. What do they want?',
          },
        ],
        onCompleteTextTemplate: '{{target}} has been convinced.',
      },
    ],
    rewards: {
      xpRange: [25, 45],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [5, 10],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['mayor', 'sheriff', 'preacher'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town'],
    tags: ['social', 'diplomacy', 'peaceful'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'convince_recruit',
    name: 'Recruitment',
    archetype: 'convince_npc',
    questType: 'side',
    titleTemplates: ['Win Over {{target}}', 'Recruitment Drive', 'Bring {{target}} Aboard'],
    descriptionTemplates: [
      '{{giver}} wants {{target}} to join the cause. Convince them.',
      '{{target}} has skills we need. Persuade them to work with us.',
      'Talk to {{target}} and bring them to our side.',
    ],
    stages: [
      {
        titleTemplate: 'Meet {{target}}',
        descriptionTemplate: 'Find {{target}} and begin your pitch.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Meet {{target}}',
            targetType: 'npc',
            targetTags: ['recruit'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Prove Your Worth',
        descriptionTemplate: 'Complete a task to earn their trust.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Do a favor for {{target}}',
            targetType: 'any',
            targetTags: ['favor', 'task'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Seal the Deal',
        descriptionTemplate: "Finalize {{target}}'s commitment.",
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: "Get {{target}}'s agreement",
            targetType: 'npc',
            targetTags: ['recruit'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: '"Alright, you\'ve convinced me. I\'m in."',
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {},
    },
    levelRange: [2, 5],
    giverRoles: ['leader', 'recruiter', 'foreman'],
    giverFactions: ['freeminers', 'ivrc', 'law'],
    validLocationTypes: ['town'],
    tags: ['social', 'recruitment'],
    repeatable: true,
    cooldownHours: 48,
  },

  // ============================================================================
  // INTIMIDATE (2 templates)
  // ============================================================================
  {
    id: 'intimidate_witness',
    name: 'Silence a Witness',
    archetype: 'intimidate',
    questType: 'side',
    titleTemplates: ['Shut Them Up', 'Silence {{target}}', 'The Quiet Treatment'],
    descriptionTemplates: [
      '{{target}} knows too much. Convince them to keep quiet.',
      'A witness named {{target}} needs to forget what they saw.',
      '{{giver}} needs {{target}} silenced. No violence - just intimidation.',
    ],
    stages: [
      {
        titleTemplate: 'Find {{target}}',
        descriptionTemplate: 'Track down {{target}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'building'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Locate {{target}}',
            targetType: 'npc',
            targetTags: ['witness'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Deliver the Message',
        descriptionTemplate: 'Make {{target}} understand the consequences.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Intimidate {{target}}',
            targetType: 'npc',
            targetTags: ['witness'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Be convincing.',
          },
        ],
        onCompleteTextTemplate: '{{target}} gets the message.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [30, 55],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        law: [-5, -12],
        townfolk: [-3, -8],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['fixer', 'gang_member', 'corrupt_official'],
    giverFactions: ['copperhead', 'neutral'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['social', 'intimidation', 'criminal'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'intimidate_protection',
    name: 'Protection Money',
    archetype: 'intimidate',
    questType: 'side',
    titleTemplates: ['Collect Protection', 'Time to Pay Up', 'Insurance Collection'],
    descriptionTemplates: [
      "{{target}} hasn't paid protection money. Remind them.",
      "Some merchants need a visit. Collect what's owed.",
      '{{giver}} wants their cut. Make sure they pay.',
    ],
    stages: [
      {
        titleTemplate: 'Collect the Payment',
        descriptionTemplate: 'Visit {{target}} and collect.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['shop', 'building'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Collect from {{target}}',
            targetType: 'npc',
            targetTags: ['merchant', 'victim'],
            countRange: [1, 3],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Payment collected.',
      },
    ],
    rewards: {
      xpRange: [30, 50],
      goldRange: [40, 80],
      itemTags: [],
      itemChance: 0.05,
      reputationImpact: {
        townfolk: [-8, -15],
        law: [-5, -12],
        copperhead: [5, 10],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['gang_boss', 'enforcer', 'fixer'],
    giverFactions: ['copperhead'],
    validLocationTypes: ['town', 'hideout'],
    tags: ['social', 'intimidation', 'gang'],
    repeatable: true,
    cooldownHours: 24,
  },

  // ============================================================================
  // MEDIATE (2 templates)
  // ============================================================================
  {
    id: 'mediate_dispute',
    name: 'Settle the Dispute',
    archetype: 'mediate',
    questType: 'side',
    titleTemplates: ['Peace Talks', 'Mediate the Conflict', 'Settle This'],
    descriptionTemplates: [
      'Two parties are at odds. {{giver}} needs someone to mediate.',
      'This dispute could turn violent. Help find a peaceful resolution.',
      'Neither side will back down. Maybe an outsider can help.',
    ],
    stages: [
      {
        titleTemplate: 'Hear Both Sides',
        descriptionTemplate: 'Talk to both parties.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Speak with the first party',
            targetType: 'npc',
            targetTags: ['disputant'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Speak with the second party',
            targetType: 'npc',
            targetTags: ['disputant'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Broker Peace',
        descriptionTemplate: 'Find a compromise.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Propose a resolution',
            targetType: 'any',
            targetTags: ['negotiation'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The dispute has been resolved.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [8, 15],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['mayor', 'preacher', 'sheriff'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town'],
    tags: ['social', 'mediation', 'peaceful'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'mediate_labor',
    name: 'Labor Dispute',
    archetype: 'mediate',
    questType: 'side',
    titleTemplates: ['Worker Talks', 'Labor Negotiation', 'Strike Mediation'],
    descriptionTemplates: [
      'Workers and management are at an impasse. Help negotiate.',
      'A strike is brewing. Find a compromise before it gets ugly.',
      '{{giver}} needs someone neutral to mediate labor disputes.',
    ],
    stages: [
      {
        titleTemplate: 'Meet Both Sides',
        descriptionTemplate: "Understand each party's concerns.",
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Speak with workers',
            targetType: 'npc',
            targetTags: ['worker', 'miner'],
            countRange: [1, 2],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Speak with management',
            targetType: 'npc',
            targetTags: ['foreman', 'manager'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Negotiate Terms',
        descriptionTemplate: 'Hammer out an agreement.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Finalize the agreement',
            targetType: 'any',
            targetTags: ['contract', 'agreement'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Both sides have reached an agreement.',
      },
    ],
    rewards: {
      xpRange: [45, 75],
      goldRange: [30, 55],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        freeminers: [5, 12],
        ivrc: [3, 8],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['mayor', 'official', 'neutral_party'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town', 'mine'],
    tags: ['social', 'mediation', 'labor'],
    repeatable: true,
    cooldownHours: 96,
  },

  // ============================================================================
  // EXPLORE LOCATION (2 templates)
  // ============================================================================
  {
    id: 'explore_ruins',
    name: 'Explore the Ruins',
    archetype: 'explore_location',
    questType: 'exploration',
    titleTemplates: ['The Old Ruins', 'Explore {{destination}}', 'Survey Mission'],
    descriptionTemplates: [
      "{{giver}} wants to know what's at {{destination}}.",
      "Nobody's been to {{destination}} in years. Scout it out.",
      'There might be something valuable at {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Reach {{destination}}',
        descriptionTemplate: 'Travel to the location.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Reach {{destination}}',
            targetType: 'location',
            targetTags: ['ruins', 'abandoned'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Explore the Area',
        descriptionTemplate: 'Search thoroughly.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Explore {{destination}}',
            targetType: 'any',
            targetTags: ['point_of_interest'],
            countRange: [2, 4],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Find items of interest',
            targetType: 'item',
            targetTags: ['artifact', 'salvage'],
            countRange: [1, 3],
            optional: true,
          },
        ],
        onCompleteTextTemplate: "You've thoroughly explored the area.",
      },
    ],
    rewards: {
      xpRange: [35, 65],
      goldRange: [20, 45],
      itemTags: ['artifact', 'treasure'],
      itemChance: 0.4,
      reputationImpact: {},
    },
    levelRange: [2, 6],
    giverRoles: ['prospector', 'mayor', 'scholar'],
    giverFactions: ['townfolk', 'freeminers'],
    validLocationTypes: ['town', 'outpost'],
    tags: ['exploration', 'adventure'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'explore_cave',
    name: 'Cave Exploration',
    archetype: 'explore_location',
    questType: 'exploration',
    titleTemplates: ['Into the Depths', 'Explore the Cave', 'Underground Survey'],
    descriptionTemplates: [
      "A cave was discovered near {{location}}. See what's inside.",
      '{{giver}} wants the caves at {{destination}} mapped.',
      'Rumors of treasure in the {{destination}} caves. Investigate.',
    ],
    stages: [
      {
        titleTemplate: 'Enter the Cave',
        descriptionTemplate: 'Descend into {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Enter {{destination}}',
            targetType: 'location',
            targetTags: ['cave', 'mine'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Explore the Depths',
        descriptionTemplate: 'Map the cave system.',
        objectives: [
          {
            type: 'interact',
            descriptionTemplate: 'Explore cave sections',
            targetType: 'any',
            targetTags: ['cave_section', 'landmark'],
            countRange: [3, 5],
            optional: false,
          },
          {
            type: 'kill',
            descriptionTemplate: 'Deal with cave creatures',
            targetType: 'enemy',
            targetTags: ['creature', 'vermin'],
            countRange: [0, 4],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'The caves have been mapped.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [25, 55],
      itemTags: ['mineral', 'artifact'],
      itemChance: 0.5,
      reputationImpact: {
        freeminers: [3, 8],
      },
    },
    levelRange: [3, 7],
    giverRoles: ['prospector', 'scholar', 'foreman'],
    giverFactions: ['freeminers', 'townfolk'],
    validLocationTypes: ['town', 'mine'],
    tags: ['exploration', 'dungeon', 'cave'],
    repeatable: true,
    cooldownHours: 48,
  },

  // ============================================================================
  // MAP AREA (2 templates)
  // ============================================================================
  {
    id: 'map_territory',
    name: 'Survey Mission',
    archetype: 'map_area',
    questType: 'exploration',
    titleTemplates: ['Map the Territory', 'Survey {{destination}}', 'Chart the Region'],
    descriptionTemplates: [
      '{{giver}} needs accurate maps of {{destination}}. Survey the area.',
      'The territory around {{destination}} is unmapped. Chart it.',
      'Create a detailed survey for {{giver}}.',
    ],
    stages: [
      {
        titleTemplate: 'Survey {{destination}}',
        descriptionTemplate: 'Visit key points and document the terrain.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Survey point 1',
            targetType: 'location',
            targetTags: ['survey_point', 'landmark'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'visit',
            descriptionTemplate: 'Survey point 2',
            targetType: 'location',
            targetTags: ['survey_point', 'landmark'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'visit',
            descriptionTemplate: 'Survey point 3',
            targetType: 'location',
            targetTags: ['survey_point', 'landmark'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Complete the survey',
            targetType: 'any',
            targetTags: ['survey'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Survey complete.',
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [25, 50],
      itemTags: ['map'],
      itemChance: 0.3,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['surveyor', 'official', 'foreman'],
    giverFactions: ['ivrc', 'townfolk', 'freeminers'],
    validLocationTypes: ['town', 'depot'],
    tags: ['exploration', 'mapping'],
    repeatable: true,
    cooldownHours: 36,
  },
  {
    id: 'map_mining_claims',
    name: 'Claim Survey',
    archetype: 'map_area',
    questType: 'exploration',
    titleTemplates: ['Survey Mining Claims', 'Map the Claims', "Prospector's Survey"],
    descriptionTemplates: [
      '{{giver}} needs mining claims surveyed at {{destination}}.',
      'Document the boundaries of claims near {{destination}}.',
      'Create official maps for the {{destination}} mining district.',
    ],
    stages: [
      {
        titleTemplate: 'Survey the Claims',
        descriptionTemplate: 'Document each mining claim.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Survey claim areas',
            targetType: 'location',
            targetTags: ['mine', 'claim'],
            countRange: [2, 4],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Mark boundaries',
            targetType: 'any',
            targetTags: ['boundary', 'marker'],
            countRange: [3, 5],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Claims have been surveyed.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [30, 55],
      itemTags: ['map', 'document'],
      itemChance: 0.2,
      reputationImpact: {
        freeminers: [5, 12],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['surveyor', 'prospector', 'official'],
    giverFactions: ['freeminers', 'ivrc'],
    validLocationTypes: ['mine', 'town'],
    tags: ['exploration', 'mapping', 'mining'],
    repeatable: true,
    cooldownHours: 48,
  },

  // ============================================================================
  // FIND ROUTE (2 templates)
  // ============================================================================
  {
    id: 'find_shortcut',
    name: 'Find a Shortcut',
    archetype: 'find_route',
    questType: 'exploration',
    titleTemplates: ['Find a Shortcut', 'New Route to {{destination}}', 'Blaze a Trail'],
    descriptionTemplates: [
      '{{giver}} needs a faster route to {{destination}}.',
      'The main road to {{destination}} is too dangerous. Find an alternative.',
      'There must be a shortcut to {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Scout the Terrain',
        descriptionTemplate: 'Look for a viable route.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Explore potential paths',
            targetType: 'location',
            targetTags: ['wilderness', 'pass'],
            countRange: [2, 3],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Mark the best route',
            targetType: 'any',
            targetTags: ['path', 'trail'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Confirm the Route',
        descriptionTemplate: 'Travel the new route.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Follow the route to {{destination}}',
            targetType: 'location',
            targetTags: ['destination'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The new route works!',
      },
    ],
    rewards: {
      xpRange: [40, 75],
      goldRange: [30, 55],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {
        townfolk: [5, 12],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['merchant', 'scout', 'foreman'],
    giverFactions: ['townfolk', 'ivrc', 'freeminers'],
    validLocationTypes: ['town', 'waystation'],
    tags: ['exploration', 'pathfinding'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'find_safe_passage',
    name: 'Safe Passage',
    archetype: 'find_route',
    questType: 'exploration',
    titleTemplates: ['Find Safe Passage', 'Avoid the Danger', 'Alternative Route'],
    descriptionTemplates: [
      'The usual road to {{destination}} is compromised. Find a safe alternative.',
      '{{giver}} needs a route that avoids bandit territory.',
      "Scout a path to {{destination}} that's safe for travelers.",
    ],
    stages: [
      {
        titleTemplate: 'Scout Safe Routes',
        descriptionTemplate: 'Find paths that avoid danger.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Scout potential routes',
            targetType: 'location',
            targetTags: ['wilderness', 'road'],
            countRange: [2, 4],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Assess route safety',
            targetType: 'any',
            targetTags: ['observation'],
            countRange: [2, 3],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Test the Route',
        descriptionTemplate: 'Travel the safe passage yourself.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Complete the journey to {{destination}}',
            targetType: 'location',
            targetTags: ['destination'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The safe route has been confirmed.',
      },
    ],
    rewards: {
      xpRange: [45, 80],
      goldRange: [35, 65],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        townfolk: [8, 15],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['merchant', 'sheriff', 'scout'],
    giverFactions: ['townfolk', 'law'],
    validLocationTypes: ['town'],
    tags: ['exploration', 'pathfinding', 'safety'],
    repeatable: true,
    cooldownHours: 72,
  },

  // ============================================================================
  // DEBT COLLECTION (2 templates)
  // ============================================================================
  {
    id: 'collect_debt',
    name: 'Debt Collection',
    archetype: 'debt_collection',
    questType: 'side',
    titleTemplates: ['Collect from {{target}}', 'Outstanding Debt', 'Payment Due'],
    descriptionTemplates: [
      '{{target}} owes {{giver}} money. Collect it.',
      'That debt has been outstanding for too long.',
      '{{giver}} needs you to convince {{target}} to pay up.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Debtor',
        descriptionTemplate: 'Locate {{target}}.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Find {{target}}',
            targetType: 'npc',
            targetTags: ['debtor'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Collect the Debt',
        descriptionTemplate: 'Get the money.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Collect payment from {{target}}',
            targetType: 'npc',
            targetTags: ['debtor'],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Persuasion or intimidation - your choice.',
          },
        ],
        onCompleteTextTemplate: 'You collected the debt.',
      },
    ],
    rewards: {
      xpRange: [20, 40],
      goldRange: [20, 45],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['banker', 'shopkeeper', 'merchant'],
    giverFactions: ['townfolk', 'ivrc'],
    validLocationTypes: ['town'],
    tags: ['economic', 'collection'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'collect_company_debt',
    name: 'IVRC Debt Collection',
    archetype: 'debt_collection',
    questType: 'side',
    titleTemplates: ['Company Debts', 'IVRC Collection', 'Corporate Recovery'],
    descriptionTemplates: [
      'IVRC has outstanding debts from miners at {{destination}}. Collect.',
      '{{giver}} needs company money recovered from workers who skipped payments.',
      'Some folks owe IVRC. Time to settle accounts.',
    ],
    stages: [
      {
        titleTemplate: 'Collect Debts',
        descriptionTemplate: 'Visit the debtors and collect payment.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Go to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'mine'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Collect from debtors',
            targetType: 'npc',
            targetTags: ['debtor', 'worker'],
            countRange: [2, 4],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Debts collected.',
      },
    ],
    rewards: {
      xpRange: [30, 55],
      goldRange: [35, 70],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        ivrc: [5, 12],
        freeminers: [-5, -12],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['company_agent', 'accountant', 'foreman'],
    giverFactions: ['ivrc'],
    validLocationTypes: ['town', 'mine'],
    tags: ['economic', 'collection', 'ivrc'],
    repeatable: true,
    cooldownHours: 36,
  },

  // ============================================================================
  // INVESTMENT (2 templates)
  // ============================================================================
  {
    id: 'investment_prospect',
    name: 'Prospecting Investment',
    archetype: 'investment',
    questType: 'side',
    titleTemplates: ['Investment Opportunity', 'Fund the Prospect', 'Mining Venture'],
    descriptionTemplates: [
      '{{giver}} has found a promising site but needs funding.',
      'A mining claim at {{destination}} needs capital. High risk, high reward.',
      "Fund {{giver}}'s operation for a cut of the profits.",
    ],
    stages: [
      {
        titleTemplate: 'Meet the Prospector',
        descriptionTemplate: 'Learn about the opportunity.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Meet {{giver}}',
            targetType: 'npc',
            targetTags: ['prospector', 'miner'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Verify the Claim',
        descriptionTemplate: 'Check if the claim is legitimate.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Inspect the claim at {{destination}}',
            targetType: 'location',
            targetTags: ['mine', 'deposit'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'interact',
            descriptionTemplate: 'Evaluate the potential',
            targetType: 'any',
            targetTags: ['ore_sample'],
            countRange: [1, 2],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Make the Investment',
        descriptionTemplate: 'Decide whether to invest.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Finalize terms',
            targetType: 'npc',
            targetTags: ['prospector'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Investment made. Now we wait.',
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [40, 100],
      itemTags: ['ore', 'mineral'],
      itemChance: 0.4,
      reputationImpact: {
        freeminers: [5, 12],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['prospector', 'miner', 'investor'],
    giverFactions: ['freeminers', 'townfolk'],
    validLocationTypes: ['town', 'mine'],
    tags: ['economic', 'investment', 'mining'],
    repeatable: true,
    cooldownHours: 72,
  },
  {
    id: 'investment_business',
    name: 'Business Investment',
    archetype: 'investment',
    questType: 'side',
    titleTemplates: ['Business Opportunity', 'Back the Venture', 'Startup Funding'],
    descriptionTemplates: [
      '{{giver}} wants to start a business but needs capital.',
      'An entrepreneur needs investment for a new venture.',
      "Fund {{giver}}'s idea for a share of the profits.",
    ],
    stages: [
      {
        titleTemplate: 'Hear the Pitch',
        descriptionTemplate: 'Learn about the business opportunity.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Meet {{giver}}',
            targetType: 'npc',
            targetTags: ['entrepreneur', 'merchant'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Due Diligence',
        descriptionTemplate: 'Investigate the viability.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Research the market',
            targetType: 'npc',
            targetTags: ['merchant', 'local'],
            countRange: [1, 2],
            optional: false,
          },
          {
            type: 'visit',
            descriptionTemplate: 'Check the proposed location',
            targetType: 'location',
            targetTags: ['building', 'shop'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Invest',
        descriptionTemplate: 'Commit your funds.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Make the investment',
            targetType: 'npc',
            targetTags: ['entrepreneur'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: "You're now a business partner.",
      },
    ],
    rewards: {
      xpRange: [40, 70],
      goldRange: [50, 120],
      itemTags: ['trade_goods'],
      itemChance: 0.3,
      reputationImpact: {
        townfolk: [5, 12],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['entrepreneur', 'merchant', 'inventor'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['economic', 'investment', 'business'],
    repeatable: true,
    cooldownHours: 96,
  },

  // ============================================================================
  // TRADE ROUTE (2 templates)
  // ============================================================================
  {
    id: 'trade_route_establish',
    name: 'Establish Trade Route',
    archetype: 'trade_route',
    questType: 'side',
    titleTemplates: ['New Trade Route', 'Commerce to {{destination}}', 'Open the Markets'],
    descriptionTemplates: [
      '{{giver}} wants to establish trade with {{destination}}.',
      'Open a trade route between here and {{destination}}.',
      'Negotiate a trade agreement with merchants at {{destination}}.',
    ],
    stages: [
      {
        titleTemplate: 'Meet the Traders',
        descriptionTemplate: 'Contact merchants at {{destination}}.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Travel to {{destination}}',
            targetType: 'location',
            targetTags: ['town', 'trading_post'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Speak with local merchants',
            targetType: 'npc',
            targetTags: ['merchant', 'trader'],
            countRange: [1, 2],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Prove Viability',
        descriptionTemplate: 'Show the trade route is profitable.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Deliver sample goods',
            targetType: 'item',
            targetTags: ['trade_goods'],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Bring back return goods',
            targetType: 'item',
            targetTags: ['trade_goods'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Finalize the Route',
        descriptionTemplate: 'Complete the agreement.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Sign the agreement',
            targetType: 'npc',
            targetTags: ['merchant', 'official'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Trade route established!',
      },
    ],
    rewards: {
      xpRange: [50, 90],
      goldRange: [45, 90],
      itemTags: ['trade_goods'],
      itemChance: 0.35,
      reputationImpact: {
        townfolk: [10, 20],
      },
    },
    levelRange: [3, 6],
    giverRoles: ['merchant', 'mayor', 'guild_master'],
    giverFactions: ['townfolk', 'ivrc'],
    validLocationTypes: ['town'],
    tags: ['economic', 'trade', 'commerce'],
    repeatable: true,
    cooldownHours: 96,
  },
  {
    id: 'trade_route_protect',
    name: 'Secure Trade Route',
    archetype: 'trade_route',
    questType: 'side',
    titleTemplates: ['Protect the Trade Route', 'Secure Commerce', 'Clear the Trading Path'],
    descriptionTemplates: [
      'The trade route to {{destination}} is threatened. Secure it.',
      'Bandits are disrupting trade. Make the route safe.',
      '{{giver}} needs the path to {{destination}} protected.',
    ],
    stages: [
      {
        titleTemplate: 'Assess Threats',
        descriptionTemplate: 'Scout the route for dangers.',
        objectives: [
          {
            type: 'visit',
            descriptionTemplate: 'Patrol the route',
            targetType: 'location',
            targetTags: ['road', 'pass'],
            countRange: [2, 3],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Eliminate Threats',
        descriptionTemplate: 'Deal with anyone threatening trade.',
        objectives: [
          {
            type: 'kill',
            descriptionTemplate: 'Defeat bandits',
            targetType: 'enemy',
            targetTags: ['bandit', 'raider'],
            countRange: [4, 8],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Confirm Security',
        descriptionTemplate: 'Report that the route is secure.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: ['merchant'],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The trade route is secure.',
      },
    ],
    rewards: {
      xpRange: [55, 95],
      goldRange: [40, 80],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        townfolk: [8, 15],
        law: [5, 10],
      },
    },
    levelRange: [3, 7],
    giverRoles: ['merchant', 'caravan_master', 'mayor'],
    giverFactions: ['townfolk'],
    validLocationTypes: ['town'],
    tags: ['economic', 'trade', 'combat'],
    repeatable: true,
    cooldownHours: 72,
  },
];

// Validate all templates at load time
QUEST_TEMPLATES.forEach((template, index) => {
  try {
    QuestTemplateSchema.parse(template);
  } catch (error) {
    console.error(`Invalid quest template at index ${index}:`, template.id, error);
  }
});

// Build lookup indexes
const TEMPLATES_BY_ID: Record<string, QuestTemplate> = {};
const TEMPLATES_BY_ARCHETYPE: Record<QuestArchetype, QuestTemplate[]> = {
  bounty_hunt: [],
  clear_area: [],
  escort: [],
  ambush: [],
  fetch_item: [],
  steal_item: [],
  recover_lost: [],
  gather_materials: [],
  deliver_message: [],
  deliver_package: [],
  smuggle: [],
  find_person: [],
  investigate: [],
  spy: [],
  convince_npc: [],
  intimidate: [],
  mediate: [],
  explore_location: [],
  map_area: [],
  find_route: [],
  debt_collection: [],
  investment: [],
  trade_route: [],
};

for (const template of QUEST_TEMPLATES) {
  TEMPLATES_BY_ID[template.id] = template;
  TEMPLATES_BY_ARCHETYPE[template.archetype].push(template);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get quest template by ID
 */
export function getQuestTemplate(id: string): QuestTemplate | undefined {
  return TEMPLATES_BY_ID[id];
}

/**
 * Get quest templates by archetype
 */
export function getQuestTemplatesByArchetype(archetype: QuestArchetype): QuestTemplate[] {
  return TEMPLATES_BY_ARCHETYPE[archetype] ?? [];
}

/**
 * Get quest templates valid for a level
 */
export function getQuestTemplatesForLevel(level: number): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => level >= t.levelRange[0] && level <= t.levelRange[1]);
}

/**
 * Get quest templates for a specific giver
 */
export function getQuestTemplatesForGiver(role: string, faction: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => {
    const roleMatch = t.giverRoles.length === 0 || t.giverRoles.includes(role);
    const factionMatch = t.giverFactions.length === 0 || t.giverFactions.includes(faction);
    return roleMatch && factionMatch;
  });
}

/**
 * Get quest templates by tag
 */
export function getQuestTemplatesByTag(tag: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => t.tags.includes(tag));
}

/**
 * Get a random template matching criteria
 */
export function getRandomQuestTemplate(
  criteria: {
    archetype?: QuestArchetype;
    level?: number;
    tags?: string[];
    giverRole?: string;
    giverFaction?: string;
  },
  random: () => number = Math.random
): QuestTemplate | undefined {
  let candidates = [...QUEST_TEMPLATES];

  if (criteria.archetype) {
    candidates = candidates.filter((t) => t.archetype === criteria.archetype);
  }

  if (criteria.level !== undefined) {
    candidates = candidates.filter(
      (t) => criteria.level! >= t.levelRange[0] && criteria.level! <= t.levelRange[1]
    );
  }

  if (criteria.tags && criteria.tags.length > 0) {
    candidates = candidates.filter((t) => criteria.tags!.some((tag) => t.tags.includes(tag)));
  }

  if (criteria.giverRole) {
    candidates = candidates.filter((t) => t.giverRoles.includes(criteria.giverRole!));
  }

  if (criteria.giverFaction) {
    candidates = candidates.filter((t) => t.giverFactions.includes(criteria.giverFaction!));
  }

  if (candidates.length === 0) {
    return undefined;
  }

  return candidates[Math.floor(random() * candidates.length)];
}
