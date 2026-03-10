/**
 * Schedule Template Helpers
 */

import type { ScheduleTemplate } from '../../../schemas/generation.ts';
import { saloon_keeper_schedule, store_owner_schedule, blacksmith_schedule, doctor_schedule, banker_schedule, gunsmith_schedule, undertaker_schedule } from './business.ts';
import { bartender_schedule, ranch_hand_schedule, miner_schedule, railroad_worker_schedule, stable_hand_schedule, telegraph_operator_schedule } from './workers.ts';
import { sheriff_schedule, deputy_schedule, preacher_schedule, mayor_schedule, innkeeper_schedule, townsfolk_schedule } from './officials.ts';
import { gambler_schedule, drifter_schedule, prospector_schedule, homesteader_schedule, outlaw_schedule, automaton_schedule, hotel_guest_schedule, elderly_schedule, bounty_hunter_schedule } from './other.ts';

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
  mayor_schedule,

  // Service
  innkeeper_schedule,
  townsfolk_schedule,

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
