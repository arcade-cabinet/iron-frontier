/**
 * GameHUD Component
 *
 * Main HUD container that positions all HUD elements overlaid on the game world.
 * The HUD is designed to be unobtrusive but readable, with a western/steampunk theme.
 *
 * Layout:
 * +-------------------------------------------------+
 * | [Time/Weather]              [Day/Weather Info]  |
 * |                                                 |
 * |              [Location Label]                   |
 * |                                                 |
 * |                [Game World]                     |
 * |                                                 |
 * |           [Encounter Warning]                   |
 * |                                                 |
 * | [Player Status]              [Provisions]       |
 * |                                                 |
 * |             [Quick Actions]                     |
 * +-------------------------------------------------+
 * | [Notifications - right side]                    |
 * +-------------------------------------------------+
 */

import * as React from 'react';
import { cn } from '../primitives/utils';
import { TimeDisplay } from './TimeDisplay';
import { PlayerStatus } from './PlayerStatus';
import { ProvisionsDisplay } from './ProvisionsDisplay';
import { QuickActions } from './QuickActions';
import { NotificationArea } from './NotificationArea';
import { LocationLabel } from './LocationLabel';
import { EncounterWarning } from './EncounterWarning';
import { MiniMap } from './MiniMap';
import type {
  GameHUDProps,
  HUDVisibility,
  TimeDisplayData,
  WeatherDisplayData,
  PlayerStatusData,
  ProvisionsData,
  HUDNotification,
  LocationData,
  EncounterWarningData,
  MapMarker,
} from './types';

/**
 * Full HUD state interface (what the HUD needs from game state)
 */
export interface HUDState {
  time: TimeDisplayData;
  weather: WeatherDisplayData;
  playerStatus: PlayerStatusData;
  provisions: ProvisionsData;
  location: LocationData | null;
  notifications: HUDNotification[];
  encounterWarning: EncounterWarningData | null;
  miniMapEnabled: boolean;
  playerPosition: { x: number; y: number };
  playerRotation: number;
  mapMarkers: MapMarker[];
}

/**
 * HUD action handlers
 */
export interface HUDActions {
  onInventory?: () => void;
  onMap?: () => void;
  onCamp?: () => void;
  onMenu?: () => void;
  onDismissNotification?: (id: string) => void;
  onToggleMiniMap?: () => void;
}

/**
 * Full GameHUD props
 */
export interface FullGameHUDProps extends GameHUDProps {
  /** Current HUD state */
  state: HUDState;
  /** Action handlers */
  actions?: HUDActions;
  /** Visibility overrides */
  visibility?: Partial<HUDVisibility>;
  /** Whether quick action shortcuts are enabled */
  shortcutsEnabled?: boolean;
}

/**
 * Default visibility settings
 */
const DEFAULT_VISIBILITY: HUDVisibility = {
  showTimeDisplay: true,
  showPlayerStatus: true,
  showProvisions: true,
  showQuickActions: true,
  showMiniMap: true,
  showNotifications: true,
  showLocationLabel: true,
  showEncounterWarning: true,
  dimmed: false,
};

/**
 * GameHUD Component
 *
 * The main HUD overlay for the game. This component positions all HUD
 * elements and handles visibility/dimming states.
 */
export function GameHUD({
  state,
  actions = {},
  visibility: visibilityOverrides = {},
  hidden = false,
  dimmed = false,
  shortcutsEnabled = true,
  className,
  children,
}: FullGameHUDProps) {
  const visibility = { ...DEFAULT_VISIBILITY, ...visibilityOverrides, dimmed };

  // Don't render if hidden
  if (hidden) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Game world content (rendered below HUD) */}
      {children}

      {/* HUD Overlay Container */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none',
          'transition-opacity duration-300',
          visibility.dimmed && 'opacity-30'
        )}
        role="region"
        aria-label="Game HUD"
      >
        {/* Top Row: Time (left) and Day/Weather (right) */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Time Display - Top Left */}
          {visibility.showTimeDisplay && (
            <div className="pointer-events-auto">
              <TimeDisplay
                time={state.time}
                weather={state.weather}
                size="sm"
              />
            </div>
          )}

          {/* Mini Map - Top Right */}
          {visibility.showMiniMap && state.miniMapEnabled && (
            <div className="pointer-events-auto">
              <MiniMap
                playerPosition={state.playerPosition}
                playerRotation={state.playerRotation}
                markers={state.mapMarkers}
                size="sm"
                shape="circle"
                onToggle={actions.onToggleMiniMap}
              />
            </div>
          )}
        </div>

        {/* Location Label - Top Center (below time row) */}
        {visibility.showLocationLabel && state.location && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none">
            <LocationLabel
              location={state.location}
              size="md"
              animateOnChange
            />
          </div>
        )}

        {/* Encounter Warning - Center */}
        {visibility.showEncounterWarning && state.encounterWarning?.isImminent && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none">
            <EncounterWarning warning={state.encounterWarning} />
          </div>
        )}

        {/* Bottom Row: Status (left) and Provisions (right) */}
        <div className="absolute bottom-16 sm:bottom-14 left-2 right-2 flex justify-between items-end">
          {/* Player Status - Bottom Left */}
          {visibility.showPlayerStatus && (
            <div className="pointer-events-auto">
              <PlayerStatus status={state.playerStatus} size="sm" />
            </div>
          )}

          {/* Provisions - Bottom Right */}
          {visibility.showProvisions && (
            <div className="pointer-events-auto">
              <ProvisionsDisplay
                provisions={state.provisions}
                size="sm"
                layout="vertical"
              />
            </div>
          )}
        </div>

        {/* Quick Actions - Bottom Center */}
        {visibility.showQuickActions && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto">
            <QuickActions
              onInventory={actions.onInventory}
              onMap={actions.onMap}
              onCamp={actions.onCamp}
              onMenu={actions.onMenu}
              shortcutsEnabled={shortcutsEnabled && !visibility.dimmed}
              size="sm"
              showKeyboardHints
            />
          </div>
        )}

        {/* Notifications - Right Side */}
        {visibility.showNotifications && (
          <div className="absolute top-20 right-2 pointer-events-auto">
            <NotificationArea
              notifications={state.notifications}
              onDismiss={actions.onDismissNotification}
              position="topRight"
              autoDismissMs={3000}
              maxVisible={4}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Simplified GameHUD for quick integration
 *
 * This version accepts raw values instead of a state object,
 * making it easier to integrate with existing game stores.
 */
export interface SimpleGameHUDProps extends GameHUDProps {
  // Time
  hour: number;
  dayOfYear: number;
  year: number;

  // Weather
  weatherType?: 'clear' | 'cloudy' | 'dusty' | 'stormy';
  weatherIntensity?: number;

  // Player
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;

  // Provisions
  food: number;
  water: number;
  gold: number;

  // Location
  locationId?: string;
  locationName?: string;
  locationType?: 'town' | 'route' | 'landmark' | 'wilderness';

  // Notifications
  notifications?: HUDNotification[];

  // Encounter
  encounterImminent?: boolean;
  encounterDangerLevel?: 'low' | 'medium' | 'high' | 'extreme';

  // Actions
  onInventory?: () => void;
  onMap?: () => void;
  onCamp?: () => void;
  onMenu?: () => void;
  onDismissNotification?: (id: string) => void;
}

export function SimpleGameHUD({
  // Time
  hour,
  dayOfYear,
  year,
  // Weather
  weatherType = 'clear',
  weatherIntensity = 0,
  // Player
  health,
  maxHealth,
  stamina,
  maxStamina,
  // Provisions
  food,
  water,
  gold,
  // Location
  locationId,
  locationName,
  locationType = 'route',
  // Notifications
  notifications = [],
  // Encounter
  encounterImminent = false,
  encounterDangerLevel = 'medium',
  // Actions
  onInventory,
  onMap,
  onCamp,
  onMenu,
  onDismissNotification,
  // Base props
  hidden,
  dimmed,
  className,
  children,
}: SimpleGameHUDProps) {
  // Build state object
  const state: HUDState = {
    time: { hour, dayOfYear, year },
    weather: {
      type: weatherType,
      intensity: weatherIntensity,
      windSpeed: 5,
    },
    playerStatus: {
      health,
      maxHealth,
      stamina,
      maxStamina,
    },
    provisions: { food, water, gold },
    location: locationId && locationName
      ? { id: locationId, name: locationName, type: locationType }
      : null,
    notifications,
    encounterWarning: encounterImminent
      ? { isImminent: true, dangerLevel: encounterDangerLevel }
      : null,
    miniMapEnabled: false,
    playerPosition: { x: 0.5, y: 0.5 },
    playerRotation: 0,
    mapMarkers: [],
  };

  const actions: HUDActions = {
    onInventory,
    onMap,
    onCamp,
    onMenu,
    onDismissNotification,
  };

  return (
    <GameHUD
      state={state}
      actions={actions}
      hidden={hidden}
      dimmed={dimmed}
      className={className}
    >
      {children}
    </GameHUD>
  );
}
