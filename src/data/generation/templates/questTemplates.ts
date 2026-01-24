/**
 * Quest Templates - Procedural quest generation templates
 *
 * Templates define the structure for different quest archetypes
 * with variable slots for procedural content generation.
 */

import { type QuestTemplate, QuestTemplateSchema } from '../../schemas/generation';

/**
 * All quest templates
 */
export const QUEST_TEMPLATES: QuestTemplate[] = [
  // ============================================================================
  // BOUNTY HUNTS
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
    ],
    descriptionTemplates: [
      '{{target}} is wanted for crimes in {{region}}. Bring them in, dead or alive.',
      'The law wants {{target}}. There\'s a price on their head.',
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
        law_enforcement: [5, 15],
        desperados: [-5, -15],
      },
    },
    levelRange: [1, 5],
    giverRoles: ['sheriff', 'deputy', 'bounty_hunter'],
    giverFactions: ['law_enforcement'],
    validLocationTypes: ['frontier_town', 'mining_town', 'cattle_town'],
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
      'Take Down {{target}}\'s Gang',
    ],
    descriptionTemplates: [
      '{{target}} leads a gang terrorizing {{region}}. The bounty is substantial.',
      'This outlaw has evaded the law for too long. It ends now.',
      '{{giver}} is offering top dollar for {{target}}.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Gang',
        descriptionTemplate: 'Locate {{target}}\'s hideout.',
        objectives: [
          {
            type: 'explore',
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
      {
        titleTemplate: 'Claim Your Reward',
        descriptionTemplate: 'Return to {{giver}}.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: ['lawman'],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [60, 100],
      goldRange: [50, 100],
      itemTags: ['weapon'],
      itemChance: 0.4,
      reputationImpact: {
        law_enforcement: [10, 25],
        desperados: [-15, -30],
      },
    },
    levelRange: [3, 8],
    giverRoles: ['sheriff', 'deputy'],
    giverFactions: ['law_enforcement'],
    validLocationTypes: ['frontier_town'],
    tags: ['combat', 'bounty', 'gang', 'difficult'],
    repeatable: true,
    cooldownHours: 72,
  },

  // ============================================================================
  // CLEAR AREA
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
      {
        titleTemplate: 'Report Back',
        descriptionTemplate: 'Tell {{giver}} the good news.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [25, 50],
      goldRange: [15, 35],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        town_council: [3, 8],
      },
    },
    levelRange: [1, 5],
    giverRoles: ['sheriff', 'mayor', 'shopkeeper', 'homesteader'],
    giverFactions: [],
    validLocationTypes: ['frontier_town', 'cattle_town', 'outpost'],
    tags: ['combat', 'safety'],
    repeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'clear_wildlife',
    name: 'Wildlife Control',
    archetype: 'clear_area',
    questType: 'side',
    titleTemplates: [
      'Predator Problem',
      'Dangerous Wildlife',
      'Animal Attacks Near {{location}}',
    ],
    descriptionTemplates: [
      'Wild animals have been attacking livestock and people. Hunt them down.',
      '{{giver}} lost cattle to predators. Help deal with the problem.',
      'The wildlife\'s gotten bold and dangerous. Thin the herd.',
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
      {
        titleTemplate: 'Return to {{giver}}',
        descriptionTemplate: 'Collect your reward.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [15, 30],
      goldRange: [10, 25],
      itemTags: ['leather', 'hide'],
      itemChance: 0.3,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['homesteader', 'ranch_hand', 'prospector'],
    giverFactions: [],
    validLocationTypes: ['ranch', 'homestead', 'cattle_town'],
    tags: ['hunting', 'wildlife'],
    repeatable: true,
    cooldownHours: 24,
  },

  // ============================================================================
  // FETCH ITEM
  // ============================================================================
  {
    id: 'fetch_medicine',
    name: 'Medicine Run',
    archetype: 'fetch_item',
    questType: 'side',
    titleTemplates: [
      'Urgent: Medicine Needed',
      'Medical Supplies for {{location}}',
      'Fetch Dr. {{giver}}\'s Order',
    ],
    descriptionTemplates: [
      '{{giver}} desperately needs medical supplies from {{destination}}.',
      'Someone\'s sick and needs medicine. Pick it up from {{destination}}.',
      'The doctor is out of supplies. Get more from the trading post.',
    ],
    stages: [
      {
        titleTemplate: 'Get the Medicine',
        descriptionTemplate: 'Travel to {{destination}} and acquire the supplies.',
        objectives: [
          {
            type: 'fetch',
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
      reputationImpact: {},
    },
    levelRange: [1, 3],
    giverRoles: ['doctor'],
    giverFactions: [],
    validLocationTypes: ['frontier_town', 'mining_town'],
    tags: ['fetch', 'urgent', 'helpful'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'fetch_parts',
    name: 'Machine Parts',
    archetype: 'fetch_item',
    questType: 'side',
    titleTemplates: [
      'Parts Needed',
      'Steam Engine Repair',
      'Mechanical Components Wanted',
    ],
    descriptionTemplates: [
      '{{giver}} needs specific parts to fix a machine. Can you find them?',
      'The steam engine is down. We need replacement parts.',
      'Without these parts, the whole operation stops.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Parts',
        descriptionTemplate: 'Search for the mechanical components.',
        objectives: [
          {
            type: 'fetch',
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
            targetTags: ['blacksmith', 'engineer'],
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
        mining_consortium: [3, 8],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['blacksmith'],
    giverFactions: ['mining_consortium', 'railroad_company'],
    validLocationTypes: ['mining_town', 'frontier_town'],
    tags: ['fetch', 'industrial'],
    repeatable: true,
    cooldownHours: 36,
  },

  // ============================================================================
  // DELIVERY
  // ============================================================================
  {
    id: 'deliver_message',
    name: 'Message Delivery',
    archetype: 'deliver_message',
    questType: 'side',
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
            targetTags: [],
            countRange: [1, 1],
            optional: false,
            hintTemplate: '{{target}} should be in {{destination}}.',
          },
        ],
        onCompleteTextTemplate: 'The message was delivered.',
      },
      {
        titleTemplate: 'Return for Payment',
        descriptionTemplate: 'Go back to {{giver}} for your reward.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
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
    giverFactions: [],
    validLocationTypes: ['frontier_town', 'cattle_town', 'mining_town'],
    tags: ['delivery', 'simple', 'travel'],
    repeatable: true,
    cooldownHours: 12,
  },
  {
    id: 'deliver_package',
    name: 'Package Delivery',
    archetype: 'deliver_package',
    questType: 'side',
    titleTemplates: [
      'Deliver to {{target}}',
      'Package for {{destination}}',
      'Special Delivery',
    ],
    descriptionTemplates: [
      '{{giver}} has a package that needs to reach {{target}} safely.',
      'This crate is valuable. Don\'t let anything happen to it.',
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
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Package delivered safely.',
      },
      {
        titleTemplate: 'Collect Payment',
        descriptionTemplate: 'Return to {{giver}}.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [20, 35],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        merchants_guild: [2, 5],
      },
    },
    levelRange: [1, 4],
    giverRoles: ['shopkeeper', 'saloon_keeper'],
    giverFactions: ['merchants_guild'],
    validLocationTypes: ['frontier_town', 'trading_post'],
    tags: ['delivery', 'cargo'],
    repeatable: true,
    cooldownHours: 24,
  },

  // ============================================================================
  // INVESTIGATION
  // ============================================================================
  {
    id: 'find_missing_person',
    name: 'Missing Person',
    archetype: 'find_person',
    questType: 'side',
    titleTemplates: [
      'Find {{target}}',
      'Missing: {{target}}',
      'Search for the Lost',
    ],
    descriptionTemplates: [
      '{{target}} went missing days ago. {{giver}} is worried sick.',
      'No one has seen {{target}} since they headed to {{destination}}.',
      'Help find {{target}}. They could be in danger.',
    ],
    stages: [
      {
        titleTemplate: 'Search for {{target}}',
        descriptionTemplate: 'Investigate {{target}}\'s disappearance.',
        objectives: [
          {
            type: 'investigate',
            descriptionTemplate: 'Search for clues about {{target}}',
            targetType: 'location',
            targetTags: [],
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
            type: 'find',
            descriptionTemplate: 'Find {{target}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'You found {{target}}!',
      },
      {
        titleTemplate: 'Report Back',
        descriptionTemplate: 'Tell {{giver}} the news.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [30, 50],
      goldRange: [20, 40],
      itemTags: [],
      itemChance: 0.15,
      reputationImpact: {},
    },
    levelRange: [2, 5],
    giverRoles: ['homesteader', 'shopkeeper', 'saloon_keeper'],
    giverFactions: [],
    validLocationTypes: ['frontier_town', 'mining_town', 'cattle_town'],
    tags: ['investigation', 'missing_person'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'investigate_crime',
    name: 'Crime Investigation',
    archetype: 'investigate',
    questType: 'side',
    titleTemplates: [
      'Who Done It?',
      'Solve the Crime',
      'Investigation: {{location}}',
    ],
    descriptionTemplates: [
      'Something bad happened and {{giver}} wants to know who\'s responsible.',
      'There\'s been a crime. Help investigate.',
      '{{giver}} needs someone to get to the bottom of this.',
    ],
    stages: [
      {
        titleTemplate: 'Gather Evidence',
        descriptionTemplate: 'Investigate the scene and talk to witnesses.',
        objectives: [
          {
            type: 'investigate',
            descriptionTemplate: 'Search for clues',
            targetType: 'location',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Interview witnesses',
            targetType: 'npc',
            targetTags: [],
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
            type: 'confront',
            descriptionTemplate: 'Confront the culprit',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'Justice has been served.',
      },
      {
        titleTemplate: 'Report to {{giver}}',
        descriptionTemplate: 'Tell {{giver}} what you found.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report findings',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [35, 60],
      goldRange: [25, 50],
      itemTags: [],
      itemChance: 0.2,
      reputationImpact: {
        law_enforcement: [5, 10],
      },
    },
    levelRange: [2, 6],
    giverRoles: ['sheriff', 'mayor'],
    giverFactions: ['law_enforcement', 'town_council'],
    validLocationTypes: ['frontier_town', 'mining_town'],
    tags: ['investigation', 'crime', 'mystery'],
    repeatable: true,
    cooldownHours: 72,
  },

  // ============================================================================
  // SOCIAL
  // ============================================================================
  {
    id: 'convince_settler',
    name: 'Persuade the Settler',
    archetype: 'convince_npc',
    questType: 'side',
    titleTemplates: [
      'Talk Some Sense',
      'Convince {{target}}',
      'Diplomatic Mission',
    ],
    descriptionTemplates: [
      '{{giver}} needs you to convince {{target}} to see reason.',
      '{{target}} won\'t listen to {{giver}}. Maybe they\'ll listen to you.',
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
            targetTags: [],
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
            type: 'persuade',
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
      {
        titleTemplate: 'Report Success',
        descriptionTemplate: 'Tell {{giver}} the good news.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [25, 40],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['mayor', 'sheriff', 'preacher'],
    giverFactions: [],
    validLocationTypes: ['frontier_town', 'cattle_town'],
    tags: ['social', 'diplomacy', 'peaceful'],
    repeatable: true,
    cooldownHours: 48,
  },
  {
    id: 'mediate_dispute',
    name: 'Settle the Dispute',
    archetype: 'mediate',
    questType: 'side',
    titleTemplates: [
      'Peace Talks',
      'Mediate the Conflict',
      'Settle This',
    ],
    descriptionTemplates: [
      'Two parties are at odds. {{giver}} needs someone to mediate.',
      'This dispute could turn violent. Help find a peaceful resolution.',
      'Neither side will back down. Maybe an outsider can help.',
    ],
    stages: [
      {
        titleTemplate: 'Hear Both Sides',
        descriptionTemplate: 'Talk to both parties to understand the conflict.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Speak with the first party',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'talk',
            descriptionTemplate: 'Speak with the second party',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Broker Peace',
        descriptionTemplate: 'Find a compromise both sides can accept.',
        objectives: [
          {
            type: 'mediate',
            descriptionTemplate: 'Propose a resolution',
            targetType: 'any',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
        onCompleteTextTemplate: 'The dispute has been resolved.',
      },
      {
        titleTemplate: 'Report to {{giver}}',
        descriptionTemplate: 'Inform {{giver}} of the outcome.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [30, 50],
      goldRange: [20, 35],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {
        town_council: [5, 10],
      },
    },
    levelRange: [2, 5],
    giverRoles: ['mayor', 'preacher', 'sheriff'],
    giverFactions: [],
    validLocationTypes: ['frontier_town', 'cattle_town', 'mining_town'],
    tags: ['social', 'mediation', 'peaceful'],
    repeatable: true,
    cooldownHours: 72,
  },

  // ============================================================================
  // EXPLORATION
  // ============================================================================
  {
    id: 'explore_ruins',
    name: 'Explore the Ruins',
    archetype: 'explore_location',
    questType: 'side',
    titleTemplates: [
      'The Old Ruins',
      'Explore {{destination}}',
      'Survey Mission',
    ],
    descriptionTemplates: [
      '{{giver}} wants to know what\'s in the old ruins at {{destination}}.',
      'Nobody\'s been to {{destination}} in years. Scout it out.',
      'There might be something valuable at {{destination}}. Check it out.',
    ],
    stages: [
      {
        titleTemplate: 'Reach {{destination}}',
        descriptionTemplate: 'Travel to the location.',
        objectives: [
          {
            type: 'travel',
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
        descriptionTemplate: 'Search the location thoroughly.',
        objectives: [
          {
            type: 'explore',
            descriptionTemplate: 'Explore {{destination}}',
            targetType: 'location',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
          {
            type: 'collect',
            descriptionTemplate: 'Find items of interest',
            targetType: 'item',
            targetTags: [],
            countRange: [1, 3],
            optional: true,
          },
        ],
        onCompleteTextTemplate: 'You\'ve thoroughly explored the area.',
      },
      {
        titleTemplate: 'Report Findings',
        descriptionTemplate: 'Tell {{giver}} what you found.',
        objectives: [
          {
            type: 'talk',
            descriptionTemplate: 'Report to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [30, 55],
      goldRange: [15, 35],
      itemTags: ['artifact', 'treasure'],
      itemChance: 0.4,
      reputationImpact: {},
    },
    levelRange: [2, 6],
    giverRoles: ['prospector', 'mayor', 'shopkeeper'],
    giverFactions: [],
    validLocationTypes: ['frontier_town', 'outpost'],
    tags: ['exploration', 'adventure'],
    repeatable: true,
    cooldownHours: 72,
  },

  // ============================================================================
  // ECONOMIC
  // ============================================================================
  {
    id: 'collect_debt',
    name: 'Debt Collection',
    archetype: 'debt_collection',
    questType: 'side',
    titleTemplates: [
      'Collect from {{target}}',
      'Outstanding Debt',
      'Payment Due',
    ],
    descriptionTemplates: [
      '{{target}} owes {{giver}} money. Collect it.',
      'That debt has been outstanding for too long. Get the money.',
      '{{giver}} needs you to convince {{target}} to pay up.',
    ],
    stages: [
      {
        titleTemplate: 'Find the Debtor',
        descriptionTemplate: 'Locate {{target}}.',
        objectives: [
          {
            type: 'find',
            descriptionTemplate: 'Find {{target}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
      {
        titleTemplate: 'Collect the Debt',
        descriptionTemplate: 'Get the money from {{target}}.',
        objectives: [
          {
            type: 'collect',
            descriptionTemplate: 'Collect payment from {{target}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
            hintTemplate: 'Persuasion or intimidation - your choice.',
          },
        ],
        onCompleteTextTemplate: 'You collected the debt.',
      },
      {
        titleTemplate: 'Return the Money',
        descriptionTemplate: 'Bring the payment back to {{giver}}.',
        objectives: [
          {
            type: 'deliver',
            descriptionTemplate: 'Give payment to {{giver}}',
            targetType: 'npc',
            targetTags: [],
            countRange: [1, 1],
            optional: false,
          },
        ],
      },
    ],
    rewards: {
      xpRange: [20, 35],
      goldRange: [15, 30],
      itemTags: [],
      itemChance: 0.1,
      reputationImpact: {},
    },
    levelRange: [1, 4],
    giverRoles: ['banker', 'shopkeeper', 'saloon_keeper'],
    giverFactions: ['merchants_guild'],
    validLocationTypes: ['frontier_town', 'mining_town', 'cattle_town'],
    tags: ['economic', 'collection'],
    repeatable: true,
    cooldownHours: 48,
  },
];

// Validate all templates
QUEST_TEMPLATES.forEach((template, index) => {
  try {
    QuestTemplateSchema.parse(template);
  } catch (error) {
    console.error(`Invalid quest template at index ${index}:`, template.id, error);
  }
});

/**
 * Get quest template by ID
 */
export function getQuestTemplateById(id: string): QuestTemplate | undefined {
  return QUEST_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get quest templates by archetype
 */
export function getQuestTemplatesByArchetype(
  archetype: QuestTemplate['archetype']
): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => t.archetype === archetype);
}

/**
 * Get quest templates valid for a level
 */
export function getQuestTemplatesForLevel(level: number): QuestTemplate[] {
  return QUEST_TEMPLATES.filter(
    (t) => level >= t.levelRange[0] && level <= t.levelRange[1]
  );
}

/**
 * Get quest templates for a specific giver
 */
export function getQuestTemplatesForGiver(
  role: string,
  faction: string
): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => {
    const roleMatch =
      t.giverRoles.length === 0 || t.giverRoles.includes(role);
    const factionMatch =
      t.giverFactions.length === 0 || t.giverFactions.includes(faction);
    return roleMatch && factionMatch;
  });
}

/**
 * Get quest templates by tag
 */
export function getQuestTemplatesByTag(tag: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => t.tags.includes(tag));
}
