// Quest definitions for Cogsworth Station

import { ITEMS } from './items';
import type { Item, Quest } from './types';

export const QUESTS: Record<string, Quest> = {
  // Main storyline quests
  welcome_aboard: {
    id: 'welcome_aboard',
    name: 'Welcome Aboard',
    description:
      "You've just arrived at Cogsworth Station. Find the Dockmaster to register your arrival.",
    status: 'available',
    objectives: [
      {
        id: 'find_dockmaster',
        description: 'Find the Dockmaster in the Docks',
        type: 'talk',
        target: 'dockmaster',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: { xp: 50, currency: 25 },
    npcId: 'tutorial_guide',
  },

  missing_manifest: {
    id: 'missing_manifest',
    name: 'The Missing Manifest',
    description:
      'The Dockmaster is in a panic - an important shipping manifest has gone missing. Help find it.',
    status: 'available',
    objectives: [
      {
        id: 'search_crates',
        description: 'Search the cargo crates in the Docks',
        type: 'explore',
        target: 'docks_crates',
        current: 0,
        required: 3,
        completed: false,
      },
      {
        id: 'find_manifest',
        description: 'Find the Dock Manifest',
        type: 'collect',
        target: 'dock_manifest',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'return_manifest',
        description: 'Return the manifest to the Dockmaster',
        type: 'deliver',
        target: 'dockmaster',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: {
      xp: 100,
      currency: 50,
      item: ITEMS.brass_goggles,
    },
    prerequisiteQuests: ['welcome_aboard'],
    npcId: 'dockmaster',
  },

  broken_compass_quest: {
    id: 'broken_compass_quest',
    name: 'True North',
    description:
      'A mysterious woman approaches you with a broken compass. She says it belonged to her father, a famous airship captain.',
    status: 'available',
    objectives: [
      {
        id: 'get_compass',
        description: 'Accept the Broken Compass',
        type: 'collect',
        target: 'broken_compass',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'find_mechanic',
        description: 'Find a skilled mechanic in the Workshop',
        type: 'talk',
        target: 'master_mechanic',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'gather_parts',
        description: 'Gather repair materials',
        type: 'collect',
        target: 'clockwork_spring',
        current: 0,
        required: 3,
        completed: false,
      },
      {
        id: 'repair_compass',
        description: 'Repair the compass at the workbench',
        type: 'explore',
        target: 'workbench_repair',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'return_compass',
        description: 'Return the repaired compass',
        type: 'deliver',
        target: 'compass_woman',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: {
      xp: 250,
      currency: 150,
      item: ITEMS.aetheric_lantern,
    },
    prerequisiteQuests: ['missing_manifest'],
    npcId: 'compass_woman',
  },

  engine_trouble: {
    id: 'engine_trouble',
    name: 'Engine Trouble',
    description:
      'Strange noises echo from the Engine Room. The Chief Engineer needs someone brave enough to investigate.',
    status: 'available',
    objectives: [
      {
        id: 'talk_engineer',
        description: 'Speak with Chief Engineer Cogsworth',
        type: 'talk',
        target: 'chief_engineer',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'investigate_noise',
        description: 'Investigate the source of the noise',
        type: 'explore',
        target: 'engine_anomaly',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'collect_crystals',
        description: 'Collect Aether Crystals for repairs',
        type: 'collect',
        target: 'aether_crystal',
        current: 0,
        required: 2,
        completed: false,
      },
      {
        id: 'repair_engine',
        description: 'Complete the engine repair puzzle',
        type: 'explore',
        target: 'engine_puzzle',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: {
      xp: 300,
      currency: 200,
      item: ITEMS.clockwork_gauntlet,
    },
    prerequisiteQuests: ['broken_compass_quest'],
    npcId: 'chief_engineer',
  },

  // Side quests
  hungry_worker: {
    id: 'hungry_worker',
    name: 'A Hungry Worker',
    description: 'A dock worker looks famished. Perhaps you could find them something to eat.',
    status: 'available',
    objectives: [
      {
        id: 'find_food',
        description: 'Find Cogwheel Cookies',
        type: 'collect',
        target: 'cogwheel_cookie',
        current: 0,
        required: 3,
        completed: false,
      },
      {
        id: 'deliver_food',
        description: 'Give the cookies to the hungry worker',
        type: 'deliver',
        target: 'hungry_worker',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: {
      xp: 30,
      currency: 15,
    },
    npcId: 'hungry_worker',
  },

  merchant_favor: {
    id: 'merchant_favor',
    name: 'Market Research',
    description: 'A merchant wants you to check prices at competing stalls.',
    status: 'available',
    objectives: [
      {
        id: 'check_stalls',
        description: 'Visit market stalls',
        type: 'explore',
        target: 'market_stall',
        current: 0,
        required: 3,
        completed: false,
      },
      {
        id: 'report_back',
        description: 'Report back to the merchant',
        type: 'talk',
        target: 'curious_merchant',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: {
      xp: 75,
      currency: 40,
      item: ITEMS.steam_tonic,
    },
    npcId: 'curious_merchant',
  },

  lost_tool: {
    id: 'lost_tool',
    name: 'The Lost Wrench',
    description: 'A mechanic has lost their favorite wrench somewhere in the Workshop.',
    status: 'available',
    objectives: [
      {
        id: 'find_wrench',
        description: "Find the Engineer's Wrench",
        type: 'collect',
        target: 'engineers_wrench',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'return_wrench',
        description: 'Return the wrench to its owner',
        type: 'deliver',
        target: 'forgetful_mechanic',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: {
      xp: 50,
      currency: 30,
      item: ITEMS.clockwork_spring,
    },
    npcId: 'forgetful_mechanic',
  },
};

// Get quests available to player based on completed prerequisites
export function getAvailableQuests(completedQuests: string[]): Quest[] {
  return Object.values(QUESTS).filter((quest) => {
    if (completedQuests.includes(quest.id)) return false;
    if (!quest.prerequisiteQuests) return true;
    return quest.prerequisiteQuests.every((prereq) => completedQuests.includes(prereq));
  });
}

// Check if a quest objective is complete
export function checkObjective(quest: Quest, objectiveId: string, increment: number = 1): Quest {
  const updatedObjectives = quest.objectives.map((obj) => {
    if (obj.id === objectiveId && !obj.completed) {
      const newCurrent = Math.min(obj.current + increment, obj.required);
      return {
        ...obj,
        current: newCurrent,
        completed: newCurrent >= obj.required,
      };
    }
    return obj;
  });

  const allComplete = updatedObjectives.every((obj) => obj.completed);

  return {
    ...quest,
    objectives: updatedObjectives,
    status: allComplete ? 'completed' : quest.status,
  };
}

// Get quest by ID
export function getQuest(questId: string): Quest | undefined {
  return QUESTS[questId];
}
