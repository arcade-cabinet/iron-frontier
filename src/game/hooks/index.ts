/**
 * Shared React Hooks
 *
 * Platform-agnostic hooks that work in both web and React Native.
 * Some hooks may be browser-specific and will return default values in other environments.
 */

export { useMediaQuery } from './useMediaQuery';
export { MOBILE_BREAKPOINT_PX, useIsMobile } from './useMobile';
export {
  useGameInput,
  useInputAction,
  useMovementInput,
  type UseGameInputOptions,
  type UseGameInputReturn,
} from './useGameInput';

export {
  useGameControllers,
  usePlayerPosition,
  useGameMode,
  type UseGameControllersConfig,
  type UseGameControllersReturn,
} from './useGameControllers';
