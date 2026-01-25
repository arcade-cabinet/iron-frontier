/**
 * HUD Components
 *
 * Heads-Up Display components for Iron Frontier.
 * These components are designed to overlay the game world
 * and provide always-visible information to the player.
 *
 * Usage:
 * ```tsx
 * import {
 *   GameHUD,
 *   SimpleGameHUD,
 *   TimeDisplay,
 *   PlayerStatus,
 *   ProvisionsDisplay,
 *   QuickActions,
 *   NotificationArea,
 *   LocationLabel,
 *   EncounterWarning,
 *   MiniMap,
 * } from '@iron-frontier/ui/hud';
 * ```
 */

// Main HUD container
export {
  GameHUD,
  SimpleGameHUD,
  type FullGameHUDProps,
  type SimpleGameHUDProps,
  type HUDState,
  type HUDActions,
} from './GameHUD';

// Individual HUD components
export { TimeDisplay, timeDisplayVariants, type TimeDisplayProps } from './TimeDisplay';
export {
  PlayerStatus,
  playerStatusVariants,
  type PlayerStatusProps,
} from './PlayerStatus';
export {
  ProvisionsDisplay,
  provisionsDisplayVariants,
  type ProvisionsDisplayProps,
} from './ProvisionsDisplay';
export {
  QuickActions,
  quickActionsVariants,
  actionButtonVariants,
  type QuickActionsProps,
} from './QuickActions';
export {
  NotificationArea,
  notificationAreaVariants,
  notificationItemVariants,
  type NotificationAreaProps,
} from './NotificationArea';
export {
  LocationLabel,
  locationLabelVariants,
  type LocationLabelProps,
} from './LocationLabel';
export {
  EncounterWarning,
  encounterWarningVariants,
  type EncounterWarningProps,
} from './EncounterWarning';
export { MiniMap, miniMapVariants, type MiniMapProps } from './MiniMap';

// Types
export type {
  TimeOfDay,
  WeatherType,
  StatusEffect,
  TimeDisplayData,
  WeatherDisplayData,
  PlayerStatusData,
  ProvisionsData,
  HUDNotification,
  QuickAction,
  MapMarker,
  EncounterWarningData,
  LocationData,
  HUDVisibility,
  GameHUDProps,
} from './types';

// Hooks
export {
  getTimeOfDay,
  formatGameTime,
  getDayNumber,
  getTemperature,
  useAutoDismiss,
  useLowValuePulse,
  useKeyboardShortcut,
  useReducedMotion,
  useIsTouchDevice,
} from './hooks';

// Icons (for custom usage)
export {
  SunIcon,
  MoonIcon,
  SunriseIcon,
  SunsetIcon,
  CloudIcon,
  WindIcon,
  StormIcon,
  ThermometerIcon,
  HeartIcon,
  FatigueIcon,
  BedIcon,
  FoodIcon,
  WaterIcon,
  CoinIcon,
  CompassIcon,
  MapIcon,
  BackpackIcon,
  CampfireIcon,
  MenuIcon,
  AlertIcon,
  DangerIcon,
  InfoIcon,
  WarningIcon,
  StarIcon,
  PlayerMarkerIcon,
  TownIcon,
  LandmarkIcon,
} from './icons';
