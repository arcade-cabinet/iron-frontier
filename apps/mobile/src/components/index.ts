/**
 * Components module - UI components for the mobile app
 *
 * Note: The 3D rendering has moved to the engine module.
 * Use imports from '../engine' for ThreeCanvas and MobileGameView.
 */

// Re-export engine components for convenience
export {
  ThreeCanvas,
  type ThreeCanvasProps,
  type ThreeCanvasRef,
  MobileGameView,
  type MobileGameViewProps,
} from '../engine';

// Vector3 tuple type for positions and directions
export type Float3 = [number, number, number];
