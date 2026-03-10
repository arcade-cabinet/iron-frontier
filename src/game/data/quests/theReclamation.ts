import type { Quest } from '../schemas/quest.ts';
import { reclamationStages0 } from './reclamationStages0.ts';
import { reclamationStages1 } from './reclamationStages1.ts';

export const TheReclamation: Quest = {
  id: 'main_the_reclamation',
  title: 'The Reclamation',
  description:
    'Old Samuel Ironpick revealed the truth: your parent was a Freeminer leader, murdered by IVRC. The family mine in the Iron Mountains is your birthright — but IVRC has already moved in. Take it back.',
  type: 'main',
  giverNpcId: 'samuel_ironpick',
  startLocationId: 'freeminer_hollow',
  recommendedLevel: 3,
  tags: ['main', 'combat', 'ivrc', 'freeminers', 'mine'],
  repeatable: false,
  timeLimitHours: null,

  prerequisites: {
    completedQuests: ['main_the_inheritance'],
    factionReputation: {},
    requiredItems: [],
  },

  stages: [
    ...reclamationStages0,
    ...reclamationStages1,
  ],

  rewards: {
    xp: 300,
    gold: 200,
    items: [
      { itemId: 'item_ironpick_deed', quantity: 1 },
      { itemId: 'item_starcite_sample', quantity: 3 },
    ],
    reputation: { freeminers: 50, ivrc: -30 },
    unlocksQuests: [],
  },
};
