/**
 * Father Miguel Santos - Dialogue Trees
 *
 * A former missionary who lost faith in the Church but not in God.
 * Runs an underground railroad for escaped IVRC workers, hiding them
 * in the church basement. Gentle, wise, and quietly subversive.
 * Partners with Doc Chen in the underground resistance.
 */

import type { DialogueTree } from '../../../schemas/npc.ts';

import { father_miguel_nodes_0 } from './nodes0.ts';
import { father_miguel_nodes_1 } from './nodes1.ts';
import { father_miguel_nodes_2 } from './nodes2.ts';
import { father_miguel_nodes_3 } from './nodes3.ts';
import { father_miguel_nodes_4 } from './nodes4.ts';

export const FatherMiguelMainDialogue: DialogueTree = {
  id: 'father_miguel_main',
  name: 'Father Miguel - Main Conversation',
  description: 'Primary dialogue tree for Father Miguel Santos',
  tags: ['dusty_springs', 'spiritual', 'underground', 'sanctuary'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'underground_active',
      conditions: [{ type: 'quest_active', target: 'sanctuary' }],
      priority: 8,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'reputation_gte', value: 40 }],
      priority: 5,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
      ...father_miguel_nodes_0,
      ...father_miguel_nodes_1,
      ...father_miguel_nodes_2,
      ...father_miguel_nodes_3,
      ...father_miguel_nodes_4,
    ],
};

export const FatherMiguelDialogues = [FatherMiguelMainDialogue];
