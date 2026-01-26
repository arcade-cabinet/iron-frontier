/**
 * GameCanvas - Platform-specific 3D canvas component
 * 
 * This file serves as the base export for platform-specific implementations:
 * - GameCanvas.web.tsx: React Three Fiber implementation for web
 * - GameCanvas.native.tsx: expo-gl implementation for native
 * 
 * Metro bundler will automatically select the correct platform file.
 */

// Re-export the platform-specific implementation
export { GameCanvas } from './GameCanvas.web';
export type { GameCanvasProps } from './GameCanvas.web';

