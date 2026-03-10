/**
 * QuestEvents.ts - Typed event emitter for quest system
 *
 * Lightweight pub/sub bus that game systems use to signal quest-relevant
 * actions (enemy killed, item picked up, NPC talked to, etc.).
 * The QuestWiring system subscribes to these and drives objective progress.
 *
 * @module systems/QuestEvents
 */

// ============================================================================
// EVENT PAYLOAD TYPES
// ============================================================================

export interface QuestEventMap {
  /** An enemy was defeated */
  enemyKilled: { enemyType: string; enemyId: string; locationId: string };

  /** Player picked up / received an item */
  itemPickedUp: { itemId: string; quantity: number };

  /** Player completed a dialogue with an NPC */
  npcTalkedTo: { npcId: string };

  /** Player entered a location or trigger zone */
  locationVisited: { locationId: string };

  /** Player delivered an item to an NPC */
  itemDelivered: { itemId: string; npcId: string };

  /** Player interacted with a world object */
  objectInteracted: { targetId: string; locationId: string };

  /** Player moved in 3D space (for proximity-based objective completion) */
  playerMoved: { x: number; y: number; z: number };

  /** A quest was started (downstream notification) */
  questStarted: { questId: string };

  /** A quest stage advanced */
  stageAdvanced: { questId: string; stageIndex: number };

  /** A quest was completed */
  questCompleted: { questId: string };
}

export type QuestEventName = keyof QuestEventMap;
export type QuestEventHandler<T extends QuestEventName> = (
  data: QuestEventMap[T],
) => void;

// ============================================================================
// TYPED EVENT EMITTER
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListenerMap = Map<QuestEventName, Set<(data: any) => void>>;

/**
 * Minimal typed event emitter. Does not depend on any external library.
 */
export class QuestEventEmitter {
  private listeners: ListenerMap = new Map();

  /** Subscribe to a quest event. */
  on<T extends QuestEventName>(event: T, handler: QuestEventHandler<T>): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as (data: any) => void);
  }

  /** Unsubscribe from a quest event. */
  off<T extends QuestEventName>(event: T, handler: QuestEventHandler<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler as (data: any) => void);
    }
  }

  /** Emit a quest event to all subscribers. */
  emit<T extends QuestEventName>(event: T, data: QuestEventMap[T]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      handler(data);
    }
  }

  /** Remove all listeners (useful for cleanup/tests). */
  clear(): void {
    this.listeners = new Map();
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

/** Global quest event bus. Import this wherever you need to emit or listen. */
export const questEvents = new QuestEventEmitter();
