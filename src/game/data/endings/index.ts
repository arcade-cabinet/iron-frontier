/**
 * Iron Frontier - Multiple Endings System
 *
 * Six distinct endings based on player choices throughout the game.
 * Each ending represents a different path through the main conflict.
 *
 * Endings:
 * 1. The Corporate Victory (IVRC path) - Thorne wins, player becomes executive
 * 2. The Revolution (Copperhead path) - Violent overthrow, freedom through chaos
 * 3. The Peaceful Reform (Freeminer path) - Legal victory, gradual change
 * 4. The Lawman's Justice (Law path) - Fair trial, system works
 * 5. The Exodus (Underground path) - Workers escape, IVRC loses workforce
 * 6. The Lone Wolf (Independent path) - Reject all factions, leave as anti-hero
 */

import type { CharacterFate, Ending, EpilogueSlide } from '../schemas/ending';
import { FACTION_IDS, NPC_IDS, QUEST_FLAGS } from '../quests/questTypes';

// ============================================================================
// CHARACTER FATE DEFINITIONS
// ============================================================================

// Reusable character fates that vary by ending

const THORNE_FATES = {
  victorious: {
    npcId: 'cornelius_thorne',
    displayName: 'Director Cornelius Thorne',
    fate: 'alive_happy' as const,
    description:
      'Thorne consolidates power over the entire region. With your help, IVRC becomes the undisputed authority. He rewards your loyalty with wealth and position.',
    priority: 0,
  },
  imprisoned: {
    npcId: 'cornelius_thorne',
    displayName: 'Director Cornelius Thorne',
    fate: 'imprisoned' as const,
    description:
      'Thorne is arrested and tried for his crimes. The evidence you gathered ensures a fair trial, and he is sentenced to life imprisonment.',
    priority: 0,
  },
  executed: {
    npcId: 'cornelius_thorne',
    displayName: 'Director Cornelius Thorne',
    fate: 'dead_justice' as const,
    description:
      'Thorne is executed by the revolutionary forces. His reign of terror ends at the end of a rope, witnessed by those he oppressed.',
    priority: 0,
  },
  escaped: {
    npcId: 'cornelius_thorne',
    displayName: 'Director Cornelius Thorne',
    fate: 'departed' as const,
    description:
      'Thorne flees the region as his empire crumbles. He takes what wealth he can carry and disappears into the east, a wanted man.',
    priority: 0,
  },
  defeated: {
    npcId: 'cornelius_thorne',
    displayName: 'Director Cornelius Thorne',
    fate: 'alive_struggling' as const,
    description:
      'Thorne loses everything but his life. Stripped of power and wealth, he wanders the frontier a broken man.',
    priority: 0,
  },
};

const DIAMONDBACK_FATES = {
  victorious: {
    npcId: 'diamondback',
    displayName: 'Diamondback',
    fate: 'alive_happy' as const,
    description:
      "Diamondback achieves her dream of freedom for the workers. She becomes a folk hero, though the cost was high. Her name is sung in saloons across the frontier.",
    priority: 0,
  },
  executed: {
    npcId: 'diamondback',
    displayName: 'Diamondback',
    fate: 'dead_justice' as const,
    description:
      'Diamondback is captured and hanged for her crimes. Even at the gallows, she refuses to repent, dying as she lived - defiant.',
    priority: 0,
  },
  imprisoned: {
    npcId: 'diamondback',
    displayName: 'Diamondback',
    fate: 'imprisoned' as const,
    description:
      'Diamondback is captured but spared execution. She spends her days in prison, planning her next escape.',
    priority: 0,
  },
  departed: {
    npcId: 'diamondback',
    displayName: 'Diamondback',
    fate: 'departed' as const,
    description:
      'Diamondback leaves the region, knowing her fight is over here. She rides into the sunset, seeking new frontiers and new causes.',
    priority: 0,
  },
  redeemed: {
    npcId: 'diamondback',
    displayName: 'Diamondback',
    fate: 'redeemed' as const,
    description:
      'Diamondback accepts a pardon in exchange for testimony against Thorne. She takes a new name and starts a quiet life, though her eyes still burn with fire.',
    priority: 0,
  },
};

const SAMUEL_FATES = {
  victorious: {
    npcId: 'samuel_ironpick',
    displayName: 'Old Samuel Ironpick',
    fate: 'alive_happy' as const,
    description:
      "Samuel lives to see his dream realized. The documents he protected for years finally brought justice. He spends his final days in peace, surrounded by free workers.",
    priority: 0,
  },
  tragic: {
    npcId: 'samuel_ironpick',
    displayName: 'Old Samuel Ironpick',
    fate: 'dead_tragic' as const,
    description:
      'Samuel dies without seeing justice. The documents are lost in the chaos, and his sacrifice is forgotten by all but a few.',
    priority: 0,
  },
  struggling: {
    npcId: 'samuel_ironpick',
    displayName: 'Old Samuel Ironpick',
    fate: 'alive_struggling' as const,
    description:
      'Samuel survives but the revolution took its toll. He lost too many friends to violence to call it victory.',
    priority: 0,
  },
  departed: {
    npcId: 'samuel_ironpick',
    displayName: 'Old Samuel Ironpick',
    fate: 'departed' as const,
    description:
      'Samuel leaves with the exodus, finally free of the mines that took his son. He finds peace in a new land, far from the frontier.',
    priority: 0,
  },
};

const SHERIFF_COLE_FATES = {
  vindicated: {
    npcId: 'sheriff_cole',
    displayName: 'Sheriff Marcus Cole',
    fate: 'alive_happy' as const,
    description:
      'Sheriff Cole sees justice served through the proper channels. His faith in the law is restored, and he continues to protect the innocent.',
    priority: 0,
  },
  compromised: {
    npcId: 'sheriff_cole',
    displayName: 'Sheriff Marcus Cole',
    fate: 'alive_struggling' as const,
    description:
      'Sheriff Cole survives, but the corruption ran too deep. He turns in his badge, unable to serve a system he no longer trusts.',
    priority: 0,
  },
  heroic: {
    npcId: 'sheriff_cole',
    displayName: 'Sheriff Marcus Cole',
    fate: 'dead_heroic' as const,
    description:
      'Sheriff Cole dies defending the innocent during the final confrontation. His sacrifice is not forgotten.',
    priority: 0,
  },
  departed: {
    npcId: 'sheriff_cole',
    displayName: 'Sheriff Marcus Cole',
    fate: 'departed' as const,
    description:
      'Sheriff Cole leaves the region, seeking a town that still believes in justice. The frontier has broken too many of his ideals.',
    priority: 0,
  },
};

const CLARA_FATES = {
  happy: {
    npcId: NPC_IDS.ENGINEER_CLARA,
    displayName: 'Engineer Clara',
    fate: 'alive_happy' as const,
    description:
      'Clara uses her skills to help rebuild. Her inventions improve the lives of workers across the region.',
    priority: 0,
  },
  struggling: {
    npcId: NPC_IDS.ENGINEER_CLARA,
    displayName: 'Engineer Clara',
    fate: 'alive_struggling' as const,
    description:
      'Clara survives but struggles to find her place in the new order. Her association with the mines haunts her.',
    priority: 0,
  },
  departed: {
    npcId: NPC_IDS.ENGINEER_CLARA,
    displayName: 'Engineer Clara',
    fate: 'departed' as const,
    description:
      'Clara leaves with the exodus, taking her technical knowledge to a new frontier where she can start fresh.',
    priority: 0,
  },
};

const MAGGIE_FATES = {
  leader: {
    npcId: 'maggie_ironpick',
    displayName: 'Margaret "Maggie" Ironpick',
    fate: 'alive_happy' as const,
    description:
      "Maggie becomes a leader of the new workers' movement, carrying on her grandfather's dream with youthful fire.",
    priority: 0,
  },
  tragic: {
    npcId: 'maggie_ironpick',
    displayName: 'Margaret "Maggie" Ironpick',
    fate: 'dead_tragic' as const,
    description:
      'Maggie dies in the fighting, her potential cut short. Samuel mourns the loss of another generation to the conflict.',
    priority: 0,
  },
  departed: {
    npcId: 'maggie_ironpick',
    displayName: 'Margaret "Maggie" Ironpick',
    fate: 'departed' as const,
    description:
      'Maggie leaves with her grandfather, eager to build something new rather than fight over the old.',
    priority: 0,
  },
};

// ============================================================================
// ENDING 1: THE CORPORATE VICTORY
// ============================================================================

const CORPORATE_VICTORY_SLIDES: EpilogueSlide[] = [
  {
    id: 'corporate_1',
    title: 'Victory for Progress',
    text: "IVRC's banner flies over every town in the territory. With your help, Director Thorne crushed all opposition. The mines run day and night, feeding the insatiable appetite of industry.",
    imageKey: 'epilogue_ivrc_victory',
    tags: ['ivrc', 'victory'],
  },
  {
    id: 'corporate_2',
    title: 'The Price of Progress',
    text: 'The workers toil under strict company rule. The wages are fair, Thorne keeps his promises, but the freedom they once dreamed of is now just a memory. Efficiency has replaced hope.',
    imageKey: 'epilogue_workers_controlled',
    tags: ['ivrc', 'bittersweet'],
  },
  {
    id: 'corporate_3',
    title: 'Your Reward',
    text: "Thorne promotes you to Regional Overseer. A grand office, a generous salary, the power to shape the frontier's future. You've won. But sometimes, late at night, you hear the echoes of promises broken.",
    imageKey: 'epilogue_player_executive',
    tags: ['ivrc', 'player'],
  },
  {
    id: 'corporate_4',
    title: 'The Corporate Frontier',
    text: 'The railroad expands. The towns grow. Prosperity comes to those who serve the company well. The frontier is tamed, but was it worth the cost? Only history will judge.',
    imageKey: 'epilogue_corporate_future',
    tags: ['ivrc', 'conclusion'],
  },
];

export const ENDING_CORPORATE_VICTORY: Ending = {
  id: 'ending_corporate_victory',
  title: 'The Corporate Victory',
  tagline: 'Order through strength. Prosperity through control.',
  description:
    "You sided with IVRC and Director Thorne, helping the corporation defeat all opposition. The frontier is now firmly under corporate control. Workers have security but no freedom. You've risen to power, but at what cost?",
  path: 'ivrc',
  isGoodEnding: false,
  isSecret: false,

  conditions: [
    {
      type: 'quest_completed',
      target: 'mq10_reckoning',
      required: true,
      weight: 20,
      description: 'Completed the main quest',
    },
    {
      type: 'reputation_gte',
      target: FACTION_IDS.LAW,
      value: 50,
      required: false,
      weight: 15,
      description: 'Maintained good standing with law',
    },
    {
      type: 'flag_set',
      target: 'sided_with_thorne',
      required: true,
      weight: 30,
      description: 'Made the choice to side with Thorne',
    },
    {
      type: 'flag_not_set',
      target: QUEST_FLAGS.RECRUITED_REYNA,
      required: true,
      weight: 15,
      description: 'Did not ally with the Copperheads',
    },
    {
      type: 'npc_alive',
      target: 'cornelius_thorne',
      required: true,
      weight: 20,
      description: 'Thorne survived',
    },
  ],

  minimumScore: 60,
  priority: 50,

  characterFates: [
    THORNE_FATES.victorious,
    DIAMONDBACK_FATES.executed,
    SAMUEL_FATES.tragic,
    SHERIFF_COLE_FATES.compromised,
    CLARA_FATES.struggling,
    MAGGIE_FATES.tragic,
  ],

  epilogueSlides: CORPORATE_VICTORY_SLIDES,

  statisticsTemplate:
    'You saved {peopleSaved} people and killed {peopleKilled}. You completed {questsCompleted} quests in {daysSurvived} days. The corporation thanks you for your service.',

  unlocks: [
    {
      type: 'achievement',
      id: 'ach_corporate_victory',
      name: 'Company Man',
    },
    {
      type: 'gallery',
      id: 'gallery_ivrc_ending',
      name: 'IVRC Ending Art',
    },
  ],

  tags: ['ivrc', 'corporate', 'bittersweet', 'order'],
};

// ============================================================================
// ENDING 2: THE REVOLUTION
// ============================================================================

const REVOLUTION_SLIDES: EpilogueSlide[] = [
  {
    id: 'revolution_1',
    title: 'The Uprising',
    text: "The workers rise. Led by Diamondback and fueled by years of oppression, they storm IVRC's strongholds. The streets run red with the blood of oppressors and innocents alike.",
    imageKey: 'epilogue_revolution',
    tags: ['copperhead', 'violence'],
  },
  {
    id: 'revolution_2',
    title: 'Thorne Falls',
    text: "Director Thorne is dragged from his mansion. His execution is swift but not merciful. The workers cheer, but you see the horror in the eyes of those who wanted justice, not vengeance.",
    imageKey: 'epilogue_thorne_execution',
    characterId: 'cornelius_thorne',
    tags: ['copperhead', 'death'],
  },
  {
    id: 'revolution_3',
    title: 'Freedom and Chaos',
    text: "Diamondback's vision is realized, but at terrible cost. The old order is shattered, but the new one struggles to form. Rival factions compete for power. Freedom has come, but peace has not.",
    imageKey: 'epilogue_chaos',
    tags: ['copperhead', 'aftermath'],
  },
  {
    id: 'revolution_4',
    title: "The Revolutionary's Dilemma",
    text: 'You helped birth this new world. The chains are broken, but the road ahead is uncertain. Was the blood worth the freedom? Only time will tell if this revolution devours its children.',
    imageKey: 'epilogue_revolutionary_future',
    tags: ['copperhead', 'conclusion'],
  },
];

export const ENDING_REVOLUTION: Ending = {
  id: 'ending_revolution',
  title: 'The Revolution',
  tagline: 'Freedom through fire. Liberation through blood.',
  description:
    "You joined Diamondback's Copperhead rebellion and helped overthrow IVRC through violent revolution. The workers are free, but chaos reigns. The old order is destroyed, but the new one is built on blood.",
  path: 'copperhead',
  isGoodEnding: false,
  isSecret: false,

  conditions: [
    {
      type: 'quest_completed',
      target: 'mq10_reckoning',
      required: true,
      weight: 20,
      description: 'Completed the main quest',
    },
    {
      type: 'reputation_gte',
      target: FACTION_IDS.OUTLAWS,
      value: 60,
      required: true,
      weight: 25,
      description: 'High reputation with outlaws',
    },
    {
      type: 'flag_set',
      target: QUEST_FLAGS.RECRUITED_REYNA,
      required: true,
      weight: 25,
      description: 'Allied with Diamondback',
    },
    {
      type: 'npc_dead',
      target: 'cornelius_thorne',
      required: false,
      weight: 15,
      description: 'Thorne was killed',
    },
    {
      type: 'people_killed_gte',
      value: 20,
      required: false,
      weight: 15,
      description: 'Significant body count from the revolution',
    },
  ],

  minimumScore: 55,
  priority: 55,

  characterFates: [
    THORNE_FATES.executed,
    DIAMONDBACK_FATES.victorious,
    SAMUEL_FATES.struggling,
    SHERIFF_COLE_FATES.heroic,
    CLARA_FATES.struggling,
    MAGGIE_FATES.leader,
  ],

  epilogueSlides: REVOLUTION_SLIDES,

  statisticsTemplate:
    'You saved {peopleSaved} people and killed {peopleKilled} in the revolution. {questsCompleted} quests completed in {daysSurvived} days of struggle. The revolution remembers.',

  unlocks: [
    {
      type: 'achievement',
      id: 'ach_revolution',
      name: 'Viva La Revolucion',
    },
    {
      type: 'gallery',
      id: 'gallery_revolution_ending',
      name: 'Revolution Ending Art',
    },
  ],

  tags: ['copperhead', 'revolution', 'violent', 'freedom'],
};

// ============================================================================
// ENDING 3: THE PEACEFUL REFORM
// ============================================================================

const PEACEFUL_REFORM_SLIDES: EpilogueSlide[] = [
  {
    id: 'reform_1',
    title: 'The Documents',
    text: "Samuel's documents are finally revealed. Years of evidence: forged contracts, stolen wages, deaths covered up. The newspapers print every word. The nation is outraged.",
    imageKey: 'epilogue_documents_revealed',
    characterId: 'samuel_ironpick',
    tags: ['freeminer', 'evidence'],
  },
  {
    id: 'reform_2',
    title: 'The Trial',
    text: 'Federal marshals arrive to arrest Thorne. The trial is long and painful, but justice is served. IVRC is broken up, its assets distributed to the workers it exploited.',
    imageKey: 'epilogue_trial',
    tags: ['freeminer', 'justice'],
  },
  {
    id: 'reform_3',
    title: "Samuel's Dream",
    text: "Old Samuel lives to see it all. Miners own their own claims. Towns govern themselves. It's not perfect, and change is slow, but the dream is real. He can rest now.",
    imageKey: 'epilogue_samuel_peace',
    characterId: 'samuel_ironpick',
    tags: ['freeminer', 'hope'],
  },
  {
    id: 'reform_4',
    title: 'A Better Tomorrow',
    text: 'The frontier changes slowly but surely. Schools open. Churches fill. Families put down roots. You helped build something that will last - not through violence, but through truth.',
    imageKey: 'epilogue_peaceful_future',
    tags: ['freeminer', 'conclusion'],
  },
];

export const ENDING_PEACEFUL_REFORM: Ending = {
  id: 'ending_peaceful_reform',
  title: 'The Peaceful Reform',
  tagline: 'Justice through truth. Freedom through law.',
  description:
    "You helped Samuel expose IVRC's crimes through proper legal channels. The documents he protected for years brought down the corporation without bloodshed. Change is slow, but lasting.",
  path: 'freeminer',
  isGoodEnding: true,
  isSecret: false,

  conditions: [
    {
      type: 'quest_completed',
      target: 'mq10_reckoning',
      required: true,
      weight: 20,
      description: 'Completed the main quest',
    },
    {
      type: 'reputation_gte',
      target: FACTION_IDS.MINERS,
      value: 60,
      required: true,
      weight: 20,
      description: 'High reputation with miners/freeminers',
    },
    {
      type: 'flag_set',
      target: QUEST_FLAGS.FULL_EVIDENCE_GATHERED,
      required: true,
      weight: 25,
      description: 'Gathered all evidence against IVRC',
    },
    {
      type: 'npc_alive',
      target: 'samuel_ironpick',
      required: true,
      weight: 15,
      description: 'Samuel survived to testify',
    },
    {
      type: 'people_killed_gte',
      value: 10,
      required: false,
      weight: -10,
      description: 'Penalty for excessive violence',
    },
    {
      type: 'people_saved_gte',
      value: 15,
      required: false,
      weight: 20,
      description: 'Bonus for saving many people',
    },
  ],

  minimumScore: 65,
  priority: 70,

  characterFates: [
    THORNE_FATES.imprisoned,
    DIAMONDBACK_FATES.redeemed,
    SAMUEL_FATES.victorious,
    SHERIFF_COLE_FATES.vindicated,
    CLARA_FATES.happy,
    MAGGIE_FATES.leader,
  ],

  epilogueSlides: PEACEFUL_REFORM_SLIDES,

  statisticsTemplate:
    'You saved {peopleSaved} people while keeping casualties to {peopleKilled}. {questsCompleted} quests completed in {daysSurvived} days. The truth set them free.',

  unlocks: [
    {
      type: 'achievement',
      id: 'ach_peaceful_reform',
      name: 'The Pen is Mightier',
    },
    {
      type: 'achievement',
      id: 'ach_good_ending',
      name: 'True Hero',
    },
    {
      type: 'gallery',
      id: 'gallery_peaceful_ending',
      name: 'Peaceful Ending Art',
    },
  ],

  tags: ['freeminer', 'peaceful', 'justice', 'good'],
};

// ============================================================================
// ENDING 4: THE LAWMAN'S JUSTICE
// ============================================================================

const LAWMANS_JUSTICE_SLIDES: EpilogueSlide[] = [
  {
    id: 'lawman_1',
    title: 'The Arrest',
    text: "Sheriff Cole leads the posse himself. With evidence you gathered, he arrests Thorne in his own office. 'You're coming with me, Thorne. The law still means something here.'",
    imageKey: 'epilogue_arrest',
    characterId: 'sheriff_cole',
    tags: ['law', 'arrest'],
  },
  {
    id: 'lawman_2',
    title: 'Due Process',
    text: "The trial is a landmark. Witnesses testify. Evidence is presented. The jury deliberates. For once, the system works as it should. Thorne is found guilty on all counts.",
    imageKey: 'epilogue_trial_law',
    tags: ['law', 'justice'],
  },
  {
    id: 'lawman_3',
    title: "The Sheriff's Faith",
    text: "Cole pins his badge back on with pride. 'The law bent, but it didn't break,' he says. 'As long as there are people willing to fight for it, justice will prevail.'",
    imageKey: 'epilogue_cole_vindicated',
    characterId: 'sheriff_cole',
    tags: ['law', 'hope'],
  },
  {
    id: 'lawman_4',
    title: 'Order Restored',
    text: "The frontier remains wild, but it's a bit more just. Deputies patrol the roads. Courts hear grievances. It's not perfect, but the badge means something again.",
    imageKey: 'epilogue_law_future',
    tags: ['law', 'conclusion'],
  },
];

export const ENDING_LAWMANS_JUSTICE: Ending = {
  id: 'ending_lawmans_justice',
  title: "The Lawman's Justice",
  tagline: 'The law is the law. Even on the frontier.',
  description:
    "You worked within the system to bring Thorne to justice. Sheriff Cole's faith in the law is restored. Order is maintained, and justice is served through proper channels.",
  path: 'law',
  isGoodEnding: true,
  isSecret: false,

  conditions: [
    {
      type: 'quest_completed',
      target: 'mq10_reckoning',
      required: true,
      weight: 20,
      description: 'Completed the main quest',
    },
    {
      type: 'reputation_gte',
      target: FACTION_IDS.LAW,
      value: 70,
      required: true,
      weight: 25,
      description: 'High reputation with law enforcement',
    },
    {
      type: 'flag_set',
      target: QUEST_FLAGS.RECRUITED_COLE,
      required: false,
      weight: 20,
      description: 'Allied with Sheriff Cole',
    },
    {
      type: 'npc_alive',
      target: 'sheriff_cole',
      required: true,
      weight: 15,
      description: 'Sheriff Cole survived',
    },
    {
      type: 'npc_alive',
      target: 'cornelius_thorne',
      required: true,
      weight: 15,
      description: 'Thorne survived for trial',
    },
    {
      type: 'flag_not_set',
      target: QUEST_FLAGS.BETRAYED_OUTLAWS,
      required: false,
      weight: 5,
      description: 'Maintained integrity',
    },
  ],

  minimumScore: 65,
  priority: 65,

  characterFates: [
    THORNE_FATES.imprisoned,
    DIAMONDBACK_FATES.imprisoned,
    SAMUEL_FATES.victorious,
    SHERIFF_COLE_FATES.vindicated,
    CLARA_FATES.happy,
    MAGGIE_FATES.leader,
  ],

  epilogueSlides: LAWMANS_JUSTICE_SLIDES,

  statisticsTemplate:
    'You saved {peopleSaved} people and brought {peopleKilled} criminals to justice. {questsCompleted} quests completed in {daysSurvived} days. The law prevails.',

  unlocks: [
    {
      type: 'achievement',
      id: 'ach_lawmans_justice',
      name: 'Badge of Honor',
    },
    {
      type: 'achievement',
      id: 'ach_good_ending',
      name: 'True Hero',
    },
    {
      type: 'gallery',
      id: 'gallery_law_ending',
      name: 'Law Ending Art',
    },
  ],

  tags: ['law', 'justice', 'order', 'good'],
};

// ============================================================================
// ENDING 5: THE EXODUS
// ============================================================================

const EXODUS_SLIDES: EpilogueSlide[] = [
  {
    id: 'exodus_1',
    title: 'The Underground',
    text: "Doc Chen's network activates. Father Miguel's church becomes a waystation. Sister Maria forges papers. In the dead of night, the workers begin to leave.",
    imageKey: 'epilogue_underground',
    tags: ['underground', 'escape'],
  },
  {
    id: 'exodus_2',
    title: 'The Empty Mines',
    text: "IVRC wakes to find their workforce gone. Mines stand silent. Fields lie fallow. Without workers to exploit, Thorne's empire crumbles from within.",
    imageKey: 'epilogue_empty_mines',
    tags: ['underground', 'victory'],
  },
  {
    id: 'exodus_3',
    title: 'New Horizons',
    text: 'The refugees find new homes in the north and west. They build communities free from corporate control. The frontier is vast, and freedom waits for those bold enough to seek it.',
    imageKey: 'epilogue_new_settlements',
    tags: ['underground', 'hope'],
  },
  {
    id: 'exodus_4',
    title: 'The Guide',
    text: "You helped them escape. Every family that found freedom owes you a debt they can never repay. Somewhere out there, your name is spoken with reverence around new hearths.",
    imageKey: 'epilogue_exodus_guide',
    tags: ['underground', 'conclusion'],
  },
];

export const ENDING_EXODUS: Ending = {
  id: 'ending_exodus',
  title: 'The Exodus',
  tagline: 'Freedom through departure. Victory through absence.',
  description:
    "You helped the underground railroad evacuate workers from IVRC's territory. Without a workforce, Thorne's empire collapsed. Freedom was found not through conflict, but through escape.",
  path: 'underground',
  isGoodEnding: true,
  isSecret: false,

  conditions: [
    {
      type: 'quest_completed',
      target: 'mq10_reckoning',
      required: true,
      weight: 20,
      description: 'Completed the main quest',
    },
    {
      type: 'flag_set',
      target: 'underground_railroad_complete',
      required: true,
      weight: 30,
      description: 'Successfully ran the underground railroad',
    },
    {
      type: 'people_saved_gte',
      value: 25,
      required: true,
      weight: 25,
      description: 'Saved many workers through evacuation',
    },
    {
      type: 'npc_alive',
      target: 'doc_chen',
      required: false,
      weight: 10,
      description: 'Doc Chen survived',
    },
    {
      type: 'npc_alive',
      target: 'father_miguel',
      required: false,
      weight: 10,
      description: 'Father Miguel survived',
    },
    {
      type: 'flag_not_set',
      target: QUEST_FLAGS.RECRUITED_REYNA,
      required: false,
      weight: 5,
      description: 'Avoided violent revolution',
    },
  ],

  minimumScore: 60,
  priority: 60,

  characterFates: [
    THORNE_FATES.defeated,
    DIAMONDBACK_FATES.departed,
    SAMUEL_FATES.departed,
    SHERIFF_COLE_FATES.departed,
    CLARA_FATES.departed,
    MAGGIE_FATES.departed,
    {
      npcId: 'doc_chen',
      displayName: 'Doc Chen',
      fate: 'alive_happy' as const,
      description:
        'Doc Chen continues his work in the new settlements, finally able to practice medicine without fear.',
      priority: 0,
    },
    {
      npcId: 'father_miguel',
      displayName: 'Father Miguel',
      fate: 'alive_happy' as const,
      description:
        'Father Miguel builds a new church in the refugee settlement, his flock free at last.',
      priority: 0,
    },
  ],

  epilogueSlides: EXODUS_SLIDES,

  statisticsTemplate:
    'You saved {peopleSaved} people through the underground railroad. Only {peopleKilled} lives were lost. {questsCompleted} quests in {daysSurvived} days. Freedom awaits in the west.',

  unlocks: [
    {
      type: 'achievement',
      id: 'ach_exodus',
      name: 'The Great Escape',
    },
    {
      type: 'achievement',
      id: 'ach_pacifist',
      name: 'Peaceful Resolution',
    },
    {
      type: 'gallery',
      id: 'gallery_exodus_ending',
      name: 'Exodus Ending Art',
    },
  ],

  tags: ['underground', 'escape', 'peaceful', 'good'],
};

// ============================================================================
// ENDING 6: THE LONE WOLF
// ============================================================================

const LONE_WOLF_SLIDES: EpilogueSlide[] = [
  {
    id: 'lonewolf_1',
    title: 'No Masters',
    text: "You refused them all. Thorne's money. Diamondback's cause. Samuel's patience. Cole's badge. None of them could claim you. None of them could use you.",
    imageKey: 'epilogue_rejection',
    tags: ['independent', 'rejection'],
  },
  {
    id: 'lonewolf_2',
    title: 'The Reckoning',
    text: 'You faced Thorne alone. Not for justice, not for revolution, not for freedom - for yourself. Whatever happened in that final confrontation, you did it your way.',
    imageKey: 'epilogue_final_confrontation',
    tags: ['independent', 'climax'],
  },
  {
    id: 'lonewolf_3',
    title: 'Chaos Descends',
    text: 'Without a unified front, the region descends into chaos. Factions tear each other apart. Towns burn. The frontier becomes more dangerous than ever.',
    imageKey: 'epilogue_chaos_independent',
    tags: ['independent', 'consequence'],
  },
  {
    id: 'lonewolf_4',
    title: 'Ride Into the Sunset',
    text: "You saddle up and ride out. Behind you, the frontier tears itself apart. Ahead, endless horizon. You're nobody's hero, nobody's villain. Just a stranger passing through.",
    imageKey: 'epilogue_ride_away',
    tags: ['independent', 'conclusion'],
  },
];

export const ENDING_LONE_WOLF: Ending = {
  id: 'ending_lone_wolf',
  title: 'The Lone Wolf',
  tagline: 'Trust no one. Serve no cause but your own.',
  description:
    'You rejected all factions, refused all alliances, and carved your own path through the conflict. The region descends into chaos as you ride away, an anti-hero with no allegiances.',
  path: 'independent',
  isGoodEnding: false,
  isSecret: false,

  conditions: [
    {
      type: 'quest_completed',
      target: 'mq10_reckoning',
      required: true,
      weight: 20,
      description: 'Completed the main quest',
    },
    {
      type: 'reputation_lte',
      target: FACTION_IDS.LAW,
      value: 30,
      required: false,
      weight: 15,
      description: 'Low reputation with law',
    },
    {
      type: 'reputation_lte',
      target: FACTION_IDS.OUTLAWS,
      value: 30,
      required: false,
      weight: 15,
      description: 'Low reputation with outlaws',
    },
    {
      type: 'reputation_lte',
      target: FACTION_IDS.MINERS,
      value: 30,
      required: false,
      weight: 15,
      description: 'Low reputation with miners',
    },
    {
      type: 'flag_not_set',
      target: QUEST_FLAGS.RECRUITED_COLE,
      required: true,
      weight: 10,
      description: 'Did not ally with Sheriff',
    },
    {
      type: 'flag_not_set',
      target: QUEST_FLAGS.RECRUITED_REYNA,
      required: true,
      weight: 10,
      description: 'Did not ally with Diamondback',
    },
    {
      type: 'flag_not_set',
      target: QUEST_FLAGS.FULL_EVIDENCE_GATHERED,
      required: false,
      weight: 15,
      description: 'Did not gather full evidence',
    },
  ],

  minimumScore: 45,
  priority: 40,

  characterFates: [
    THORNE_FATES.escaped,
    DIAMONDBACK_FATES.departed,
    SAMUEL_FATES.struggling,
    SHERIFF_COLE_FATES.compromised,
    CLARA_FATES.struggling,
    MAGGIE_FATES.tragic,
  ],

  epilogueSlides: LONE_WOLF_SLIDES,

  statisticsTemplate:
    'You saved {peopleSaved} people - or was it just yourself? {peopleKilled} fell to your gun. {questsCompleted} quests, {daysSurvived} days. Now you ride alone.',

  unlocks: [
    {
      type: 'achievement',
      id: 'ach_lone_wolf',
      name: 'No Gods, No Masters',
    },
    {
      type: 'gallery',
      id: 'gallery_lonewolf_ending',
      name: 'Lone Wolf Ending Art',
    },
  ],

  tags: ['independent', 'antihero', 'chaos', 'neutral'],
};

// ============================================================================
// SECRET ENDING: THE TRUE PEACE (Hidden - requires specific rare conditions)
// ============================================================================

const TRUE_PEACE_SLIDES: EpilogueSlide[] = [
  {
    id: 'truepeace_1',
    title: 'An Unlikely Alliance',
    text: "Against all odds, you brought them together. Diamondback and Sheriff Cole. Samuel and Thorne's reform-minded lieutenant. Enemies sat at the same table and found common ground.",
    imageKey: 'epilogue_alliance',
    tags: ['secret', 'unity'],
  },
  {
    id: 'truepeace_2',
    title: 'The Compromise',
    text: "No one got everything they wanted. Thorne was exiled, not executed. Workers gained rights, not ownership. The law bent, but held. It wasn't perfect - it was real.",
    imageKey: 'epilogue_compromise',
    tags: ['secret', 'balance'],
  },
  {
    id: 'truepeace_3',
    title: 'The Peacemaker',
    text: 'They call you the Peacemaker now. The one who proved that even on the frontier, enemies can become partners. That justice and mercy can coexist.',
    imageKey: 'epilogue_peacemaker',
    tags: ['secret', 'player'],
  },
  {
    id: 'truepeace_4',
    title: 'A New Dawn',
    text: 'The frontier will always be wild. But today, it is also hopeful. You built something rare - a peace that might just last. Not through force, but through understanding.',
    imageKey: 'epilogue_true_peace',
    tags: ['secret', 'conclusion'],
  },
];

export const ENDING_TRUE_PEACE: Ending = {
  id: 'ending_true_peace',
  title: 'The True Peace',
  tagline: 'Unity in diversity. Peace through understanding.',
  description:
    'Through incredible effort and wisdom, you united the warring factions. No one got everything they wanted, but everyone got something they needed. True peace was achieved.',
  path: 'freeminer', // Closest alignment
  isGoodEnding: true,
  isSecret: true,

  conditions: [
    {
      type: 'quest_completed',
      target: 'mq10_reckoning',
      required: true,
      weight: 15,
      description: 'Completed the main quest',
    },
    {
      type: 'reputation_gte',
      target: FACTION_IDS.LAW,
      value: 50,
      required: true,
      weight: 15,
      description: 'Good standing with law',
    },
    {
      type: 'reputation_gte',
      target: FACTION_IDS.OUTLAWS,
      value: 40,
      required: true,
      weight: 15,
      description: 'Decent standing with outlaws',
    },
    {
      type: 'reputation_gte',
      target: FACTION_IDS.MINERS,
      value: 50,
      required: true,
      weight: 15,
      description: 'Good standing with miners',
    },
    {
      type: 'flag_set',
      target: QUEST_FLAGS.RECRUITED_COLE,
      required: true,
      weight: 10,
      description: 'Allied with Sheriff',
    },
    {
      type: 'flag_set',
      target: QUEST_FLAGS.FULL_EVIDENCE_GATHERED,
      required: true,
      weight: 15,
      description: 'Gathered full evidence',
    },
    {
      type: 'people_saved_gte',
      value: 20,
      required: true,
      weight: 10,
      description: 'Saved many people',
    },
    {
      type: 'npc_alive',
      target: 'sheriff_cole',
      required: true,
      weight: 5,
      description: 'Sheriff Cole survived',
    },
    {
      type: 'npc_alive',
      target: 'samuel_ironpick',
      required: true,
      weight: 5,
      description: 'Samuel survived',
    },
  ],

  minimumScore: 80,
  priority: 100, // Highest priority - true ending

  characterFates: [
    {
      ...THORNE_FATES.escaped,
      description:
        'Thorne is exiled rather than executed. He leaves with his life but nothing else, a mercy he never showed others.',
    },
    {
      ...DIAMONDBACK_FATES.redeemed,
      description:
        'Diamondback accepts a role in the new council. Her fire now builds rather than destroys.',
    },
    SAMUEL_FATES.victorious,
    SHERIFF_COLE_FATES.vindicated,
    CLARA_FATES.happy,
    MAGGIE_FATES.leader,
  ],

  epilogueSlides: TRUE_PEACE_SLIDES,

  statisticsTemplate:
    'You saved {peopleSaved} people and lost only {peopleKilled}. {questsCompleted} quests completed in {daysSurvived} days. You achieved what no one thought possible.',

  unlocks: [
    {
      type: 'achievement',
      id: 'ach_true_peace',
      name: 'The Peacemaker',
    },
    {
      type: 'achievement',
      id: 'ach_perfect_ending',
      name: 'Perfect Ending',
    },
    {
      type: 'new_game_plus',
      id: 'ngp_peacemaker',
      name: 'New Game+ (Peacemaker)',
    },
    {
      type: 'gallery',
      id: 'gallery_secret_ending',
      name: 'Secret Ending Art',
    },
    {
      type: 'music',
      id: 'music_true_peace',
      name: 'True Peace Theme',
    },
  ],

  tags: ['secret', 'perfect', 'unity', 'good', 'rare'],
};

// ============================================================================
// ENDING REGISTRY
// ============================================================================

export const ALL_ENDINGS: Ending[] = [
  ENDING_CORPORATE_VICTORY,
  ENDING_REVOLUTION,
  ENDING_PEACEFUL_REFORM,
  ENDING_LAWMANS_JUSTICE,
  ENDING_EXODUS,
  ENDING_LONE_WOLF,
  ENDING_TRUE_PEACE,
];

export const ENDINGS_BY_ID: Record<string, Ending> = Object.fromEntries(
  ALL_ENDINGS.map((ending) => [ending.id, ending])
);

export const ENDINGS_BY_PATH: Record<string, Ending[]> = ALL_ENDINGS.reduce(
  (acc, ending) => {
    if (!acc[ending.path]) {
      acc[ending.path] = [];
    }
    acc[ending.path].push(ending);
    return acc;
  },
  {} as Record<string, Ending[]>
);

export const GOOD_ENDINGS: Ending[] = ALL_ENDINGS.filter((e) => e.isGoodEnding);
export const SECRET_ENDINGS: Ending[] = ALL_ENDINGS.filter((e) => e.isSecret);
export const STANDARD_ENDINGS: Ending[] = ALL_ENDINGS.filter((e) => !e.isSecret);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get an ending by its ID
 */
export function getEndingById(id: string): Ending | undefined {
  return ENDINGS_BY_ID[id];
}

/**
 * Get all endings for a specific path
 */
export function getEndingsByPath(path: string): Ending[] {
  return ENDINGS_BY_PATH[path] || [];
}

/**
 * Get endings by tag
 */
export function getEndingsByTag(tag: string): Ending[] {
  return ALL_ENDINGS.filter((e) => e.tags.includes(tag));
}

/**
 * Get the default/fallback ending (Lone Wolf - lowest priority, easiest to achieve)
 */
export function getFallbackEnding(): Ending {
  return ENDING_LONE_WOLF;
}
