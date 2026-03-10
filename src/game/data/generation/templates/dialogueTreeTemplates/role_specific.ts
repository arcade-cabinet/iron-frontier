/**
 * Dialogue Tree Templates - Role Specific
 */

import type { DialogueTreeTemplate } from '../../../schemas/generation.ts';
import { ROLE_AUTHORITY_DIALOGUE_TREES } from './role_authority.ts';
import { ROLE_TRADE_DIALOGUE_TREES } from './role_trade.ts';

export const ROLE_SPECIFIC_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
  ...ROLE_AUTHORITY_DIALOGUE_TREES,
  ...ROLE_TRADE_DIALOGUE_TREES,
};
