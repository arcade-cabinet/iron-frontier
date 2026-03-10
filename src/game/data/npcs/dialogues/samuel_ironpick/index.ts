/**
 * Old Samuel Ironpick - Dialogue Trees
 *
 * A grizzled miner and leader of the Freeminer resistance. Lost his son
 * to a preventable mine collapse caused by IVRC negligence. Holds critical
 * documents that could expose IVRC's crimes. Suspicious of outsiders but
 * fair once trust is earned. Key figure in the main quest chain.
 */

import type { DialogueTree } from '../../../schemas/npc.ts';

import { samuel_ironpick_nodes_0 } from './nodes0.ts';
import { samuel_ironpick_nodes_1 } from './nodes1.ts';
import { samuel_ironpick_nodes_2 } from './nodes2.ts';
import { samuel_ironpick_nodes_3 } from './nodes3.ts';
import { samuel_ironpick_nodes_4 } from './nodes4.ts';
import { samuel_ironpick_nodes_5 } from './nodes5.ts';

export const SamuelIronpickMainDialogue: DialogueTree = {
  id: 'samuel_ironpick_main',
  name: 'Samuel Ironpick - Main Conversation',
  description: 'Primary dialogue tree for Old Samuel Ironpick',
  tags: ['freeminer_hollow', 'faction_leader', 'freeminer', 'documents'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'gear_carrier',
      conditions: [
        { type: 'first_meeting' },
        { type: 'has_item', target: 'mysterious_letter' },
      ],
      priority: 15,
    },
    {
      nodeId: 'miguel_message',
      conditions: [
        { type: 'first_meeting' },
        { type: 'flag_set', target: 'carries_miguel_message' },
      ],
      priority: 12,
    },
    {
      nodeId: 'trusted_greeting',
      conditions: [{ type: 'reputation_gte', value: 50 }],
      priority: 5,
    },
    {
      nodeId: 'quest_update',
      conditions: [{ type: 'quest_active', target: 'find_documents' }],
      priority: 8,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
      ...samuel_ironpick_nodes_0,
      ...samuel_ironpick_nodes_1,
      ...samuel_ironpick_nodes_2,
      ...samuel_ironpick_nodes_3,
      ...samuel_ironpick_nodes_4,
      ...samuel_ironpick_nodes_5,
    ],
};

export const SamuelIronpickDialogues = [SamuelIronpickMainDialogue];
