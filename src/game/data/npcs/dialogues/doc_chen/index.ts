/**
 * Doc Chen Wei - Dialogue Trees
 *
 * The town doctor who knows everyone's secrets. Observant, wise,
 * and quietly subversive. Runs an underground network helping
 * those fleeing IVRC's oppression.
 */

import type { DialogueTree } from '../../../schemas/npc.ts';

import { doc_chen_nodes_0 } from './nodes0.ts';
import { doc_chen_nodes_1 } from './nodes1.ts';
import { doc_chen_nodes_2 } from './nodes2.ts';

export const DocChenMainDialogue: DialogueTree = {
  id: 'doc_chen_main',
  name: 'Doc Chen Wei - Main Conversation',
  description: 'Primary dialogue tree for Doc Chen Wei',
  tags: ['dusty_springs', 'healer', 'information'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'wounded_greeting',
      conditions: [{ type: 'flag_set', target: 'player_wounded' }],
      priority: 8,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
      ...doc_chen_nodes_0,
      ...doc_chen_nodes_1,
      ...doc_chen_nodes_2,
    ],
};

export const DocChenDialogues = [DocChenMainDialogue];
