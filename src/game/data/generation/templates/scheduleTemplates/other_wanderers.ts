/**
 * Schedule Templates - Wanderers (Gambler, Drifter, Prospector, Homesteader, Outlaw)
 */

import type { ScheduleTemplate } from '../../../schemas/generation.ts';

// ============================================================================
// OTHER SCHEDULES
// ============================================================================

/**
 * Gambler - Late nights at the tables, sleeps in
 */
export const gambler_schedule: ScheduleTemplate = {
  id: 'gambler_schedule',
  validRoles: ['gambler', 'card_sharp', 'hustler'],
  entries: [
    {
      startHour: 0,
      endHour: 4,
      activity: 'socialize',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'late_night_cards',
    },
    { startHour: 4, endHour: 5, activity: 'travel', locationMarker: '{{hotel}}' },
    { startHour: 5, endHour: 14, activity: 'sleep', locationMarker: '{{hotel}}' },
    { startHour: 14, endHour: 15, activity: 'eat', locationMarker: '{{hotel}}' },
    { startHour: 15, endHour: 17, activity: 'idle', locationMarker: '{{hotel}}' },
    { startHour: 17, endHour: 18, activity: 'shop', locationMarker: '{{general_store}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{saloon}}' },
    {
      startHour: 19,
      endHour: 24,
      activity: 'socialize',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'card_game',
    },
  ],
  tags: ['transient', 'night_owl', 'saloon_regular', 'questionable'],
};



/**
 * Drifter - Unpredictable, lots of idle time, no fixed location
 */
export const drifter_schedule: ScheduleTemplate = {
  id: 'drifter_schedule',
  validRoles: ['drifter', 'vagrant', 'wanderer', 'stranger'],
  entries: [
    { startHour: 0, endHour: 6, activity: 'sleep', locationMarker: '{{camp}}' },
    { startHour: 6, endHour: 7, activity: 'idle', locationMarker: '{{camp}}' },
    { startHour: 7, endHour: 9, activity: 'travel', locationMarker: '{{town_center}}' },
    {
      startHour: 9,
      endHour: 11,
      activity: 'idle',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'drifter_talk',
    },
    { startHour: 11, endHour: 12, activity: 'eat', locationMarker: '{{saloon}}' },
    { startHour: 12, endHour: 15, activity: 'idle', locationMarker: '{{stable}}' },
    { startHour: 15, endHour: 17, activity: 'travel', locationMarker: '{{outskirts}}' },
    { startHour: 17, endHour: 18, activity: 'idle', locationMarker: '{{outskirts}}' },
    { startHour: 18, endHour: 19, activity: 'travel', locationMarker: '{{saloon}}' },
    { startHour: 19, endHour: 21, activity: 'socialize', locationMarker: '{{saloon}}' },
    { startHour: 21, endHour: 22, activity: 'travel', locationMarker: '{{camp}}' },
    { startHour: 22, endHour: 24, activity: 'sleep', locationMarker: '{{camp}}' },
  ],
  tags: ['transient', 'unpredictable', 'wanderer', 'mysterious'],
};



/**
 * Prospector - Dawn mining, evening saloon, gold fever
 */
export const prospector_schedule: ScheduleTemplate = {
  id: 'prospector_schedule',
  validRoles: ['prospector', 'gold_panner', 'claim_holder'],
  entries: [
    { startHour: 0, endHour: 4, activity: 'sleep', locationMarker: '{{camp}}' },
    { startHour: 4, endHour: 5, activity: 'eat', locationMarker: '{{camp}}' },
    { startHour: 5, endHour: 6, activity: 'travel', locationMarker: '{{claim}}' },
    {
      startHour: 6,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{claim}}',
      dialogueOverride: 'panning_gold',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{claim}}' },
    { startHour: 13, endHour: 17, activity: 'work', locationMarker: '{{claim}}' },
    { startHour: 17, endHour: 18, activity: 'travel', locationMarker: '{{town_center}}' },
    {
      startHour: 18,
      endHour: 19,
      activity: 'shop',
      locationMarker: '{{assay_office}}',
      dialogueOverride: 'selling_gold',
    },
    {
      startHour: 19,
      endHour: 22,
      activity: 'socialize',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'prospector_tales',
    },
    { startHour: 22, endHour: 23, activity: 'travel', locationMarker: '{{camp}}' },
    { startHour: 23, endHour: 24, activity: 'sleep', locationMarker: '{{camp}}' },
  ],
  tags: ['worker', 'outdoor', 'early_riser', 'gold_fever'],
};



/**
 * Homesteader - Farm routine, self-sufficient living
 */
export const homesteader_schedule: ScheduleTemplate = {
  id: 'homesteader_schedule',
  validRoles: ['homesteader', 'farmer', 'settler'],
  entries: [
    { startHour: 0, endHour: 5, activity: 'sleep', locationMarker: '{{homestead}}' },
    { startHour: 5, endHour: 6, activity: 'eat', locationMarker: '{{homestead}}' },
    {
      startHour: 6,
      endHour: 8,
      activity: 'work',
      locationMarker: '{{homestead}}',
      dialogueOverride: 'morning_chores',
    },
    { startHour: 8, endHour: 12, activity: 'work', locationMarker: '{{fields}}' },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{homestead}}' },
    { startHour: 13, endHour: 16, activity: 'work', locationMarker: '{{fields}}' },
    {
      startHour: 16,
      endHour: 18,
      activity: 'work',
      locationMarker: '{{homestead}}',
      dialogueOverride: 'evening_chores',
    },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{homestead}}' },
    { startHour: 19, endHour: 21, activity: 'idle', locationMarker: '{{homestead}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{homestead}}' },
  ],
  tags: ['settler', 'farmer', 'early_riser', 'self_sufficient'],
};



/**
 * Outlaw - Reversed hours, nocturnal activities, hides during day
 */
export const outlaw_schedule: ScheduleTemplate = {
  id: 'outlaw_schedule',
  validRoles: ['outlaw', 'bandit', 'rustler', 'thief'],
  entries: [
    {
      startHour: 0,
      endHour: 4,
      activity: 'patrol',
      locationMarker: '{{hideout}}',
      dialogueOverride: 'outlaw_scheming',
    },
    { startHour: 4, endHour: 5, activity: 'travel', locationMarker: '{{hideout}}' },
    { startHour: 5, endHour: 14, activity: 'sleep', locationMarker: '{{hideout}}' },
    { startHour: 14, endHour: 15, activity: 'eat', locationMarker: '{{hideout}}' },
    { startHour: 15, endHour: 17, activity: 'idle', locationMarker: '{{hideout}}' },
    {
      startHour: 17,
      endHour: 18,
      activity: 'work',
      locationMarker: '{{hideout}}',
      dialogueOverride: 'planning_job',
    },
    { startHour: 18, endHour: 20, activity: 'travel', locationMarker: '{{outskirts}}' },
    {
      startHour: 20,
      endHour: 24,
      activity: 'patrol',
      locationMarker: '{{outskirts}}',
      dialogueOverride: 'scouting',
    },
  ],
  tags: ['criminal', 'nocturnal', 'dangerous', 'hidden'],
};
