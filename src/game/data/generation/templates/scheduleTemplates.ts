/**
 * Iron Frontier - NPC Schedule Templates
 *
 * Daily routine templates for different NPC roles.
 * Schedules define 24-hour activity cycles with location markers.
 *
 * Location markers use {{building_type}} for dynamic resolution:
 * - {{saloon}} resolves to nearest saloon
 * - {{home}} resolves to NPC's assigned home
 * - {{workplace}} resolves to NPC's work location
 */

import type { ScheduleTemplate } from '../../schemas/generation';

// ============================================================================
// BUSINESS OWNER SCHEDULES
// ============================================================================

/**
 * Saloon Keeper - Opens late morning, closes well past midnight
 */
const saloon_keeper_schedule: ScheduleTemplate = {
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
const store_owner_schedule: ScheduleTemplate = {
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
const blacksmith_schedule: ScheduleTemplate = {
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
const doctor_schedule: ScheduleTemplate = {
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
const banker_schedule: ScheduleTemplate = {
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
// WORKER SCHEDULES
// ============================================================================

/**
 * Bartender - Evening and night shift worker
 */
const bartender_schedule: ScheduleTemplate = {
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
const ranch_hand_schedule: ScheduleTemplate = {
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
const miner_schedule: ScheduleTemplate = {
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
const railroad_worker_schedule: ScheduleTemplate = {
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

// ============================================================================
// OFFICIAL SCHEDULES
// ============================================================================

/**
 * Sheriff - Patrol rounds, office hours, keeps peace
 */
const sheriff_schedule: ScheduleTemplate = {
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
const deputy_schedule: ScheduleTemplate = {
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
const preacher_schedule: ScheduleTemplate = {
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
// OTHER SCHEDULES
// ============================================================================

/**
 * Gambler - Late nights at the tables, sleeps in
 */
const gambler_schedule: ScheduleTemplate = {
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
const drifter_schedule: ScheduleTemplate = {
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
const prospector_schedule: ScheduleTemplate = {
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
const homesteader_schedule: ScheduleTemplate = {
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
const outlaw_schedule: ScheduleTemplate = {
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

/**
 * Automaton - 24/7 operation with scheduled maintenance windows
 */
const automaton_schedule: ScheduleTemplate = {
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
const hotel_guest_schedule: ScheduleTemplate = {
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
const elderly_schedule: ScheduleTemplate = {
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

// ============================================================================
// ADDITIONAL SCHEDULES (Bonus)
// ============================================================================

/**
 * Gunsmith - Careful craftsman, precision work hours
 */
const gunsmith_schedule: ScheduleTemplate = {
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
const undertaker_schedule: ScheduleTemplate = {
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

/**
 * Stable Hand - Horse care, early mornings and late evenings
 */
const stable_hand_schedule: ScheduleTemplate = {
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
const telegraph_operator_schedule: ScheduleTemplate = {
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

/**
 * Bounty Hunter - Irregular hours, hunting and tracking
 */
const bounty_hunter_schedule: ScheduleTemplate = {
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

// ============================================================================
// SCHEDULE COLLECTION
// ============================================================================

/**
 * All schedule templates indexed by ID
 */
export const SCHEDULE_TEMPLATES: Record<string, ScheduleTemplate> = {
  // Business Owners
  saloon_keeper_schedule,
  store_owner_schedule,
  blacksmith_schedule,
  doctor_schedule,
  banker_schedule,
  gunsmith_schedule,
  undertaker_schedule,

  // Workers
  bartender_schedule,
  ranch_hand_schedule,
  miner_schedule,
  railroad_worker_schedule,
  stable_hand_schedule,
  telegraph_operator_schedule,

  // Officials
  sheriff_schedule,
  deputy_schedule,
  preacher_schedule,

  // Other
  gambler_schedule,
  drifter_schedule,
  prospector_schedule,
  homesteader_schedule,
  outlaw_schedule,
  automaton_schedule,
  hotel_guest_schedule,
  elderly_schedule,
  bounty_hunter_schedule,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a schedule template by ID
 */
export function getScheduleTemplate(id: string): ScheduleTemplate | undefined {
  return SCHEDULE_TEMPLATES[id];
}

/**
 * Get all schedule templates valid for a given role
 */
export function getScheduleForRole(role: string): ScheduleTemplate | undefined {
  for (const schedule of Object.values(SCHEDULE_TEMPLATES)) {
    if (schedule.validRoles.includes(role)) {
      return schedule;
    }
  }
  return undefined;
}

/**
 * Get all schedules that match a given role
 */
export function getAllSchedulesForRole(role: string): ScheduleTemplate[] {
  return Object.values(SCHEDULE_TEMPLATES).filter((schedule) => schedule.validRoles.includes(role));
}

/**
 * Get the activity for an NPC at a specific hour
 */
export function getNPCActivityAt(
  schedule: ScheduleTemplate,
  hour: number
):
  | {
      activity: ScheduleTemplate['entries'][0]['activity'];
      locationMarker: string;
      dialogueOverride?: string;
    }
  | undefined {
  // Normalize hour to 0-24 range
  const normalizedHour = ((hour % 24) + 24) % 24;

  for (const entry of schedule.entries) {
    // Handle schedules that wrap around midnight
    if (entry.startHour <= entry.endHour) {
      // Normal case: start <= end (e.g., 8-12)
      if (normalizedHour >= entry.startHour && normalizedHour < entry.endHour) {
        return {
          activity: entry.activity,
          locationMarker: entry.locationMarker,
          dialogueOverride: entry.dialogueOverride,
        };
      }
    } else {
      // Wrap case: start > end (e.g., 22-6 means 22-24 and 0-6)
      if (normalizedHour >= entry.startHour || normalizedHour < entry.endHour) {
        return {
          activity: entry.activity,
          locationMarker: entry.locationMarker,
          dialogueOverride: entry.dialogueOverride,
        };
      }
    }
  }

  return undefined;
}

/**
 * Get all schedules with a specific tag
 */
export function getSchedulesByTag(tag: string): ScheduleTemplate[] {
  return Object.values(SCHEDULE_TEMPLATES).filter((schedule) => schedule.tags.includes(tag));
}

/**
 * Get schedule IDs for a specific category
 */
export function getScheduleIdsByCategory(
  category: 'business_owner' | 'worker' | 'official' | 'transient' | 'criminal'
): string[] {
  const categoryTags: Record<string, string[]> = {
    business_owner: ['business_owner'],
    worker: ['worker'],
    official: ['official'],
    transient: ['transient', 'wanderer'],
    criminal: ['criminal', 'dangerous'],
  };

  const tags = categoryTags[category] || [];
  const schedules = Object.entries(SCHEDULE_TEMPLATES).filter(([_, schedule]) =>
    schedule.tags.some((tag) => tags.includes(tag))
  );

  return schedules.map(([id]) => id);
}

/**
 * Validate that a schedule covers all 24 hours
 */
export function validateScheduleCoverage(schedule: ScheduleTemplate): boolean {
  const covered = new Set<number>();

  for (const entry of schedule.entries) {
    if (entry.startHour <= entry.endHour) {
      for (let h = entry.startHour; h < entry.endHour; h++) {
        covered.add(h);
      }
    } else {
      // Wrap around midnight
      for (let h = entry.startHour; h < 24; h++) {
        covered.add(h);
      }
      for (let h = 0; h < entry.endHour; h++) {
        covered.add(h);
      }
    }
  }

  // Check all 24 hours are covered
  for (let h = 0; h < 24; h++) {
    if (!covered.has(h)) {
      return false;
    }
  }

  return true;
}

/**
 * Get a summary of activities in a schedule
 */
export function getScheduleSummary(schedule: ScheduleTemplate): Record<string, number> {
  const summary: Record<string, number> = {};

  for (const entry of schedule.entries) {
    const duration =
      entry.startHour <= entry.endHour
        ? entry.endHour - entry.startHour
        : 24 - entry.startHour + entry.endHour;

    summary[entry.activity] = (summary[entry.activity] || 0) + duration;
  }

  return summary;
}
