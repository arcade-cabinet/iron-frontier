/**
 * Menu Component Types
 *
 * Shared type definitions for all menu components.
 * These types define the mock interfaces for game store integration.
 */

import type { ReactNode } from 'react';

/**
 * Base props for all menu components
 */
export interface MenuBaseProps {
  /** Whether the menu is currently visible */
  open?: boolean;
  /** Callback when the menu should close */
  onClose?: () => void;
  /** Test ID for automated testing */
  testID?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Menu button item
 */
export interface MenuButton {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

/**
 * Save slot data
 */
export interface SaveSlot {
  id: string;
  isEmpty: boolean;
  playerName?: string;
  location?: string;
  playTime?: number;
  dateSaved?: Date;
  thumbnail?: string;
  isAutoSave?: boolean;
}

/**
 * Inventory item for menus
 */
export interface MenuItem {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  quantity: number;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'key_item' | 'junk';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  weight: number;
  value: number;
  usable?: boolean;
  equippable?: boolean;
  equipped?: boolean;
  condition?: number;
  stats?: Record<string, number>;
}

/**
 * Character stats
 */
export interface CharacterStats {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
}

/**
 * Equipment slots
 */
export interface Equipment {
  weapon: MenuItem | null;
  offhand: MenuItem | null;
  head: MenuItem | null;
  body: MenuItem | null;
  accessory: MenuItem | null;
}

/**
 * Status effect
 */
export interface StatusEffect {
  id: string;
  name: string;
  icon?: string;
  duration?: number;
  isPositive: boolean;
}

/**
 * Skill/Ability
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon?: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
}

/**
 * Map location
 */
export interface MapLocation {
  id: string;
  name: string;
  type: 'town' | 'camp' | 'dungeon' | 'landmark' | 'unknown';
  position: { x: number; y: number };
  visited: boolean;
  current?: boolean;
  description?: string;
}

/**
 * Map route between locations
 */
export interface MapRoute {
  from: string;
  to: string;
  traveled: boolean;
  dangerLevel?: 'safe' | 'moderate' | 'dangerous';
}

/**
 * Shop item for buying
 */
export interface ShopItem {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  type: string;
  rarity: string;
  price: number;
  stock: number;
  canAfford: boolean;
}

/**
 * Shop keeper info
 */
export interface ShopKeeper {
  name: string;
  shopName: string;
  portrait?: string;
  greeting?: string;
}

/**
 * Game settings
 */
export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  fullscreen: boolean;
  uiScale: number;
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  autoSaveFrequency: 'off' | '5min' | '10min' | '15min';
  colorblindMode: 'off' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  largerText: boolean;
  showMinimap: boolean;
  haptics: boolean;
  controlMode: 'tap' | 'joystick';
  reducedMotion: boolean;
}

/**
 * Camp options
 */
export interface CampOptions {
  currentFatigue: number;
  maxFatigue: number;
  provisions: number;
  maxProvisions: number;
  currentTime: string;
  isDangerous: boolean;
}

/**
 * Hook interface for menu components to access game state
 * This should be implemented by the consuming application
 */
export interface GameStoreHook {
  // State
  playerName: string;
  playerStats: CharacterStats;
  inventory: MenuItem[];
  equipment: Equipment;
  statusEffects: StatusEffect[];
  skills: Skill[];
  mapLocations: MapLocation[];
  mapRoutes: MapRoute[];
  settings: GameSettings;
  saveSlots: SaveSlot[];
  currentMoney: number;

  // Actions
  useItem: (itemId: string) => void;
  dropItem: (itemId: string) => void;
  equipItem: (itemId: string, slot: keyof Equipment) => void;
  unequipItem: (slot: keyof Equipment) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  saveGame: (slotId: string) => void;
  loadGame: (slotId: string) => void;
  deleteGame: (slotId: string) => void;
  buyItem: (itemId: string, quantity: number) => void;
  sellItem: (itemId: string, quantity: number) => void;
  travelTo: (locationId: string) => void;
  rest: (hours: number) => void;
  setUpCamp: (withFire: boolean) => void;
  eatMeal: () => void;
  startHunting: () => void;
}
