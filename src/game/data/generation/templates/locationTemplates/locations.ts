/**
 * Location Templates - Settlement compositions
 */

import type { LocationTemplate } from '../../../schemas/generation.ts';
import { SETTLEMENT_LOCATION_TEMPLATES } from './locations_settlements.ts';
import { OTHER_LOCATION_TEMPLATES } from './locations_other.ts';

export const LOCATION_TEMPLATES: LocationTemplate[] = [
  ...SETTLEMENT_LOCATION_TEMPLATES,
  ...OTHER_LOCATION_TEMPLATES,
];
