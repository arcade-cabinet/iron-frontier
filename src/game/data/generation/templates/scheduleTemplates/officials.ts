/**
 * Schedule Templates - Officials
 */

import type { ScheduleTemplate } from '../../../schemas/generation.ts';

// ============================================================================
// OFFICIAL SCHEDULES
// ============================================================================

/**
 * Sheriff - Patrol rounds, office hours, keeps peace
 */
export const sheriff_schedule: ScheduleTemplate = {
  id: 'sheriff_schedule',
  validRoles: ['sheriff', 'marshal', 'lawman'],
  entries: [
    {
      startHour: 0,
      endHour: 2,
      activity: 'patrol',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'night_patrol',
    },
    { startHour: 2, endHour: 6, activity: 'sleep', locationMarker: '{{sheriff_office}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{sheriff_office}}' },
    {
      startHour: 7,
      endHour: 9,
      activity: 'patrol',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'morning_patrol',
    },
    { startHour: 9, endHour: 12, activity: 'work', locationMarker: '{{sheriff_office}}' },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{saloon}}' },
    { startHour: 13, endHour: 15, activity: 'patrol', locationMarker: '{{town_center}}' },
    { startHour: 15, endHour: 18, activity: 'work', locationMarker: '{{sheriff_office}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{home}}' },
    {
      startHour: 19,
      endHour: 21,
      activity: 'patrol',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'evening_patrol',
    },
    { startHour: 21, endHour: 24, activity: 'patrol', locationMarker: '{{town_center}}' },
  ],
  tags: ['official', 'law_enforcement', 'patrol', 'authority'],
};


/**
 * Deputy - Night patrol focus, supports sheriff
 */
export const deputy_schedule: ScheduleTemplate = {
  id: 'deputy_schedule',
  validRoles: ['deputy', 'deputy_sheriff', 'constable'],
  entries: [
    {
      startHour: 0,
      endHour: 4,
      activity: 'patrol',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'night_watch',
    },
    { startHour: 4, endHour: 5, activity: 'work', locationMarker: '{{sheriff_office}}' },
    { startHour: 5, endHour: 12, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 13, endHour: 14, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 14, endHour: 15, activity: 'travel', locationMarker: '{{sheriff_office}}' },
    { startHour: 15, endHour: 18, activity: 'work', locationMarker: '{{sheriff_office}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{saloon}}' },
    {
      startHour: 19,
      endHour: 24,
      activity: 'patrol',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'evening_patrol',
    },
  ],
  tags: ['official', 'law_enforcement', 'night_shift', 'patrol'],
};


/**
 * Preacher - Sunday service, pastoral visits, prayer times
 */
export const preacher_schedule: ScheduleTemplate = {
  id: 'preacher_schedule',
  validRoles: ['preacher', 'priest', 'pastor', 'reverend'],
  entries: [
    { startHour: 0, endHour: 5, activity: 'sleep', locationMarker: '{{home}}' },
    {
      startHour: 5,
      endHour: 6,
      activity: 'pray',
      locationMarker: '{{church}}',
      dialogueOverride: 'morning_devotion',
    },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 7, endHour: 9, activity: 'work', locationMarker: '{{church}}' },
    {
      startHour: 9,
      endHour: 12,
      activity: 'travel',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'pastoral_visit',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 13, endHour: 16, activity: 'work', locationMarker: '{{church}}' },
    {
      startHour: 16,
      endHour: 18,
      activity: 'travel',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'pastoral_visit',
    },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{home}}' },
    {
      startHour: 19,
      endHour: 20,
      activity: 'pray',
      locationMarker: '{{church}}',
      dialogueOverride: 'evening_prayer',
    },
    { startHour: 20, endHour: 21, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['official', 'religious', 'community', 'pastoral'],
};


// ============================================================================
// CIVIC / AUTHORITY SCHEDULES
// ============================================================================

/**
 * Mayor - Office hours, public appearances, evening socializing
 */
export const mayor_schedule: ScheduleTemplate = {
  id: 'mayor_schedule',
  validRoles: ['mayor', 'magistrate', 'town_leader'],
  entries: [
    { startHour: 0, endHour: 6, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 7, endHour: 8, activity: 'idle', locationMarker: '{{home}}' },
    {
      startHour: 8,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{town_hall}}',
      dialogueOverride: 'morning_office',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{hotel}}' },
    {
      startHour: 13,
      endHour: 15,
      activity: 'travel',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'public_appearance',
    },
    { startHour: 15, endHour: 17, activity: 'work', locationMarker: '{{town_hall}}' },
    { startHour: 17, endHour: 18, activity: 'travel', locationMarker: '{{home}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{home}}' },
    {
      startHour: 19,
      endHour: 21,
      activity: 'socialize',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'evening_politicking',
    },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['official', 'authority', 'civic', 'politician'],
};


/**
 * Innkeeper - Manages the hotel, early and late hours
 */
export const innkeeper_schedule: ScheduleTemplate = {
  id: 'innkeeper_schedule',
  validRoles: ['innkeeper', 'hotel_owner', 'hotel_manager'],
  entries: [
    { startHour: 0, endHour: 1, activity: 'work', locationMarker: '{{hotel}}' },
    { startHour: 1, endHour: 6, activity: 'sleep', locationMarker: '{{hotel}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{hotel}}' },
    {
      startHour: 7,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{hotel}}',
      dialogueOverride: 'morning_desk',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{hotel}}' },
    { startHour: 13, endHour: 18, activity: 'work', locationMarker: '{{hotel}}' },
    { startHour: 18, endHour: 19, activity: 'idle', locationMarker: '{{hotel}}' },
    {
      startHour: 19,
      endHour: 22,
      activity: 'work',
      locationMarker: '{{hotel}}',
      dialogueOverride: 'evening_desk',
    },
    { startHour: 22, endHour: 24, activity: 'idle', locationMarker: '{{hotel}}' },
  ],
  tags: ['business_owner', 'service', 'hospitality'],
};


/**
 * Townsfolk - Generic schedule for non-specialized residents
 */
export const townsfolk_schedule: ScheduleTemplate = {
  id: 'townsfolk_schedule',
  validRoles: ['townsfolk', 'resident', 'citizen', 'civilian'],
  entries: [
    { startHour: 0, endHour: 6, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    {
      startHour: 7,
      endHour: 9,
      activity: 'idle',
      locationMarker: '{{home}}',
    },
    {
      startHour: 9,
      endHour: 11,
      activity: 'travel',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'morning_gossip',
    },
    { startHour: 11, endHour: 12, activity: 'shop', locationMarker: '{{general_store}}' },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 13, endHour: 15, activity: 'idle', locationMarker: '{{home}}' },
    {
      startHour: 15,
      endHour: 17,
      activity: 'travel',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'afternoon_stroll',
    },
    { startHour: 17, endHour: 18, activity: 'eat', locationMarker: '{{home}}' },
    {
      startHour: 18,
      endHour: 20,
      activity: 'socialize',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'evening_chat',
    },
    { startHour: 20, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['civilian', 'resident', 'social'],
};
