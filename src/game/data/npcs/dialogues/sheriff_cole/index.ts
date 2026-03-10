/**
 * Sheriff Marcus Cole - Dialogue Trees
 *
 * An honest lawman, overwhelmed by the challenges of maintaining order
 * on the frontier. Potential ally who can provide information about
 * IVRC's activities and the Copperhead Gang.
 */

import type { DialogueTree } from '../../../schemas/npc.ts';

import { sheriff_cole_nodes_0 } from './nodes0.ts';
import { sheriff_cole_nodes_1 } from './nodes1.ts';
import { sheriff_cole_nodes_2 } from './nodes2.ts';
import { sheriff_cole_nodes_3 } from './nodes3.ts';

export const SheriffColeMainDialogue: DialogueTree = {
  id: 'sheriff_cole_main',
  name: 'Sheriff Cole - Main Conversation',
  description: 'Primary dialogue tree for Sheriff Marcus Cole',
  tags: ['dusty_springs', 'authority', 'quest_giver'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'quest_active',
      conditions: [{ type: 'quest_active', target: 'investigate_strangers' }],
      priority: 5,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
      ...sheriff_cole_nodes_0,
      ...sheriff_cole_nodes_1,
      ...sheriff_cole_nodes_2,
      ...sheriff_cole_nodes_3,
    ],
};

export const SheriffColeDialogues = [SheriffColeMainDialogue];
