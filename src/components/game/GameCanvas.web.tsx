/**
 * GameCanvas.web.tsx - Web platform canvas using React Three Fiber
 *
 * This component provides the R3F Canvas wrapper for web rendering.
 * It handles:
 * - Canvas setup with shadows, antialiasing
 * - Performance monitoring
 * - Scene rendering
 */

import { Canvas } from '@react-three/fiber';
import { Suspense, type ReactNode } from 'react';
import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

interface GameCanvasProps {
  children: ReactNode;
  shadows?: boolean;
  dpr?: number | [number, number];
  performance?: {
    min?: number;
    max?: number;
    debounce?: number;
  };
}

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#d97706" />
    </mesh>
  );
}

// ============================================================================
// GAME CANVAS (WEB)
// ============================================================================

export function GameCanvas({
  children,
  shadows = true,
  dpr = [1, 2],
  performance,
}: GameCanvasProps) {
  return (
    <Canvas
      shadows={shadows}
      dpr={dpr}
      performance={performance}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        touchAction: 'none',
      }}
      camera={{
        position: [0, 15, 20],
        fov: 45,
        near: 0.1,
        far: 1000,
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </Canvas>
  );
}

export default GameCanvas;
