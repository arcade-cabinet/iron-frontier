/**
 * Menu Components for Iron Frontier
 *
 * A collection of game menu screens with western/steampunk styling.
 * All menus are keyboard navigable, touch-friendly, and accessible.
 *
 * @example
 * ```tsx
 * import {
 *   MainMenu,
 *   PauseMenu,
 *   InventoryScreen,
 *   StatsScreen,
 *   MapScreen,
 *   SaveLoadScreen,
 *   SettingsScreen,
 *   ShopScreen,
 *   CampScreen,
 * } from '@iron-frontier/ui/menus';
 * ```
 */

// Main menu components
export { MainMenu } from './MainMenu';
export type { MainMenuProps } from './MainMenu';

export { PauseMenu } from './PauseMenu';
export type { PauseMenuProps } from './PauseMenu';

export { InventoryScreen } from './InventoryScreen';
export type { InventoryScreenProps } from './InventoryScreen';

export { StatsScreen } from './StatsScreen';
export type { StatsScreenProps } from './StatsScreen';

export { MapScreen } from './MapScreen';
export type { MapScreenProps } from './MapScreen';

export { SaveLoadScreen } from './SaveLoadScreen';
export type { SaveLoadScreenProps } from './SaveLoadScreen';

export { SettingsScreen } from './SettingsScreen';
export type { SettingsScreenProps } from './SettingsScreen';

export { ShopScreen } from './ShopScreen';
export type { ShopScreenProps } from './ShopScreen';

export { CampScreen } from './CampScreen';
export type { CampScreenProps } from './CampScreen';

// Shared components and utilities
export {
  // Icons
  GearIcon,
  PlayIcon,
  PauseIcon,
  CloseIcon,
  BackpackIcon,
  MapIcon,
  SaveIcon,
  LoadIcon,
  UserIcon,
  CoinIcon,
  SwordIcon,
  ShieldIcon,
  PotionIcon,
  KeyIcon,
  ScrollIcon,
  CampfireIcon,
  MoonIcon,
  VolumeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  QuitIcon,
  TrashIcon,
  TargetIcon,
  // Components
  MenuButton,
  MenuOverlay,
  MenuPanel,
  MenuHeader,
  MenuDivider,
  ProgressBar,
  TabGroup,
  Slider,
  Toggle,
  Select,
  // Utilities
  formatPlayTime,
  formatDate,
  getRarityColor,
  getRarityBgColor,
} from './shared';

export type {
  MenuButtonProps,
  MenuOverlayProps,
  MenuPanelProps,
  MenuHeaderProps,
  ProgressBarProps,
  Tab,
  TabGroupProps,
  SliderProps,
  ToggleProps,
  SelectOption,
  SelectProps,
} from './shared';

// Type definitions
export type {
  MenuBaseProps,
  MenuButton as MenuButtonType,
  SaveSlot,
  MenuItem,
  CharacterStats,
  Equipment,
  StatusEffect,
  Skill,
  MapLocation,
  MapRoute,
  ShopItem,
  ShopKeeper,
  GameSettings,
  CampOptions,
  GameStoreHook,
} from './types';
