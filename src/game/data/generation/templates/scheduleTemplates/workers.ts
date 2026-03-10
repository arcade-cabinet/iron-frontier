/**
 * Schedule Templates - Workers
 */

import type { ScheduleTemplate } from '../../../schemas/generation.ts';

// ============================================================================
// WORKER SCHEDULES
// ============================================================================

/**
 * Bartender - Evening and night shift worker
 */
export const bartender_schedule: ScheduleTemplate = {
  id: 'bartender_schedule',
  validRoles: ['bartender', 'barmaid', 'saloon_worker'],
  entries: [
    {
      startHour: 0,
      endHour: 3,
      activity: 'work',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'late_night_service',
    },
    { startHour: 3, endHour: 4, activity: 'idle', locationMarker: '{{saloon}}' },
    { startHour: 4, endHour: 12, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 13, endHour: 15, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 15, endHour: 16, activity: 'shop', locationMarker: '{{general_store}}' },
    { startHour: 16, endHour: 17, activity: 'travel', locationMarker: '{{saloon}}' },
    {
      startHour: 17,
      endHour: 24,
      activity: 'work',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'evening_service',
    },
  ],
  tags: ['worker', 'saloon', 'night_shift'],
};


/**
 * Ranch Hand - Dawn to dusk outdoor work
 */
export const ranch_hand_schedule: ScheduleTemplate = {
  id: 'ranch_hand_schedule',
  validRoles: ['ranch_hand', 'cowboy', 'wrangler', 'cattle_driver'],
  entries: [
    { startHour: 0, endHour: 4, activity: 'sleep', locationMarker: '{{bunkhouse}}' },
    { startHour: 4, endHour: 5, activity: 'eat', locationMarker: '{{bunkhouse}}' },
    {
      startHour: 5,
      endHour: 8,
      activity: 'work',
      locationMarker: '{{ranch}}',
      dialogueOverride: 'morning_chores',
    },
    { startHour: 8, endHour: 9, activity: 'eat', locationMarker: '{{ranch}}' },
    { startHour: 9, endHour: 12, activity: 'work', locationMarker: '{{pasture}}' },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{ranch}}' },
    { startHour: 13, endHour: 17, activity: 'work', locationMarker: '{{pasture}}' },
    { startHour: 17, endHour: 18, activity: 'work', locationMarker: '{{stable}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{bunkhouse}}' },
    { startHour: 19, endHour: 21, activity: 'socialize', locationMarker: '{{bunkhouse}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{bunkhouse}}' },
  ],
  tags: ['worker', 'outdoor', 'early_riser', 'ranch'],
};


/**
 * Miner - Shift work patterns, underground labor
 */
export const miner_schedule: ScheduleTemplate = {
  id: 'miner_schedule',
  validRoles: ['miner', 'prospector_worker', 'mine_worker'],
  entries: [
    { startHour: 0, endHour: 5, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 5, endHour: 6, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'travel', locationMarker: '{{mine_entrance}}' },
    {
      startHour: 7,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{mine}}',
      dialogueOverride: 'mining_shift',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{mine_entrance}}' },
    { startHour: 13, endHour: 17, activity: 'work', locationMarker: '{{mine}}' },
    { startHour: 17, endHour: 18, activity: 'travel', locationMarker: '{{home}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 19, endHour: 21, activity: 'socialize', locationMarker: '{{saloon}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['worker', 'mining', 'physical_labor', 'shift_work'],
};


/**
 * Railroad Worker - Long shifts, camp-based living
 */
export const railroad_worker_schedule: ScheduleTemplate = {
  id: 'railroad_worker_schedule',
  validRoles: ['railroad_worker', 'track_layer', 'rail_engineer'],
  entries: [
    { startHour: 0, endHour: 4, activity: 'sleep', locationMarker: '{{camp}}' },
    { startHour: 4, endHour: 5, activity: 'eat', locationMarker: '{{camp}}' },
    { startHour: 5, endHour: 6, activity: 'travel', locationMarker: '{{rail_line}}' },
    {
      startHour: 6,
      endHour: 11,
      activity: 'work',
      locationMarker: '{{rail_line}}',
      dialogueOverride: 'track_work',
    },
    { startHour: 11, endHour: 12, activity: 'eat', locationMarker: '{{rail_line}}' },
    { startHour: 12, endHour: 17, activity: 'work', locationMarker: '{{rail_line}}' },
    { startHour: 17, endHour: 18, activity: 'travel', locationMarker: '{{camp}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{camp}}' },
    { startHour: 19, endHour: 21, activity: 'socialize', locationMarker: '{{camp}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{camp}}' },
  ],
  tags: ['worker', 'railroad', 'camp_life', 'long_shift'],
};


/**
 * Stable Hand - Horse care, early mornings and late evenings
 */
export const stable_hand_schedule: ScheduleTemplate = {
  id: 'stable_hand_schedule',
  validRoles: ['stable_hand', 'hostler', 'groom'],
  entries: [
    { startHour: 0, endHour: 5, activity: 'sleep', locationMarker: '{{stable}}' },
    { startHour: 5, endHour: 6, activity: 'eat', locationMarker: '{{stable}}' },
    {
      startHour: 6,
      endHour: 9,
      activity: 'work',
      locationMarker: '{{stable}}',
      dialogueOverride: 'morning_feeding',
    },
    { startHour: 9, endHour: 11, activity: 'idle', locationMarker: '{{stable}}' },
    { startHour: 11, endHour: 12, activity: 'eat', locationMarker: '{{stable}}' },
    { startHour: 12, endHour: 14, activity: 'idle', locationMarker: '{{stable}}' },
    { startHour: 14, endHour: 15, activity: 'travel', locationMarker: '{{town_center}}' },
    { startHour: 15, endHour: 17, activity: 'idle', locationMarker: '{{town_center}}' },
    {
      startHour: 17,
      endHour: 20,
      activity: 'work',
      locationMarker: '{{stable}}',
      dialogueOverride: 'evening_care',
    },
    { startHour: 20, endHour: 21, activity: 'eat', locationMarker: '{{stable}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{stable}}' },
  ],
  tags: ['worker', 'animal_care', 'split_shift'],
};


/**
 * Telegraph Operator - Shift work, message handling
 */
export const telegraph_operator_schedule: ScheduleTemplate = {
  id: 'telegraph_operator_schedule',
  validRoles: ['telegraph_operator', 'telegrapher', 'communications'],
  entries: [
    { startHour: 0, endHour: 6, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 7, endHour: 8, activity: 'travel', locationMarker: '{{telegraph}}' },
    {
      startHour: 8,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{telegraph}}',
      dialogueOverride: 'morning_messages',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{telegraph}}' },
    { startHour: 13, endHour: 18, activity: 'work', locationMarker: '{{telegraph}}' },
    { startHour: 18, endHour: 19, activity: 'travel', locationMarker: '{{home}}' },
    { startHour: 19, endHour: 20, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 20, endHour: 21, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['worker', 'communications', 'technology'],
};
