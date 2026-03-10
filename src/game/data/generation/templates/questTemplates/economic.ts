/**
 * Economic Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { ECONOMIC_DEBT_TEMPLATES } from './economic_debt.ts';
import { ECONOMIC_INVESTMENT_TEMPLATES } from './economic_investment.ts';
import { ECONOMIC_TRADE_TEMPLATES } from './economic_trade.ts';

export const ECONOMIC_QUEST_TEMPLATES: QuestTemplate[] = [
  ...ECONOMIC_DEBT_TEMPLATES,
  ...ECONOMIC_INVESTMENT_TEMPLATES,
  ...ECONOMIC_TRADE_TEMPLATES,
];
