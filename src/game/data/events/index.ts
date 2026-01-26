/**
 * Iron Frontier - Events Module
 *
 * Exports all event-related schemas, data, and utilities.
 */

export {
  // Schemas
  EventCategorySchema,
  EventRaritySchema,
  TimeOfDaySchema,
  EventEffectTypeSchema,
  EventConditionSchema,
  EventEffectSchema,
  EventChoiceSchema,
  RandomEventSchema,
  // Types
  type EventCategory,
  type EventRarity,
  type TimeOfDay,
  type EventEffectType,
  type EventCondition,
  type EventEffect,
  type EventChoice,
  type RandomEvent,
  // Constants
  RARITY_WEIGHTS,
  RANDOM_EVENTS_SCHEMA_VERSION,
  // Event Collections
  TRAVEL_EVENTS,
  TOWN_EVENTS,
  CAMP_EVENTS,
  ALL_RANDOM_EVENTS,
  // Utility Functions
  getEventsByCategory,
  getEventsByRarity,
  getEventById,
  checkEventConditions,
  selectRandomEvent,
  getAvailableChoices,
  calculateEffectValue,
  // Validation
  validateRandomEvent,
  validateEventChoice,
  validateEventEffect,
} from './randomEvents';
