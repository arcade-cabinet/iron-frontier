/**
 * Delivery Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { DELIVERY_MESSAGE_TEMPLATES } from './delivery_messages.ts';
import { DELIVERY_SMUGGLE_TEMPLATES } from './delivery_smuggle.ts';

export { DELIVERY_MESSAGE_TEMPLATES } from './delivery_messages.ts';
export { DELIVERY_SMUGGLE_TEMPLATES } from './delivery_smuggle.ts';

export const DELIVERY_QUEST_TEMPLATES: QuestTemplate[] = [
  ...DELIVERY_MESSAGE_TEMPLATES,
  ...DELIVERY_SMUGGLE_TEMPLATES,
];
