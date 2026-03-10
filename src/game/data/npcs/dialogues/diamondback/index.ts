/**
 * "Diamondback" Dolores Vega - Dialogue Trees
 *
 * Leader of the Copperhead Gang. Former IVRC worker turned outlaw after
 * witnessing the company's atrocities. Fierce, principled, and dangerous.
 * Potential ally against IVRC if the player earns her trust.
 */

import type { DialogueTree } from '../../../schemas/npc.ts';

import { diamondback_nodes_0 } from './nodes0.ts';
import { diamondback_nodes_1 } from './nodes1.ts';
import { diamondback_nodes_2 } from './nodes2.ts';
import { diamondback_nodes_3 } from './nodes3.ts';
import { diamondback_nodes_4 } from './nodes4.ts';
import { diamondback_nodes_5 } from './nodes5.ts';

export const DiamondbackMainDialogue: DialogueTree = {
  id: 'diamondback_main',
  name: 'Diamondback Dolores - Main Conversation',
  description: 'Primary dialogue tree for Diamondback Dolores',
  tags: ['rattlesnake_canyon', 'outlaw', 'faction_leader', 'copperhead'],

  entryPoints: [
    {
      nodeId: 'captured_entry',
      conditions: [{ type: 'flag_set', target: 'captured_by_copperheads' }],
      priority: 15,
    },
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'reputation_gte', value: 50 }],
      priority: 5,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
      ...diamondback_nodes_0,
      ...diamondback_nodes_1,
      ...diamondback_nodes_2,
      ...diamondback_nodes_3,
      ...diamondback_nodes_4,
      ...diamondback_nodes_5,
    ],
};

export const DiamondbackDialogues = [DiamondbackMainDialogue];
