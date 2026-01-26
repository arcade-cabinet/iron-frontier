/**
 * HUD Component Types
 *
 * Type definitions for the game HUD (Heads-Up Display) system.
 * These types define the interface between game state and HUD components.
 */

/**
 * Time of day categories for visual theming
 */
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'dusk' | 'night';

/**
 * Weather types for display
 */
export type WeatherType = 'clear' | 'cloudy' | 'dusty' | 'stormy';

/**
 * Status effect for display in the HUD
 */
export interface StatusEffect {
  id: string;
  name: string;
  icon: string;
  duration?: number;
  stacks?: number;
  isDebuff: boolean;
  description: string;
}

/**
 * Time display data from game state
 */
export interface TimeDisplayData {
  hour: number;
  dayOfYear: number;
  year: number;
}

/**
 * Weather display data
 */
export interface WeatherDisplayData {
  type: WeatherType;
  intensity: number;
  windSpeed: number;
}

/**
 * Player status data for HUD
 */
export interface PlayerStatusData {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  statusEffects?: StatusEffect[];
}

/**
 * Provisions data for display
 */
export interface ProvisionsData {
  food: number;
  water: number;
  gold: number;
}

/**
 * Notification for the HUD
 */
export interface HUDNotification {
  id: string;
  type: 'item' | 'xp' | 'quest' | 'level' | 'info' | 'warning' | 'location' | 'danger';
  message: string;
  timestamp: number;
  duration?: number;
}

/**
 * Quick action configuration
 */
export interface QuickAction {
  id: string;
  label: string;
  shortcut: string;
  icon?: string;
  disabled?: boolean;
  onPress: () => void;
}

/**
 * Mini-map marker
 */
export interface MapMarker {
  id: string;
  type: 'player' | 'town' | 'landmark' | 'quest' | 'danger';
  x: number;
  y: number;
  label?: string;
}

/**
 * Encounter warning data
 */
export interface EncounterWarningData {
  isImminent: boolean;
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  type?: string;
}

/**
 * Location label data
 */
export interface LocationData {
  id: string;
  name: string;
  type: 'town' | 'route' | 'landmark' | 'wilderness';
}

/**
 * HUD visibility state
 */
export interface HUDVisibility {
  showTimeDisplay: boolean;
  showPlayerStatus: boolean;
  showProvisions: boolean;
  showQuickActions: boolean;
  showMiniMap: boolean;
  showNotifications: boolean;
  showLocationLabel: boolean;
  showEncounterWarning: boolean;
  dimmed: boolean;
}

/**
 * Props for the main GameHUD container
 */
export interface GameHUDProps {
  /**
   * Whether the HUD should be hidden (e.g., during cutscenes)
   */
  hidden?: boolean;
  /**
   * Whether the HUD should be dimmed (e.g., during dialogue)
   */
  dimmed?: boolean;
  /**
   * Children elements (usually the game world canvas)
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}
