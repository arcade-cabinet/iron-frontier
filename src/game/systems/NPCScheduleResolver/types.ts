import type { Vec3 } from '../../data/schemas/spatial';
import type { ScheduleTemplate } from '../../data/schemas/generation';

/** Result of resolving a schedule for a specific time */
export interface ResolvedScheduleTarget {
  /** World-space position the NPC should move to */
  position: Vec3;
  /** Whether the NPC is indoors at this position */
  isIndoors: boolean;
  /** Whether the NPC can be interacted with */
  isAvailable: boolean;
  /** The current activity from the schedule */
  activity: string;
  /** Optional dialogue override for this time period */
  dialogueOverride?: string;
  /** For patrol activities: the full set of waypoints to cycle through */
  patrolWaypoints?: Vec3[];
}

/** NPC instance data needed for schedule resolution */
export interface NPCInstanceData {
  /** Unique NPC identifier */
  npcId: string;
  /** The NPC's role (e.g., 'sheriff', 'bartender') */
  role: string;
  /** The NPC's assigned home position */
  homePosition: Vec3;
  /** The building/area this NPC is assigned to (from npcMarker.assignedTo) */
  assignedTo?: string;
  /** The NPC's schedule template */
  schedule: ScheduleTemplate;
  /** Override position mappings: location marker key -> Vec3 */
  positionOverrides?: Record<string, Vec3>;
}

/** Activities that place NPCs indoors */
export const INDOOR_ACTIVITIES = new Set(['sleep', 'work', 'eat', 'pray']);

/** Activities where NPCs are not available for interaction */
export const UNAVAILABLE_ACTIVITIES = new Set(['sleep']);

/** Unresolved position — returned when no positions can be averaged */
export const UNRESOLVED_POSITION: Vec3 = { x: 0, y: 0, z: 0 };
