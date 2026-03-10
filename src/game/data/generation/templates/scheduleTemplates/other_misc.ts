/**
 * Schedule Templates - Misc (Automaton, Hotel Guest, Elderly, Bounty Hunter)
 */

import type { ScheduleTemplate } from '../../../schemas/generation.ts';

/**
 * Automaton - 24/7 operation with scheduled maintenance windows
 */
export const automaton_schedule: ScheduleTemplate = {
  id: 'automaton_schedule',
  validRoles: ['automaton', 'mechanical_worker', 'steam_bot'],
  entries: [
    { startHour: 0, endHour: 4, activity: 'work', locationMarker: '{{workplace}}' },
    {
      startHour: 4,
      endHour: 5,
      activity: 'idle',
      locationMarker: '{{workshop}}',
      dialogueOverride: 'maintenance_mode',
    },
    { startHour: 5, endHour: 12, activity: 'work', locationMarker: '{{workplace}}' },
    {
      startHour: 12,
      endHour: 13,
      activity: 'idle',
      locationMarker: '{{workshop}}',
      dialogueOverride: 'refueling',
    },
    { startHour: 13, endHour: 20, activity: 'work', locationMarker: '{{workplace}}' },
    {
      startHour: 20,
      endHour: 21,
      activity: 'idle',
      locationMarker: '{{workshop}}',
      dialogueOverride: 'maintenance_mode',
    },
    { startHour: 21, endHour: 24, activity: 'work', locationMarker: '{{workplace}}' },
  ],
  tags: ['mechanical', 'tireless', 'predictable', 'steam_powered'],
};



/**
 * Hotel Guest - Tourist pattern, leisure activities
 */
export const hotel_guest_schedule: ScheduleTemplate = {
  id: 'hotel_guest_schedule',
  validRoles: ['hotel_guest', 'traveler', 'tourist', 'visitor'],
  entries: [
    { startHour: 0, endHour: 8, activity: 'sleep', locationMarker: '{{hotel}}' },
    { startHour: 8, endHour: 9, activity: 'eat', locationMarker: '{{hotel}}' },
    { startHour: 9, endHour: 11, activity: 'idle', locationMarker: '{{hotel}}' },
    {
      startHour: 11,
      endHour: 13,
      activity: 'travel',
      locationMarker: '{{town_center}}',
      dialogueOverride: 'sightseeing',
    },
    { startHour: 13, endHour: 14, activity: 'eat', locationMarker: '{{saloon}}' },
    { startHour: 14, endHour: 16, activity: 'shop', locationMarker: '{{general_store}}' },
    { startHour: 16, endHour: 18, activity: 'travel', locationMarker: '{{town_center}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{hotel}}' },
    {
      startHour: 19,
      endHour: 22,
      activity: 'socialize',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'tourist_questions',
    },
    { startHour: 22, endHour: 24, activity: 'sleep', locationMarker: '{{hotel}}' },
  ],
  tags: ['transient', 'leisure', 'visitor', 'temporary'],
};



/**
 * Elderly Schedule - Early to bed, slow routine, lots of rest
 */
export const elderly_schedule: ScheduleTemplate = {
  id: 'elderly_schedule',
  validRoles: ['elderly', 'retired', 'old_timer'],
  entries: [
    { startHour: 0, endHour: 5, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 5, endHour: 6, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    {
      startHour: 7,
      endHour: 9,
      activity: 'idle',
      locationMarker: '{{home}}',
      dialogueOverride: 'old_timer_stories',
    },
    { startHour: 9, endHour: 11, activity: 'travel', locationMarker: '{{town_center}}' },
    { startHour: 11, endHour: 12, activity: 'socialize', locationMarker: '{{general_store}}' },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 13, endHour: 15, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 15, endHour: 17, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 17, endHour: 18, activity: 'eat', locationMarker: '{{home}}' },
    {
      startHour: 18,
      endHour: 19,
      activity: 'socialize',
      locationMarker: '{{church}}',
      dialogueOverride: 'reminiscing',
    },
    { startHour: 19, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['elderly', 'slow_pace', 'early_riser', 'wisdom'],
};



/**
 * Bounty Hunter - Irregular hours, hunting and tracking
 */
export const bounty_hunter_schedule: ScheduleTemplate = {
  id: 'bounty_hunter_schedule',
  validRoles: ['bounty_hunter', 'tracker', 'manhunter'],
  entries: [
    { startHour: 0, endHour: 5, activity: 'sleep', locationMarker: '{{camp}}' },
    { startHour: 5, endHour: 6, activity: 'eat', locationMarker: '{{camp}}' },
    {
      startHour: 6,
      endHour: 10,
      activity: 'patrol',
      locationMarker: '{{outskirts}}',
      dialogueOverride: 'tracking',
    },
    { startHour: 10, endHour: 11, activity: 'travel', locationMarker: '{{town_center}}' },
    {
      startHour: 11,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{sheriff_office}}',
      dialogueOverride: 'checking_bounties',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{saloon}}' },
    { startHour: 13, endHour: 17, activity: 'patrol', locationMarker: '{{outskirts}}' },
    { startHour: 17, endHour: 18, activity: 'idle', locationMarker: '{{town_center}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{saloon}}' },
    {
      startHour: 19,
      endHour: 21,
      activity: 'socialize',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'gathering_intel',
    },
    { startHour: 21, endHour: 24, activity: 'travel', locationMarker: '{{camp}}' },
  ],
  tags: ['hunter', 'dangerous', 'independent', 'tracker'],
};
