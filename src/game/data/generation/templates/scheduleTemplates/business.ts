/**
 * Schedule Templates - Business
 */

import type { ScheduleTemplate } from '../../../schemas/generation.ts';

// ============================================================================
// BUSINESS OWNER SCHEDULES
// ============================================================================

/**
 * Saloon Keeper - Opens late morning, closes well past midnight
 */
export const saloon_keeper_schedule: ScheduleTemplate = {
  id: 'saloon_keeper_schedule',
  validRoles: ['saloon_keeper', 'bartender_owner'],
  entries: [
    {
      startHour: 0,
      endHour: 2,
      activity: 'work',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'late_night_barkeep',
    },
    { startHour: 2, endHour: 3, activity: 'work', locationMarker: '{{saloon}}' },
    { startHour: 3, endHour: 10, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 10, endHour: 11, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 11, endHour: 12, activity: 'idle', locationMarker: '{{saloon}}' },
    {
      startHour: 12,
      endHour: 14,
      activity: 'work',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'afternoon_setup',
    },
    { startHour: 14, endHour: 18, activity: 'work', locationMarker: '{{saloon}}' },
    {
      startHour: 18,
      endHour: 24,
      activity: 'work',
      locationMarker: '{{saloon}}',
      dialogueOverride: 'evening_barkeep',
    },
  ],
  tags: ['business_owner', 'saloon', 'night_owl'],
};


/**
 * Store Owner - Standard business hours, closes for Sunday
 */
export const store_owner_schedule: ScheduleTemplate = {
  id: 'store_owner_schedule',
  validRoles: ['store_owner', 'merchant', 'shopkeeper'],
  entries: [
    { startHour: 0, endHour: 6, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 7, endHour: 8, activity: 'travel', locationMarker: '{{general_store}}' },
    {
      startHour: 8,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{general_store}}',
      dialogueOverride: 'morning_shopkeep',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{general_store}}' },
    { startHour: 13, endHour: 18, activity: 'work', locationMarker: '{{general_store}}' },
    { startHour: 18, endHour: 19, activity: 'idle', locationMarker: '{{general_store}}' },
    { startHour: 19, endHour: 20, activity: 'travel', locationMarker: '{{home}}' },
    { startHour: 20, endHour: 21, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 21, endHour: 22, activity: 'socialize', locationMarker: '{{saloon}}' },
    { startHour: 22, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['business_owner', 'commerce', 'regular_hours'],
};


/**
 * Blacksmith - Early riser, heavy physical labor with breaks
 */
export const blacksmith_schedule: ScheduleTemplate = {
  id: 'blacksmith_schedule',
  validRoles: ['blacksmith', 'farrier', 'metalworker'],
  entries: [
    { startHour: 0, endHour: 5, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 5, endHour: 6, activity: 'eat', locationMarker: '{{home}}' },
    {
      startHour: 6,
      endHour: 10,
      activity: 'work',
      locationMarker: '{{blacksmith}}',
      dialogueOverride: 'morning_forge',
    },
    { startHour: 10, endHour: 11, activity: 'idle', locationMarker: '{{blacksmith}}' },
    { startHour: 11, endHour: 12, activity: 'eat', locationMarker: '{{blacksmith}}' },
    { startHour: 12, endHour: 16, activity: 'work', locationMarker: '{{blacksmith}}' },
    { startHour: 16, endHour: 17, activity: 'idle', locationMarker: '{{blacksmith}}' },
    { startHour: 17, endHour: 18, activity: 'work', locationMarker: '{{blacksmith}}' },
    { startHour: 18, endHour: 19, activity: 'travel', locationMarker: '{{home}}' },
    { startHour: 19, endHour: 20, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 20, endHour: 21, activity: 'socialize', locationMarker: '{{saloon}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['business_owner', 'craftsman', 'early_riser', 'physical_labor'],
};


/**
 * Doctor - On call with irregular hours, makes house calls
 */
export const doctor_schedule: ScheduleTemplate = {
  id: 'doctor_schedule',
  validRoles: ['doctor', 'physician', 'surgeon'],
  entries: [
    {
      startHour: 0,
      endHour: 6,
      activity: 'sleep',
      locationMarker: '{{home}}',
      dialogueOverride: 'on_call_night',
    },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 7, endHour: 8, activity: 'travel', locationMarker: '{{doctor}}' },
    {
      startHour: 8,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{doctor}}',
      dialogueOverride: 'morning_patients',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{doctor}}' },
    { startHour: 13, endHour: 15, activity: 'travel', locationMarker: '{{town_center}}' },
    { startHour: 15, endHour: 18, activity: 'work', locationMarker: '{{doctor}}' },
    { startHour: 18, endHour: 19, activity: 'idle', locationMarker: '{{doctor}}' },
    { startHour: 19, endHour: 20, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 20, endHour: 21, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['professional', 'on_call', 'essential_service'],
};


/**
 * Banker - Short business hours, very secure and predictable routine
 */
export const banker_schedule: ScheduleTemplate = {
  id: 'banker_schedule',
  validRoles: ['banker', 'bank_teller', 'financier'],
  entries: [
    { startHour: 0, endHour: 6, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 7, endHour: 8, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 8, endHour: 9, activity: 'travel', locationMarker: '{{bank}}' },
    {
      startHour: 9,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{bank}}',
      dialogueOverride: 'morning_banking',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{hotel}}' },
    { startHour: 13, endHour: 15, activity: 'work', locationMarker: '{{bank}}' },
    { startHour: 15, endHour: 16, activity: 'idle', locationMarker: '{{bank}}' },
    { startHour: 16, endHour: 17, activity: 'travel', locationMarker: '{{home}}' },
    { startHour: 17, endHour: 18, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 19, endHour: 21, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['business_owner', 'finance', 'secure_routine', 'short_hours'],
};


// ============================================================================
// ADDITIONAL SCHEDULES (Bonus)
// ============================================================================

/**
 * Gunsmith - Careful craftsman, precision work hours
 */
export const gunsmith_schedule: ScheduleTemplate = {
  id: 'gunsmith_schedule',
  validRoles: ['gunsmith', 'weaponsmith', 'armorer'],
  entries: [
    { startHour: 0, endHour: 6, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 7, endHour: 8, activity: 'travel', locationMarker: '{{gunsmith}}' },
    {
      startHour: 8,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{gunsmith}}',
      dialogueOverride: 'morning_repairs',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{gunsmith}}' },
    { startHour: 13, endHour: 17, activity: 'work', locationMarker: '{{gunsmith}}' },
    { startHour: 17, endHour: 18, activity: 'idle', locationMarker: '{{gunsmith}}' },
    { startHour: 18, endHour: 19, activity: 'travel', locationMarker: '{{home}}' },
    { startHour: 19, endHour: 20, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 20, endHour: 21, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['business_owner', 'craftsman', 'precision_work'],
};


/**
 * Undertaker - Somber schedule, cemetery visits
 */
export const undertaker_schedule: ScheduleTemplate = {
  id: 'undertaker_schedule',
  validRoles: ['undertaker', 'mortician', 'gravedigger'],
  entries: [
    { startHour: 0, endHour: 6, activity: 'sleep', locationMarker: '{{home}}' },
    { startHour: 6, endHour: 7, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 7, endHour: 8, activity: 'travel', locationMarker: '{{undertaker}}' },
    { startHour: 8, endHour: 10, activity: 'work', locationMarker: '{{undertaker}}' },
    {
      startHour: 10,
      endHour: 12,
      activity: 'work',
      locationMarker: '{{cemetery}}',
      dialogueOverride: 'cemetery_work',
    },
    { startHour: 12, endHour: 13, activity: 'eat', locationMarker: '{{undertaker}}' },
    { startHour: 13, endHour: 16, activity: 'work', locationMarker: '{{undertaker}}' },
    { startHour: 16, endHour: 17, activity: 'work', locationMarker: '{{cemetery}}' },
    { startHour: 17, endHour: 18, activity: 'travel', locationMarker: '{{home}}' },
    { startHour: 18, endHour: 19, activity: 'eat', locationMarker: '{{home}}' },
    { startHour: 19, endHour: 21, activity: 'idle', locationMarker: '{{home}}' },
    { startHour: 21, endHour: 24, activity: 'sleep', locationMarker: '{{home}}' },
  ],
  tags: ['business_owner', 'somber', 'essential_service'],
};
