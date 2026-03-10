/**
 * Mayor Josephine Holt - Dialogue Trees
 *
 * An elegant, politically savvy woman who serves as mayor of Dusty Springs.
 * Aligned with IVRC out of pragmatism and fear, but not without conscience.
 * Involved in the main quest through land disputes and inheritance matters.
 * Morally grey - she does what she believes necessary to keep the town alive.
 */

import type { DialogueTree } from '../../../schemas/npc.ts';

import { mayor_holt_nodes_0 } from './nodes0.ts';
import { mayor_holt_nodes_1 } from './nodes1.ts';
import { mayor_holt_nodes_2 } from './nodes2.ts';
import { mayor_holt_nodes_3 } from './nodes3.ts';
import { mayor_holt_nodes_4 } from './nodes4.ts';

export const MayorHoltMainDialogue: DialogueTree = {
  id: 'mayor_holt_main',
  name: 'Mayor Holt - Main Conversation',
  description: 'Primary dialogue tree for Mayor Josephine Holt',
  tags: ['dusty_springs', 'authority', 'ivrc_connected', 'morally_grey'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'inheritance_discussion',
      conditions: [{ type: 'quest_active', target: 'main_the_inheritance' }],
      priority: 8,
    },
    {
      nodeId: 'post_investigation',
      conditions: [{ type: 'flag_set', target: 'found_partial_manifest' }],
      priority: 6,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
      ...mayor_holt_nodes_0,
      ...mayor_holt_nodes_1,
      ...mayor_holt_nodes_2,
      ...mayor_holt_nodes_3,
      ...mayor_holt_nodes_4,
    ],
};

export const MayorHoltDialogues = [MayorHoltMainDialogue];
