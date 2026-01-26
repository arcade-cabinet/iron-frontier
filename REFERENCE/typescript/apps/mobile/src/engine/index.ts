/**
 * Engine module - Three.js rendering engine for React Native
 *
 * This module provides the core 3D rendering components using expo-three,
 * enabling shared rendering patterns with the web version using Three.js.
 */

// Core canvas component
export { ThreeCanvas, type ThreeCanvasProps, type ThreeCanvasRef } from './ThreeCanvas';

// Renderer hook
export {
  useThreeRenderer,
  type ThreeRendererState,
  type UseThreeRendererOptions,
  type UseThreeRendererResult,
} from './useThreeRenderer';

// Main game view
export { MobileGameView, type MobileGameViewProps } from './MobileGameView';
