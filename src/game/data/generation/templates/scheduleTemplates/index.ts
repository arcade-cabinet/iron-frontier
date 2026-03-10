/**
 * Schedule Templates - NPC daily routines
 */

export { saloon_keeper_schedule, store_owner_schedule, blacksmith_schedule, doctor_schedule, banker_schedule, gunsmith_schedule, undertaker_schedule } from './business.ts';
export { bartender_schedule, ranch_hand_schedule, miner_schedule, railroad_worker_schedule, stable_hand_schedule, telegraph_operator_schedule } from './workers.ts';
export { sheriff_schedule, deputy_schedule, preacher_schedule, mayor_schedule, innkeeper_schedule, townsfolk_schedule } from './officials.ts';
export { gambler_schedule, drifter_schedule, prospector_schedule, homesteader_schedule, outlaw_schedule, automaton_schedule, hotel_guest_schedule, elderly_schedule, bounty_hunter_schedule } from './other.ts';

export {
  getAllSchedulesForRole,
  getNPCActivityAt,
  getScheduleForRole,
  getScheduleIdsByCategory,
  getSchedulesByTag,
  getScheduleSummary,
  getScheduleTemplate,
  SCHEDULE_TEMPLATES,
  validateScheduleCoverage,
} from './helpers.ts';
